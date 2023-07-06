import Page from "./basePage.js";

/**
 * sub page containing specific selectors and methods for a specific page
 */
class HomePage extends Page {
  /**
   * define selectors using getter methods
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get inputUsername() {
    return $("#username");
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get inputPassword() {
    return $("#password");
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get btnSubmit() {
    return $('button[type="submit"]');
  }

  /**
   * overwrite specific options to adapt it to page object
   */
  public open(): void {
    return super.open();
  }
}

export default new HomePage();
