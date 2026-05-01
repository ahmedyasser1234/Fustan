import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  Param,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
  ) {}

  @Get('vendors')
  async getVendors() {
    return this.adminService.getAllVendors();
  }

  @Get('vendors/pending')
  async getPendingVendors() {
    return this.adminService.getPendingVendors();
  }

  @Post('vendors')
  async createVendor(@Body() body: any) {
    return this.adminService.createVendor(body);
  }

  @Get('customers')
  async getCustomers() {
    return this.adminService.getAllCustomers();
  }

  @Get('orders')
  async getOrders() {
    return this.adminService.getAllOrders();
  }

  @Get('products')
  async getProducts(@Query('search') search?: string) {
    return this.adminService.getAllProducts(search);
  }

  @Get('conversations')
  async getConversations(@Req() req: any) {
    const user = await this.authService.findUserByOpenId(req.user.openId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.adminService.getAllConversations(user.id);
  }

  @Patch('vendors/:id/email')
  async updateVendorEmail(
    @Param('id') id: string,
    @Body('email') email: string,
  ) {
    return this.adminService.updateVendorEmail(+id, email);
  }

  @Delete('vendors/:id')
  async deleteVendor(@Param('id') id: string) {
    return this.adminService.deleteVendor(+id);
  }

  @Patch('vendors/:id/commission')
  async updateVendorCommission(
    @Param('id') id: string,
    @Body('commissionRate') commissionRate: number,
  ) {
    return this.adminService.updateVendorCommission(+id, commissionRate);
  }

  @Patch('vendors/:id/commission-fixed')
  async updateVendorFixedCommission(
    @Param('id') id: string,
    @Body('commissionFixed') commissionFixed: number,
  ) {
    return this.adminService.updateVendorFixedCommission(+id, commissionFixed);
  }

  @Patch('vendors/:id/status')
  async updateVendorStatus(
    @Param('id') id: string,
    @Body('status') status: 'approved' | 'rejected',
  ) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new UnauthorizedException('Invalid status');
    }
    return this.adminService.updateVendorStatus(+id, status);
  }

  @Get('customers/:id')
  async getCustomer(@Param('id') id: string) {
    return this.adminService.getCustomerDetails(+id);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Req() req: any, @Param('id') id: string) {
    return this.adminService.deleteCustomer(+id, req.user.email);
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return this.adminService.globalSearch(q);
  }
}
