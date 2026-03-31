"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAPI = void 0;
class InMemoryAPI {
    constructor() {
        this.store = new Map();
    }
    async read(key) {
        return this.store.has(key) ? this.store.get(key) : null;
    }
    async write(key, value) {
        this.store.set(key, value);
    }
    async query(filter) {
        const matches = [];
        for (const [key, value] of this.store.entries()) {
            let match = true;
            for (const field of Object.keys(filter)) {
                if (value?.[field] !== filter[field]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                matches.push({ key, value });
            }
        }
        return matches;
    }
}
exports.InMemoryAPI = InMemoryAPI;
//# sourceMappingURL=memory-api.js.map