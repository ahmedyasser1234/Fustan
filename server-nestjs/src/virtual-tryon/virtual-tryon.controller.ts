import { Controller, Post, Body, Res, HttpStatus, Logger } from '@nestjs/common';
import { VirtualTryonService } from './virtual-tryon.service';
import { Response } from 'express';

@Controller('tryon')
export class VirtualTryonController {
  private readonly logger = new Logger(VirtualTryonController.name);

  constructor(private readonly tryonService: VirtualTryonService) {}

  @Post()
  async tryon(
    @Body() body: { userImage: string; productImage: string },
    @Res() res: Response,
  ) {
    try {
      if (!body.userImage || !body.productImage) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Both userImage and productImage are required as base64 strings',
        });
      }

      this.logger.log('Received try-on request');
      const imageBuffer = await this.tryonService.generateTryOn(
        body.userImage,
        body.productImage,
      );

      res.set('Content-Type', 'image/png');
      res.send(imageBuffer);
    } catch (error) {
      this.logger.error(`Try-on endpoint error: ${error.message}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to generate try-on image',
        error: error.message,
      });
    }
  }
}
