import { NextResponse } from 'next/server';
import { createDefaultEventSystem, Event } from '@karyo/event-system';
import {
  AgentRegistry,
  AgentDispatcher,
  DefaultAIAPI,
  InMemoryAPI,
  UserInputAgent,
  SystemConfigAgent,
  AIConfigAgent,
  AgentManagementAgent,
  MemoryAgent,
} from '@karyo/agent-system';

export type EventItem = {
  id: string;
  type: string;
  payload: any;
  createdAt: string;
}

export let eventStore: EventItem[] = [];

const { bus, registry } = createDefaultEventSystem();

// Replace default low-level USER_INPUT handler in event system with agent-driven behavior.
registry.unregister('USER_INPUT');

const agentRegistry = new AgentRegistry();
agentRegistry.registerAgent(new UserInputAgent());
agentRegistry.registerAgent(new SystemConfigAgent());
agentRegistry.registerAgent(new AIConfigAgent());
agentRegistry.registerAgent(new AgentManagementAgent());
agentRegistry.registerAgent(new MemoryAgent());

const memoryApi = new InMemoryAPI();
const aiApi = new DefaultAIAPI();

const agentDispatcher = new AgentDispatcher({
  registry: agentRegistry,
  memory: memoryApi,
  ai: aiApi,
  bus,
});

bus.subscribe('USER_INPUT', async (event) => {
  await agentDispatcher.dispatch(event);
});

const addEventToStore = (event: import('@karyo/event-system').Event) => {
  const eventItem: EventItem = {
    id: event.id,
    type: event.type,
    payload: event.payload,
    createdAt: new Date(event.metadata?.timestamp || Date.now()).toISOString(),
  };

  // keep newest events first
  eventStore = [eventItem, ...eventStore].slice(0, 500);
};

const mirrorEventToStore = async (event: import('@karyo/event-system').Event) => {
  addEventToStore(event);
};

// Mirror key events from the bus to the local store for dashboard visibility
const trackedTypes = [
  'AGENT_RESPONSE',
  'SYSTEM_CONFIG_UPDATED',
  'AI_CONFIG_UPDATED',
  'AGENT_STATUS_UPDATED',
  'MEMORY_READ_RESULT',
  'MEMORY_WRITE_RESULT',
  'MEMORY_DELETE_RESULT',
  'EVENT_LOG',
];

for (const type of trackedTypes) {
  bus.subscribe(type, async (event) => {
    await mirrorEventToStore(event);
  });
}


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
