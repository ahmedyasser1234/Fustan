import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ReportsController {
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
      console.error('Error in getAnalytics:', error);
      throw error;
    }
  }
}
