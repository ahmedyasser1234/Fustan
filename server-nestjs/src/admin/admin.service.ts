import { scrypt, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { vendors, users, orders, products, conversations, messages, cartItems, wishlist, notifications, productColors, reviews, shipping, offerItems, collections, coupons, offers, vendorReviews, vendorPayouts, vendorWallets } from '../database/schema';
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

        const userId = vendor[0].userId;

        return await this.databaseService.db.transaction(async (tx) => {
            // --- A. DELETE PRODUCTS & RELATED ENTITIES ---
            const vendorProducts = await tx
                .select({ id: products.id })
                .from(products)
                .where(eq(products.vendorId, vendorId));

            const productIds = vendorProducts.map(p => p.id);

            if (productIds.length > 0) {
                // 1. Delete Product Colors
                await tx.delete(productColors).where(sql`${productColors.productId} IN ${productIds}`);

                // 2. Delete Product Reviews
                await tx.delete(reviews).where(sql`${reviews.productId} IN ${productIds}`);

                // 3. Delete Cart Items with these products
                await tx.delete(cartItems).where(sql`${cartItems.productId} IN ${productIds}`);

                // 4. Delete Wishlist items
                await tx.delete(wishlist).where(sql`${wishlist.productId} IN ${productIds}`);

                // 5. Delete Shipping rules for products
                await tx.delete(shipping).where(sql`${shipping.productId} IN ${productIds}`);

                // 6. Delete Offer Items
                await tx.delete(offerItems).where(sql`${offerItems.productId} IN ${productIds}`);

                // 7. FINALLY DELETE PRODUCTS
                await tx.delete(products).where(eq(products.vendorId, vendorId));
            }

            // --- B. DELETE COLLECTIONS ---
            await tx.delete(collections).where(eq(collections.vendorId, vendorId));

            // --- C. DELETE COUPONS ---
            await tx.delete(coupons).where(eq(coupons.vendorId, vendorId));

            // --- D. DELETE OFFERS ---
            // First delete offer items linked to vendor's offers (if not covered above)
            const vendorOffers = await tx.select({ id: offers.id }).from(offers).where(eq(offers.vendorId, vendorId));
            const offerIds = vendorOffers.map(o => o.id);
            if (offerIds.length > 0) {
                await tx.delete(offerItems).where(sql`${offerItems.offerId} IN ${offerIds}`);
                await tx.delete(offers).where(eq(offers.vendorId, vendorId));
            }

            // --- E. DELETE SHIPPING RULES (Vendor Level) ---
            await tx.delete(shipping).where(eq(shipping.vendorId, vendorId));

            // --- F. DELETE REVIEWS & RATINGS ---
            await tx.delete(vendorReviews).where(eq(vendorReviews.vendorId, vendorId));

            // --- G. DELETE WALLET & PAYOUTS ---
            await tx.delete(vendorPayouts).where(eq(vendorPayouts.vendorId, vendorId));
            // Wallet needs to be found first or deleted by vendorId if unique
            await tx.delete(vendorWallets).where(eq(vendorWallets.vendorId, vendorId));

            // --- H. DELETE CHAT CONVERSATIONS ---
            const vendorConversations = await tx
                .select({ id: conversations.id })
                .from(conversations)
                .where(eq(conversations.vendorId, vendorId));

            const conversationIds = vendorConversations.map(c => c.id);
            if (conversationIds.length > 0) {
                await tx.delete(messages).where(sql`${messages.conversationId} IN ${conversationIds}`);
                await tx.delete(conversations).where(eq(conversations.vendorId, vendorId));
            }

            // --- I. DELETE VENDOR PROFILE ---
            await tx.delete(vendors).where(eq(vendors.id, vendorId));

            // --- J. DELETE USER ACCOUNT ---
            await tx.delete(users).where(eq(users.id, userId));

            return { success: true, message: 'Vendor and all related data deleted successfully' };
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

    async getCustomerDetails(id: number) {
        const customer = await this.databaseService.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (customer.length === 0) {
            throw new UnauthorizedException('Customer not found');
        }

        const customerOrders = await this.databaseService.db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                total: orders.total,
                status: orders.status,
                paymentStatus: orders.paymentStatus,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .where(eq(orders.customerId, id))
            .orderBy(desc(orders.createdAt));

        return {
            ...customer[0],
            orders: customerOrders
        };
    }

    async deleteCustomer(id: number, adminEmail: string) {
        // Strict check: Only main admin can delete
        // Hardcoded for now as per plan. 
        // In production, this should likely be an env var or a database flag 'isSuperAdmin'
        const MAIN_ADMIN_EMAIL = 'admin@fustan.com';

        if (adminEmail !== MAIN_ADMIN_EMAIL) {
            throw new UnauthorizedException('Only the main admin can delete customers.');
        }

        const customer = await this.databaseService.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (customer.length === 0) {
            // Return success even if not found to be idempotent, or throw error? 
            // Throwing error is better for UI feedback.
            throw new UnauthorizedException('Customer not found');
        }

        return await this.databaseService.db.transaction(async (tx) => {
            // 1. Delete Cart Items
            await tx.delete(cartItems).where(eq(cartItems.customerId, id));

            // 2. Delete Wishlist
            await tx.delete(wishlist).where(eq(wishlist.customerId, id));

            // 3. Delete Notifications
            await tx.delete(notifications).where(eq(notifications.userId, id));

            // 4. Delete Messages/Conversations logic?
            // Conversations have customerId. Messages have senderId.
            // If we delete the user, we should probably keep messages for record but they won't link to a name.
            // Or we delete them. Let's keep them for now as they might be relevant for vendors.
            // But we might want to anonymize? 
            // For now, simple deletion of the user record is requested. 
            // If there are foreign key constraints, this will fail. 
            // Schema shows 'customerId' integer but no explicit foreign keys defined in Drizzle schema for 'conversations', 'orders', etc.
            // So deletion of user row should usually work unless DB level constraints exist.

            // 5. Delete the User
            await tx.delete(users).where(eq(users.id, id));

            return { success: true, message: 'Customer deleted successfully' };
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
