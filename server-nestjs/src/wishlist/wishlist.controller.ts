import { Controller, Get, Post, Delete, Param, UseGuards, Request, Body, ParseIntPipe } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    findAll(@Request() req) {
        return this.wishlistService.findAll(req.user.id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    add(@Request() req, @Body('productId', ParseIntPipe) productId: number) {
        return this.wishlistService.add(req.user.id, productId);
    }

    @Delete(':productId')
    @UseGuards(JwtAuthGuard)
    remove(@Request() req, @Param('productId', ParseIntPipe) productId: number) {
        return this.wishlistService.remove(req.user.id, productId);
    }

    @Get('check/:productId')
    @UseGuards(JwtAuthGuard)
    checkStatus(@Request() req, @Param('productId', ParseIntPipe) productId: number) {
        return this.wishlistService.checkStatus(req.user.id, productId);
    }

    // --- Sharing Endpoints ---

    @Get('settings')
    @UseGuards(JwtAuthGuard)
    getSettings(@Request() req) {
        return this.wishlistService.getSettings(req.user.id);
    }

    @Post('settings')
    @UseGuards(JwtAuthGuard)
    updateSettings(@Request() req, @Body('isPublic') isPublic: boolean) {
        return this.wishlistService.updateSettings(req.user.id, isPublic);
    }

    @Get('shared/:token')
    findByToken(@Param('token') token: string) {
        return this.wishlistService.findByToken(token);
    }
}
