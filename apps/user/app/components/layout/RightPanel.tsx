'use client';

import * as React from 'react';

type AgentActivity = {
  id: string;
  task: string;
  status: string;
  progress: number;
  updatedAt: string;
};

type RightPanelProps = {
  events: any[];
  sessionStartedAt: number;
};

export default function RightPanel({ events, sessionStartedAt }: RightPanelProps) {
  const [timer, setTimer] = React.useState('00:00:00');

  React.useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartedAt) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt]);

  const agentRecords = React.useMemo(() => {
    const state: Record<string, AgentActivity> = {};
    for (const event of events) {
      if (event.type === 'AGENT_STARTED') {
        state[event.payload.task] = {
          id: event.id,
          task: event.payload.task,
          status: 'Started',
          progress: 0,
          updatedAt: new Date(event.metadata?.timestamp || Date.now()).toLocaleTimeString(),
        };
      }
      if (event.type === 'AGENT_PROGRESS') {
        const existing = state[event.payload.task] || {
          id: event.id,
          task: event.payload.task,
          status: 'In Progress',
          progress: 0,
          updatedAt: new Date(event.metadata?.timestamp || Date.now()).toLocaleTimeString(),
        };
        state[event.payload.task] = {
          ...existing,
          status: 'In Progress',
          progress: event.payload.progress ?? existing.progress,
          updatedAt: new Date(event.metadata?.timestamp || Date.now()).toLocaleTimeString(),
        };
      }
      if (event.type === 'AGENT_COMPLETED') {
        const existing = state[event.payload.task] || {
          id: event.id,
          task: event.payload.task,
          status: 'Completed',
          progress: 100,
          updatedAt: new Date(event.metadata?.timestamp || Date.now()).toLocaleTimeString(),
        };
        state[event.payload.task] = {
          ...existing,
          status: 'Completed',
          progress: 100,
          updatedAt: new Date(event.metadata?.timestamp || Date.now()).toLocaleTimeString(),
        };
      }
    }
    return Object.values(state).sort((a, b) => b.progress - a.progress).slice(0, 5);
  }, [events]);

  return (
    <aside className="w-[300px] min-w-[300px] h-screen bg-karyo-panel border-l border-karyo-border p-4 overflow-y-auto">
      <div className="rounded-xl border border-karyo-border bg-[#111827] p-4">
        <h3 className="text-lg font-semibold text-white">Active Session</h3>
        <p className="text-sm text-karyo-text-secondary">{timer}</p>
      </div>

      <div className="mt-4 rounded-xl border border-karyo-border bg-[#111827] p-4">
        <h3 className="text-lg font-semibold text-white">AI Activity</h3>
        <div className="mt-3 space-y-3">
          {agentRecords.length === 0 ? (
            <p className="text-sm text-karyo-text-secondary">Tidak ada aktivitas.ai saat ini</p>
          ) : (
            agentRecords.map((item) => (
              <div key={item.id} className="rounded-lg border border-karyo-border bg-karyo-darker p-3">
                <p className="font-semibold text-white">{item.task}</p>
                <p className="text-xs text-karyo-text-secondary">{item.status}</p>
                <div className="mt-2 h-2 w-full rounded-full bg-[#1f2937]">
                  <div className="h-2 rounded-full bg-karyo-cyan" style={{ width: `${item.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-karyo-text-secondary">{item.progress}% • {item.updatedAt}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
