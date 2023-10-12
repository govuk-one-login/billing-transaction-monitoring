import supertest from "supertest";
import { app } from "../app";
import { initApp } from "../init-app";
import { unitTestMiddleware } from "../middleware";

describe("Security handler", () => {
  beforeEach(() => {
    initApp(app, unitTestMiddleware);
  });

  test("Request has CSP headers", async () => {
    const request = supertest(app);
    const response = await request.get("/cookies");
    expect(response.status).toBe(200);
    expect(response.headers['content-security-policy']).toBeDefined();
  });

  test("Request does not fingerprint", async () => {
    const request = supertest(app);
    const response = await request.get("/cookies");
    expect(response.status).toBe(200);
    expect(response.headers['x-powered-by']).toBeUndefined();
  });
});
