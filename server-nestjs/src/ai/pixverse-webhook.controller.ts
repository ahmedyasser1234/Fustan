import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PixVerseService } from './pixverse.service';

@Controller('ai/pixverse')
export class PixVerseWebhookController {
  private readonly logger = new Logger(PixVerseWebhookController.name);

  constructor(private readonly pixVerseService: PixVerseService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Headers() headers: any, @Body() payload: any) {
    this.logger.log(
      `Received PixVerse Webhook: ${payload.id} (Status: ${payload.status})`,
    );

    // 1. Verify Signature
    const isValid = this.pixVerseService.verifySignature(headers, payload);
    if (!isValid) {
      this.logger.error('Invalid PixVerse webhook signature');
      throw new UnauthorizedException('invalid signature');
    }

    // 2. Process based on status
    // PixVerse status: usually 1 for success, 2 for failure (or similar)
    // From doc: { "id": "123456789", "status": 1, "url": "...", ... }
    const { id, status, url, error } = payload;

    if (status === 1 || status === 'success' || status === 'completed') {
      await this.pixVerseService.handleTaskSuccess(id, url);
    } else {
      await this.pixVerseService.handleTaskFailure(
        id,
        error || 'Unknown task failure',
      );
    }

    // 3. Must return "ok" as per PixVerse documentation
    return 'ok';
  }
}
