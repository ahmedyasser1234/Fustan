import { v2 as cloudinary } from 'cloudinary';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export const CLOUDINARY = 'Cloudinary';

export const CloudinaryProvider = {
    provide: CLOUDINARY,
    useFactory: (configService: ConfigService) => {
        const config = {
            cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET'),
        };
        console.log("☁️ [Cloudinary Provider] Configuring with:", {
            cloud_name: config.cloud_name,
            api_key: config.api_key ? "***" : "MISSING",
            api_secret: config.api_secret ? "***" : "MISSING"
        });
        return cloudinary.config(config);
    },
    inject: [ConfigService],
};

@Injectable()
export class CloudinaryService {
    constructor(@Inject(CLOUDINARY) private cloudinaryInstance: any) {
        console.log("🚀 [Cloudinary Service] Initialized and forced configuration.");
    }

    async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                {
                    folder: 'fustan-products',
                    transformation: [
                        { width: 1200, height: 1200, crop: "limit" },
                        { quality: "auto" },
                        { fetch_format: "auto" }
                    ]
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result!);
                }
            );

            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }
}
