import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { DatabaseService } from '../database/database.service';
import { products, productColors, categories } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class LocalAiService {
  private readonly logger = new Logger(LocalAiService.name);

  constructor(
    private readonly databaseService: DatabaseService,
  ) {
    this.logger.log(`☁️ Using Cloudinary AI Background Removal & Underlay Overlay`);
  }

  /**
   * Helper to extract the Cloudinary public_id from a full URL.
   */
  private extractPublicId(url: string): string | null {
    if (!url) return null;
    try {
      const parts = url.split('/upload/');
      if (parts.length < 2) return null;
      let pathPart = parts[1];
      // Remove version prefix if present (e.g. v1778657980/)
      pathPart = pathPart.replace(/^v\d+\//, '');
      // Remove extension
      const lastDotIndex = pathPart.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        pathPart = pathPart.substring(0, lastDotIndex);
      }
      return pathPart;
    } catch {
      return null;
    }
  }

  /**
   * Process a single image buffer using Cloudinary AI Background Removal and optional background underlay.
   */
  async processImageBuffer(
    imageBuffer: Buffer,
    backgroundUrl?: string,
  ): Promise<Buffer | null> {
    try {
      const options: any = {
        folder: 'fustan-ai-bg-removal',
      };

      const bgPublicId = backgroundUrl ? this.extractPublicId(backgroundUrl) : null;
      if (bgPublicId) {
        // Cloudinary layers require replacing slashes with colons for folder paths
        const layerId = bgPublicId.replace(/\//g, ':');
        options.transformation = [
          { effect: 'background_removal' },
          { underlay: layerId, width: '1.0', height: '1.0', flags: 'relative', crop: 'scale' }
        ];
      } else {
        options.transformation = [
          { effect: 'background_removal' }
        ];
      }

      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        uploadStream.end(imageBuffer);
      });

      if (uploadResult?.secure_url) {
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
   * Retrieves category background URL, cuts product background, and underlays the category image.
   */
  async processProductBackgroundsAsync(
    productId: number,
    categoryId: number | null,
  ): Promise<void> {
    this.logger.log(`🔄 [LocalAiService] Starting Cloudinary AI background processing for product ${productId}...`);

    try {
      // 1. Fetch category background URL if categoryId is provided
      let bgUrl: string | undefined;
      if (categoryId) {
        const categoryRows = await this.databaseService.db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId))
          .limit(1);
        if (categoryRows.length > 0) {
          bgUrl = (categoryRows[0] as any)?.categoryBackgroundUrl;
          this.logger.log(`📁 Found category background URL: ${bgUrl}`);
        }
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
          const processed = await this.processCloudinaryImageUrl(imgUrl, bgUrl);
          newImageUrls.push(processed ?? imgUrl); // keep original if failed
        }
        // Update product images in DB
        await this.databaseService.db
          .update(products)
          .set({ images: newImageUrls, updatedAt: new Date() })
          .where(eq(products.id, productId));
        this.logger.log(`✅ [LocalAiService] Updated main images for product ${productId} with background removal & underlay`);
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
          const processed = await this.processCloudinaryImageUrl(imgUrl, bgUrl);
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
   * Applies Cloudinary AI Background Removal and category background underlay to an existing image URL.
   */
  private async processCloudinaryImageUrl(imageUrl: string, bgUrl?: string): Promise<string | null> {
    try {
      this.logger.log(`☁️ Triggering background removal for: ${imageUrl}`);
      const options: any = {
        folder: 'fustan-ai-bg-removal',
      };

      const bgPublicId = bgUrl ? this.extractPublicId(bgUrl) : null;
      if (bgPublicId) {
        // Replace slashes with colons to conform to Cloudinary layer string requirements
        const layerId = bgPublicId.replace(/\//g, ':');
        this.logger.log(`🎨 Adding category background underlay: ${layerId}`);
        options.transformation = [
          { effect: 'background_removal' },
          { underlay: layerId, width: '1.0', height: '1.0', flags: 'relative', crop: 'scale' }
        ];
      } else {
         options.transformation = [
          { effect: 'background_removal' }
        ];
      }

      const uploadResult = await cloudinary.uploader.upload(imageUrl, options);
      return uploadResult?.secure_url ?? null;
    } catch (err) {
      this.logger.error(`❌ [LocalAiService] processCloudinaryImageUrl failed: ${err.message}`);
      return null;
    }
  }
}
