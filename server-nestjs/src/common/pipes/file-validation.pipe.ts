import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
    constructor(private readonly maxSizeBytes: number = 10 * 1024 * 1024) { } // Default 10MB

    transform(value: any) {
        if (!value) return null;

        // Handle single file
        if (value.fieldname && value.buffer) {
            this.validateFile(value);
        }
        // Handle array of files
        else if (Array.isArray(value)) {
            value.forEach(file => this.validateFile(file));
        }

        return value;
    }

    private validateFile(file: any) {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            console.error(`❌ [FileValidationPipe] Invalid file type: ${file.mimetype}`);
            throw new BadRequestException(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, WEBP, and GIF are allowed.`);
        }

        if (file.size > this.maxSizeBytes) {
            console.error(`❌ [FileValidationPipe] File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${(this.maxSizeBytes / 1024 / 1024).toFixed(2)}MB`);
            throw new BadRequestException(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max allowed is ${(this.maxSizeBytes / 1024 / 1024).toFixed(2)}MB.`);
        }

        // Check for potential RCE indicators in filename or buffer if necessary
        // But Cloudinary upload usually handles the processing safely.
    }
}
