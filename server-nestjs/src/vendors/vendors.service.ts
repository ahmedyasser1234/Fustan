import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { vendors, products, orders, orderItems, users, reviews } from '../database/schema';
import { eq, and, sql, desc, inArray, count } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../media/cloudinary.provider';

@Injectable()
export class VendorsService {
    constructor(
        private databaseService: DatabaseService,
        private cloudinaryService: CloudinaryService,
        private notificationsService: NotificationsService
    ) { }

    async findAll() {
        return await this.databaseService.db
            .select()
            .from(vendors)
            .where(eq(vendors.isActive, true));
    }

    async findByUserId(userId: number) {
        const result = await this.databaseService.db
            .select()
            .from(vendors)
            .where(eq(vendors.userId, userId))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    async findOne(idOrSlug: string | number) {
        // Try to parse as ID if it looks like a number
        const id = Number(idOrSlug);

        if (!isNaN(id) && id > 0) {
            const result = await this.databaseService.db
                .select()
                .from(vendors)
                .where(eq(vendors.id, id))
                .limit(1);

            if (result.length > 0) return result[0];
        }

        // Try to find by slug
        const result = await this.databaseService.db
            .select()
            .from(vendors)
            .where(eq(vendors.storeSlug, String(idOrSlug)))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    async getStats(vendorId: number) {
        // Run queries in parallel for maximum performance
        const [productsCountResult, ordersCountResult, revenueResult, pendingOrdersResult, ratingResult] = await Promise.all([
            // Total Products
            this.databaseService.db
                .select({ count: sql<number>`count(*)` })
                .from(products)
                .where(eq(products.vendorId, vendorId)),

            // Total Orders
            this.databaseService.db
                .select({ count: sql<number>`count(*)` })
                .from(orders)
                .where(eq(orders.vendorId, vendorId)),

            // Total Revenue (Paid orders only)
            this.databaseService.db
                .select({ total: sql<string>`sum(${orders.total})` })
                .from(orders)
                .where(and(eq(orders.vendorId, vendorId), eq(orders.paymentStatus, 'paid'))),

            // Pending Orders
            this.databaseService.db
                .select({ count: sql<number>`count(*)` })
                .from(orders)
                .where(and(eq(orders.vendorId, vendorId), eq(orders.status, 'pending'))),

            // Average Rating (from product reviews)
            this.databaseService.db
                .select({ rating: sql<string>`avg(${reviews.rating})` })
                .from(reviews)
                .innerJoin(products, eq(reviews.productId, products.id))
                .where(eq(products.vendorId, vendorId)),
        ]);

        const avgRating = Number(ratingResult[0]?.rating || 0);

        return {
            totalProducts: Number(productsCountResult[0]?.count || 0),
            totalOrders: Number(ordersCountResult[0]?.count || 0),
            totalRevenue: Number(revenueResult[0]?.total || 0),
            pendingOrders: Number(pendingOrdersResult[0]?.count || 0),
            rating: parseFloat(avgRating.toFixed(1)), // Return 1 decimal place, e.g., 4.5
        };
    }

    async getRecentOrders(vendorId: number, limit = 5) {
        // Get orders with customer info
        const ordersList = await this.databaseService.db
            .select({
                order: orders,
                customer: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    phone: users.phone
                }
            })
            .from(orders)
            .leftJoin(users, eq(orders.customerId, users.id))
            .where(eq(orders.vendorId, vendorId))
            .limit(limit)
            .orderBy(desc(orders.createdAt));

        if (ordersList.length === 0) return [];

        // Get items count for these orders
        const orderIds = ordersList.map(o => o.order.id);
        const itemsCount = await this.databaseService.db
            .select({
                orderId: orderItems.orderId,
                count: sql<number>`count(*)`
            })
            .from(orderItems)
            .where(inArray(orderItems.orderId, orderIds))
            .groupBy(orderItems.orderId);

        // Map items count to orders
        return ordersList.map(({ order, customer }) => ({
            ...order,
            customer,
            items: Array(Number(itemsCount.find(i => i.orderId === order.id)?.count || 0))
        }));
    }

    async getOrders(vendorId: number, page = 1) {
        const offset = (page - 1) * 20;

        // 1. Get Orders with Customer Info
        const ordersList = await this.databaseService.db
            .select({
                order: orders,
                customer: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    phone: users.phone
                }
            })
            .from(orders)
            .leftJoin(users, eq(orders.customerId, users.id))
            .where(eq(orders.vendorId, vendorId))
            .limit(20)
            .offset(offset)
            .orderBy(desc(orders.createdAt));

        if (ordersList.length === 0) {
            return { data: [], total: 0 };
        }

        // 2. Get Items for these orders with product details
        const orderIds = ordersList.map(o => o.order.id);

        const items = await this.databaseService.db
            .select({
                item: orderItems,
                product: {
                    nameAr: products.nameAr,
                    nameEn: products.nameEn,
                    images: products.images
                }
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(inArray(orderItems.orderId, orderIds));

        // 3. Attach items and customer info to orders
        const ordersWithItems = ordersList.map(({ order, customer }) => {
            const orderItemsList = items
                .filter(i => i.item.orderId === order.id)
                .map(i => ({ ...i.item, product: i.product }));
            return { ...order, items: orderItemsList, customer };
        });

        // 4. Get Total Count (Separate query for pagination)
        const [countResult] = await this.databaseService.db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.vendorId, vendorId));

        return { data: ordersWithItems, total: Number(countResult?.count || 0) };
    }

