import supertest from "supertest";
import { app } from "../app";
import { initApp } from "../init-app";
import { unitTestMiddleware } from "../middleware";

describe("cookies handler", () => {
  beforeEach(() => {
    initApp(app, unitTestMiddleware);
  });

  test("Page displays cookie info", async () => {
    const request = supertest(app);
    const response = await request.get("/cookies");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Cookies are small files");
    expect(response.text).toContain("Essential cookies");
    expect(response.text).toMatchSnapshot();
  });
});
