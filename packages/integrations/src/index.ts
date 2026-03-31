// packages/integrations/src/index.ts

export { IntegrationManager } from './integration-manager';

export {
  GoogleDriveIntegration,
  SlackIntegration,
  GmailIntegration,
  CustomAPIIntegration,
} from './integrations';

export type {
  IntegrationType,
  IntegrationConfig,
  IntegrationResult,
  ToolDefinition,
  IntegrationProvider,
  IntegrationContext,
} from './types';