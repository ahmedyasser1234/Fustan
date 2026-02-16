
import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { orders, orderItems, products, cartItems, notifications, vendors, coupons, offers, offerItems, users } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';
import { NotificationsService } from '../notifications/notifications.service';
import { CouponsService } from '../coupons/coupons.service';
import { WalletsService } from '../wallets/wallets.service';
import { PointsService } from '../points/points.service';

@Injectable()
export class OrdersService {
    constructor(
        private databaseService: DatabaseService,
        private notificationsService: NotificationsService,
        private couponsService: CouponsService,
        private walletsService: WalletsService,
        private pointsService: PointsService
    ) { }

    async findAll(customerId: number, limit = 20, offset = 0) {
        return await this.databaseService.db
            .select()
            .from(orders)
            .where(eq(orders.customerId, customerId))
            .limit(limit)
            .offset(offset)
            .orderBy(desc(orders.createdAt));
    }

    async findOne(id: number) {
        const orderRaw = await this.databaseService.db
            .select({
                order: orders,
                customer: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    phone: users.phone,
                }
            })
            .from(orders)
            .leftJoin(users, eq(orders.customerId, users.id))
            .where(eq(orders.id, id))
            .limit(1);

        if (orderRaw.length === 0) return null;

        const items = await this.databaseService.db
            .select({
                id: orderItems.id,
                orderId: orderItems.orderId,
                productId: orderItems.productId,
                vendorId: orderItems.vendorId,
                quantity: orderItems.quantity,
                price: orderItems.price,
                total: orderItems.total,
                size: orderItems.size,
                productNameAr: products.nameAr,
                productNameEn: products.nameEn,
                productImage: products.images,
                storeNameAr: vendors.storeNameAr,
                storeNameEn: vendors.storeNameEn,
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .leftJoin(vendors, eq(orderItems.vendorId, vendors.id))
            .where(eq(orderItems.orderId, id));

        return { ...orderRaw[0].order, customer: orderRaw[0].customer, items };
    }

    async create(customerId: number, shippingAddress: any, paymentMethod = 'card', couponCode?: string) {
        console.log(`📦 [OrdersService] Creating Order for Customer ID: ${customerId}`);

        const cart = await this.databaseService.db
            .select()
            .from(cartItems)
            .where(eq(cartItems.customerId, customerId));

        console.log(`   - Cart Items Found: ${cart.length}`);

        if (cart.length === 0) {
            console.error(`❌ [OrdersService] Cart is empty for Customer ID: ${customerId}`);
            throw new BadRequestException('السلة فارغة');
        }

        // Group items by vendor
        const vendorGroups = new Map<number, { items: any[], subtotal: number, vendorUserId: number }>();

        for (const item of cart) {
            const product = await this.databaseService.db
                .select()
                .from(products)
                .where(eq(products.id, item.productId))
                .limit(1);

            if (product.length > 0) {
                const prod = product[0];
                const vendorId = prod.vendorId;

                // Get Vendor User ID for notification
                let vendorUserId = 0;
                if (vendorId) {
                    const vendor = await this.databaseService.db
                        .select({ userId: vendors.userId })
                        .from(vendors)
                        .where(eq(vendors.id, vendorId))
                        .limit(1);
                    if (vendor.length > 0) vendorUserId = vendor[0].userId;
                }

                if (!vendorGroups.has(vendorId)) {
                    vendorGroups.set(vendorId, { items: [], subtotal: 0, vendorUserId });
                }

                const price = Number(prod.price);
                const itemTotal = price * item.quantity;
                const group = vendorGroups.get(vendorId)!;

                group.subtotal += itemTotal;
                group.items.push({
                    productId: prod.id,
                    vendorId: prod.vendorId,
                    quantity: item.quantity,
                    price: price,
                    total: itemTotal,
                    size: item.size,
                });
            }
        }

        // Validate and apply coupon if exists
        let coupon: any = null;
        if (couponCode) {
            try {
                coupon = await this.couponsService.findByCode(couponCode);
                console.log('✅ Coupon found:', { id: coupon.id, code: coupon.code, vendorId: coupon.vendorId, usedCount: coupon.usedCount });
            } catch (e) {
                // Ignore invalid coupon, proceed without discount or throw? 
                // Best to ignore or handle gracefully as frontend should have validated
                console.log('❌ Invalid coupon code during order creation:', couponCode, e.message);
            }
        }

        const createdOrders: any[] = [];

        await this.databaseService.db.transaction(async (tx) => {
            // 1. Strict Stock Validation for ALL items before processing
            for (const [vendorId, group] of vendorGroups) {
                for (const item of group.items) {
                    const productRes = await tx
                        .select()
                        .from(products)
                        .where(eq(products.id, item.productId))
                        .limit(1);

                    if (productRes.length === 0) throw new BadRequestException(`Product ${item.productNameEn || item.productId} not found`);

                    const prod = productRes[0];

                    if (item.size) {
                        const sizes = prod.sizes as { size: string; quantity: number }[] | null;
                        const sizeObj = sizes?.find(s => s.size === item.size);
                        if (!sizeObj || sizeObj.quantity < item.quantity) {
                            throw new BadRequestException(`الكمية غير متوفرة للمنتج ${prod.nameAr} مقاس ${item.size}`);
                        }
                    } else {
                        if ((prod.stock || 0) < item.quantity) {
                            throw new BadRequestException(`الكمية غير متوفرة للمنتج ${prod.nameAr}`);
                        }
                    }
                }
            }

            for (const [vendorId, group] of vendorGroups) {
                // --- Automatic Offers Logic ---
                let automaticDiscount = 0;
                const now = new Date();

                // Fetch active offers for this vendor
                const vendorOffers = await this.databaseService.db
                    .select()
                    .from(offers)
                    .where(and(
                        eq(offers.vendorId, vendorId),
                        eq(offers.isActive, true)
                    ));

                for (const offer of vendorOffers) {
                    // Check date validity
                    const startDate = new Date(offer.startDate);
                    const endDate = new Date(offer.endDate);
                    endDate.setHours(23, 59, 59, 999); // Inclusive end date

                    if (startDate > now || endDate < now) continue;

                    // Check usage limit
                    if (offer.usageLimit && (offer.usedCount || 0) >= offer.usageLimit) continue;

                    // Get products for this offer
                    const opItems = await this.databaseService.db
                        .select({ productId: offerItems.productId })
                        .from(offerItems)
                        .where(eq(offerItems.offerId, offer.id));

                    const offerProductIds = opItems.map(i => i.productId);

                    // Find matching items in the order group
                    let matchingItems: any[] = [];
                    if (offerProductIds.length === 0) {
                        // Store-wide offer (all items from this vendor)
                        matchingItems = group.items;
                    } else {
                        // Specific products
                        matchingItems = group.items.filter(item => offerProductIds.includes(item.productId));
                    }

                    if (matchingItems.length > 0) {
                        const totalQty = matchingItems.reduce((sum, item) => sum + item.quantity, 0);

                        // Check Min Quantity Condition
                        if (totalQty >= (offer.minQuantity || 1)) {
                            const matchingSubtotal = matchingItems.reduce((sum, item) => sum + item.total, 0);
                            const discount = (matchingSubtotal * offer.discountPercent) / 100;
                            automaticDiscount += discount;

                            // Increment offer usage count
                            await tx.update(offers)
                                .set({ usedCount: (offer.usedCount || 0) + 1 })
                                .where(eq(offers.id, offer.id));
                        }
                    }
                }

                // --- End Automatic Offers Logic ---

                // Apply discount if coupon belongs to this vendor
                let couponDiscount = 0;
                if (coupon && coupon.vendorId === vendorId) {
                    couponDiscount = (group.subtotal * coupon.discountPercent) / 100;
                    // ... coupon usage update ...
                    await tx.update(coupons)
                        .set({ usedCount: (coupon.usedCount || 0) + 1 })
                        .where(eq(coupons.id, coupon.id));
                }

                const totalDiscount = automaticDiscount + couponDiscount;
                const finalTotal = group.subtotal - totalDiscount;

                // Get Vendor Shipping Cost and Commission Rate
                let shippingCost = 0;
                let commissionRate = 0;

                if (vendorGroups.has(vendorId)) {
                    const vendorData = await this.databaseService.db
                        .select({
                            shippingCost: vendors.shippingCost,
                            commissionRate: vendors.commissionRate
                        })
                        .from(vendors)
                        .where(eq(vendors.id, vendorId))
                        .limit(1);

                    if (vendorData.length > 0) {
                        shippingCost = vendorData[0].shippingCost;
                        commissionRate = vendorData[0].commissionRate || 0;
                    }
                }

                const orderTotal = finalTotal + shippingCost;

                // Calculate Commission
                // Commission is usually based on subtotal - discount (Revenue generated for vendor)
                // Assuming commission is changing on the sold amount (excluding shipping)
                const commissionBase = Math.max(0, finalTotal);
                const commission = (commissionBase * commissionRate) / 100;

                const orderNumber = `ORD-${Date.now()}-${vendorId}-${Math.floor(Math.random() * 1000)}`;

                if (paymentMethod === 'card') {
                    // Simulate Payment Gateway Delay
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                const [newOrder] = await tx
                    .insert(orders)
                    .values({
                        orderNumber,
                        customerId,
                        vendorId,
                        status: paymentMethod === 'card' ? 'confirmed' : 'pending',
                        paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
                        stripePaymentId: paymentMethod === 'card' ? `mock_tx_${Date.now()}` : null,
                        subtotal: group.subtotal,
                        discount: totalDiscount,
                        shippingCost: shippingCost,
                        commission: commission,
                        total: orderTotal,
                        shippingAddress,
                        paymentMethod,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    })
                    .returning();

                const itemsWithOrderId = group.items.map((item) => ({
                    ...item,
                    orderId: newOrder.id,
                }));

                await tx.insert(orderItems).values(itemsWithOrderId);

                // Update stock
                for (const item of group.items) {
                    const product = await tx
                        .select()
                        .from(products)
                        .where(eq(products.id, item.productId))
                        .limit(1);

                    if (product.length > 0) {
                        const prod = product[0];
                        const newStock = Math.max(0, (prod.stock || 0) - item.quantity);

                        let newSizes = prod.sizes;
                        if (item.size && prod.sizes) {
                            const sizes = prod.sizes as { size: string; quantity: number }[];
                            newSizes = sizes.map(s => {
                                if (s.size === item.size) {
                                    return { ...s, quantity: Math.max(0, s.quantity - item.quantity) };
                                }
                                return s;
                            });
                        }

                        await tx.update(products)
                            .set({ stock: newStock, sizes: newSizes })
                            .where(eq(products.id, item.productId));
                    }
                }

                createdOrders.push(newOrder);

                // Update Vendor Wallet (Net Earnings: FinalTotal - Commission)
                const vendorEarnings = finalTotal - commission;
                if (newOrder.paymentStatus === 'paid') {
                    await this.walletsService.handleOrderPaid(vendorId, newOrder.id, vendorEarnings);
                    await this.pointsService.earnPoints(customerId, newOrder.total, newOrder.id);
                }

                // Send Notification to Vendor
                if (group.vendorUserId) {
                    await this.notificationsService.notify(
                        group.vendorUserId,
                        'new_order',
                        'طلب جديد!',
                        `لديك طلب جديد رقم #${orderNumber} بقيمة ${group.subtotal}`,
                        newOrder.id
                    );
                }

                // Send Notification to Customer
                await this.notificationsService.notify(
                    customerId,
                    'order_created',
                    'تم استلام طلبك',
                    `تم استلام طلبك رقم #${orderNumber} بنجاح`,
                    newOrder.id
                );

                // Notify Admins
                await this.notificationsService.notifyAdmins(
                    'new_order_admin',
                    'طلب جديد في النظام',
                    `تم إنشاء طلب جديد رقم #${orderNumber} للعميل ${customerId}`,
                    newOrder.id
                );
            }

            // Clear cart
            await tx.delete(cartItems).where(eq(cartItems.customerId, customerId));
        });

        return createdOrders;
    }

    async updateStatus(orderId: number, status: string, userId?: number) {
        // Fetch Order with Vendor info using standard Join
        const [result] = await this.databaseService.db
            .select()
            .from(orders)
            .leftJoin(vendors, eq(orders.vendorId, vendors.id))
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!result || !result.orders) throw new BadRequestException('Order not found');

        const currentOrder = result.orders;
        const vendor = result.vendors;
        const vendorUserId = vendor ? vendor.userId : null;

        // Validation 1: Strict Forward-Only Workflow
        const stepMap: Record<string, number> = { pending: 1, confirmed: 2, shipped: 3, delivered: 4, cancelled: 0 };

        const currentStatusNormalized = (currentOrder.status || '').toLowerCase();
        const newStatusNormalized = (status || '').toLowerCase();

        const currentStep = stepMap[currentStatusNormalized] || 0;
        const newStep = stepMap[newStatusNormalized] || 0;

        // Prevent ANY backtracking (except cancelling, if allowed)
        if (newStep < currentStep && newStatusNormalized !== 'cancelled') {
            throw new BadRequestException('Cannot revert order to a previous status.');
        }

        // Validation 2: Role Checks (if userId provided)
        if (userId) {
            const [user] = await this.databaseService.db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (user) {
                // Vendor checks
                if (user.role === 'vendor') {
                    // Verify vendor owns the order
                    if (user.id !== vendorUserId) {
                        throw new BadRequestException('You are not authorized to update this order.');
                    }
                    // Vendor cannot set Delivered
                    if (newStatusNormalized === 'delivered') {
                        throw new BadRequestException('Vendors cannot mark orders as Delivered. Only customers can confirm receipt.');
                    }
                }
            }
        }

        const [updatedOrder] = await this.databaseService.db
            .update(orders)
            .set({ status: newStatusNormalized, updatedAt: new Date() })
            .where(eq(orders.id, orderId))
            .returning();

        if (updatedOrder) {
            // Customer Notification
            await this.notificationsService.notify(
                updatedOrder.customerId,
                'order_status',
                'تحديث حالة الطلب',
                `تم تغيير حالة طلبك رقم #${updatedOrder.orderNumber} إلى ${status}`,
                updatedOrder.id
            );

            // Vendor Notification (If Delivered)
            if (newStatusNormalized === 'delivered' && vendorUserId) {
                await this.notificationsService.notify(
                    vendorUserId,
                    'order_delivered',
                    'تم تسليم الطلب',
                    `قام العميل بتأكيد استلام الطلب رقم #${updatedOrder.orderNumber}`,
                    updatedOrder.id
                );

                // Move funds from pending to available in Vendor Wallet
                const vendorEarnings = Number(updatedOrder.total) - Number(updatedOrder.commission) - Number(updatedOrder.shippingCost || 0);
                const vendorId = updatedOrder.vendorId;
                if (vendorId) {
                    await this.walletsService.handleOrderDelivered(vendorId, updatedOrder.id, vendorEarnings);
                }

                // Award points if not already awarded (COD case)
                if (updatedOrder.paymentStatus === 'paid' || newStatusNormalized === 'delivered') {
                    await this.pointsService.earnPoints(updatedOrder.customerId, updatedOrder.total, updatedOrder.id);
                }
            }
        }
        return updatedOrder;
    }
}
