"use client";

interface ActivityLogsPanelProps {
  events: any[];
  loading: boolean;
  error: string | null;
}

export default function ActivityLogsPanel({ events, loading, error }: ActivityLogsPanelProps) {
  return (
    <section className="rounded-xl border p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-2">Activity / Logs</h2>
      {loading && <p className="text-sm text-slate-500">Loading events...</p>}
      {error && <p className="text-sm text-rose-600">Error: {error}</p>}
      <div className="max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No events yet.</p>
        ) : (
          <ul className="space-y-2">
            {events.slice(0, 50).map((event) => (
              <li key={event.id} className="rounded border p-2 bg-slate-50">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>{event.type}</span>
                  <span>{new Date(event.createdAt).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm">{JSON.stringify(event.payload)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
