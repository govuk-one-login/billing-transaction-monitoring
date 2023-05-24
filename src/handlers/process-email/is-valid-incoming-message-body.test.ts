import { isValidIncomingMessageBody } from "./is-valid-incoming-message-body";

describe("Valid incoming message body type guard", () => {
  let givenMessage: any;

  test("Valid incoming message body type guard with null message", () => {
    givenMessage = null;
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid incoming message body type guard with undefined message", () => {
    givenMessage = undefined;
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid incoming message body type guard with message of wrong type", () => {
    givenMessage = {};
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid incoming message body type guard with valid message", () => {
    givenMessage =
      "MIME-Version: 1.0\\r\\nDate: Tue, 16 May 2023 12:57:44 +0100\\r\\nMessage-ID: <CALCsedWjXJtAw_oerRBF6aL_hQRKGcYxME+za_wYCwDWP_Lsuw@mail.gmail.com>\\r\\nSubject: emailwithtestcsv\\r\\nFrom: xyz <xyz@digital.cabinet-office.gov.uk>\\r\\nTo: abc <abc@digital.cabinet-office.gov.uk>\\r\\nContent-Type: text/csv;";
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(true);
  });
});
