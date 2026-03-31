import { NextRequest } from 'next/server';
import { eventSystem } from '../eventSystem';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = async (event: any): Promise<void> => {
        const data = JSON.stringify(event);
        controller.enqueue(`data: ${data}\n\n`);
      };

      const heartbeat = setInterval(() => controller.enqueue(': heartbeat\n\n'), 15000);

      // Subscribe to all events in the bus
      eventSystem.bus.subscribeAll(sendEvent);

      const abortHandler = () => {
        clearInterval(heartbeat);
        eventSystem.bus.unsubscribeAll(sendEvent);
        controller.close();
      };

      request.signal.addEventListener('abort', abortHandler);

      // send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'STREAM_CONNECTED', metadata: { timestamp: Date.now() } })}\n\n`);
    },
    cancel() {
      // No-op
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
