import { Controller, Get, UseGuards, Logger } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);
  constructor(private readonly reportsService: ReportsService) {}

  @Get('commissions')
  async getCommissions() {
    return await this.reportsService.getVendorCommissions();
  }

  @Get('analytics')
  async getAnalytics() {
    try {
      return await this.reportsService.getDashboardAnalytics();
    } catch (error) {
      this.logger.error('Error in getAnalytics', error instanceof Error ? error.stack : error);
      throw error;
    }
  }
}
