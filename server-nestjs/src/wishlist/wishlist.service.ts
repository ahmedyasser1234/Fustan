import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { wishlist, products, wishlistSettings } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

@Injectable()
export class WishlistService {
    constructor(private databaseService: DatabaseService) { }

    async findAll(customerId: number) {
        return await this.databaseService.db
            .select({
                id: wishlist.id,
                productId: wishlist.productId,
                createdAt: wishlist.createdAt,
                product: products,
            })
            .from(wishlist)
            .innerJoin(products, eq(wishlist.productId, products.id))
            .where(eq(wishlist.customerId, customerId))
            .orderBy(desc(wishlist.createdAt));
    }

    async add(customerId: number, productId: number) {
        // ... (existing add code)
        // Check if product exists
        const [product] = await this.databaseService.db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Check if already in wishlist
        const [existing] = await this.databaseService.db
            .select()
            .from(wishlist)
            .where(
                and(
                    eq(wishlist.customerId, customerId),
                    eq(wishlist.productId, productId)
                )
            )
            .limit(1);

        if (existing) {
            return existing;
        }

        const [item] = await this.databaseService.db
            .insert(wishlist)
            .values({
                customerId,
                productId,
            })
            .returning();

        return item;
    }

    async remove(customerId: number, productId: number) {
        // ... (existing remove code)
        const result = await this.databaseService.db
            .delete(wishlist)
            .where(
                and(
                    eq(wishlist.customerId, customerId),
                    eq(wishlist.productId, productId)
                )
            )
            .returning();

        if (result.length === 0) {
            throw new NotFoundException('Item not found in wishlist');
        }

        return { success: true };
    }

    async checkStatus(customerId: number, productId: number) {
        // ... (existing checkStatus code)
        const [item] = await this.databaseService.db
            .select()
            .from(wishlist)
            .where(
                and(
                    eq(wishlist.customerId, customerId),
                    eq(wishlist.productId, productId)
                )
            )
            .limit(1);

        return { isFavorite: !!item };
    }

    // --- Sharing Logic ---

    async getSettings(userId: number) {
        let [settings] = await this.databaseService.db
            .select()
            .from(wishlistSettings)
            .where(eq(wishlistSettings.userId, userId))
            .limit(1);

        if (!settings) {
            [settings] = await this.databaseService.db
                .insert(wishlistSettings)
                .values({
                    userId,
                    isPublic: false,
                    shareToken: nanoid(10),
                })
                .returning();
        }

        return settings;
    }

    async updateSettings(userId: number, isPublic: boolean) {
        const current = await this.getSettings(userId);

        return await this.databaseService.db
            .update(wishlistSettings)
            .set({
                isPublic,
                updatedAt: new Date(),
            })
            .where(eq(wishlistSettings.id, current.id))
            .returning();
    }

    async findByToken(token: string) {
        const [settings] = await this.databaseService.db
            .select()
            .from(wishlistSettings)
            .where(and(
                eq(wishlistSettings.shareToken, token),
                eq(wishlistSettings.isPublic, true)
            ))
            .limit(1);

        if (!settings) {
            throw new NotFoundException('Wishlist not found or private');
        }

        return await this.findAll(settings.userId);
    }
}
