import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly logger = new Logger(FileValidationPipe.name);
  constructor(private readonly maxSizeBytes: number = 10 * 1024 * 1024) { } // Default 10MB

  async transform(value: any) {
    if (!value) return null;

    // Handle single file
    if (value.fieldname && value.buffer) {
      await this.validateFile(value);
    }
    // Handle array of files
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

    // Detect real type from buffer using dynamic import for ESM compatibility
    const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<any>);
    const detected = await fileTypeFromBuffer(file.buffer);
    if (!detected || !allowedMimeTypes.includes(detected.mime)) {
      this.logger.error(
        `❌ [FileValidationPipe] Invalid file type detected: ${detected?.mime || 'unknown'} (claimed: ${file.mimetype})`,
      );
      throw new BadRequestException(
        `Invalid file type detected. Only JPEG, PNG, WEBP, and GIF are allowed.`,
      );
    }

    // Double check mimetype header just in case, though buffer is more reliable
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file mimetype header: ${file.mimetype}.`,
      );
    }

    if (file.size > this.maxSizeBytes) {
      this.logger.error(
        `❌ [FileValidationPipe] File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${(this.maxSizeBytes / 1024 / 1024).toFixed(2)}MB`,
      );
      throw new BadRequestException(
        `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max allowed is ${(this.maxSizeBytes / 1024 / 1024).toFixed(2)}MB.`,
      );
    }
  }
}
