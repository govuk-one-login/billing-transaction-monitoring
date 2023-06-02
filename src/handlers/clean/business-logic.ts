import { BusinessLogic, ConfigElements } from "../../handler-context";
import { getVendorId } from "../../shared/utils";
import { CleanedEventBody, ConfigCache, Env, IncomingEventBody } from "./types";

export const businessLogic: BusinessLogic<
  IncomingEventBody,
  Env,
  ConfigCache,
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
  { config, logger }
) => {
  const vendorId =
    vendor_id ?? getVendorId(event_name, config[ConfigElements.services]);

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
