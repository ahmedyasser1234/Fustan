import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { userPoints, pointsTransactions } from '../database/schema';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class PointsService {
    constructor(private readonly databaseService: DatabaseService) { }

    // 1 Point for every 10 EGP spent (configurable)
    private readonly POINTS_PER_CURRENCY = 0.1;

    async getOrCreatePoints(userId: number) {
        let [pointsRecord] = await this.databaseService.db
            .select()
            .from(userPoints)
            .where(eq(userPoints.userId, userId))
            .limit(1);

        if (!pointsRecord) {
            [pointsRecord] = await this.databaseService.db
                .insert(userPoints)
                .values({
                    userId,
                    points: 0,
                })
                .returning();
        }

        return pointsRecord;
    }

    async getHistory(userId: number) {
        return await this.databaseService.db
            .select()
            .from(pointsTransactions)
            .where(eq(pointsTransactions.userId, userId))
            .orderBy(desc(pointsTransactions.createdAt));
    }

    async earnPoints(userId: number, orderTotal: number, orderId: number) {
        const pointsToEarn = Math.floor(orderTotal * this.POINTS_PER_CURRENCY);
        if (pointsToEarn <= 0) return;

        const current = await this.getOrCreatePoints(userId);

        return await this.databaseService.db.transaction(async (tx) => {
            await tx.update(userPoints)
                .set({
                    points: current.points + pointsToEarn,
                    updatedAt: new Date(),
                })
                .where(eq(userPoints.id, current.id));

            await tx.insert(pointsTransactions).values({
                userId,
                amount: pointsToEarn,
                type: 'earn',
                description: `نقاط مكافأة للطلب رقم #${orderId}`,
            });
        });
    }

    async spendPoints(userId: number, amount: number, description: string) {
        const current = await this.getOrCreatePoints(userId);
        if (current.points < amount) {
            throw new Error('Not enough points');
        }

        return await this.databaseService.db.transaction(async (tx) => {
            await tx.update(userPoints)
                .set({
                    points: current.points - amount,
                    updatedAt: new Date(),
                })
                .where(eq(userPoints.id, current.id));

            await tx.insert(pointsTransactions).values({
                userId,
                amount: -amount,
                type: 'spend',
                description: description,
            });
        });
    }
}
