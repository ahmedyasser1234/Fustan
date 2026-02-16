import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { StoreReviewsService } from './store-reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('store-reviews')
export class StoreReviewsController {
    constructor(private readonly storeReviewsService: StoreReviewsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() createReviewDto: any, @Req() req: any) {
        return this.storeReviewsService.create(createReviewDto, req.user);
    }

    @Get()
    findAll() {
        return this.storeReviewsService.findAll();
    }
}
