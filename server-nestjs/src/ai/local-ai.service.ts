import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { DatabaseService } from '../database/database.service';
import { products, productColors } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class LocalAiService {
  private readonly logger = new Logger(LocalAiService.name);

  constructor(
    private readonly databaseService: DatabaseService,
  ) {
    this.logger.log(`☁️ Using Cloudinary AI Background Removal instead of local Python script`);
  }

  /**
   * Process a single image buffer using Cloudinary AI Background Removal.
   * Uploads buffer directly with background removal add-on, then downloads the transparent result buffer.
   */
  async processImageBuffer(
    imageBuffer: Buffer,
    _backgroundUrl?: string,
  ): Promise<Buffer | null> {
    try {
      // Upload buffer directly to Cloudinary with background removal enabled
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'fustan-ai-bg-removal',
            background_removal: 'cloudinary_ai',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        uploadStream.end(imageBuffer);
      });

      if (uploadResult?.secure_url) {
        // Fetch the processed transparent image buffer
        const res = await fetch(uploadResult.secure_url);
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
      return null;
    } catch (err) {
      this.logger.error(`❌ [LocalAiService] processImageBuffer failed via Cloudinary AI: ${err.message}`);
      return null;
    }
  }

  /**
   * Fully process all product images in the background using Cloudinary AI Background Removal.
   * Triggers Cloudinary background replacement for each image URL and updates DB.
   */
  async processProductBackgroundsAsync(
    productId: number,
    _categoryId: number | null,
  ): Promise<void> {
    this.logger.log(`🔄 [LocalAiService] Starting Cloudinary AI background processing for product ${productId}...`);

    try {
      // 1. Fetch the product
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

      // 2. Process main product images
      const imageUrls: string[] = (product.images as string[]) || [];
      if (imageUrls.length > 0) {
        const newImageUrls: string[] = [];
        for (const imgUrl of imageUrls) {
          const processed = await this.processCloudinaryImageUrl(imgUrl);
          newImageUrls.push(processed ?? imgUrl); // keep original if failed
        }
        // Update product images in DB
        await this.databaseService.db
          .update(products)
          .set({ images: newImageUrls, updatedAt: new Date() })
          .where(eq(products.id, productId));
        this.logger.log(`✅ [LocalAiService] Updated main images for product ${productId} with background removal`);
      }

      // 3. Process product color variant images
      const colorRows = await this.databaseService.db
        .select()
        .from(productColors)
        .where(eq(productColors.productId, productId));

      for (const colorRow of colorRows) {
        const colorImages: string[] = (colorRow.images as string[]) || [];
        if (colorImages.length === 0) continue;
        const newColorImages: string[] = [];
        for (const imgUrl of colorImages) {
          const processed = await this.processCloudinaryImageUrl(imgUrl);
          newColorImages.push(processed ?? imgUrl);
        }
        await this.databaseService.db
          .update(productColors)
          .set({ images: newColorImages })
          .where(eq(productColors.id, colorRow.id));
        this.logger.log(`✅ [LocalAiService] Updated color ${colorRow.id} images for product ${productId}`);
      }

      this.logger.log(`🎉 [LocalAiService] Cloudinary AI processing DONE for product ${productId}`);
    } catch (err) {
      this.logger.error(`❌ [LocalAiService] Background processing failed for product ${productId}: ${err.message}`);
    }
  }

  /**
   * Applies Cloudinary AI Background Removal to an existing image URL.
   * Re-uploads the URL directly to Cloudinary to run the add-on asynchronously/synchronously.
   */
  private async processCloudinaryImageUrl(imageUrl: string): Promise<string | null> {
    try {
      this.logger.log(`☁️ Triggering background removal for: ${imageUrl}`);
      const uploadResult = await cloudinary.uploader.upload(imageUrl, {
        folder: 'fustan-ai-bg-removal',
        background_removal: 'cloudinary_ai',
      });
      return uploadResult?.secure_url ?? null;
    } catch (err) {
      this.logger.error(`❌ [LocalAiService] processCloudinaryImageUrl failed: ${err.message}`);
      return null;
    }
  }
}
