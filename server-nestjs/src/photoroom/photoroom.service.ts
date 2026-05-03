import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PhotoroomService {
  private readonly logger = new Logger(PhotoroomService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://image-api.photoroom.com/v2/edit';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PHOTOROOM_API_KEY');
  }

  async replaceBackground(
    productImageBuffer: Buffer,
    backgroundImageUrl?: string,
    backgroundPrompt?: string,
  ): Promise<Buffer> {
    if (!this.apiKey) {
      this.logger.error('PHOTOROOM_API_KEY is not defined in .env');
      throw new Error('PhotoRoom API key is missing');
    }

    const formData = new FormData();
    
    // Create a Blob from the buffer for the image file
    const imageBlob = new Blob([new Uint8Array(productImageBuffer)], { type: 'image/png' });
    formData.append('imageFile', imageBlob, 'product.png');
    formData.append('referenceBox', 'originalImage');
    formData.append('removeBackground', 'true');

    if (backgroundImageUrl) {
      formData.append('background.guidance.imageUrl', backgroundImageUrl);
      formData.append('background.guidance.scale', '0.8');
    } else if (backgroundPrompt) {
      formData.append('background.prompt', backgroundPrompt);
    }

    try {
      this.logger.log(`Calling PhotoRoom API for background replacement...`);
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'pr-ai-background-model-version': 'background-studio-beta-2025-03-17',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`PhotoRoom API error: ${response.status} - ${errorText}`);
        throw new Error(`PhotoRoom API failed: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      this.logger.error(`Error in replaceBackground: ${error.message}`);
      throw error;
    }
  }
}
