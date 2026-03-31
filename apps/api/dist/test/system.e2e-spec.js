"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('System (e2e)', () => {
    let app;
    beforeEach(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    it('/health (GET) - should return system health', () => {
        return request(app.getHttpServer())
            .get('/health')
            .expect(200)
            .expect((res) => {
            expect(res.body).toHaveProperty('status');
            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('version');
            expect(res.body).toHaveProperty('uptime');
        });
    });
    afterAll(async () => {
        await app.close();
    });
});
//# sourceMappingURL=system.e2e-spec.js.map