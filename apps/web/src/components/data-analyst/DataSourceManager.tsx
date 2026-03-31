'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Database, Globe, Upload, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'file' | 'database' | 'api' | 'integration';
  status: 'active' | 'inactive' | 'error';
  config: Record<string, any>;
  createdAt: string;
  lastUsed?: string;
  integrationId?: string;
}

interface DataSourceManagerProps {
  workspaceId: string;
}

const DATA_SOURCE_TYPES = {
  file: { label: 'File Upload', icon: FileText, description: 'Upload CSV, JSON, or Excel files' },
  database: { label: 'Database', icon: Database, description: 'Connect to SQL/NoSQL databases' },
  api: { label: 'REST API', icon: Globe, description: 'Connect to REST APIs and web services' },
  integration: { label: 'Integration', icon: Globe, description: 'Use connected integrations' }
};

export default function DataSourceManager({ workspaceId }: DataSourceManagerProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  const [newDataSource, setNewDataSource] = useState({
    name: '',
    type: '' as keyof typeof DATA_SOURCE_TYPES,
    config: {} as Record<string, any>
  });

  useEffect(() => {
    loadDataSources();
    loadIntegrations();
  }, [workspaceId]);

  const loadDataSources = async () => {
    try {
      const response = await fetch(`/api/data-analyst/data-sources?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setDataSources(data.dataSources || []);
      }
    } catch (error) {
      console.error('Failed to load data sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrations = async () => {
    try {
      const response = await fetch(`/api/integrations/workspace/${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Failed to load integrations:', error);
    }
  };

  const addDataSource = async () => {
    if (!newDataSource.name || !newDataSource.type) return;

    try {
      const response = await fetch('/api/data-analyst/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDataSource,
          workspaceId,
          userId: 'current-user' // In real app, get from auth
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDataSources(prev => [...prev, data.dataSource]);
        setNewDataSource({ name: '', type: '' as any, config: {} });
        setShowAddDialog(false);
      }
    } catch (error) {
      console.error('Failed to add data source:', error);
    }
  };

  const deleteDataSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;

    try {
      await fetch(`/api/data-analyst/data-sources/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' })
      });
      setDataSources(prev => prev.filter(ds => ds.id !== id));
    } catch (error) {
      console.error('Failed to delete data source:', error);
    }
  };

  const testDataSource = async (dataSource: DataSource) => {
    try {
      const response = await fetch(`/api/data-analyst/data-sources/${dataSource.id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'current-user' })
      });

      if (response.ok) {
        const result = await response.json();
        // Update status in UI
        setDataSources(prev =>
          prev.map(ds =>
            ds.id === dataSource.id
              ? { ...ds, status: result.success ? 'active' : 'error' }
              : ds
          )
        );
      }
    } catch (error) {
      console.error('Failed to test data source:', error);
      setDataSources(prev =>
        prev.map(ds =>
          ds.id === dataSource.id ? { ...ds, status: 'error' } : ds
        )
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const renderConfigForm = () => {
    switch (newDataSource.type) {
      case 'file':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">File Upload</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewDataSource(prev => ({
                      ...prev,
                      config: { ...prev.config, fileName: file.name, fileSize: file.size }
                    }));
                  }
                }}
              />
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="dbType">Database Type</Label>
              <Select
                value={newDataSource.config.dbType || ''}
                onValueChange={(value) =>
                  setNewDataSource(prev => ({
                    ...prev,
                    config: { ...prev.config, dbType: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="connectionString">Connection String</Label>
              <Input
                id="connectionString"
                placeholder="postgresql://user:pass@host:port/db"
                value={newDataSource.config.connectionString || ''}
                onChange={(e) =>
                  setNewDataSource(prev => ({
                    ...prev,
                    config: { ...prev.config, connectionString: e.target.value }
                  }))
                }
              />
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://api.example.com/data"
                value={newDataSource.config.endpoint || ''}
                onChange={(e) =>
                  setNewDataSource(prev => ({
                    ...prev,
                    config: { ...prev.config, endpoint: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="method">HTTP Method</Label>
              <Select
                value={newDataSource.config.method || 'GET'}
                onValueChange={(value) =>
                  setNewDataSource(prev => ({
                    ...prev,
                    config: { ...prev.config, method: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Input
                id="headers"
                placeholder='{"Authorization": "Bearer token"}'
                value={newDataSource.config.headers || ''}
                onChange={(e) =>
                  setNewDataSource(prev => ({
                    ...prev,
                    config: { ...prev.config, headers: e.target.value }
                  }))
                }
              />
            </div>
          </div>
        );

      case 'integration':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="integration">Integration</Label>
              <Select
                value={newDataSource.config.integrationId || ''}
                onValueChange={(value) =>
                  setNewDataSource(prev => ({
                    ...prev,
                    config: { ...prev.config, integrationId: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select integration" />
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
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Database className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading data sources...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Data Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Data Sources
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Data Source
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Data Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="My Data Source"
                      value={newDataSource.name}
                      onChange={(e) =>
                        setNewDataSource(prev => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newDataSource.type}
                      onValueChange={(value) => {
                        setSelectedType(value);
                        setNewDataSource(prev => ({ ...prev, type: value as any, config: {} }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DATA_SOURCE_TYPES).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center">
                              <info.icon className="w-4 h-4 mr-2" />
                              <div>
                                <div className="font-medium">{info.label}</div>
                                <div className="text-sm text-gray-500">{info.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedType && renderConfigForm()}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addDataSource} disabled={!newDataSource.name || !newDataSource.type}>
                      Add Data Source
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataSources.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No data sources configured</p>
              <p className="text-sm">Add data sources to enable AI analysis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dataSources.map((dataSource) => {
                const typeInfo = DATA_SOURCE_TYPES[dataSource.type];
                const Icon = typeInfo?.icon || FileText;

                return (
                  <div key={dataSource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{dataSource.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {typeInfo?.label || dataSource.type}
                          </Badge>
                          {getStatusBadge(dataSource.status)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(dataSource.createdAt).toLocaleDateString()}
                          {dataSource.lastUsed && ` • Last used: ${new Date(dataSource.lastUsed).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testDataSource(dataSource)}
                      >
                        Test
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDataSource(dataSource.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{dataSources.length}</p>
                <p className="text-xs text-gray-500">Total Data Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {dataSources.filter(ds => ds.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500">Active Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {dataSources.filter(ds => ds.type === 'integration').length}
                </p>
                <p className="text-xs text-gray-500">Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}