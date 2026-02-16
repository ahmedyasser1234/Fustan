import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { notifications, users } from '../database/schema';
import { eq, desc, and } from 'drizzle-orm';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly notificationsGateway: NotificationsGateway
    ) { }

    async notify(userId: number, type: string, title: string, message: string, relatedId?: number) {
        // 1. Save to DB
        const [notif] = await this.databaseService.db.insert(notifications).values({
            userId,
            type,
            title,
            message,
            relatedId,
            isRead: false,
        }).returning();

        // 2. Emit via Gateway for real-time update
        this.notificationsGateway.sendNotification(String(userId), {
            id: notif.id,
            type,
            title,
            message,
            relatedId,
            createdAt: notif.createdAt
        });

        return notif;
    }

    async notifyAdmins(type: string, title: string, message: string, relatedId?: number) {
        const admins = await this.databaseService.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.role, 'admin'));

        for (const admin of admins) {
            await this.notify(admin.id, type, title, message, relatedId);
        }
    }

    async findAll(userId: number) {
        return await this.databaseService.db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt));
    }

    async getUnreadCount(userId: number) {
        const result = await this.databaseService.db
            .select({
                count: notifications.id
            })
            .from(notifications)
            .where(
                and(
                    eq(notifications.userId, userId),
                    eq(notifications.isRead, false)
                )
            );
        return { count: result.length };
    }

    async markAsRead(id: number, userId: number) {
        await this.databaseService.db
            .update(notifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(notifications.id, id),
                    eq(notifications.userId, userId)
                )
            );
        return { success: true };
    }

    async markAllAsRead(userId: number) {
        await this.databaseService.db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));
        return { success: true };
    }
}
