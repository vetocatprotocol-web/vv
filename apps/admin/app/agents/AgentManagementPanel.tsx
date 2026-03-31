"use client";

import * as React from 'react';
import { postEvent } from '../../lib/api';

export type AgentStatusMap = Record<string, string>;

export default function AgentManagementPanel({
  agents,
  statuses,
  onStatusChange,
}: {
  agents: string[];
  statuses: AgentStatusMap;
  onStatusChange?: () => void;
}) {
  const [activeAgent, setActiveAgent] = React.useState<string>(agents[0] || '');
  const [error, setError] = React.useState<string | null>(null);

  const handleAction = async (enable: boolean) => {
    if (!activeAgent) return;
    setError(null);

    try {
      await postEvent({
        type: enable ? 'AGENT_ENABLE' : 'AGENT_DISABLE',
        payload: { agentName: activeAgent },
      });
      onStatusChange?.();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <section className="rounded-xl border p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Agent Management</h2>
      <p className="text-sm text-slate-500 mb-4">Enable/disable agents through events.</p>

      <div className="space-y-3">
        <label className="block text-sm font-medium">Select agent</label>
        <select
          className="block w-full rounded border px-2 py-1"
          value={activeAgent}
          onChange={(e) => setActiveAgent(e.target.value)}
        >
          {agents.map((agent) => (
            <option key={agent} value={agent}>
              {agent}
            </option>
          ))}
        </select>

        <p className="text-sm">Current status: {statuses[activeAgent] || 'unknown'}</p>

        <div className="flex gap-2">
          <button
            className="rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
            onClick={() => void handleAction(true)}
          >
            Enable
          </button>
          <button
            className="rounded bg-rose-600 px-3 py-2 text-white hover:bg-rose-700"
            onClick={() => void handleAction(false)}
          >
            Disable
          </button>
        </div>

        {error && <p className="text-sm text-rose-600">Error: {error}</p>}
      </div>
    </section>
  );
}
