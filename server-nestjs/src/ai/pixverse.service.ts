import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';
import * as crypto from 'crypto';

@Injectable()
export class PixVerseService {
  private readonly logger = new Logger(PixVerseService.name);
  private readonly apiKey: string;
  private readonly webhookSecret: string;
  private readonly webhookId: string;
  private readonly baseUrl = 'https://app-api.pixverse.ai/openapi/v2';
  private readonly appApiUrl = 'https://app-api.pixverse.ai/openapi/v2';
  private readonly uploadUrl = 'https://app-api.pixverse.ai/openapi/v2/image/upload';

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    this.apiKey = this.configService.get<string>('PIXVERSE_API_KEY');
    this.webhookSecret = this.configService.get<string>(
      'PIXVERSE_WEBHOOK_SECRET',
    );
    this.webhookId = this.configService.get<string>('PIXVERSE_WEBHOOK_ID');
  }

  /**
   * Helper to generate mandatory headers for PixVerse v2 API.
   */
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'API-KEY': this.apiKey,
      'Ai-Trace-Id': crypto.randomUUID(),
    };
  }

  /**
   * Verifies the signature of a PixVerse webhook request.
   */
  verifySignature(headers: any, payload: any): boolean {
    try {
      const timestamp =
        headers['webhook-timestamp'] || headers['Webhook-Timestamp'];
      const nonce = headers['webhook-nonce'] || headers['Webhook-Nonce'];
      const signature =
        headers['webhook-signature'] || headers['Webhook-Signature'];

      if (!timestamp || !nonce || !signature) {
        this.logger.warn(
          'Missing required webhook headers for signature verification',
        );
        return false;
      }

      // Build URL-encoded payload (sort keys alphabetically and join with &)
      // As per PixVerse docs: each field in the JSON body into key=value format and join them with &
      // Booleans should be lowercase strings
      const sortedKeys = Object.keys(payload).sort();
      const urlEncodedPayload = sortedKeys
        .map((key) => {
          let val = payload[key];
          if (typeof val === 'boolean') {
            val = val.toString().toLowerCase();
          }
          return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
        })
        .join('&');

      // Build the string to sign: {timestamp}\n{nonce}\n{url_encoded_payload}
      const signString = `${timestamp}\n${nonce}\n${urlEncodedPayload}`;

      // Generate HMAC-SHA256 signature
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signString)
        .digest('base64');

      // Secure comparison
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature),
      );
    } catch (error) {
      this.logger.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Triggers a Background Change task.
   */
  async createBackgroundChangeTask(
    productId: number,
    imageUrl: string,
    prompt?: string,
  ) {
    if (!this.apiKey) throw new Error('PIXVERSE_API_KEY not configured');

    // Fetch product and its category to check for a fixed background
    const product = await this.databaseService.db.query.products.findFirst({
      where: eq(schema.products.id, productId),
    });

    let backgroundUrl = null;
    if (product?.categoryId) {
      const category = await this.databaseService.db.query.categories.findFirst(
        {
          where: eq(schema.categories.id, product.categoryId),
        },
      );
      backgroundUrl = category?.aiBackgroundImage;
    }

    this.logger.log(
      `Creating PixVerse Background Change task for product ${productId}${backgroundUrl ? ' with category background' : ''}`,
    );

    const imageInput = [imageUrl];
    if (backgroundUrl) imageInput.push(backgroundUrl);

    const defaultPrompt = backgroundUrl
      ? 'Replace the background of the first image with the scene from the second image. Ensure the product in the first image looks natural in the new environment.'
      : 'Change the background to a professional studio setting with soft lighting, high-end fashion style.';

    const response = await fetch(`${this.baseUrl}/video/visionary/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: 'visionary-1.0',
        input: {
          image_input: imageInput,
          prompt: prompt || defaultPrompt,
          mode: 'background_change',
        },
        webhook_id: this.webhookId,
      }),
    });

    const result = await response.json();

    if (result.ErrCode !== 0 || (!result.Resp?.video_id && !result.Resp?.taskId)) {
      this.logger.error(
        `PixVerse Task Creation Failed: ${JSON.stringify(result)}`,
      );
      throw new Error(result.ErrMsg || 'Failed to create PixVerse task');
    }

    const taskId = result.Resp.video_id || result.Resp.taskId;

    // Track task in database
    await this.databaseService.db.insert(schema.aiTasks).values({
      id: taskId,
      type: 'background_change',
      targetId: productId,
      status: 'pending',
      metadata: { originalImageUrl: imageUrl },
    });

    return taskId;
  }

  /**
   * Triggers a Virtual Try-On task.
   */
  async createVirtualTryOnTask(
    userId: number,
    brideImageUrl: string,
    dressImageUrl: string,
  ) {
    if (!this.apiKey) throw new Error('PIXVERSE_API_KEY not configured');

    this.logger.log(`Creating PixVerse Virtual Try-On task for user ${userId}`);

    const response = await fetch(`${this.baseUrl}/video/visionary/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: 'visionary-1.0',
        input: {
          image_input: [brideImageUrl, dressImageUrl],
          prompt:
            'Put the dress from the second image onto the person in the first image. Preserve face and body shape.',
          mode: 'virtual_try_on',
        },
        webhook_id: this.webhookId,
      }),
    });

    const result = await response.json();

    if (result.ErrCode !== 0 || (!result.Resp?.video_id && !result.Resp?.taskId)) {
      this.logger.error(
        `PixVerse Task Creation Failed: ${JSON.stringify(result)}`,
      );
      throw new Error(result.ErrMsg || 'Failed to create PixVerse task');
    }

    const taskId = result.Resp.video_id || result.Resp.taskId;

    // Track task in database
    await this.databaseService.db.insert(schema.aiTasks).values({
      id: taskId,
      type: 'virtual_try_on',
      targetId: userId,
      status: 'pending',
      metadata: { brideImageUrl, dressImageUrl },
    });

    return taskId;
  }

  /**
   * Handles the successful completion of a task.
   */
  async handleTaskSuccess(taskId: string, resultUrl: string) {
    this.logger.log(
      `PixVerse Task ${taskId} completed successfully. Result: ${resultUrl}`,
    );

    const task = await this.databaseService.db.query.aiTasks.findFirst({
      where: eq(schema.aiTasks.id, taskId),
    });

    if (!task) {
      this.logger.warn(`Received webhook for unknown task: ${taskId}`);
      return;
    }

    // Update task status
    await this.databaseService.db
      .update(schema.aiTasks)
      .set({ status: 'completed', resultUrl, updatedAt: new Date() })
      .where(eq(schema.aiTasks.id, taskId));

    // Perform business logic based on task type
    if (task.type === 'background_change' && task.targetId) {
      this.logger.log(
        `Updating product ${task.targetId} with new AI-processed image`,
      );
      // Update product images
      const product = await this.databaseService.db.query.products.findFirst({
        where: eq(schema.products.id, task.targetId),
      });

      if (product) {
        const currentImages = product.images || [];
        // Replace the first image or add as a new one?
        // The user said: "يرجعها بعد متخلص كصور للمنتج"
        // I'll add it to the images array if not already there, or replace the first one if it's an update.
        // For now, I'll update aiQualifiedImage and add to gallery.
        await this.databaseService.db
          .update(schema.products)
          .set({
            aiQualifiedImage: resultUrl,
            images: [
              resultUrl,
              ...currentImages.filter((img) => img !== resultUrl),
            ],
            updatedAt: new Date(),
          })
          .where(eq(schema.products.id, task.targetId));
      }
    } else if (task.type === 'virtual_try_on' && task.targetId) {
      this.logger.log(`Virtual Try-On completed for user ${task.targetId}`);
      // We could update a 'trials' table or send a notification
      // For now, it's just tracked in aiTasks.
    }
  }

  /**
   * Uploads an image to PixVerse to get an img_id.
   */
  async uploadImage(imageUrl: string): Promise<number> {
    if (!this.apiKey) throw new Error('PIXVERSE_API_KEY not configured');

    const traceId = crypto.randomUUID();
    this.logger.log(`Uploading image to PixVerse. TraceId: ${traceId}`);

    const formData = new FormData();
    formData.append('image_url', imageUrl);

    const response = await fetch(this.uploadUrl, {
      method: 'POST',
      headers: {
        'API-KEY': this.apiKey,
        'Ai-Trace-Id': crypto.randomUUID(),
      },
      body: formData,
    });

    const result = await response.json();

    if (result.ErrCode !== 0 || !result.Resp?.img_id) {
      this.logger.error(`PixVerse Image Upload Failed: ${JSON.stringify(result)}`);
      throw new Error(result.ErrMsg || 'Failed to upload image to PixVerse');
    }

    return result.Resp.img_id;
  }

  /**
   * Creates a PixVerse C1 Video Generation task.
   */
  async createVideoTask(
    type: 'text' | 'img' | 'transition' | 'fusion',
    params: any,
    targetId?: number,
  ) {
    if (!this.apiKey) throw new Error('PIXVERSE_API_KEY not configured');

    let endpoint = '';
    const body: any = {
      model: 'c1',
      ...params,
    };

    // Handle image-to-id conversion based on type
    if (type === 'img' && params.image_url) {
      body.img_id = await this.uploadImage(params.image_url);
      delete body.image_url;
      endpoint = 'img/generate';
    } else if (type === 'text') {
      endpoint = 'text/generate';
    } else if (type === 'transition') {
      if (params.first_frame_url) {
        body.first_frame_img = await this.uploadImage(params.first_frame_url);
        delete body.first_frame_url;
      }
      if (params.last_frame_url) {
        body.last_frame_img = await this.uploadImage(params.last_frame_url);
        delete body.last_frame_url;
      }
      endpoint = 'transition/generate';
    } else if (type === 'fusion') {
      if (params.image_references) {
        body.image_references = await Promise.all(
          params.image_references.map(async (ref: any) => ({
            ...ref,
            img_id: ref.img_url ? await this.uploadImage(ref.img_url) : ref.img_id,
          })),
        );
      }
      endpoint = 'fusion/generate';
    }

    this.logger.log(`Creating PixVerse C1 Video task (${type})`);

    const response = await fetch(`${this.baseUrl}/video/${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (result.ErrCode !== 0 || (!result.Resp?.video_id && !result.Resp?.taskId)) {
      this.logger.error(`PixVerse Video Task Failed: ${JSON.stringify(result)}`);
      throw new Error(result.ErrMsg || 'Failed to create PixVerse video task');
    }

    const taskId = result.Resp.video_id || result.Resp.taskId;

    // Track task in database
    await this.databaseService.db.insert(schema.aiTasks).values({
      id: taskId,
      type: `video_${type}`,
      targetId: targetId || null,
      status: 'pending',
      metadata: { ...params, model: 'c1' },
    });

    return taskId;
  }

  /**
   * Creates an Image Template Generation task.
   */
  async createImageTemplateTask(imgIds: number[], templateId: number) {
    if (!this.apiKey) throw new Error('PIXVERSE_API_KEY not configured');

    const traceId = crypto.randomUUID();
    this.logger.log(`Creating PixVerse Image Template task. TraceId: ${traceId}`);

    const response = await fetch(`${this.appApiUrl}/image/template/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        img_ids: imgIds,
        template_id: templateId,
      }),
    });

    const result = await response.json();

    if (result.ErrCode !== 0 || !result.Resp?.image_id) {
      this.logger.error(`PixVerse Image Template Failed: ${JSON.stringify(result)}`);
      throw new Error(result.ErrMsg || 'Failed to create image template task');
    }

    return result.Resp.image_id;
  }

  /**
   * Gets the result of an image generation task.
   */
  async getImageResult(imageId: string) {
    if (!this.apiKey) throw new Error('PIXVERSE_API_KEY not configured');

    const traceId = crypto.randomUUID();
    const response = await fetch(`${this.appApiUrl}/image/result/${imageId}`, {
      method: 'GET',
      headers: {
        'API-KEY': this.apiKey,
        'Ai-trace-Id': traceId,
      },
    });

    const result = await response.json();
    return result;
  }

  /**
   * Gets the account balance.
   */
  async getAccountBalance() {
    if (!this.apiKey) throw new Error('PIXVERSE_API_KEY not configured');

    const traceId = crypto.randomUUID();
    const response = await fetch(`${this.appApiUrl}/account/balance`, {
      method: 'GET',
      headers: {
        'API-KEY': this.apiKey,
        'ai-trace-id': traceId,
      },
    });

    return await response.json();
  }

  /**
   * Handles the failure of a task.
   */
  async handleTaskFailure(taskId: string, error: string) {
    this.logger.error(`PixVerse Task ${taskId} failed: ${error}`);

    await this.databaseService.db
      .update(schema.aiTasks)
      .set({ status: 'failed', error, updatedAt: new Date() })
      .where(eq(schema.aiTasks.id, taskId));
  }
}
