import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { shipping } from '../database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ShippingService {
    constructor(private databaseService: DatabaseService) { }

    async findAll(vendorId: number) {
        return await this.databaseService.db
            .select()
            .from(shipping)
            .where(eq(shipping.vendorId, vendorId));
    }

    async findByProduct(productId: number) {
        const result = await this.databaseService.db
            .select()
            .from(shipping)
            .where(eq(shipping.productId, productId))
            .limit(1);
        
        return result.length > 0 ? result[0] : null;
    }

    async upsert(vendorId: number, productId: number, shippingCost: number) {
        // Check if shipping cost already exists for this product
        const existing = await this.findByProduct(productId);

        if (existing) {
            // Update existing
            const [updated] = await this.databaseService.db
                .update(shipping)
                .set({ shippingCost, updatedAt: new Date() })
                .where(eq(shipping.productId, productId))
                .returning();
            return updated;
        } else {
            // Insert new
            const [created] = await this.databaseService.db
                .insert(shipping)
                .values({ vendorId, productId, shippingCost })
                .returning();
            return created;
        }
    }

    async delete(productId: number) {
        await this.databaseService.db
            .delete(shipping)
            .where(eq(shipping.productId, productId));
    }
}
