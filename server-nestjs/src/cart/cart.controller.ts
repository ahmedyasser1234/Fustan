import { Controller, Get, Post, Body, Delete, Param, Query, ParseIntPipe, Req, UnauthorizedException } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthService } from '../auth/auth.service';
import type { Request } from 'express';
import { COOKIE_NAME } from '../common/constants';

@Controller('cart')
export class CartController {
    constructor(
        private cartService: CartService,
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
    async getItems(@Req() req: Request) {
        const userId = await this.getUserId(req);
        return this.cartService.getItems(userId);
    }

    @Post()
    async addItem(
        @Req() req: Request,
        @Body('productId') productId: number,
        @Body('quantity') quantity: number,
        @Body('size') size?: string,
        @Body('color') color?: string,
    ) {
        const userId = await this.getUserId(req);
        return this.cartService.addItem(userId, productId, quantity, size, color);
    }

    @Post('update')
    async updateQuantity(
        @Req() req: Request,
        @Body('cartItemId') cartItemId: number,
        @Body('quantity') quantity: number,
    ) {
        const userId = await this.getUserId(req);
        return this.cartService.updateQuantity(userId, cartItemId, quantity);
    }

    @Delete(':cartItemId')
    async removeItem(
        @Req() req: Request,
        @Param('cartItemId', ParseIntPipe) cartItemId: number,
    ) {
        const userId = await this.getUserId(req);
        return this.cartService.removeItem(userId, cartItemId);
    }

    @Post('clear')
    async clear(@Req() req: Request) {
        const userId = await this.getUserId(req);
        return this.cartService.clear(userId);
    }
}
