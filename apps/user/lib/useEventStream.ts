import * as React from 'react';
import { fetchEvents, EventItem } from './api';

const SSE_URL = '/api/events/stream';

export function useEventStream() {
  const [events, setEvents] = React.useState<EventItem[]>([]);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadEvents = React.useCallback(async () => {
    try {
      const initial = await fetchEvents();
      setEvents(Array.isArray(initial) ? initial : []);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  React.useEffect(() => {
    let source: EventSource | null = null;
    let reconnectTimer: number | null = null;

    const connect = async () => {
      setRunning(true);
      setError(null);
      await loadEvents();

      source = new EventSource(SSE_URL);

      source.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          const normalized: EventItem = {
            id: parsed.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: parsed.type,
            payload: parsed.payload,
            metadata: parsed.metadata,
            createdAt: new Date(parsed.metadata?.timestamp || Date.now()).toISOString(),
          };
          setEvents((prev) => [normalized, ...prev].slice(0, 500));
        } catch (err) {
          console.error('useEventStream parse error', err);
        }
      };

      source.onerror = () => {
        setError('Event stream disconnected, reconnecting...');
        source?.close();
        if (reconnectTimer) window.clearTimeout(reconnectTimer);
        reconnectTimer = window.setTimeout(connect, 3000);
      };
    };

    void connect();

    return () => {
      if (source) source.close();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      setRunning(false);
    };
  }, [loadEvents]);

  return { events, running, error, reload: loadEvents };
}
