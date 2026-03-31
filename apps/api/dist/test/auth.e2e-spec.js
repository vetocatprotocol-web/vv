"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Auth (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    it('/auth/register (POST) - should register a new user', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Test User',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('user');
        });
    });
    it('/auth/login (POST) - should login existing user', async () => {
        const email = `login-test-${Date.now()}@example.com`;
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
            email,
            password: 'password123',
            name: 'Login Test User',
        });
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
            email,
            password: 'password123',
        })
            .expect(201)
            .expect((res) => {
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('user');
        });
    });
    it('/auth/login (POST) - should fail with wrong password', async () => {
        const email = `wrong-pass-${Date.now()}@example.com`;
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
            email,
            password: 'password123',
            name: 'Wrong Pass User',
        });
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
            email,
            password: 'wrongpassword',
        })
            .expect(401);
    });
    afterAll(async () => {
        await app.close();
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map