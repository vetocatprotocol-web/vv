'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Settings, Plus, ExternalLink } from 'lucide-react';

interface Integration {
  id: string;
  type: 'google-drive' | 'slack' | 'gmail' | 'custom-api';
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  config: Record<string, any>;
}

interface IntegrationPanelProps {
  workspaceId: string;
}

const INTEGRATION_TYPES = {
  'google-drive': {
    name: 'Google Drive',
    icon: '📁',
    description: 'Access files and folders from Google Drive',
    color: 'bg-blue-500'
  },
  'slack': {
    name: 'Slack',
    icon: '💬',
    description: 'Send messages and manage channels',
    color: 'bg-purple-500'
  },
  'gmail': {
    name: 'Gmail',
    icon: '📧',
    description: 'Read and send emails',
    color: 'bg-red-500'
  },
  'custom-api': {
    name: 'Custom API',
    icon: '🔗',
    description: 'Connect to any REST API',
    color: 'bg-green-500'
  }
};

export default function IntegrationPanel({ workspaceId }: IntegrationPanelProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configForm, setConfigForm] = useState<Record<string, any>>({});

  useEffect(() => {
    loadIntegrations();
  }, [workspaceId]);

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/integrations`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (type: string) => {
    try {
      const response = await fetch(`/api/integrations/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, workspaceId })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.authUrl) {
          window.open(result.authUrl, '_blank');
        }
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/disconnect`, {
        method: 'POST'
      });

      if (response.ok) {
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration.id);
    setConfigForm(integration.config);
    setIsConfigDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedIntegration) return;

    try {
      const response = await fetch(`/api/integrations/${selectedIntegration}/configure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: configForm })
      });

      if (response.ok) {
        setIsConfigDialogOpen(false);
        loadIntegrations();
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Integrations
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Integration</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                {Object.entries(INTEGRATION_TYPES).map(([type, info]) => (
                  <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white text-lg`}>
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{info.name}</h3>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    <Button onClick={() => handleConnect(type)} size="sm">
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ExternalLink className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No integrations configured yet</p>
              <p className="text-sm">Connect external services to enhance your AI capabilities</p>
            </div>
          ) : (
            integrations.map((integration) => {
              const typeInfo = INTEGRATION_TYPES[integration.type];
              return (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center text-white text-lg`}>
                      {typeInfo.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{integration.name}</h3>
                        {getStatusBadge(integration.status)}
                      </div>
                      <p className="text-sm text-gray-600">{typeInfo.description}</p>
                      {integration.lastSync && (
                        <p className="text-xs text-gray-500">
                          Last sync: {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfigure(integration)}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    {integration.status === 'connected' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(integration.type)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedIntegration && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={configForm.apiKey || ''}
                    onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                    placeholder="Enter API key"
                  />
                </div>
                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={configForm.baseUrl || ''}
                    onChange={(e) => setConfigForm({ ...configForm, baseUrl: e.target.value })}
                    placeholder="https://api.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={configForm.timeout || 30000}
                    onChange={(e) => setConfigForm({ ...configForm, timeout: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveConfig}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}