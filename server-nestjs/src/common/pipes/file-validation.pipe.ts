import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';

import { fromBuffer } from 'file-type';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly logger = new Logger(FileValidationPipe.name);

  constructor(private readonly maxSizeBytes: number = 10 * 1024 * 1024) { } // 10MB

  async transform(value: any) {
    if (!value) return null;

    // Single file
    if (value.fieldname && value.buffer) {
      await this.validateFile(value);
    }

    // Multiple files
    else if (Array.isArray(value)) {
      for (const file of value) {
        await this.validateFile(file);
      }
    }

    return value;
  }

  private async validateFile(file: any) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    // Detect real file type from buffer
    const detected = await fromBuffer(file.buffer);

    if (!detected || !allowedMimeTypes.includes(detected.mime)) {
      this.logger.error(
        `❌ Invalid file type detected: ${detected?.mime || 'unknown'} (claimed: ${file.mimetype})`,
      );

      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.',
      );
    }

    // Extra check (header mimetype)
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file mimetype header: ${file.mimetype}`,
      );
    }

    // Size validation
    if (file.size > this.maxSizeBytes) {
      this.logger.error(
        `❌ File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );

      throw new BadRequestException(
        `File too large. Max allowed is ${(this.maxSizeBytes / 1024 / 1024).toFixed(2)}MB`,
      );
    }
  }
}