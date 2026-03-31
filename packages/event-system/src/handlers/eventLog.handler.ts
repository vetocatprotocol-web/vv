import { Event, EventHandler } from '../event.types';

export const eventLogHandler: EventHandler = async (event, bus) => {
  console.log(`[event-system] EVENT_LOG (${event.id}):`, event.payload);
};
