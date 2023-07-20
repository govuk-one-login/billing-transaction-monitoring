import { ConfigServicesRow } from "../../types";

export const getVendorId = (
  eventName: string,
  vendorServiceConfig: ConfigServicesRow[]
): string => {
  // Event name is unique for each vendor id
  const vendorId = vendorServiceConfig.find(
    (vendor) => vendor.event_name === eventName
  );

  if (vendorId === undefined) {
    throw new Error(
      "Event name: " + eventName + " not found in vendorServiceConfig"
    );
  }
  return vendorId.vendor_id;
};
