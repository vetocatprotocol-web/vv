"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Agents (e2e)', () => {
    let app;
    let authToken;
    let agentId;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        const registerResponse = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
            email: 'agent-test@example.com',
            password: 'password123',
            name: 'Agent Test User',
        });
        authToken = registerResponse.body.token;
    });
    it('/agents (POST) - should create a new agent', () => {
        return request(app.getHttpServer())
            .post('/agents')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
            name: 'Test Agent',
            description: 'This is a test agent',
            type: 'custom',
            category: 'productivity',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.name).toBe('Test Agent');
            expect(res.body.status).toBe('active');
            agentId = res.body.id;
        });
    });
    it('/agents (GET) - should retrieve all agents', () => {
        return request(app.getHttpServer())
            .get('/agents')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
            .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            const agent = res.body.find((a) => a.id === agentId);
            expect(agent).toBeDefined();
            expect(agent.name).toBe('Test Agent');
        });
    });
    it('/agents/:id (GET) - should retrieve specific agent', () => {
        return request(app.getHttpServer())
            .get(`/agents/${agentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200)
            .expect((res) => {
            expect(res.body.id).toBe(agentId);
            expect(res.body.name).toBe('Test Agent');
        });
    });
    afterAll(async () => {
        await app.close();
    });
});
//# sourceMappingURL=agents.e2e-spec.js.map