import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe Webhook handler' })
  async handleStripeWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log('Received Stripe Webhook');
    // Implementation for verifying signature and updating order status
    // return this.paymentsService.handleStripeWebhook(payload, signature);
    return { received: true };
  }

  @Post('webhook/tabby')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tabby Webhook handler' })
  async handleTabbyWebhook(@Body() payload: any) {
    this.logger.log('Received Tabby Webhook');
    // Implementation for Tabby webhook
    return { status: 'acknowledged' };
  }

  @Post('webhook/tamara')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tamara Webhook handler' })
  async handleTamaraWebhook(@Body() payload: any) {
    this.logger.log('Received Tamara Webhook');
    // Implementation for Tamara webhook
    return { status: 'acknowledged' };
  }
}
