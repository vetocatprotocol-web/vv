export type EventPayload = {
  type: string;
  payload: any;
};

export async function postEvent(eventPayload: EventPayload) {
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Event API failed: ${res.status} ${text}`);
  }

  return res.json();
}

export type EventItem = {
  id: string;
  type: string;
  payload: any;
  metadata?: { timestamp?: number; correlationId?: string };
  createdAt?: string;
};

export async function fetchEvents(): Promise<EventItem[]> {
  const res = await fetch('/api/events');

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetchEvents failed: ${res.status} ${text}`);
  }

  return res.json();
}
