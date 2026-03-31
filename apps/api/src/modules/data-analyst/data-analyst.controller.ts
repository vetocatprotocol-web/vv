import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { DataAnalystService, DataAnalysisRequest, DataAnalysisResult } from './data-analyst.service';

@Controller('data-analyst')
export class DataAnalystController {
  constructor(private readonly dataAnalystService: DataAnalystService) {}

  @Post('analyze')
  async analyzeData(@Body() request: DataAnalysisRequest): Promise<DataAnalysisResult> {
    return this.dataAnalystService.analyzeData(request);
  }

  @Get('result/:jobId')
  async getAnalysisResult(
    @Param('jobId') jobId: string,
    @Query('userId') userId: string,
  ): Promise<DataAnalysisResult> {
    return this.dataAnalystService.getAnalysisResult(jobId, userId);
  }

  @Get('history')
  async getAnalysisHistory(
    @Query('userId') userId: string,
    @Query('workspaceId') workspaceId: string,
    @Query('limit') limit?: number,
  ) {
    return this.dataAnalystService.getAnalysisHistory(userId, workspaceId, limit);
  }

  @Delete('history/:analysisId')
  async deleteAnalysis(
    @Param('analysisId') analysisId: string,
    @Query('userId') userId: string,
  ) {
    return this.dataAnalystService.deleteAnalysis(analysisId, userId);
  }

  @Get('data-sources')
  async getDataSources(
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.dataAnalystService.getDataSources(workspaceId);
  }

  @Post('data-sources')
  async addDataSource(@Body() dataSource: any) {
    return this.dataAnalystService.addDataSource(dataSource);
  }

  @Delete('data-sources/:id')
  async deleteDataSource(@Param('id') id: string) {
    return this.dataAnalystService.deleteDataSource(id);
  }

  @Post('data-sources/:id/test')
  async testDataSource(@Param('id') id: string) {
    return this.dataAnalystService.testDataSource(id);
  }

  @Get('usage')
  async getUsageStats(
    @Query('userId') userId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.dataAnalystService.getUsageStats(userId, workspaceId);
  }
}