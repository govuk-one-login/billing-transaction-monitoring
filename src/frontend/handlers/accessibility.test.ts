import supertest from "supertest";
import { app } from "../app";
import { initApp } from "../init-app";
import { unitTestMiddleware } from "../middleware";

describe("accessibility handler", () => {
  beforeEach(() => {
    initApp(app, unitTestMiddleware);
  });

  test("Page displays accessibility info", async () => {
    const request = supertest(app);
    const response = await request.get("/accessibility");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Accessibility Statement");
    expect(response.text).toContain("Feedback and contact information");
    expect(response.text).toMatchSnapshot();
  });
});

