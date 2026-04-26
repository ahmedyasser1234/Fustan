import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { PixVerseService } from './pixverse.service';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly pixVerseService: PixVerseService,
  ) {}

  @Post('try-on')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dressImage', maxCount: 1 },
      { name: 'userImage', maxCount: 1 },
    ]),
  )
  async generateTryOn(
    @UploadedFiles()
    files: {
      dressImage?: Express.Multer.File[];
      userImage?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    // Normalize files to array for service
    const fileArray: Express.Multer.File[] = [];
    if (files.dressImage?.[0]) fileArray.push(files.dressImage[0]);
    if (files.userImage?.[0]) fileArray.push(files.userImage[0]);

    return this.aiService.generateTryOn(body, fileArray);
  }

  @Get('try-on/result/:imageId')
  async getTryOnResult(@Param('imageId') imageId: string) {
    console.log(`🔍 [AiController] Polling result for imageId: ${imageId}`);
    try {
      const result = await this.pixVerseService.getImageResult(imageId);
      console.log(`  -> PixVerse Result for ${imageId}: ${JSON.stringify(result)}`);
      
      if (result.ErrCode !== 0) {
        return { 
          status: 'failed', 
          error: result.ErrMsg || `PixVerse Error ${result.ErrCode}` 
        };
      }

      if (result.Resp) {
        const { status, url, image_url } = result.Resp;
        // status 2 = Success, 3 = Failed, 1 = Processing
        if (status === 2 || url || image_url) {
          return {
            status: 'completed',
            imageUrl: url || image_url,
          };
        } else if (status === 3) {
          return {
            status: 'failed',
            error: 'PixVerse generation failed (Status 3)',
          };
        }
        return { status: 'pending', pixverseStatus: status };
      }
      
      return { status: 'failed', error: 'Invalid response structure from PixVerse' };
    } catch (err: any) {
      console.error(`  -> Polling Error for ${imageId}:`, err);
      return { status: 'failed', error: err.message };
    }
  }

  @Post('analyze-analytics')
  async analyzeAnalytics(@Body() body: any) {
    return this.aiService.analyzeAnalytics(body);
  }

  @Post('description')
  async generateDescription(@Body() body: any) {
    return this.aiService.generateProductDescription(body);
  }

  @Post('enhance-image')
  async enhanceImage(@Body() body: { imageUrl: string; prompt?: string }) {
    return this.aiService.generateImageWithKie(body);
  }

  @Post('pixverse/background-change')
  async pixVerseBackgroundChange(
    @Body() body: { productId: number; imageUrl: string; prompt?: string },
  ) {
    const taskId = await this.pixVerseService.createBackgroundChangeTask(
      body.productId,
      body.imageUrl,
      body.prompt,
    );
    return { taskId, message: 'PixVerse Background Change task created' };
  }

  @Post('pixverse/try-on')
  async pixVerseTryOn(
    @Body()
    body: {
      userId: number;
      brideImageUrl: string;
      dressImageUrl: string;
    },
  ) {
    const taskId = await this.pixVerseService.createVirtualTryOnTask(
      body.userId,
      body.brideImageUrl,
      body.dressImageUrl,
    );
    return { taskId, message: 'PixVerse Virtual Try-On task created' };
  }

  @Post('pixverse/video/generate')
  async pixVerseVideoGenerate(
    @Body()
    body: {
      type: 'text' | 'img' | 'transition' | 'fusion';
      params: any;
      targetId?: number;
    },
  ) {
    const taskId = await this.pixVerseService.createVideoTask(
      body.type,
      body.params,
      body.targetId,
    );
    return { taskId, message: `PixVerse C1 Video (${body.type}) task created` };
  }

  @Post('pixverse/image/template')
  async pixVerseImageTemplate(
    @Body() body: { imgUrls: string[]; templateId: number },
  ) {
    const imgIds = await Promise.all(
      body.imgUrls.map((url) => this.pixVerseService.uploadImage(url)),
    );
    const imageId = await this.pixVerseService.createImageTemplateTask(
      imgIds,
      body.templateId,
    );
    return { imageId, message: 'PixVerse Image Template task created' };
  }

  @Post('pixverse/image/result')
  async pixVerseImageResult(@Body() body: { imageId: string }) {
    return this.pixVerseService.getImageResult(body.imageId);
  }

  @Post('pixverse/account/balance')
  async pixVerseAccountBalance() {
    return this.pixVerseService.getAccountBalance();
  }
}