    async update(id: number, data: any, files?: { logo?: Express.Multer.File[], banner?: Express.Multer.File[], coverImage?: Express.Multer.File[], gallery?: Express.Multer.File[] }) {
        const updateData = { ...data };

        // Parse socialLinks if it's a JSON string (FormData sends objects as strings)
        if (updateData.socialLinks && typeof updateData.socialLinks === 'string') {
            try {
                updateData.socialLinks = JSON.parse(updateData.socialLinks);
            } catch (e) {
                console.error('Failed to parse socialLinks:', e);
                // Keep as-is if parsing fails
            }
        }

        if (files?.logo?.[0]) {
            const result = await this.cloudinaryService.uploadFile(files.logo[0]);
            updateData.logo = result.secure_url;
        }

        if (files?.banner?.[0]) {
            const result = await this.cloudinaryService.uploadFile(files.banner[0]);
            updateData.banner = result.secure_url;
        }

        if (files?.coverImage?.[0]) {
            const result = await this.cloudinaryService.uploadFile(files.coverImage[0]);
            updateData.coverImage = result.secure_url;
        }

        if (files?.gallery?.length) {
            const uploadResults = await Promise.all(
                files.gallery.map(file => this.cloudinaryService.uploadFile(file))
            );
            const galleryUrls = uploadResults.map(res => res.secure_url);

            // Get existing gallery to append
            const [existing] = await this.databaseService.db
                .select({ gallery: vendors.gallery })
                .from(vendors)
                .where(eq(vendors.id, id));

            const currentGallery = existing?.gallery || [];
            updateData.gallery = [...currentGallery, ...galleryUrls];
        }

        const [updated] = await this.databaseService.db
            .update(vendors)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(vendors.id, id))
            .returning();
        return updated;
    }

    async getCustomers(vendorId: number) {
        // Get all paid/delivered orders for this vendor to find unique customers
        const vendorOrders = await this.databaseService.db
            .select({
                customerId: orders.customerId,
                total: orders.total,
                createdAt: orders.createdAt,
                status: orders.status
            })
            .from(orders)
            .where(
                and(
                    eq(orders.vendorId, vendorId),
                    // Simplify: List anyone who has an order that is paid, shipped or delivered
                    inArray(orders.status, ['paid', 'shipped', 'delivered'])
                )
            );

        if (vendorOrders.length === 0) return [];

        const customerIds = [...new Set(vendorOrders.map(o => o.customerId))];

        // Fetch user details for these customers
        const customers = await this.databaseService.db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
                location: users.address
            })
            .from(users)
            .where(inArray(users.id, customerIds));

        // Calculate stats for each customer
        const customersWithStats = customers.map(customer => {
            const customerOrders = vendorOrders.filter(o => o.customerId === customer.id);
            const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.total), 0);
            const lastOrderDate = customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt;

            return {
                ...customer,
                totalOrders: customerOrders.length,
                totalSpent,
                lastOrderDate
            };
        });

        return customersWithStats;
    }

    async getCustomerDetails(vendorId: number, customerId: number) {
        // Verify customer exists
        const [customer] = await this.databaseService.db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
                address: users.address
            })
            .from(users)
            .where(eq(users.id, customerId))
            .limit(1);

        if (!customer) throw new NotFoundException('Customer not found');

        // Get orders history with this vendor
        const customerOrders = await this.getOrders(vendorId); // Reuse getOrders but filter? No, standard getOrders is paginated and for all.

        // Let's make a specific query for this customer's orders with this vendor
        // We can reuse the logic from getOrders partially or write a new one.
        // Let's write a targeted query.

        const ordersList = await this.databaseService.db
            .select()
            .from(orders)
            .where(
                and(
                    eq(orders.vendorId, vendorId),
                    eq(orders.customerId, customerId)
                )
            )
            .orderBy(desc(orders.createdAt));

        // We also need items for these orders to show details if asked, or just list them.
        // Let's just return the orders list first. Frontend can expand if needed or we assume simple list.
        // Actually, fetching items is better for "Profile" view to show what they bought.

        const orderIds = ordersList.map(o => o.id);
        let ordersWithItems: any[] = [];

        if (orderIds.length > 0) {
            const items = await this.databaseService.db
                .select({
                    item: orderItems,
                    product: {
                        nameAr: products.nameAr,
                        nameEn: products.nameEn,
                        images: products.images
                    }
                })
                .from(orderItems)
                .leftJoin(products, eq(orderItems.productId, products.id))
                .where(inArray(orderItems.orderId, orderIds));

            ordersWithItems = ordersList.map(order => {
                const orderItemsList = items
                    .filter(i => i.item.orderId === order.id)
                    .map(i => ({ ...i.item, product: i.product }));
                return { ...order, items: orderItemsList };
            });
        }

        // Calculate total stats
        const totalSpent = ordersList.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const totalOrders = ordersList.length;

        return {
            customer,
            stats: {
                totalSpent,
                totalOrders
            },
            orders: ordersWithItems
        };
    }


    async getAnalytics(vendorId: number) {
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

        const ordersList = await this.databaseService.db
            .select({
                createdAt: orders.createdAt,
                total: orders.total,
                paymentStatus: orders.paymentStatus
            })
            .from(orders)
            .where(
                and(
                    eq(orders.vendorId, vendorId),
                    sql`${orders.createdAt} >= ${sevenMonthsAgo.toISOString()}`
                )
            )
            .orderBy(orders.createdAt);

        const monthlyData: { [key: string]: number } = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        ordersList.forEach(order => {
            if (order.paymentStatus === 'paid') {
                const date = new Date(order.createdAt);
                const monthKey = `${monthNames[date.getMonth()]}`;
                monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(order.total);
            }
        });

        const result: { name: string; value: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = monthNames[date.getMonth()];
            result.push({
                name: monthName,
                value: Math.round(monthlyData[monthName] || 0)
            });
        }

        return result;
    }

    async updateStatus(id: number, status: string) {
        const [updated] = await this.databaseService.db
            .update(vendors)
            .set({ status, updatedAt: new Date() })
            .where(eq(vendors.id, id))
            .returning();

        if (updated) {
            const title = status === 'approved' ? 'تم تفعيل حسابك' : 'تحديث حالة الحساب';
            const message = status === 'approved'
                ? 'تهانينا! تم تفعيل حسابك كبائع في فستان. يمكنك الآن البدء بإضافة منتجاتك.'
                : `تم تغيير حالة حسابك إلى: ${status}`;

            await this.notificationsService.notify(
                updated.userId,
                'vendor_status_update',
                title,
                message,
                updated.id
            );
        }

        return updated;
    }

    async findAllPending() {
        return await this.databaseService.db
            .select({
                vendor: vendors,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    phone: users.phone
                }
            })
            .from(vendors)
            .innerJoin(users, eq(vendors.userId, users.id))
            .where(eq(vendors.status, 'pending'))
            .orderBy(desc(vendors.createdAt));
    }
}
