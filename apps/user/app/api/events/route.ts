import { NextRequest, NextResponse } from 'next/server';
import { eventSystem, userEventStore, addEventToStore } from './eventSystem';
import type { Event } from '@karyo/event-system';

export async function GET() {
  return NextResponse.json(userEventStore);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Event>;

    if (!body.type || !body.payload) {
      return NextResponse.json({ error: 'Invalid event payload' }, { status: 400 });
    }

    const now = Date.now();
    const event: Event = {
      id: body.id || `evt-${now}-${Math.random().toString(16).slice(2)}`,
      type: body.type,
      payload: body.payload,
      metadata: {
        ...body.metadata,
        timestamp: body.metadata?.timestamp || now,
        source: body.metadata?.source || 'user-dashboard',
        correlationId: body.metadata?.correlationId || body.id || `corr-${now}-${Math.random().toString(16).slice(2)}`,
      },
    };

    addEventToStore(event);

    await eventSystem.bus.publish(event);

    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
