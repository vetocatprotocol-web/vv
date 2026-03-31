"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema = require("./schema");
const connectionString = process.env.DATABASE_URL || 'postgresql://karyo:password@localhost:5432/karyo_os';
const client = postgres(connectionString);
const db = (0, postgres_js_1.drizzle)(client, { schema });
async function seed() {
    console.log('Seeding database...');
    const existingUser = await db.select().from(schema.users).where((0, drizzle_orm_1.eq)(schema.users.email, 'admin@karyo-os.com')).limit(1);
    let adminUser;
    if (existingUser.length === 0) {
        adminUser = await db.insert(schema.users).values({
            email: 'admin@karyo-os.com',
            passwordHash: '$2b$10$13ul3BiI9mjxaeb1.LVVjOd3Df0mTc32JG9sYQAgHvlREq47fYakG',
            name: 'Admin User',
            role: 'super_admin',
        }).returning();
    }
    else {
        adminUser = existingUser;
    }
    const existingWorkspace = await db.select().from(schema.workspaces).where((0, drizzle_orm_1.eq)(schema.workspaces.slug, 'demo')).limit(1);
    let workspace;
    if (existingWorkspace.length === 0) {
        workspace = await db.insert(schema.workspaces).values({
            name: 'Demo Workspace',
            slug: 'demo',
            ownerId: adminUser[0].id,
            plan: 'free',
            settings: {},
            storageUsedBytes: 0,
            aiTasksToday: 0,
        }).returning();
    }
    else {
        workspace = existingWorkspace;
    }
    const existingMember = await db.select().from(schema.workspaceMembers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.workspaceMembers.workspaceId, workspace[0].id), (0, drizzle_orm_1.eq)(schema.workspaceMembers.userId, adminUser[0].id))).limit(1);
    if (existingMember.length === 0) {
        await db.insert(schema.workspaceMembers).values({
            workspaceId: workspace[0].id,
            userId: adminUser[0].id,
            role: 'owner',
        });
    }
    console.log('Seeding completed!');
    process.exit(0);
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map