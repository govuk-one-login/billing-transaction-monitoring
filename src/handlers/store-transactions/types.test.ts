import { isValidIncomingCleanedEventBody } from "./types";

describe("Valid incoming cleaned event body type guard", () => {
  let givenEvent: any;

  beforeEach(() => {
    givenEvent = {
      component_id: "given component ID",
      event_id: "given event ID",
      timestamp: 123,
      timestamp_formatted: "given formatted timestamp",
      event_name: "given event name",
      vendor_id: "a vendor id",
    };
  });

  test("Valid incoming cleaned event body type guard with null event", () => {
    givenEvent = null;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with undefined event", () => {
    givenEvent = undefined;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event of wrong type", () => {
    givenEvent = "a string";
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with no component_id", () => {
    delete givenEvent.component_id;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with non-string component_id", () => {
    givenEvent.component_id = {};
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with no event_id", () => {
    delete givenEvent.event_id;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with non-string event_id", () => {
    givenEvent.event_id = 123;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with no timestamp", () => {
    delete givenEvent.timestamp;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with non-number timestamp", () => {
    givenEvent.timestamp = "a string";
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with no timestamp_formatted", () => {
    delete givenEvent.timestamp_formatted;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with non-string timestamp_formatted", () => {
    givenEvent.timestamp_formatted = null;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with non-number credits", () => {
    givenEvent.credits = null;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with no event_name", () => {
    delete givenEvent.event_name;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with non-string event_name", () => {
    givenEvent.event_name = true;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with no vendor_id", () => {
    delete givenEvent.vendor_id;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with non-string vendor_id", () => {
    givenEvent.vendor_id = 123;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(false);
  });

  test("Valid incoming cleaned event body type guard with event with empty credits", () => {
    delete givenEvent.credits;
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(true);
  });

  test("Valid incoming cleaned event body type guard with valid event", () => {
    const result = isValidIncomingCleanedEventBody(givenEvent);
    expect(result).toBe(true);
  });
});
