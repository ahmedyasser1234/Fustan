import { Controller, Get, Patch, Param, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    private getUserId(req: Request): number {
        const user = (req as any).user;
        if (!user || !user.id) {
            throw new UnauthorizedException();
        }
        return Number(user.id);
    }

    @Get()
    async findAll(@Req() req: Request) {
        const userId = this.getUserId(req);
        return this.notificationsService.findAll(userId);
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: Request) {
        const userId = this.getUserId(req);
        return this.notificationsService.getUnreadCount(userId);
    }

    @Patch(':id/read')
    async markAsRead(@Req() req: Request, @Param('id') id: string) {
        const userId = this.getUserId(req);
        return this.notificationsService.markAsRead(Number(id), userId);
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: Request) {
        const userId = this.getUserId(req);
        return this.notificationsService.markAllAsRead(userId);
    }
}
