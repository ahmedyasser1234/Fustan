import { Body, Controller, Post, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('try-on')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'dressImage', maxCount: 1 },
        { name: 'userImage', maxCount: 1 },
    ]))
    async generateTryOn(
        @UploadedFiles() files: { dressImage?: Express.Multer.File[], userImage?: Express.Multer.File[] },
        @Body() body: any
    ) {
        // Normalize files to array for service
        const fileArray: Express.Multer.File[] = [];
        if (files.dressImage?.[0]) fileArray.push(files.dressImage[0]);
        if (files.userImage?.[0]) fileArray.push(files.userImage[0]);

        return this.aiService.generateTryOn(body, fileArray);
    }

    @Post('analyze-analytics')
    async analyzeAnalytics(@Body() body: any) {
        return this.aiService.analyzeAnalytics(body);
    }
}
