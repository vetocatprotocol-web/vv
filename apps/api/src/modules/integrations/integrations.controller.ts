import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request, Put } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Query('workspaceId') workspaceId: string, @Request() req) {
    return { data: await this.integrationsService.list(workspaceId, req.user.userId) };
  }

  // New endpoint for workspace integrations
  @Get('workspace/:workspaceId')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceIntegrations(@Param('workspaceId') workspaceId: string, @Request() req) {
    return { integrations: await this.integrationsService.getWorkspaceIntegrations(workspaceId, req.user.userId) };
  }

  // New endpoint for integration tools
  @Get(':integrationId/tools')
  @UseGuards(JwtAuthGuard)
  async getTools(@Param('integrationId') integrationId: string, @Request() req) {
    return { tools: await this.integrationsService.getTools(integrationId, req.user.userId) };
  }

  // New endpoint for executing tools
  @Post(':integrationId/execute')
  @UseGuards(JwtAuthGuard)
  async executeTool(
    @Param('integrationId') integrationId: string,
    @Body() body: { tool: string; parameters: Record<string, any> },
    @Request() req
  ) {
    const result = await this.integrationsService.executeTool(integrationId, req.user.userId, body.tool, body.parameters);
    return { result };
  }

  // New endpoint for configuring integrations
  @Put(':integrationId/configure')
  @UseGuards(JwtAuthGuard)
  async configureIntegration(
    @Param('integrationId') integrationId: string,
    @Body() body: { config: Record<string, any> },
    @Request() req
  ) {
    return await this.integrationsService.configureIntegration(integrationId, req.user.userId, body.config);
  }

  // New endpoint for connecting integrations
  @Post('connect')
  @UseGuards(JwtAuthGuard)
  async connectIntegration(@Body() body: { type: string; workspaceId: string }, @Request() req) {
    const result = await this.integrationsService.connectIntegration(body.workspaceId, req.user.userId, body.type);
    return result;
  }

  // New endpoint for disconnecting integrations
  @Post(':integrationId/disconnect')
  @UseGuards(JwtAuthGuard)
  async disconnectIntegration(@Param('integrationId') integrationId: string, @Request() req) {
    return await this.integrationsService.disconnectIntegration(integrationId, req.user.userId);
  }

  @Post(':provider/connect')
  @UseGuards(JwtAuthGuard)
  async connect(@Param('provider') provider: string, @Query('workspaceId') workspaceId: string, @Request() req) {
    return { data: await this.integrationsService.connect(workspaceId, req.user.userId, provider) };
  }

  @Post(':provider/callback')
  @UseGuards(JwtAuthGuard)
  async callback(@Param('provider') provider: string, @Query('workspaceId') workspaceId: string, @Body() body: { code: string; state: string }, @Request() req) {
    return { data: await this.integrationsService.callback(workspaceId, req.user.userId, provider, body.code, body.state) };
  }

  @Post(':integrationId/sync')
  @UseGuards(JwtAuthGuard)
  async sync(@Param('integrationId') integrationId: string, @Request() req) {
    return this.integrationsService.triggerSync(integrationId, req.user.userId);
  }

  @Delete(':integrationId')
  @UseGuards(JwtAuthGuard)
  async disconnect(@Param('integrationId') integrationId: string, @Request() req) {
    return this.integrationsService.disconnect(integrationId, req.user.userId);
  }
}
