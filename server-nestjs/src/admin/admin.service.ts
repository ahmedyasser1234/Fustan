import { scrypt, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { vendors, users, orders, products, conversations, messages } from '../database/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

@Injectable()
export class AdminService {
    constructor(private databaseService: DatabaseService) { }

    async getAllVendors() {
        return await this.databaseService.db
            .select()
            .from(vendors)
            .orderBy(desc(vendors.createdAt));
    }

    async getAllCustomers() {
        return await this.databaseService.db
            .select()
            .from(users)
            .where(eq(users.role, 'customer'))
            .orderBy(desc(users.lastSignedIn));
    }

    async getAllOrders() {
        return await this.databaseService.db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                customerId: orders.customerId,
                customerName: users.name,
                total: orders.total,
                status: orders.status,
                paymentStatus: orders.paymentStatus,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .leftJoin(users, eq(orders.customerId, users.id))
            .orderBy(desc(orders.createdAt));
    }

    async getAllProducts(search?: string) {
        let query = this.databaseService.db
            .select()
            .from(products);

        if (search) {
            const searchPattern = `%${search.toLowerCase()}%`;
            query = query.where(
                sql`lower(${products.nameAr}) LIKE ${searchPattern} OR lower(${products.nameEn}) LIKE ${searchPattern}`
            ) as any;
        }

        return await query.orderBy(desc(products.createdAt));
    }

    async getAllConversations(adminId: number) {
        // Return only conversations where the admin is a participant
        // Admin acts as a user (customerId) when talking to vendors
        // or potentially as a vendor (vendorId) if they manage a store directly (though less common for super admin)

        console.log(`AdminService: getAllConversations called for adminId: ${adminId}`);

        const results = await this.databaseService.db
            .select({
                id: conversations.id,
                customerId: conversations.customerId,
                vendorId: conversations.vendorId,
                lastMessageTime: conversations.updatedAt,
                customerName: users.name,
                customerEmail: users.email,
                customerAvatar: users.avatar,
                storeNameAr: vendors.storeNameAr,
                storeNameEn: vendors.storeNameEn,
                storeSlug: vendors.storeSlug,
                storeLogo: vendors.logo,
                lastMessage: messages.content
            })
            .from(conversations)
            .leftJoin(messages, eq(conversations.lastMessageId, messages.id))
            .leftJoin(users, eq(conversations.customerId, users.id))
            .leftJoin(vendors, eq(conversations.vendorId, vendors.id))
            .where(
                sql`${conversations.customerId} = ${adminId} OR ${vendors.userId} = ${adminId} OR ${conversations.vendorId} = ${adminId}`
            )
            .orderBy(desc(conversations.updatedAt));

        return results;
    }

    private async hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const salt = randomBytes(16).toString('hex');
            scrypt(password, salt, 64, (err, derivedKey) => {
                if (err) reject(err);
                resolve(`${salt}:${derivedKey.toString('hex')}`);
            });
        });
    }

    async createAdminAccount(email: string, password: string, name: string) {
        const hashedPassword = await this.hashPassword(password);
        const openId = `admin_${Date.now()}`;

        const [admin] = await this.databaseService.db.insert(users).values({
            openId,
            email,
            name,
            password: hashedPassword,
            role: 'admin',
            loginMethod: 'email',
            lastSignedIn: new Date(),
        }).returning();

        return admin;
    }

    async createVendor(data: {
        email: string;
        password: string;
        storeNameAr: string;
        storeNameEn: string;
        phone?: string;
        city?: string;
        commissionRate?: number;
    }) {
        // Check if email already exists
        const existingUser = await this.databaseService.db
            .select()
            .from(users)
            .where(eq(users.email, data.email))
            .limit(1);

        if (existingUser.length > 0) {
            throw new UnauthorizedException('Email already exists');
        }

        // Generate unique storeSlug from English name
        const baseSlug = data.storeNameEn
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let storeSlug = baseSlug;
        let counter = 1;

        // Ensure slug is unique
        while (true) {
            const existingVendor = await this.databaseService.db
                .select()
                .from(vendors)
                .where(eq(vendors.storeSlug, storeSlug))
                .limit(1);

            if (existingVendor.length === 0) break;
            storeSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        // Hash password
        const hashedPassword = await this.hashPassword(data.password);
        const openId = `vendor_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        return await this.databaseService.db.transaction(async (tx) => {
            // Create user
            const [newUser] = await tx.insert(users).values({
                openId,
                email: data.email,
                name: data.storeNameEn,
                phone: data.phone,
                password: hashedPassword,
                role: 'vendor',
                loginMethod: 'email',
                lastSignedIn: new Date(),
            }).returning();

            // Create vendor
            const [newVendor] = await tx.insert(vendors).values({
                userId: newUser.id,
                storeNameAr: data.storeNameAr,
                storeNameEn: data.storeNameEn,
                storeSlug,
                email: data.email,
                phone: data.phone,
                cityAr: data.city,
                cityEn: data.city,
                commissionRate: data.commissionRate || 10,
                status: 'approved', // Auto-approve admin-created vendors
            }).returning();

            return { user: newUser, vendor: newVendor };
        });
    }

    async deleteVendor(vendorId: number) {
        // 1. Find vendor to get userId
        const vendor = await this.databaseService.db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
        if (vendor.length === 0) return { success: false, message: 'Vendor not found' };

        return await this.databaseService.db.transaction(async (tx) => {
            // Delete vendor profile
            await tx.delete(vendors).where(eq(vendors.id, vendorId));
            // Optionally delete user or just deactivate? Admin requested "Delete vendor info"
            // We'll just delete the vendor profile for now.
            return { success: true };
        });
    }

    async updateVendorEmail(vendorId: number, newEmail: string) {
        const vendor = await this.databaseService.db.select().from(vendors).where(eq(vendors.id, vendorId)).limit(1);
        if (vendor.length === 0) return { success: false, message: 'Vendor not found' };

        return await this.databaseService.db.transaction(async (tx) => {
            // Update vendor email
            await tx.update(vendors).set({ email: newEmail }).where(eq(vendors.id, vendorId));
            // Update user email as well
            await tx.update(users).set({ email: newEmail }).where(eq(users.id, vendor[0].userId));
            return { success: true };
        });
    }

    async updateVendorCommission(vendorId: number, commissionRate: number) {
        return await this.databaseService.db.transaction(async (tx) => {
            const [updated] = await tx
                .update(vendors)
                .set({ commissionRate, updatedAt: new Date() })
                .where(eq(vendors.id, vendorId))
                .returning();

            // Recalculate all product prices for this vendor
            const rateMultiplier = 1 + commissionRate / 100;

            // We use sql helper for dynamic calculation in update
            await tx.execute(sql`
                UPDATE products 
                SET 
                    price = COALESCE("vendorPrice", price / ${rateMultiplier}) * ${rateMultiplier},
                    "originalPrice" = COALESCE("vendorOriginalPrice", "vendorPrice", "originalPrice" / ${rateMultiplier}) * ${rateMultiplier},
                    "updatedAt" = NOW()
                WHERE "vendorId" = ${vendorId}
            `);

            return updated;
        });
    }

    async globalSearch(query: string) {
        const searchPattern = `%${query.toLowerCase()}%`;

        const [vendorsResults, productsResults, customersResults, ordersResults] = await Promise.all([
            this.databaseService.db
                .select()
                .from(vendors)
                .where(
                    sql`lower(${vendors.storeNameAr}) LIKE ${searchPattern} OR lower(${vendors.storeNameEn}) LIKE ${searchPattern} OR lower(${vendors.email}) LIKE ${searchPattern}`
                )
                .limit(5),
            this.databaseService.db
                .select()
                .from(products)
                .where(
                    sql`lower(${products.nameAr}) LIKE ${searchPattern} OR lower(${products.nameEn}) LIKE ${searchPattern}`
                )
                .limit(5),
            this.databaseService.db
                .select()
                .from(users)
                .where(
                    and(
                        eq(users.role, 'customer'),
                        sql`lower(${users.name}) LIKE ${searchPattern} OR lower(${users.email}) LIKE ${searchPattern}`
                    )
                )
                .limit(5),
            this.databaseService.db
                .select({
                    id: orders.id,
                    orderNumber: orders.orderNumber,
                    customerName: users.name,
                })
                .from(orders)
                .leftJoin(users, eq(orders.customerId, users.id))
                .where(
                    sql`CAST(${orders.id} AS TEXT) LIKE ${searchPattern} OR lower(${orders.orderNumber}) LIKE ${searchPattern}`
                )
                .limit(5)
        ]);

        return {
            vendors: vendorsResults,
            products: productsResults,
            customers: customersResults,
            orders: ordersResults
        };
    }
}
