import { isValidIncomingMessageBody } from "./is-valid-incoming-message-body";

describe("Valid invoming message body type guard", () => {
  test("Valid invoming message body type guard with null message", () => {
    const givenMessage = null;
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid invoming message body type guard with undefined message", () => {
    const givenMessage = undefined;
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid invoming message body type guard with message of wrong type", () => {
    const givenMessage = "a string";
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid invoming message body type guard with message with non-string event_name", () => {
    const givenMessage = { event_name: {} };
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid invoming message body type guard with valid message", () => {
    const givenMessage = { event_name: "my event", some_other_field: "foo" };
    const result = isValidIncomingMessageBody(givenMessage);
    expect(result).toBe(true);
  });
});
