import { BusinessLogic } from "../../handler-context";
import { fetchVendorId } from "../../shared/utils/config-utils/fetch-vendor-id";
import { CleanedEventBody, Env, IncomingEventBody } from "./types";

export const businessLogic: BusinessLogic<
  IncomingEventBody,
  Env,
  never,
  CleanedEventBody
> = async (
  {
    component_id,
    event_id,
    event_name,
    timestamp,
    timestamp_formatted,
    user,
    vendor_id,
  },
  { logger }
) => {
  const vendorId = vendor_id ?? (await fetchVendorId(event_name));

  const cleanedBody: CleanedEventBody = {
    component_id,
    event_name,
    timestamp: timestamp * 1000,
    event_id,
    timestamp_formatted,
    vendor_id: vendorId,
    user: {
      transaction_id: user?.transaction_id,
    },
  };

  logger.info(`Cleaned event ${event_id}`);

  return [cleanedBody];
};
