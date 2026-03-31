"use client";

import * as React from 'react';

interface OverviewPanelProps {
  events: any[];
  config: Record<string, any>;
  aiConfig: Record<string, any>;
  agentStatus: Record<string, string>;
}

export default function OverviewPanel({ events, config, aiConfig, agentStatus }: OverviewPanelProps) {
  const latestEvent = events[0];

  return (
    <section className="rounded-xl border p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">System Overview</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded border p-3 bg-slate-50">
          <h3 className="text-sm font-medium">Event count</h3>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
        <div className="rounded border p-3 bg-slate-50">
          <h3 className="text-sm font-medium">Latest event</h3>
          <p className="text-xs text-slate-600">{latestEvent?.type || 'n/a'}</p>
          <p className="text-sm">{latestEvent?.createdAt || '-'}</p>
        </div>
        <div className="rounded border p-3 bg-slate-50">
          <h3 className="text-sm font-medium">System state</h3>
          <p className="text-xs text-slate-600">Actors: {Object.keys(agentStatus).length}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Config snapshot</h4>
        <pre className="mt-2 max-h-40 overflow-auto rounded border bg-slate-950 p-2 text-xs text-white">
          {JSON.stringify({ system: config, ai: aiConfig, agents: agentStatus }, null, 2)}
        </pre>
      </div>
    </section>
  );
}
