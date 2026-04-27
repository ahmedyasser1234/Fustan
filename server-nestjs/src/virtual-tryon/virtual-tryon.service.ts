import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VirtualTryonService {
  private readonly logger = new Logger(VirtualTryonService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
  }

  async generateTryOn(userImageBase64: string, productImageBase64: string): Promise<Buffer> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

    const cleanUserImage = userImageBase64.replace(/^data:image\/\w+;base64,/, '');
    const cleanProductImage = productImageBase64.replace(/^data:image\/\w+;base64,/, '');

    const requestBody = {
      contents: [{
        parts: [
          { text: "I have two images: a person and a dress. Describe in detail how the person would look wearing this dress. Mention fit, style, and overall appearance." },
          { inlineData: { mimeType: 'image/jpeg', data: cleanUserImage } },
          { inlineData: { mimeType: 'image/jpeg', data: cleanProductImage } },
        ],
      }],
    };

    try {
      this.logger.log('Sending request to Gemini 2.5 Flash (text mode test)...');

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API error: ${response.status} ${errorText}`);
        throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
      }

      const result = await response.json() as any;
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      this.logger.log(`Gemini response: ${text}`);

      // رجّع الـ text كـ Buffer مؤقتاً للتيست
      return Buffer.from(JSON.stringify({ success: true, message: text }));

    } catch (error) {
      this.logger.error(`Failed to call Gemini API: ${error.message}`);
      throw error;
    }
  }
}