import { Controller, Post, Get, Req, Body, UnauthorizedException, Param, Patch } from '@nestjs/common';
import { VendorRequestsService } from './vendor-requests.service';
import { AuthService } from '../auth/auth.service';
import { VendorsService } from '../vendors/vendors.service';
import { Request } from 'express';
import { COOKIE_NAME } from '../common/constants';

@Controller('vendor-requests')
export class VendorRequestsController {
    constructor(
        private vendorRequestsService: VendorRequestsService,
        private authService: AuthService,
        private vendorsService: VendorsService,
    ) { }

    private async getVendor(req: Request) {
        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.[COOKIE_NAME];

        if (!token) throw new UnauthorizedException('No token found');

        const payload = await this.authService.verifySession(token);
        if (!payload) throw new UnauthorizedException('Invalid session');

        const user = await this.authService.findUserByOpenId(payload.openId);
        if (!user) throw new UnauthorizedException('User not found');

        const vendor = await this.vendorsService.findByUserId(user.id);
        if (!vendor) throw new UnauthorizedException('Vendor profile not found');

        return vendor;
    }

    private async getUser(req: Request) {
        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.[COOKIE_NAME];

        if (!token) throw new UnauthorizedException('No token found');

        const payload = await this.authService.verifySession(token);
        if (!payload) throw new UnauthorizedException('Invalid session');

        const user = await this.authService.findUserByOpenId(payload.openId);
        if (!user) throw new UnauthorizedException('User not found');

        return user;
    }

    @Post()
    async create(@Req() req: Request, @Body() body: { type: string, data: any, scheduledAt?: string }) {
        const vendor = await this.getVendor(req);
        const type = body.type || 'category_request';
        const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : undefined;
        return this.vendorRequestsService.create(vendor.id, type, body.data, scheduledAt);
    }

    @Get('my-requests')
    async getMyRequests(@Req() req: Request) {
        const vendor = await this.getVendor(req);
        return this.vendorRequestsService.findByVendor(vendor.id);
    }

    @Get()
    async findAll(@Req() req: Request) {
        const user = await this.getUser(req);
        if (user.role !== 'admin') throw new UnauthorizedException('Admin access required');
        return this.vendorRequestsService.findAll();
    }

    @Patch(':id/status')
    async updateStatus(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() body: { status: string, adminNotes?: string }
    ) {
        const user = await this.getUser(req);
        if (user.role !== 'admin') throw new UnauthorizedException('Admin access required');
        return this.vendorRequestsService.updateStatus(+id, body.status, body.adminNotes);
    }
}
