import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { DatabaseService } from '../database/database.service';
import { CloudinaryService } from '../media/cloudinary.provider';
import { products, productColors, categories } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class LocalAiService {
  private readonly logger = new Logger(LocalAiService.name);
  private readonly pythonScript: string;
  private readonly tmpDir: string;
  private readonly pythonBin: string;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudinary: CloudinaryService,
  ) {
    // Use PYTHON_PATH env var if set, otherwise auto-detect venv python3
    // __dirname in compiled code = server-nestjs/dist/ai/
    // so ../../ goes up to server-nestjs/ root
    this.pythonBin =
      process.env.PYTHON_PATH ||
      path.join(__dirname, '..', '..', 'venv', 'bin', 'python3');

    // Path to the python script, located at the root of server-nestjs
    this.pythonScript = path.join(__dirname, '..', '..', 'ai_background_replacement_script.py');
    // Temp directory inside server-nestjs for processing
    this.tmpDir = path.join(__dirname, '..', '..', 'tmp_ai');
    if (!fs.existsSync(this.tmpDir)) {
      fs.mkdirSync(this.tmpDir, { recursive: true });
    }
    this.logger.log(`🐍 Using Python: ${this.pythonBin}`);
  }

  /**
   * Run the python background replacement script on a single image buffer.
   * Returns the output image as a Buffer, or null on failure.
   */
  async processImageBuffer(
    imageBuffer: Buffer,
    backgroundUrl?: string,
  ): Promise<Buffer | null> {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const inputPath = path.join(this.tmpDir, `input_${id}.png`);
    const outputPath = path.join(this.tmpDir, `output_${id}.png`);
    let bgPath: string | undefined;

    try {
      // Write input buffer to temp file
      fs.writeFileSync(inputPath, imageBuffer);

      // Download background image if URL provided
      if (backgroundUrl) {
        bgPath = path.join(this.tmpDir, `bg_${id}.png`);
        await this.downloadFile(backgroundUrl, bgPath);
      }

      // Run the python script
      await this.runPythonScript(inputPath, outputPath, bgPath);

      // Read the output and return as buffer
      if (fs.existsSync(outputPath)) {
        const result = fs.readFileSync(outputPath);
        return result;
      }
      return null;
    } catch (err) {
      this.logger.error(`❌ [LocalAiService] processImageBuffer failed: ${err.message}`);
      return null;
    } finally {
      // Cleanup temp files
      this.cleanup(inputPath, outputPath, bgPath);
    }
  }

  /**
   * Fully process all product images in the background after product creation.
   * Downloads each image, runs the python script, uploads to Cloudinary, and updates DB.
   */
  async processProductBackgroundsAsync(
    productId: number,
    categoryId: number | null,
  ): Promise<void> {
    this.logger.log(`🔄 [LocalAiService] Starting background AI processing for product ${productId}...`);

    try {
      // 1. Fetch category background URL
      let bgUrl: string | undefined;
      if (categoryId) {
        const category = await this.databaseService.db.query.categories.findFirst({
          where: eq(categories.id, categoryId),
        });
        bgUrl = (category as any)?.categoryBackgroundUrl;
      }

      // 2. Fetch the product
      const productRows = await this.databaseService.db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      if (!productRows.length) {
        this.logger.warn(`⚠️ [LocalAiService] Product ${productId} not found`);
        return;
      }
      const product = productRows[0];

      // 3. Process main product images
      const imageUrls: string[] = (product.images as string[]) || [];
      if (imageUrls.length > 0) {
        const newImageUrls: string[] = [];
        for (const imgUrl of imageUrls) {
          const processed = await this.processCloudinaryImage(imgUrl, bgUrl);
          newImageUrls.push(processed ?? imgUrl); // keep original if failed
        }
        // Update product images in DB
        await this.databaseService.db
          .update(products)
          .set({ images: newImageUrls, updatedAt: new Date() })
          .where(eq(products.id, productId));
        this.logger.log(`✅ [LocalAiService] Updated main images for product ${productId}`);
      }

      // 4. Process product color variant images
      const colorRows = await this.databaseService.db
        .select()
        .from(productColors)
        .where(eq(productColors.productId, productId));

      for (const colorRow of colorRows) {
        const colorImages: string[] = (colorRow.images as string[]) || [];
        if (colorImages.length === 0) continue;
        const newColorImages: string[] = [];
        for (const imgUrl of colorImages) {
          const processed = await this.processCloudinaryImage(imgUrl, bgUrl);
          newColorImages.push(processed ?? imgUrl);
        }
        await this.databaseService.db
          .update(productColors)
          .set({ images: newColorImages })
          .where(eq(productColors.id, colorRow.id));
        this.logger.log(`✅ [LocalAiService] Updated color ${colorRow.id} images for product ${productId}`);
      }

      this.logger.log(`🎉 [LocalAiService] Background AI processing DONE for product ${productId}`);
    } catch (err) {
      this.logger.error(`❌ [LocalAiService] Background processing failed for product ${productId}: ${err.message}`);
    }
  }

  /**
   * Downloads an image from Cloudinary (or any URL), runs python script,
   * uploads processed image to Cloudinary, and returns new secure_url.
   */
  private async processCloudinaryImage(
    imageUrl: string,
    backgroundUrl?: string,
  ): Promise<string | null> {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const inputPath = path.join(this.tmpDir, `input_${id}.png`);
    const outputPath = path.join(this.tmpDir, `output_${id}.png`);
    let bgPath: string | undefined;

    try {
      // Download the source image
      await this.downloadFile(imageUrl, inputPath);

      // Download background if provided
      if (backgroundUrl) {
        bgPath = path.join(this.tmpDir, `bg_${id}.png`);
        await this.downloadFile(backgroundUrl, bgPath);
      }

      // Run python script
      await this.runPythonScript(inputPath, outputPath, bgPath);

      if (!fs.existsSync(outputPath)) {
        this.logger.warn(`⚠️ [LocalAiService] Python script produced no output for: ${imageUrl}`);
        return null;
      }

      // Upload processed image to Cloudinary
      const buffer = fs.readFileSync(outputPath);
      const uploadResult = await this.cloudinary.uploadBuffer(buffer) as any;
      return uploadResult?.secure_url ?? null;
    } catch (err) {
      this.logger.error(`❌ [LocalAiService] processCloudinaryImage failed: ${err.message}`);
      return null;
    } finally {
      this.cleanup(inputPath, outputPath, bgPath);
    }
  }

  /**
   * Spawns the python3 process and resolves when done.
   */
  private runPythonScript(
    inputPath: string,
    outputPath: string,
    bgPath?: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = ['-u', this.pythonScript, inputPath, outputPath];
      if (bgPath) args.push(bgPath);

      this.logger.log(`🐍 Running: ${this.pythonBin} ${args.join(' ')}`);
      const proc = spawn(this.pythonBin, args);

      proc.stdout.on('data', (d) => this.logger.log(`Python: ${d.toString().trim()}`));
      proc.stderr.on('data', (d) => this.logger.warn(`Python stderr: ${d.toString().trim()}`));

      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Python script exited with code ${code}`));
      });

      proc.on('error', (err) => reject(err));
    });
  }

  /**
   * Downloads a file from a URL to a local path.
   */
  private downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      const protocol = url.startsWith('https') ? https : http;
      protocol.get(url, (res) => {
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      }).on('error', (err) => {
        fs.unlink(dest, () => { });
        reject(err);
      });
    });
  }

  /**
   * Safely delete temp files.
   */
  private cleanup(...filePaths: (string | undefined)[]) {
    for (const p of filePaths) {
      if (p && fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch { }
      }
    }
  }
}
