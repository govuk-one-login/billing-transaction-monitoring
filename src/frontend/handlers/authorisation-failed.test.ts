import supertest from "supertest";
import { app } from "../app";
import { initApp } from "../init-app";

describe("authorisation failed handler", () => {
  beforeEach(() => {
    initApp(app);
  });

  test("Page displays title and info", async () => {
    const request = supertest(app);
    const response = await request.get("/authorisation-failed");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Authorisation failed");
    expect(response.text).toContain("You are not on our allowlist.");
    expect(response.text).toContain(
      "Contact the Digital Identity Billing &amp; Transactions Monitoring team for access to this website."
    );
    expect(response.text).toMatchSnapshot();
  });
});
