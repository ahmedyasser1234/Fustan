import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);
  constructor(private ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@User('id') userId: number) {
    return this.ordersService.findAll(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOne(id, userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @User('id') userId: number,
    @Body('shippingAddress') shippingAddress: any,
    @Body('paymentMethod') paymentMethod?: string,
    @Body('couponCode') couponCode?: string,
  ) {
    this.logger.log(`📦 Creating order for user ${userId}`);
    return this.ordersService.create(
      userId,
      shippingAddress,
      paymentMethod,
      couponCode,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @User('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.ordersService.updateStatus(id, status, userId);
  }
}
