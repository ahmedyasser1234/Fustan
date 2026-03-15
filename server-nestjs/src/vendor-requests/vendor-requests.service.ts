import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class VendorRequestsService {
    constructor(
        private databaseService: DatabaseService,
    ) { }

    private get db() {
        return this.databaseService.db;
    }

    async create(vendorId: number, data: any) {
        return await this.db.insert(schema.vendorRequests).values({
            vendorId,
            type: 'category_request',
            data,
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
}
