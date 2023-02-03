import { TestCases } from "./augmentTestCases";

export const testCases: TestCases = [
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "LEVEL_1",
    givenStatus: "BILLABLE",
    expectedPath: "happy",
    expectedEventId: "9656",
    expectedClientId: "client4",
    expectedEventName: "IPV_C4_TEST1",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "LEVEL_1",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "happy",
    expectedEventId: "42758",
    expectedClientId: "client4",
    expectedEventName: "IPV_C4_S_TEST1",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "LEVEL_1",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "74876",
    expectedClientId: "client4",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "LEVEL_2",
    givenStatus: "BILLABLE",
    expectedPath: "happy",
    expectedEventId: "49087",
    expectedClientId: "client4",
    expectedEventName: "IPV_C4_S_TEST2",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "LEVEL_2",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "happy",
    expectedEventId: "85970",
    expectedClientId: "client4",
    expectedEventName: "IPV_C4_SI_TEST2",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "LEVEL_2",
    givenStatus: "BILLABLE-UPLIFT",
    expectedPath: "happy",
    expectedEventId: "56013",
    expectedClientId: "client4",
    expectedEventName: "IPV_C4_TEST3",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "LEVEL_2",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "30825",
    expectedClientId: "client4",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "GOOP",
    givenStatus: "BILLABLE",
    expectedPath: "sad",
    expectedEventId: "94891",
    expectedClientId: "client4",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "GOOP",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "sad",
    expectedEventId: "8199",
    expectedClientId: "client4",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "GOOP",
    givenStatus: "BILLABLE-UPLIFT",
    expectedPath: "sad",
    expectedEventId: "76015",
    expectedClientId: "client4",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client4.co.uk",
    givenLoa: "GOOP",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "44021",
    expectedClientId: "client4",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "LEVEL_1",
    givenStatus: "BILLABLE",
    expectedPath: "happy",
    expectedEventId: "99178",
    expectedClientId: "client3",
    expectedEventName: "IPV_C3_TEST1",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "LEVEL_1",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "happy",
    expectedEventId: "46561",
    expectedClientId: "client3",
    expectedEventName: "IPV_C3_S_TEST1",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "LEVEL_1",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "47976",
    expectedClientId: "client3",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "LEVEL_2",
    givenStatus: "BILLABLE",
    expectedPath: "happy",
    expectedEventId: "23270",
    expectedClientId: "client3",
    expectedEventName: "IPV_C3_S_TEST2",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "LEVEL_2",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "happy",
    expectedEventId: "89270",
    expectedClientId: "client3",
    expectedEventName: "IPV_C3_SI_TEST2",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "LEVEL_2",
    givenStatus: "BILLABLE-UPLIFT",
    expectedPath: "happy",
    expectedEventId: "20736",
    expectedClientId: "client3",
    expectedEventName: "IPV_C3_TEST3",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "LEVEL_2",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "14487",
    expectedClientId: "client3",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "GOOP",
    givenStatus: "BILLABLE",
    expectedPath: "sad",
    expectedEventId: "50945",
    expectedClientId: "client3",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "GOOP",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "sad",
    expectedEventId: "82622",
    expectedClientId: "client3",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "GOOP",
    givenStatus: "BILLABLE-UPLIFT",
    expectedPath: "sad",
    expectedEventId: "84787",
    expectedClientId: "client3",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://a.client3.eu",
    givenLoa: "GOOP",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "59034",
    expectedClientId: "client3",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_1",
    givenStatus: "BILLABLE",
    expectedPath: "sad",
    expectedEventId: "39350",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_1",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "sad",
    expectedEventId: "87104",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_1",
    givenStatus: "BILLABLE-UPLIFT",
    expectedPath: "sad",
    expectedEventId: "95403",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_1",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "21059",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_2",
    givenStatus: "BILLABLE",
    expectedPath: "sad",
    expectedEventId: "53851",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_2",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "sad",
    expectedEventId: "14067",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_2",
    givenStatus: "BILLABLE-UPLIFT",
    expectedPath: "sad",
    expectedEventId: "83639",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "LEVEL_2",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "84863",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "GOOP",
    givenStatus: "BILLABLE",
    expectedPath: "sad",
    expectedEventId: "20220",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "GOOP",
    givenStatus: "REPEAT-BILLABLE",
    expectedPath: "sad",
    expectedEventId: "48397",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "GOOP",
    givenStatus: "BILLABLE-UPLIFT",
    expectedPath: "sad",
    expectedEventId: "83969",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
  {
    givenEntity: "https://g.oo.p",
    givenLoa: "GOOP",
    givenStatus: "GOOP",
    expectedPath: "sad",
    expectedEventId: "9382",
    expectedClientId: "g.oo.p",
    expectedEventName: "unknown",
  },
];
