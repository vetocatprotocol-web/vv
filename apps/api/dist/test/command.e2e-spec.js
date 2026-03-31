"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Command (e2e)', () => {
    let app;
    let authToken;
    let workspaceId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        const registerResponse = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
            email: 'command-test@example.com',
            password: 'password123',
            name: 'Command Test User',
        });
        authToken = registerResponse.body.token;
        const userId = registerResponse.body.user.id;
        const workspaceResponse = await request(app.getHttpServer())
            .post('/workspaces')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            name: 'Test Workspace',
            ownerId: userId,
        });
        workspaceId = workspaceResponse.body.id;
    });
    it('/command/interpret (POST) - should interpret "buat tugas" command', () => {
        return request(app.getHttpServer())
            .post('/command/interpret')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            command: 'buat tugas analisis data penjualan',
            workspaceId,
            mode: 'manual',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('analisis data penjualan');
            expect(res.body.type).toBe('manual');
        });
    });
    it('/command/interpret (POST) - should interpret agent task command', () => {
        return request(app.getHttpServer())
            .post('/command/interpret')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            command: 'gunakan agen untuk membuat laporan',
            workspaceId,
            mode: 'agent',
            agentId: 'some-agent-id',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.type).toBe('agent');
        });
    });
    it('/command/interpret (POST) - should handle unknown commands', () => {
        return request(app.getHttpServer())
            .post('/command/interpret')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            command: 'unknown command that does nothing',
            workspaceId,
            mode: 'manual',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.title).toBe('unknown command that does nothing');
        });
    });
    afterAll(async () => {
        await app.close();
    });
});
//# sourceMappingURL=command.e2e-spec.js.map