import { Event } from '@karyo/event-system';
import { bus } from '../route';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
};

const encoder = new TextEncoder();

function formatSseEvent(event: Event): string {
  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    payload: event.payload,
    metadata: event.metadata,
  });

  return `data: ${payload}\n\n`;
}

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const pushEvent = async (event: Event) => {
        try {
          const data = formatSseEvent(event);
          controller.enqueue(encoder.encode(data));
        } catch (error) {
          console.error('[event-stream] failed to send event', error);
        }
      };

      const eventListener = async (event: Event) => {
        await pushEvent(event);
      };

      bus.subscribeAll(eventListener);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          // ignore errors on closed stream
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        bus.unsubscribeAll(eventListener);
        controller.close();
      });
    },
    cancel() {
      // no-op
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
