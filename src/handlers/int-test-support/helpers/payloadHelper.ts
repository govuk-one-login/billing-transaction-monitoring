import path from "path";
import fs from "fs";

export const generateRandomId = (): string => {
  return Math.floor(Math.random() * 10000000).toString();
};

export const validTimestamp = (date: string): number => {
  return Math.floor(new Date(date).getTime() / 1000);
};

export enum VendorId {
  vendor_testvendor1 = "vendor_testvendor1",
  vendor_testvendor2 = "vendor_testvendor2",
  vendor_testvendor3 = "vendor_testvendor3",
  vendor_testvendor4 = "vendor_testvendor4",
  vendor_testvendor5 = "vendor_testvendor5",
}

export enum EventName {
  VENDOR_1_EVENT_1 = "VENDOR_1_EVENT_1",
  VENDOR_1_EVENT_3 = "VENDOR_1_EVENT_3",
  VENDOR_2_EVENT_7 = "VENDOR_2_EVENT_7",
  VENDOR_3_EVENT_6 = "VENDOR_3_EVENT_6",
  VENDOR_3_EVENT_4 = "VENDOR_3_EVENT_4",
}

export enum ContractName {
  vendor_testvendor1_contract1 = "C01234",
  vendor_testvendor2_contract1 = "C01235",
  vendor_testvendor3_contract1 = "C01236",
  vendor_testvendor4_contract1 = "FOOBAR1",
  vendor_testvendor5_contract1 = "FOOBAR2",
}

export interface EventPayload {
  event_name: EventName | string;
  event_id: string;
  component_id: string;
  timestamp: number;
  timestamp_formatted: string;
  user?: {
    transaction_id?: string;
  };
  evidence?: unknown[];
}

export const prettyVendorNameMap = {
  vendor_testvendor1: "Vendor One",
  vendor_testvendor2: "Vendor Two",
  vendor_testvendor3: "Vendor Three",
  vendor_testvendor4: "Vendor Four",
  vendor_testvendor5: "Vendor Five",
};

export const prettyEventNameMap = {
  VENDOR_1_EVENT_1: "Passport check",
  VENDOR_1_EVENT_3: "Fraud check",
  VENDOR_2_EVENT_2: "Passport check",
  VENDOR_2_EVENT_7: "Kbv check",
  VENDOR_3_EVENT_4: "Passport check",
  VENDOR_3_EVENT_6: "Address check",
  VENDOR_4_EVENT_5: "Passport check",
};

export const validEventPayload: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-01-30"),
  timestamp_formatted: "2005-01-30",
};

export const validEventPayloadWithSortedValue: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-01-30"),
  timestamp_formatted: "2005-01-30",
  evidence: [
    {
      sorted_mate: "1111",
    },
  ],
};

export const validEventPayloadWithSortedValueNA: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-01-30"),
  timestamp_formatted: "2005-01-30",
  evidence: [
    {
      sorted_mate: "Not available",
    },
  ],
};

export const validUtcEventPayload1sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-09-30 23:00:01+0"),
  timestamp_formatted: "2005-09-30 23:00:01+0",
};

export const validUtcEventPayload59m59sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-09-30 23:59:59+0"),
  timestamp_formatted: "2005-09-30 23:59:59+0",
};

export const validUtcEventPayload1h1sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-10-01 00:00:01+0"),
  timestamp_formatted: "2005-10-01 00:00:01+0",
};

export const validUtcEventPayload1sIntoFebUtc0: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-02-01 00:00:01+0"),
  timestamp_formatted: "2005-02-01 00:00:01+0",
};

export const validUtcMinus6EventPayload1sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-09-30 17:00:01-6"),
  timestamp_formatted: "2005-09-30 17:00:01-6",
};

export const validUtcMinus6EventPayload59m59sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-09-30 17:59:59-6"),
  timestamp_formatted: "2005-09-30 17:59:59-6",
};

export const validUtcMinus6EventPayload1h1sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-09-30 18:00:01-6"),
  timestamp_formatted: "2005-09-30 18:00:01-6",
};

export const validUtcMinus6EventPayload1sIntoFebUtc0: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-01-31 18:00:01-6"),
  timestamp_formatted: "2005-01-31 18:00:01-6",
};

export const validUtc6EventPayload1sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-10-01 05:00:01+6"),
  timestamp_formatted: "2005-10-01 05:00:01+6",
};

export const validUtc6EventPayload59m59sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-10-01 05:59:59+6"),
  timestamp_formatted: "2005-10-01 05:59:59+6",
};

export const validUtc6EventPayload1h1sIntoOctUtc1: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-10-01 06:00:01+6"),
  timestamp_formatted: "2005-10-01 06:00:01+6",
};

export const validUtc6EventPayload1sIntoFebUtc0: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-02-01 06:00:01+6"),
  timestamp_formatted: "2005-02-01 06:00:01+6",
};

export const invalidEventPayloadEventName: EventPayload = {
  event_name: "TESTGGHYJKIK" as EventName,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-01-30"),
  timestamp_formatted: "2005-01-30",
};

export const invalidEventPayloadTimeStamp: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: "somestring" as unknown as number,
  timestamp_formatted: "2005-01-30",
};

export const invalidEventPayloadComponentId: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: 5678 as unknown as string,
  timestamp: validTimestamp("2005-01-30"),
  timestamp_formatted: "2005-01-30",
};

export const invalidEventPayloadTimestampFormatted: EventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: validTimestamp("2005-01-30"),
  timestamp_formatted: 123 as unknown as string,
};

export const validCleanedEventPayload: CleanedEventPayload = {
  event_name: EventName.VENDOR_1_EVENT_1,
  event_id: generateRandomId(),
  component_id: "TEST_COMP",
  timestamp: new Date("2005-01-30").getTime(),
  timestamp_formatted: "2005/01/30",
  vendor_id: VendorId.vendor_testvendor1,
  user: {
    transaction_id: "12345",
  },
};

export const updateSQSEventPayloadBody = async <TPayload>(
  eventPayload: TPayload,
  validEventPayloadFilename: string
): Promise<string> => {
  // update SQS Event body value with eventPayload
  const sqsEventFilePath = path.join(__dirname, validEventPayloadFilename);
  const sqsEventPayloadFileContent = fs.readFileSync(sqsEventFilePath, "utf-8");
  const sqsEventPayload = JSON.parse(sqsEventPayloadFileContent);
  sqsEventPayload.Records[0].body = JSON.stringify(eventPayload);
  return JSON.stringify(sqsEventPayload);
};

export interface CleanedEventPayload {
  vendor_id: string;
  component_id: string;
  event_id: string;
  event_name: string;
  timestamp: number;
  timestamp_formatted: string;
  credits?: number;
  user?: {
    transaction_id?: string;
  };
}
