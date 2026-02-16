import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { vendorWallets, walletTransactions, vendors } from '../database/schema';
import { eq, and, desc } from 'drizzle-orm';

@Injectable()
export class WalletsService {
    constructor(private readonly databaseService: DatabaseService) { }

    async getOrCreateWallet(vendorId: number) {
        let [wallet] = await this.databaseService.db
            .select()
            .from(vendorWallets)
            .where(eq(vendorWallets.vendorId, vendorId))
            .limit(1);

        if (!wallet) {
            [wallet] = await this.databaseService.db
                .insert(vendorWallets)
                .values({
                    vendorId,
                    availableBalance: 0,
                    pendingBalance: 0,
                })
                .returning();
        }

        return wallet;
    }

    async getTransactions(vendorId: number) {
        const wallet = await this.getOrCreateWallet(vendorId);

        return await this.databaseService.db
            .select()
            .from(walletTransactions)
            .where(eq(walletTransactions.walletId, wallet.id))
            .orderBy(desc(walletTransactions.createdAt));
    }

    async handleOrderPaid(vendorId: number, orderId: number, amount: number) {
        const wallet = await this.getOrCreateWallet(vendorId);

        return await this.databaseService.db.transaction(async (tx) => {
            // Update pending balance
            await tx.update(vendorWallets)
                .set({
                    pendingBalance: wallet.pendingBalance + amount,
                    updatedAt: new Date(),
                })
                .where(eq(vendorWallets.id, wallet.id));

            // Record transaction
            await tx.insert(walletTransactions).values({
                walletId: wallet.id,
                amount,
                type: 'credit',
                status: 'pending',
                relatedId: orderId,
                description: `الأرباح المعلقة للطلب الجديد رقم #${orderId}`,
            });
        });
    }

    async handleOrderDelivered(vendorId: number, orderId: number, amount: number) {
        const wallet = await this.getOrCreateWallet(vendorId);

        return await this.databaseService.db.transaction(async (tx) => {
            // Move from pending to available
            await tx.update(vendorWallets)
                .set({
                    pendingBalance: Math.max(0, wallet.pendingBalance - amount),
                    availableBalance: wallet.availableBalance + amount,
                    updatedAt: new Date(),
                })
                .where(eq(vendorWallets.id, wallet.id));

            // Mark transaction as completed
            await tx.update(walletTransactions)
                .set({ status: 'completed' })
                .where(and(
                    eq(walletTransactions.walletId, wallet.id),
                    eq(walletTransactions.relatedId, orderId),
                    eq(walletTransactions.type, 'credit')
                ));
        });
    }
}
