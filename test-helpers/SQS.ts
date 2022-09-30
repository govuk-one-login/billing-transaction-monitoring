import {SQSRecord} from "aws-lambda";

export class SQSHelper {
    static createEvent(records: Array<SQSRecord>) {
        return {
            Records: records
        };
    }

    static createEventRecordWithName(name: String, messageId: Number): SQSRecord {
        return {
            body: JSON.stringify({
                event_name: name,
                timestamp: Date.now(),
            }),
            messageId,
        } as any;
    }
}
