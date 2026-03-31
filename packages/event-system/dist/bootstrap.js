"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultEventSystem = createDefaultEventSystem;
const index_1 = require("./index");
const handlers_1 = require("./handlers");
function createDefaultEventSystem() {
    const bus = new index_1.EventBus();
    const registry = new index_1.EventRegistry(bus);
    registry.register('USER_INPUT', handlers_1.userInputHandler);
    registry.register('AGENT_RESPONSE', handlers_1.agentResponseHandler);
    registry.register('EVENT_LOG', handlers_1.eventLogHandler);
    return { bus, registry };
}
//# sourceMappingURL=bootstrap.js.map