"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const workspaces_module_1 = require("./modules/workspaces/workspaces.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const agents_module_1 = require("./modules/agents/agents.module");
const files_module_1 = require("./modules/files/files.module");
const events_module_1 = require("./modules/events/events.module");
const memory_module_1 = require("./modules/memory/memory.module");
const integrations_module_1 = require("./modules/integrations/integrations.module");
const billing_module_1 = require("./modules/billing/billing.module");
const system_module_1 = require("./modules/system/system.module");
const marketplace_module_1 = require("./modules/marketplace/marketplace.module");
const observability_module_1 = require("./modules/observability/observability.module");
const command_module_1 = require("./modules/command/command.module");
const data_analyst_module_1 = require("./modules/data-analyst/data-analyst.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            workspaces_module_1.WorkspacesModule,
            tasks_module_1.TasksModule,
            agents_module_1.AgentsModule,
            files_module_1.FilesModule,
            events_module_1.EventsModule,
            memory_module_1.MemoryModule,
            integrations_module_1.IntegrationsModule,
            billing_module_1.BillingModule,
            system_module_1.SystemModule,
            marketplace_module_1.MarketplaceModule,
            observability_module_1.ObservabilityModule,
            command_module_1.CommandModule,
            data_analyst_module_1.DataAnalystModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map