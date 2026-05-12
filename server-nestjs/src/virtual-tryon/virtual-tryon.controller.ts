import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Logger,
  HttpCode,
} from '@nestjs/common';
import { VirtualTryonService } from './virtual-tryon.service';

@Controller('tryon')
export class VirtualTryonController {
  private readonly logger = new Logger(VirtualTryonController.name);

  constructor(private readonly tryonService: VirtualTryonService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async tryon(
    @Body() body: { userImage: string; productImage: string },
  ) {
    if (!body.userImage || !body.productImage) {
      return {
        success: false,
        message: 'Both userImage and productImage are required as base64 strings',
      };
    }

    this.logger.log('Received try-on request');

    const result = await this.tryonService.generateTryOn(
      body.userImage,
      body.productImage,
    );

    return {
      success: true,
      result_url: result.result_url,
    };
  }
}
