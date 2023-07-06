import HomePage from "../pageobjects/home.page.js";

describe("My Login application", () => {
  it("should login with valid credentials", async () => {
    await HomePage.open();
    /* await expect(HomePage.flashAlert).toBeExisting()
        await expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!') */
  });
});
