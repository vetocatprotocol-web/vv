import { NextResponse } from 'next/server';
import { createDefaultEventSystem, Event } from '@karyo/event-system';

export type EventItem = {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
}

export let eventStore: EventItem[] = [];

const { bus } = createDefaultEventSystem();

const toEvent = (type: string, payload: any): EventItem => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  payload,
  createdAt: new Date().toISOString(),
});

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || '';

async function proxyEvents(path: string, opts?: RequestInit) {
  if (!EVENT_SERVICE_URL) {
    throw new Error("No EVENT_SERVICE_URL configured")
  }
  const url = `${EVENT_SERVICE_URL.replace(/\/$/, "")}${path}`
  const res = await fetch(url, opts)

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Remote event service error: ${res.status} ${text}`)
  }

  if (res.status === 204) {
    return null
  }

  return res.json()
}

export async function GET() {
  if (EVENT_SERVICE_URL) {
    try {
      const remoteEvents = await proxyEvents("/events")
      return NextResponse.json(remoteEvents)
    } catch (error) {
      console.warn("EVENT_SERVICE_URL GET fallback:", (error as Error).message)
    }
  }

  const sorted = [...eventStore].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  return NextResponse.json(sorted)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body?.type || typeof body.type !== "string") {
      return NextResponse.json({ error: "Missing or invalid type" }, { status: 400 })
    }

    if (body.payload === undefined) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 })
    }

    if (EVENT_SERVICE_URL) {
      try {
        const event = await proxyEvents("/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        return NextResponse.json(event, { status: 201 })
      } catch (error) {
        console.warn("EVENT_SERVICE_URL POST fallback:", (error as Error).message)
        // Fall back to local store and continue
      }
    }

    const userEvent = toEvent(body.type, body.payload)
    eventStore = [userEvent, ...eventStore]

    const busEvent: Event = {
      id: userEvent.id,
      type: userEvent.type,
      payload: userEvent.payload,
      metadata: {
        source: 'apps/admin',
        timestamp: Date.now(),
        correlationId: userEvent.id,
      },
    }

    await bus.publish(busEvent)

    return NextResponse.json({ status: 'accepted', event: userEvent }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse request body" }, { status: 400 })
  }
}
