import { Controller, Get, Post, Req, UnauthorizedException, Param, Body, Patch, Delete, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import type { Request } from 'express';
import { COOKIE_NAME } from '../common/constants';

@Controller('admin')
export class AdminController {
    constructor(
        private adminService: AdminService,
        private authService: AuthService
    ) { }



    private async checkAdmin(req: Request) {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) throw new UnauthorizedException('No token');

        const payload = await this.authService.verifySession(token);
        if (!payload || payload.role !== 'admin') {
            throw new UnauthorizedException('Not an admin');
        }
        return payload;
    }

    @Get('vendors')
    async getVendors(@Req() req: Request) {
        await this.checkAdmin(req);
        return this.adminService.getAllVendors();
    }

    @Post('vendors')
    async createVendor(@Req() req: Request, @Body() body: any) {
        await this.checkAdmin(req);
        return this.adminService.createVendor(body);
    }

    @Get('customers')
    async getCustomers(@Req() req: Request) {
        await this.checkAdmin(req);
        return this.adminService.getAllCustomers();
    }

    @Get('orders')
    async getOrders(@Req() req: Request) {
        await this.checkAdmin(req);
        return this.adminService.getAllOrders();
    }

    @Get('products')
    async getProducts(@Req() req: Request, @Query('search') search?: string) {
        await this.checkAdmin(req);
        return this.adminService.getAllProducts(search);
    }

    @Get('conversations')
    async getConversations(@Req() req: Request) {
        const payload = await this.checkAdmin(req);
        const user = await this.authService.findUserByOpenId(payload.openId);
        if (!user) throw new UnauthorizedException('User not found');

        return this.adminService.getAllConversations(user.id);
    }

    @Patch('vendors/:id/email')
    async updateVendorEmail(@Req() req: Request, @Param('id') id: string, @Body('email') email: string) {
        await this.checkAdmin(req);
        return this.adminService.updateVendorEmail(+id, email);
    }

    @Delete('vendors/:id')
    async deleteVendor(@Req() req: Request, @Param('id') id: string) {
        await this.checkAdmin(req);
        return this.adminService.deleteVendor(+id);
    }

    @Patch('vendors/:id/commission')
    async updateVendorCommission(
        @Req() req: Request,
        @Param('id') id: string,
        @Body('commissionRate') commissionRate: number
    ) {
        await this.checkAdmin(req);
        return this.adminService.updateVendorCommission(+id, commissionRate);
    }

    @Get('customers/:id')
    async getCustomer(@Req() req: Request, @Param('id') id: string) {
        await this.checkAdmin(req);
        return this.adminService.getCustomerDetails(+id);
    }

    @Delete('customers/:id')
    async deleteCustomer(@Req() req: Request, @Param('id') id: string) {
        const adminPayload = await this.checkAdmin(req);
        return this.adminService.deleteCustomer(+id, adminPayload.email);
    }

    @Get('search')
    async search(@Req() req: Request, @Query('q') q: string) {
        await this.checkAdmin(req);
        return this.adminService.globalSearch(q);
    }
}
