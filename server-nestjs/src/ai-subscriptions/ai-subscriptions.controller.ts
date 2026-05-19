import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { AiSubscriptionsService } from './ai-subscriptions.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('ai-subscriptions')
@Controller('ai-subscriptions')
export class AiSubscriptionsController {
  constructor(private readonly service: AiSubscriptionsService) {}

  // --- Public/User Endpoints ---

  @Get('plans')
  @ApiOperation({ summary: 'Get all active AI subscription plans' })
  async getPlans() {
    return this.service.findAllPlans(true);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('credits')
  @ApiOperation({ summary: 'Get current user AI credits balance' })
  async getMyCredits(@Req() req: any) {
    return this.service.getUserCredits(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('purchase/:planId')
  @ApiOperation({ summary: 'Purchase an AI subscription plan' })
  async purchasePlan(
    @Req() req: any,
    @Param('planId', ParseIntPipe) planId: number,
  ) {
    // In a real scenario, this would follow a successful payment
    return this.service.purchasePlan(req.user.id, planId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout/:planId')
  @ApiOperation({ summary: 'Create Stripe checkout session for AI plan' })
  async createStripeCheckout(
    @Req() req: any,
    @Param('planId', ParseIntPipe) planId: number,
  ) {
    return this.service.createStripeCheckoutSession(req.user.id, planId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('verify-checkout')
  @ApiOperation({ summary: 'Verify Stripe checkout session and award credits' })
  async verifyCheckout(
    @Body('sessionId') sessionId: string,
  ) {
    return this.service.verifyStripeCheckoutSession(sessionId);
  }

  // --- Admin Endpoints ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/plans')
  @ApiOperation({ summary: 'Create a new AI plan (Admin only)' })
  async createPlan(@Body() data: any) {
    return this.service.createPlan(data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/plans/:id')
  @ApiOperation({ summary: 'Update an existing AI plan (Admin only)' })
  async updatePlan(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.updatePlan(id, data);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/plans')
  @ApiOperation({ summary: 'Get all AI plans including inactive (Admin only)' })
  async getAllPlansAdmin() {
    return this.service.findAllPlans(false);
  }
}
