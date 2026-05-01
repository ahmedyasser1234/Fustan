import {
  Controller,
  Get,
  UnauthorizedException,
  Query,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VendorsService } from './vendors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';

@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPending() {
    return this.vendorsService.findAllPending();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.vendorsService.updateStatus(+id, status);
  }

  @Get()
  async findAll() {
    return this.vendorsService.findAll();
  }
  @Get('support')
  async getSupport() {
    return this.vendorsService.getSupportVendor();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@User('id') userId: number) {
    const vendor = await this.vendorsService.findByUserId(userId);

    if (!vendor) {
      throw new UnauthorizedException('Vendor profile not found');
    }

    const stats = await this.vendorsService.getStats(vendor.id);
    const recentOrders = await this.vendorsService.getRecentOrders(vendor.id);

    return {
      vendor,
      stats,
      recentOrders,
    };
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(@User('id') userId: number, @Query('page') page?: string) {
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor) throw new UnauthorizedException('Vendor profile not found');
    return this.vendorsService.getOrders(vendor.id, page ? +page : 1);
  }

  @Get('customers')
  @UseGuards(JwtAuthGuard)
  async getCustomers(@User('id') userId: number) {
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor) throw new UnauthorizedException('Vendor profile not found');
    return this.vendorsService.getCustomers(vendor.id);
  }

  @Get('customers/:customerId')
  @UseGuards(JwtAuthGuard)
  async getCustomerDetails(
    @User('id') userId: number,
    @Param('customerId') customerId: string,
  ) {
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor) throw new UnauthorizedException('Vendor profile not found');
    return this.vendorsService.getCustomerDetails(vendor.id, +customerId);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  async getAnalytics(@User('id') userId: number) {
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor) throw new UnauthorizedException('Vendor profile not found');
    return this.vendorsService.getAnalytics(vendor.id);
  }

  @Get(':idOrSlug')
  async getOne(@Param('idOrSlug') idOrSlug: string) {
    const vendor = await this.vendorsService.findOne(idOrSlug);
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'vendor')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
      { name: 'gallery', maxCount: 10 },
    ]),
  )
  async update(
    @User('id') userId: number,
    @Param('id') id: string,
    @Body() updateVendorDto: any,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    },
  ) {
    return this.vendorsService.update(+id, updateVendorDto, files, userId);
  }
}
