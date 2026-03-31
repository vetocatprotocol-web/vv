import React from 'react';
import type { EventItem } from '../../../lib/useEventStream';

type Props = {
  events: EventItem[];
};

export default function AgentActivity({ events }: Props) {
  const agentEvents = events.filter((e) => e.type.startsWith('AGENT_'));

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm h-[440px] overflow-auto">
      <h3 className="text-lg font-semibold mb-3">Agent Activity (Live)</h3>
      {agentEvents.length === 0 ? (
        <p className="text-sm text-slate-500">No agent activity yet</p>
      ) : (
        <ul className="space-y-2">
          {agentEvents.slice(0, 30).map((event) => (
            <li key={event.id} className="rounded border px-3 py-2 bg-slate-50">
              <p className="text-xs text-slate-500">{new Date(event.createdAt).toLocaleTimeString()}</p>
              <p className="font-medium text-sm">{event.type}</p>
              <p className="text-xs text-slate-600 break-words">{JSON.stringify(event.payload)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
