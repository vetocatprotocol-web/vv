import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AgentsModule } from './modules/agents/agents.module';
import { FilesModule } from './modules/files/files.module';
import { EventsModule } from './modules/events/events.module';
import { MemoryModule } from './modules/memory/memory.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { BillingModule } from './modules/billing/billing.module';
import { SystemModule } from './modules/system/system.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { ObservabilityModule } from './modules/observability/observability.module';
import { CommandModule } from './modules/command/command.module';
import { DataAnalystModule } from './modules/data-analyst/data-analyst.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    TasksModule,
    AgentsModule,
    FilesModule,
    EventsModule,
    MemoryModule,
    IntegrationsModule,
    BillingModule,
    SystemModule,
    MarketplaceModule,
    ObservabilityModule,
    CommandModule,
    DataAnalystModule,
  ],
})
export class AppModule {}