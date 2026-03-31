"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userInputHandler = void 0;
const userInputHandler = async (event, bus) => {
    const text = String(event.payload?.text ?? '').trim();
    if (!text) {
        console.warn('[event-system] userInputHandler received empty text, ignoring');
        return;
    }
    console.log(`[event-system] USER_INPUT received (${event.id}): ${text}`);
    await bus.publish({
        id: event.id + '-response',
        type: 'AGENT_RESPONSE',
        payload: {
            response: `Echo (agent): ${text}`,
            originalText: text,
        },
        metadata: {
            source: 'event-system.userInputHandler',
            correlationId: event.metadata?.correlationId || event.id,
            timestamp: Date.now(),
        },
    });
};
exports.userInputHandler = userInputHandler;
//# sourceMappingURL=userInput.handler.js.map