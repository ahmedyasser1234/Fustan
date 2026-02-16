
import { Controller, Get, Post, Patch, Req, Body, Query, Param, UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import type { Request } from 'express';
import { COOKIE_NAME } from '../common/constants';

@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private authService: AuthService
    ) { }

    private async getUser(req: Request) {
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) throw new UnauthorizedException('No token found');
        const payload = await this.authService.verifySession(token);
        if (!payload) throw new UnauthorizedException('Invalid session');
        const user = await this.authService.findUserByOpenId(payload.openId);
        if (!user) throw new UnauthorizedException('User not found');
        return user;
    }

    @Get('conversations')
    async getConversations(@Req() req: Request) {
        const user = await this.getUser(req);
        return this.chatService.getConversations(user.id, user.role);
    }

    @Get('messages/:id')
    async getMessages(@Req() req: Request, @Param('id') id: string) {
        const user = await this.getUser(req);
        return this.chatService.getMessages(+id, user.id);
    }

    @Post('start')
    async startConversation(@Req() req: Request, @Body() body: { vendorId: number; content: string }) {
        const user = await this.getUser(req);
        // Customer starting chat with vendor
        return this.chatService.sendMessage(user.id, user.role, null, body.content, undefined, body.vendorId);
    }
    @Get('unread-count')
    async getUnreadCount(@Req() req: Request) {
        const user = await this.getUser(req);
        const count = await this.chatService.getUnreadCount(user.id, user.role);
        return { count };
    }

    @Patch('conversations/:id/read')
    async markRead(@Req() req: Request, @Param('id') id: string) {
        const user = await this.getUser(req);
        return this.chatService.markAsRead(+id, user.id, user.role);
    }
}
