import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

export const CLOUDINARY = 'Cloudinary';

export const CloudinaryProvider = {
    provide: CLOUDINARY,
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET'),
        });
    },
    inject: [ConfigService],
};

@Injectable()
export class CloudinaryService {
    async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream((error, result) => {
                if (error) return reject(error);
                resolve(result!);
            });

            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }
}
