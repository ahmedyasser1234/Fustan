
import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, BadRequestException, Query, Patch } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponsService: CouponsService) { }

    @Post()
    create(@Body() createCouponDto: any) {
        return this.couponsService.create(createCouponDto);
    }

    @Get()
    findAll(@Query('vendorId') vendorId: string) {
        if (!vendorId) {
            throw new BadRequestException('Vendor ID is required');
        }
        return this.couponsService.findAll(Number(vendorId));
    }

    @Post('validate')
    validate(@Body() body: { code: string }) {
        return this.couponsService.findByCode(body.code);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.couponsService.remove(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateCouponDto: any) {
        return this.couponsService.update(id, updateCouponDto);
    }
}
