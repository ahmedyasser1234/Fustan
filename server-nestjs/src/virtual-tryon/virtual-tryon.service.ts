import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VirtualTryonService {
  private readonly logger = new Logger(VirtualTryonService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.developer.pixelcut.ai/v1/try-on';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PIXA_API_KEY');
  }

  /**
   * Calls Pixa virtual try-on API.
   * @param personImageBase64 - base64 string of the person's photo
   * @param garmentImageBase64 - base64 string of the garment/dress photo
   * @returns result_url - URL to the generated try-on image (valid for 1 hour)
   */
  async generateTryOn(
    personImageBase64: string,
    garmentImageBase64: string,
  ): Promise<{ result_url: string }> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('PIXA_API_KEY is not configured');
    }

    // Strip base64 data URI prefix if present
    const cleanPerson = personImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const cleanGarment = garmentImageBase64.replace(/^data:image\/\w+;base64,/, '');

    const personBuffer = Buffer.from(cleanPerson, 'base64');
    const garmentBuffer = Buffer.from(cleanGarment, 'base64');

    // Build multipart form using native FormData (Node 18+)
    const formData = new FormData();

    const personBlob = new Blob([personBuffer], { type: 'image/jpeg' });
    const garmentBlob = new Blob([garmentBuffer], { type: 'image/jpeg' });

    formData.append('person_image', personBlob, 'person.jpg');
    formData.append('garment_image', garmentBlob, 'garment.jpg');
    formData.append('wait_for_result', 'true');

    this.logger.log('🎽 Sending request to Pixa Virtual Try-On API...');

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Pixa API error: ${response.status} ${errorText}`);
      throw new InternalServerErrorException(
        `Pixa Virtual Try-On failed: ${response.status} - ${errorText}`,
      );
    }

    const result = await response.json() as any;
    this.logger.log(`✅ Pixa Try-On success: ${result.result_url}`);

    return { result_url: result.result_url };
  }
}
