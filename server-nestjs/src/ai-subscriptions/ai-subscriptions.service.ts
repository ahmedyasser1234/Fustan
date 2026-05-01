import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { aiPlans, userAiCredits } from '../database/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class AiSubscriptionsService {
  constructor(private databaseService: DatabaseService) {}

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
    const [credits] = await this.databaseService.db
      .select()
      .from(userAiCredits)
      .where(eq(userAiCredits.userId, userId))
      .limit(1);
    
    if (!credits) {
      // Initialize if not exists
      const [newCredits] = await this.databaseService.db
        .insert(userAiCredits)
        .values({
          userId,
          totalCredits: 0,
          usedCredits: 0,
          remainingCredits: 0,
          updatedAt: new Date(),
        })
        .returning();
      return newCredits;
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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (plan.durationDays || 30));

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
}
