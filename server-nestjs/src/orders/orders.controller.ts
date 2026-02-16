import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, Req, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthService } from '../auth/auth.service';
import type { Request } from 'express';
import { COOKIE_NAME } from '../common/constants';

@Controller('orders')
export class OrdersController {
    constructor(
        private ordersService: OrdersService,
        private authService: AuthService,
    ) { }

    private async getUserId(req: Request): Promise<number> {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) throw new UnauthorizedException();

        const payload = await this.authService.verifySession(token);
        if (!payload) throw new UnauthorizedException();

        const user = await this.authService.findUserByOpenId(payload.openId);
        if (!user) throw new UnauthorizedException('User not found');

        return user.id;
    }

    @Get()
    async findAll(@Req() req: Request) {
        const userId = await this.getUserId(req);
        return this.ordersService.findAll(userId);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.findOne(id);
    }

    @Post()
    async create(
        @Req() req: Request,
        @Body('shippingAddress') shippingAddress: any,
        @Body('paymentMethod') paymentMethod?: string,
        @Body('couponCode') couponCode?: string,
    ) {
        const userId = await this.getUserId(req);
        console.log('📦 Creating order with couponCode:', couponCode);
        return this.ordersService.create(userId, shippingAddress, paymentMethod, couponCode);
    }

    @Patch(':id/status')
    async updateStatus(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: string,
    ) {
        const userId = await this.getUserId(req);
        // We need to know who is asking. Since we don't have full Role in getUserId (returns ID),
        // we might need to fetch User with Role or pass ID to service and let service check.
        // Let's modify getUserId to return User or fetch it in Service. Service is better.
        return this.ordersService.updateStatus(id, status, userId);
    }
}
