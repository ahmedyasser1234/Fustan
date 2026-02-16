import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { reviews, vendorReviews, products, vendors, users } from '../database/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

@Injectable()
export class ReviewsService {
    constructor(private databaseService: DatabaseService) { }

    // Product Reviews
    async createProductReview(data: {
        productId: number;
        customerId: number;
        rating: number;
        title?: string;
        comment?: string;
        isVerifiedPurchase?: boolean;
    }) {
        // Check if user is the vendor for this product
        const [product] = await this.databaseService.db
            .select({ vendorId: products.vendorId })
            .from(products)
            .where(eq(products.id, data.productId));

        if (product) {
            const [vendor] = await this.databaseService.db
                .select({ userId: vendors.userId })
                .from(vendors)
                .where(eq(vendors.id, product.vendorId));

            if (vendor && vendor.userId === data.customerId) {
                throw new BadRequestException("لا يمكن تقيم منتجك");
            }
        }

        // Check if review exists
        const [existingReview] = await this.databaseService.db
            .select()
            .from(reviews)
            .where(and(
                eq(reviews.productId, data.productId),
                eq(reviews.customerId, data.customerId)
            ));

        let review;
        if (existingReview) {
            // Update existing
            [review] = await this.databaseService.db
                .update(reviews)
                .set({
                    rating: data.rating,
                    title: data.title,
                    comment: data.comment,
                    updatedAt: new Date(),
                })
                .where(eq(reviews.id, existingReview.id))
                .returning();
        } else {
            // Create new
            [review] = await this.databaseService.db
                .insert(reviews)
                .values(data)
                .returning();
        }

        // Update product rating
        await this.updateProductRating(data.productId);

        return review;
    }

    async getProductReviews(productId: number) {
        return await this.databaseService.db
            .select({
                id: reviews.id,
                productId: reviews.productId,
                customerId: reviews.customerId,
                customerName: users.name,
                rating: reviews.rating,
                title: reviews.title,
                comment: reviews.comment,
                images: reviews.images,
                isVerifiedPurchase: reviews.isVerifiedPurchase,
                helpful: reviews.helpful,
                unhelpful: reviews.unhelpful,
                createdAt: reviews.createdAt,
                updatedAt: reviews.updatedAt,
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.customerId, users.id))
            .where(eq(reviews.productId, productId))
            .orderBy(desc(reviews.createdAt));
    }

    private async updateProductRating(productId: number) {
        const reviewStats = await this.databaseService.db
            .select({
                avgRating: sql<number>`AVG(${reviews.rating})`,
                count: sql<number>`COUNT(*)`,
            })
            .from(reviews)
            .where(eq(reviews.productId, productId));

        if (reviewStats[0]) {
            await this.databaseService.db
                .update(products)
                .set({
                    rating: Number(reviewStats[0].avgRating) || 0,
                    reviewCount: Number(reviewStats[0].count) || 0,
                })
                .where(eq(products.id, productId));
        }
    }

    // Vendor Reviews
    async createVendorReview(data: {
        vendorId: number;
        customerId: number;
        rating: number;
        comment?: string;
        isVerifiedPurchase?: boolean;
    }) {
        // Check if user is the vendor owner
        const [vendor] = await this.databaseService.db
            .select({ userId: vendors.userId })
            .from(vendors)
            .where(eq(vendors.id, data.vendorId));

        if (vendor && vendor.userId === data.customerId) {
            throw new BadRequestException("لا يمكن تقيم متجرك");
        }

        // Check if review exists
        const [existingReview] = await this.databaseService.db
            .select()
            .from(vendorReviews)
            .where(and(
                eq(vendorReviews.vendorId, data.vendorId),
                eq(vendorReviews.customerId, data.customerId)
            ));

        let review;
        if (existingReview) {
            // Update existing
            [review] = await this.databaseService.db
                .update(vendorReviews)
                .set({
                    rating: data.rating,
                    comment: data.comment,
                    updatedAt: new Date(),
                })
                .where(eq(vendorReviews.id, existingReview.id))
                .returning();
        } else {
            // Create new
            [review] = await this.databaseService.db
                .insert(vendorReviews)
                .values(data)
                .returning();
        }

        // Update vendor rating
        await this.updateVendorRating(data.vendorId);

        return review;
    }

    async getVendorReviews(vendorId: number) {
        return await this.databaseService.db
            .select({
                id: vendorReviews.id,
                vendorId: vendorReviews.vendorId,
                customerId: vendorReviews.customerId,
                customerName: users.name,
                rating: vendorReviews.rating,
                comment: vendorReviews.comment,
                isVerifiedPurchase: vendorReviews.isVerifiedPurchase,
                createdAt: vendorReviews.createdAt,
                updatedAt: vendorReviews.updatedAt,
            })
            .from(vendorReviews)
            .leftJoin(users, eq(vendorReviews.customerId, users.id))
            .where(eq(vendorReviews.vendorId, vendorId))
            .orderBy(desc(vendorReviews.createdAt));
    }

    private async updateVendorRating(vendorId: number) {
        const reviewStats = await this.databaseService.db
            .select({
                avgRating: sql<number>`AVG(${vendorReviews.rating})`,
                count: sql<number>`COUNT(*)`,
            })
            .from(vendorReviews)
            .where(eq(vendorReviews.vendorId, vendorId));

        if (reviewStats[0]) {
            await this.databaseService.db
                .update(vendors)
                .set({
                    rating: Number(reviewStats[0].avgRating) || 0,
                    totalReviews: Number(reviewStats[0].count) || 0,
                })
                .where(eq(vendors.id, vendorId));
        }
    }
}
