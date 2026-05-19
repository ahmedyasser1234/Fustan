import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { aiPlans, userAiCredits, users } from '../database/schema';
import { eq, sql } from 'drizzle-orm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class AiSubscriptionsService {
  private stripe: Stripe;
  private processedSessions = new Set<string>();

  constructor(
    private databaseService: DatabaseService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(apiKey || 'sk_test_mock', {
      apiVersion: '2023-10-16' as any,
    });
  }

  // --- Plan Management (Admin) ---

  async createPlan(data: any) {
    const [plan] = await this.databaseService.db
      .insert(aiPlans)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return plan;
  }

  async updatePlan(id: number, data: any) {
    const [plan] = await this.databaseService.db
      .update(aiPlans)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(aiPlans.id, id))
      .returning();
    
    if (!plan) throw new NotFoundException('AI Plan not found');
    return plan;
  }

  async findAllPlans(onlyActive = true) {
    if (onlyActive) {
      return await this.databaseService.db
        .select()
        .from(aiPlans)
        .where(eq(aiPlans.isActive, true));
    }
    return await this.databaseService.db.select().from(aiPlans);
  }

  // --- User Credit Management ---

  async getUserCredits(userId: number) {
    let [credits] = await this.databaseService.db
      .select({
        id: userAiCredits.id,
        userId: userAiCredits.userId,
        totalCredits: userAiCredits.totalCredits,
        usedCredits: userAiCredits.usedCredits,
        remainingCredits: userAiCredits.remainingCredits,
        expiresAt: userAiCredits.expiresAt,
        planId: userAiCredits.planId,
        updatedAt: userAiCredits.updatedAt,
        planNameAr: aiPlans.nameAr,
        planNameEn: aiPlans.nameEn,
        planPrice: aiPlans.price,
      })
      .from(userAiCredits)
      .leftJoin(aiPlans, eq(userAiCredits.planId, aiPlans.id))
      .where(eq(userAiCredits.userId, userId))
      .limit(1);
    
    if (!credits) {
      // Find the free trial plan configured by the admin (price = 0)
      const [freePlan] = await this.databaseService.db
        .select()
        .from(aiPlans)
        .where(eq(aiPlans.price, 0))
        .limit(1);

      const trialCredits = freePlan ? freePlan.credits : 3;
      const planId = freePlan ? freePlan.id : null;

      await this.databaseService.db
        .insert(userAiCredits)
        .values({
          userId,
          totalCredits: trialCredits, 
          usedCredits: 0,
          remainingCredits: trialCredits,
          planId: planId,
          updatedAt: new Date(),
        });

      // Fetch again to return standard structure with joined fields
      [credits] = await this.databaseService.db
        .select({
          id: userAiCredits.id,
          userId: userAiCredits.userId,
          totalCredits: userAiCredits.totalCredits,
          usedCredits: userAiCredits.usedCredits,
          remainingCredits: userAiCredits.remainingCredits,
          expiresAt: userAiCredits.expiresAt,
          planId: userAiCredits.planId,
          updatedAt: userAiCredits.updatedAt,
          planNameAr: aiPlans.nameAr,
          planNameEn: aiPlans.nameEn,
          planPrice: aiPlans.price,
        })
        .from(userAiCredits)
        .leftJoin(aiPlans, eq(userAiCredits.planId, aiPlans.id))
        .where(eq(userAiCredits.userId, userId))
        .limit(1);
    }
    return credits;
  }

  async purchasePlan(userId: number, planId: number) {
    const [plan] = await this.databaseService.db
      .select()
      .from(aiPlans)
      .where(eq(aiPlans.id, planId))
      .limit(1);
    
    if (!plan) throw new NotFoundException('Plan not found');
    if (!plan.isActive) throw new BadRequestException('Plan is currently inactive');

    const expiresAt = plan.durationDays 
      ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000) 
      : null;

    return await this.databaseService.db.transaction(async (tx) => {
      const [currentCredits] = await tx
        .select()
        .from(userAiCredits)
        .where(eq(userAiCredits.userId, userId))
        .limit(1);

      if (currentCredits) {
        const [updated] = await tx
          .update(userAiCredits)
          .set({
            totalCredits: currentCredits.totalCredits + plan.credits,
            remainingCredits: currentCredits.remainingCredits + plan.credits,
            planId: planId,
            expiresAt: expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(userAiCredits.userId, userId))
          .returning();
        return updated;
      } else {
        const [newCredits] = await tx
          .insert(userAiCredits)
          .values({
            userId,
            totalCredits: plan.credits,
            remainingCredits: plan.credits,
            usedCredits: 0,
            planId: planId,
            expiresAt: expiresAt,
            updatedAt: new Date(),
          })
          .returning();
        return newCredits;
      }
    });
  }

  async useCredit(userId: number) {
    const credits = await this.getUserCredits(userId);
    
    if (credits.remainingCredits <= 0) {
      throw new BadRequestException('No AI credits remaining. Please purchase a plan.');
    }

    if (credits.expiresAt && new Date() > credits.expiresAt) {
      throw new BadRequestException('Your AI credits have expired.');
    }

    const [updated] = await this.databaseService.db
      .update(userAiCredits)
      .set({
        remainingCredits: credits.remainingCredits - 1,
        usedCredits: credits.usedCredits + 1,
        updatedAt: new Date(),
      })
      .where(eq(userAiCredits.userId, userId))
      .returning();
    
    return updated;
  }

  async createStripeCheckoutSession(userId: number, planId: number) {
    const [plan] = await this.databaseService.db
      .select()
      .from(aiPlans)
      .where(eq(aiPlans.id, planId))
      .limit(1);

    if (!plan) throw new NotFoundException('Plan not found');
    if (!plan.isActive) throw new BadRequestException('Plan is inactive');
    if (plan.price === 0) throw new BadRequestException('Free plans cannot be purchased');

    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sar',
            product_data: {
              name: plan.nameAr || plan.nameEn || `AI Plan #${planId}`,
              description: plan.descriptionAr || plan.descriptionEn || undefined,
            },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/ai-checkout/success?session_id={CHECKOUT_SESSION_ID}&planId=${planId}`,
      cancel_url: `${frontendUrl}/ai-checkout/cancel`,
      customer_email: user?.email || undefined,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
      },
    });

    return { url: session.url };
  }

  async verifyStripeCheckoutSession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    if (!session) throw new NotFoundException('Session not found');
    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Payment has not been completed');
    }

    const userId = parseInt(session.metadata?.userId || '', 10);
    const planId = parseInt(session.metadata?.planId || '', 10);

    if (isNaN(userId) || isNaN(planId)) {
      throw new BadRequestException('Invalid session metadata');
    }

    if (this.processedSessions.has(sessionId)) {
      return this.getUserCredits(userId);
    }
    this.processedSessions.add(sessionId);

    return this.purchasePlan(userId, planId);
  }
}
