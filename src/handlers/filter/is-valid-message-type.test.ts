import { isValidMessageType } from "./is-valid-message-type";

describe("Valid message type guard", () => {
  test("Valid message type guard with null message", () => {
    const givenMessage = null;
    const result = isValidMessageType(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid message type guard with undefined message", () => {
    const givenMessage = undefined;
    const result = isValidMessageType(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid message type guard with message of wrong type", () => {
    const givenMessage = "a string";
    const result = isValidMessageType(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid message type guard with message with non-string event_name", () => {
    const givenMessage = { event_name: {} };
    const result = isValidMessageType(givenMessage);
    expect(result).toBe(false);
  });

  test("Valid message type guard with valid message", () => {
    const givenMessage = { event_name: "my event", some_other_field: "foo" };
    const result = isValidMessageType(givenMessage);
    expect(result).toBe(true);
  });
});
