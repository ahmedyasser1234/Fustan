import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { storeReviews } from '../database/schema';
import { desc, eq, and } from 'drizzle-orm';

@Injectable()
export class StoreReviewsService {
    constructor(private drizzle: DatabaseService) { }

    async create(data: any, user: any) {
        if (user.role !== 'customer') {
            throw new ForbiddenException('Only customers can write reviews');
        }

        const existingReview = await this.drizzle.db.select().from(storeReviews).where(
            eq(storeReviews.customerId, user.id)
        ).limit(1);

        if (existingReview.length > 0) {
            throw new ConflictException('You have already reviewed this store');
        }

        try {
            console.log('Creating review for user:', user.id, 'Data:', data);
            return await this.drizzle.db.insert(storeReviews).values({
                ...data,
                customerId: user.id,
                guestName: user.name || data.guestName, // Use authenticated name if available
                isApproved: true,
            }).returning();
        } catch (error) {
            console.error('Error creating store review:', error);
            throw error;
        }
    }

    async findAll() {
        return await this.drizzle.db.select()
            .from(storeReviews)
            .where(eq(storeReviews.isApproved, true))
            .orderBy(desc(storeReviews.createdAt));
    }
}
