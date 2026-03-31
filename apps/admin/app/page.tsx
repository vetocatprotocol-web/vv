"use client";

import * as React from 'react';
import { useEvents } from '../lib/hooks';
import { fetchEvents, postEvent } from '../lib/api';

import OverviewPanel from './components/overview/OverviewPanel';
import SystemConfigPanel from './config/SystemConfigPanel';
import AgentManagementPanel from './agents/AgentManagementPanel';
import EventControlPanel from './events/EventControlPanel';
import AIControlPanel from './ai/AIControlPanel';
import MemoryControlPanel from './memory/MemoryControlPanel';
import ActivityLogsPanel from './components/logs/ActivityLogsPanel';

const knownAgents = ['UserInputAgent', 'SystemConfigAgent', 'AIConfigAgent', 'AgentManagementAgent', 'MemoryAgent'];

export default function HomePage() {
  const { events, loading, error, reload } = useEvents(3000);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [agentStatuses, setAgentStatuses] = React.useState<Record<string, string>>({});
  const [systemConfig, setSystemConfig] = React.useState<Record<string, any>>({});
  const [aiConfig, setAIConfig] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    const cfgEvent = events.find((e) => e.type === 'SYSTEM_CONFIG_UPDATED');
    if (cfgEvent?.payload?.config) {
      setSystemConfig(cfgEvent.payload.config);
    }

    const aiEvent = events.find((e) => e.type === 'AI_CONFIG_UPDATED');
    if (aiEvent?.payload?.config) {
      setAIConfig(aiEvent.payload.config);
    }

    const agentEvent = events.find((e) => e.type === 'AGENT_STATUS_UPDATED');
    if (agentEvent?.payload?.state) {
      setAgentStatuses(agentEvent.payload.state);
    }
  }, [events]);

  const refreshAll = async () => {
    await reload();
  };

  const sendSimpleCommand = async () => {
    await postEvent({ type: 'SYSTEM_STATUS_CHECK', payload: { ping: Date.now() } });
    await reload();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-4 border-b pb-4 flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold">KARYO OS Super Admin Dashboard</h1>
            <p className="text-slate-600">Central control plane (layer 1-5), event-driven, no direct state mutation.</p>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded border px-3 py-2 bg-white text-slate-800"
              onClick={() => void refreshAll()}
            >
              Refresh
            </button>
            <button
              className="rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
              onClick={() => void sendSimpleCommand()}
            >
              Ping System
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'config', label: 'System Config' },
            { id: 'agents', label: 'Agents' },
            { id: 'events', label: 'Events' },
            { id: 'ai', label: 'AI' },
            { id: 'memory', label: 'Memory' },
            { id: 'logs', label: 'Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`rounded px-3 py-1.5 text-sm ${activeTab === tab.id ? 'bg-slate-700 text-white' : 'bg-white border text-slate-700'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <OverviewPanel
                events={events}
                config={systemConfig}
                aiConfig={aiConfig}
                agentStatus={agentStatuses}
              />
            )}
            {activeTab === 'config' && <SystemConfigPanel onUpdate={() => void reload()} />}
            {activeTab === 'agents' && (
              <AgentManagementPanel
                agents={knownAgents}
                statuses={agentStatuses}
                onStatusChange={() => void reload()}
              />
            )}
            {activeTab === 'events' && <EventControlPanel onTrigger={() => void reload()} />}
            {activeTab === 'ai' && <AIControlPanel onUpdate={() => void reload()} />}
            {activeTab === 'memory' && <MemoryControlPanel onDone={() => void reload()} />}
            {activeTab === 'logs' && <ActivityLogsPanel events={events} loading={loading} error={error} />}
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold">Quick State</h2>
              <p className="text-sm text-slate-500">Events: {events.length}</p>
              <p className="text-sm text-slate-500">Config keys: {Object.keys(systemConfig).length}</p>
              <p className="text-sm text-slate-500">AI config keys: {Object.keys(aiConfig).length}</p>
            </div>
            <div className="rounded-xl border p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold">Recent Event Types</h2>
              <ul className="text-sm text-slate-700 list-disc pl-5">
                {events.slice(0, 5).map((event) => (
                  <li key={event.id}>{event.type}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

