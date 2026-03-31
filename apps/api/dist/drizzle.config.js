"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    schema: './src/database/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgresql://karyo:password@localhost:5432/karyo_os',
    },
});
//# sourceMappingURL=drizzle.config.js.map