// packages/integrations/src/__tests__/integration-manager.test.ts

import { IntegrationManager } from '../integration-manager';

describe('IntegrationManager', () => {
  let manager: IntegrationManager;

  beforeEach(() => {
    manager = new IntegrationManager();
  });

  it('should initialize with supported integrations', () => {
    const supported = manager.getSupportedIntegrations();
    expect(supported).toContainEqual(
      expect.objectContaining({
        type: 'google-drive',
        name: 'Google Drive',
      })
    );
    expect(supported).toContainEqual(
      expect.objectContaining({
        type: 'slack',
        name: 'Slack',
      })
    );
    expect(supported).toContainEqual(
      expect.objectContaining({
        type: 'gmail',
        name: 'Gmail',
      })
    );
    expect(supported).toContainEqual(
      expect.objectContaining({
        type: 'custom-api',
        name: 'Custom API',
      })
    );
  });

  it('should return inactive status for non-existent integration', () => {
    const status = manager.getIntegrationStatus('non-existent');
    expect(status.isActive).toBe(false);
  });

  it('should handle unsupported integration types', async () => {
    const result = await manager.configureIntegration({
      id: 'test-1',
      type: 'unsupported' as any,
      name: 'Unsupported',
      credentials: {},
      settings: {},
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not supported');
  });

  it('should return empty tools for inactive integration', () => {
    const tools = manager.getAvailableTools('inactive-integration');
    expect(tools).toEqual([]);
  });
});