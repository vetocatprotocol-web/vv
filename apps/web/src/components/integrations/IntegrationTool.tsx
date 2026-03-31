'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Zap } from 'lucide-react';

interface Integration {
  id: string;
  type: string;
  name: string;
  status: 'connected' | 'disconnected';
}

interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

interface IntegrationToolProps {
  workspaceId: string;
}

export default function IntegrationTool({ workspaceId }: IntegrationToolProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [toolParams, setToolParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    loadIntegrations();
  }, [workspaceId]);

  useEffect(() => {
    if (selectedIntegration) {
      loadTools(selectedIntegration);
    }
  }, [selectedIntegration]);

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/integrations`);
      if (response.ok) {
        const data = await response.json();
        const connectedIntegrations = data.integrations.filter((i: Integration) => i.status === 'connected');
        setIntegrations(connectedIntegrations);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const loadTools = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/tools`);
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools || []);
        setSelectedTool('');
        setToolParams({});
      }
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const handleExecuteTool = async () => {
    if (!selectedIntegration || !selectedTool) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/integrations/${selectedIntegration}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          parameters: toolParams
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.result);
      } else {
        setResult({ error: 'Failed to execute tool' });
      }
    } catch (error) {
      setResult({ error: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const renderParameterInput = (paramName: string, paramSchema: any) => {
    const value = toolParams[paramName] || '';

    switch (paramSchema.type) {
      case 'string':
        return (
          <div key={paramName}>
            <Label htmlFor={paramName}>{paramName}</Label>
            <Input
              id={paramName}
              value={value}
              onChange={(e) => setToolParams({ ...toolParams, [paramName]: e.target.value })}
              placeholder={paramSchema.description || `Enter ${paramName}`}
            />
          </div>
        );
      case 'number':
        return (
          <div key={paramName}>
            <Label htmlFor={paramName}>{paramName}</Label>
            <Input
              id={paramName}
              type="number"
              value={value}
              onChange={(e) => setToolParams({ ...toolParams, [paramName]: parseFloat(e.target.value) })}
              placeholder={paramSchema.description || `Enter ${paramName}`}
            />
          </div>
        );
      case 'boolean':
        return (
          <div key={paramName} className="flex items-center space-x-2">
            <input
              id={paramName}
              type="checkbox"
              checked={value || false}
              onChange={(e) => setToolParams({ ...toolParams, [paramName]: e.target.checked })}
            />
            <Label htmlFor={paramName}>{paramName}</Label>
          </div>
        );
      default:
        return (
          <div key={paramName}>
            <Label htmlFor={paramName}>{paramName} (JSON)</Label>
            <Input
              id={paramName}
              value={typeof value === 'string' ? value : JSON.stringify(value)}
              onChange={(e) => {
                try {
                  setToolParams({ ...toolParams, [paramName]: JSON.parse(e.target.value) });
                } catch {
                  setToolParams({ ...toolParams, [paramName]: e.target.value });
                }
              }}
              placeholder={`Enter ${paramName} as JSON`}
            />
          </div>
        );
    }
  };

  const selectedToolData = tools.find(t => t.name === selectedTool);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Integration Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Integration Selection */}
        <div>
          <Label htmlFor="integration">Select Integration</Label>
          <Select value={selectedIntegration} onValueChange={setSelectedIntegration}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an integration" />
            </SelectTrigger>
            <SelectContent>
              {integrations.map((integration) => (
                <SelectItem key={integration.id} value={integration.id}>
                  {integration.name} ({integration.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tool Selection */}
        {selectedIntegration && (
          <div>
            <Label htmlFor="tool">Select Tool</Label>
            <Select value={selectedTool} onValueChange={setSelectedTool}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a tool" />
              </SelectTrigger>
              <SelectContent>
                {tools.map((tool) => (
                  <SelectItem key={tool.name} value={tool.name}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tool Parameters */}
        {selectedToolData && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Tool Description</h3>
              <p className="text-sm text-gray-600">{selectedToolData.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Parameters</h3>
              <div className="space-y-3">
                {Object.entries(selectedToolData.parameters.properties || {}).map(([paramName, paramSchema]: [string, any]) => (
                  renderParameterInput(paramName, paramSchema)
                ))}
              </div>
            </div>

            <Button
              onClick={handleExecuteTool}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Execute Tool
                </>
              )}
            </Button>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Result</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {integrations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No connected integrations available</p>
            <p className="text-sm">Connect integrations first to use tools</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}