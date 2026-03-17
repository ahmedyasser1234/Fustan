import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';

import { CloudinaryService } from '../media/cloudinary.provider';

@Injectable()
export class VendorRequestsService {
    constructor(
        private databaseService: DatabaseService,
        private readonly cloudinary: CloudinaryService,
    ) { }

    private get db() {
        return this.databaseService.db;
    }

    async create(vendorId: number, type: string, data: any, scheduledAt?: Date, file?: Express.Multer.File) {
        if (file) {
            const result = await this.cloudinary.uploadFile(file);
            if ('secure_url' in result) {
                // If it's a collection_request, it expects imageUrl. 
                // If it's a category_request, maybe it expects imageUrl or image.
                // We'll update the data object with the new URL.
                if (type === 'collection_request' || type === 'category_request') {
                    data.imageUrl = result.secure_url;
                }
            }
        }
        return await this.db.insert(schema.vendorRequests).values({
            vendorId,
            type,
            data,
            scheduledAt,
            status: 'pending',
        }).returning();
    }

    async findByVendor(vendorId: number) {
        return await this.db.select().from(schema.vendorRequests).where(eq(schema.vendorRequests.vendorId, vendorId));
    }

    async findAll() {
        return await this.db.select().from(schema.vendorRequests);
    }

    async updateStatus(id: number, status: string, adminNotes?: string) {
        return await this.db.update(schema.vendorRequests)
            .set({ status, adminNotes, updatedAt: new Date() })
            .where(eq(schema.vendorRequests.id, id))
            .returning();
    }

    async markAsExecuted(id: number) {
        return await this.db.update(schema.vendorRequests)
            .set({ isExecuted: true, updatedAt: new Date() })
            .where(eq(schema.vendorRequests.id, id))
            .returning();
    }
}
