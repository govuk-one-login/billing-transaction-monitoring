import {
  invalidEventPayloadEventName,
  validEventPayload,
  validUtc6EventPayload1h1sIntoOctUtc1,
  validUtc6EventPayload1sIntoFebUtc0,
  validUtc6EventPayload1sIntoOctUtc1,
  validUtc6EventPayload59m59sIntoOctUtc1,
  validUtcEventPayload1h1sIntoOctUtc1,
  validUtcEventPayload1sIntoFebUtc0,
  validUtcEventPayload1sIntoOctUtc1,
  validUtcEventPayload59m59sIntoOctUtc1,
  validUtcMinus6EventPayload1h1sIntoOctUtc1,
  validUtcMinus6EventPayload1sIntoFebUtc0,
  validUtcMinus6EventPayload1sIntoOctUtc1,
  validUtcMinus6EventPayload59m59sIntoOctUtc1,
} from "../../src/handlers/int-test-support/helpers/payloadHelper";
import { queryAthena } from "../../src/handlers/int-test-support/helpers/queryHelper";
import { sendEventAndVerifyInDataStore } from "../../src/handlers/int-test-support/helpers/testDataHelper";
import { Queue } from "../../src/handlers/int-test-support/helpers/sqsHelper";

describe("\nGenerate valid event and execute athena query\n", () => {
  test("should contain eventId in the generated query results", async () => {
    const { eventId } = await sendEventAndVerifyInDataStore(
      validEventPayload,
      Queue.FILTER
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).toContain(eventId);
  });
});

describe.each`
  testCase                                                                    | givenPayload                                   | queryMonthNumberText | queryMonthName
  ${"UTC+0 event at one second after midnight on 1 Oct UTC+1"}                | ${validUtcEventPayload1sIntoOctUtc1}           | ${"10"}              | ${"October"}
  ${"UTC+0 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1"} | ${validUtcEventPayload59m59sIntoOctUtc1}       | ${"10"}              | ${"October"}
  ${"UTC+0 event at one hour and one second after midnight on 1 Oct UTC+1"}   | ${validUtcEventPayload1h1sIntoOctUtc1}         | ${"10"}              | ${"October"}
  ${"UTC+0 event at one second after midnight on 1 Feb UTC+0"}                | ${validUtcEventPayload1sIntoFebUtc0}           | ${"02"}              | ${"February"}
  ${"UTC-6 event at one second after midnight on 1 Oct UTC+1"}                | ${validUtcMinus6EventPayload1sIntoOctUtc1}     | ${"10"}              | ${"October"}
  ${"UTC-6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1"} | ${validUtcMinus6EventPayload59m59sIntoOctUtc1} | ${"10"}              | ${"October"}
  ${"UTC-6 event at one hour and one second after midnight on 1 Oct UTC+1"}   | ${validUtcMinus6EventPayload1h1sIntoOctUtc1}   | ${"10"}              | ${"October"}
  ${"UTC-6 event at one second after midnight on 1 Feb UTC+0"}                | ${validUtcMinus6EventPayload1sIntoFebUtc0}     | ${"02"}              | ${"February"}
  ${"UTC+6 event at one second after midnight on 1 Oct UTC+1"}                | ${validUtc6EventPayload1sIntoOctUtc1}          | ${"10"}              | ${"October"}
  ${"UTC+6 event at 59 minutes and 59 seconds after midnight on 1 Oct UTC+1"} | ${validUtc6EventPayload59m59sIntoOctUtc1}      | ${"10"}              | ${"October"}
  ${"UTC+6 event at one hour and one second after midnight on 1 Oct UTC+1"}   | ${validUtc6EventPayload1h1sIntoOctUtc1}        | ${"10"}              | ${"October"}
  ${"UTC+6 event at one second after midnight on 1 Feb UTC+0"}                | ${validUtc6EventPayload1sIntoFebUtc0}          | ${"02"}              | ${"February"}
`(`\nGenerate valid $testCase and execute athena query\n`, (data) => {
  test(`should contain eventId in the generated query results for ${data.queryMonthName}`, async () => {
    const { eventId } = await sendEventAndVerifyInDataStore(
      data.givenPayload,
      Queue.FILTER
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where month='${data.queryMonthNumberText}'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).toContain(eventId);
  });
});

describe("\nGenerate invalid event and execute athena query\n", () => {
  test("should not contain eventId in the generated query results", async () => {
    const { eventId } = await sendEventAndVerifyInDataStore(
      invalidEventPayloadEventName,
      Queue.FILTER
    );
    const queryString = `SELECT * FROM "btm_transactions_standardised" where event_id='${eventId}'`;
    const queryResult = await queryAthena(queryString);
    expect(JSON.stringify(queryResult)).not.toContain(eventId);
  });
});
