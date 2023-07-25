export const buildLineItem = <T>(
  lineItem: T,
  updates: Array<[keyof T, T[keyof T]]>
): T => {
  const updatedLineItem = { ...lineItem };
  updates.forEach(([field, value]) => {
    updatedLineItem[field] = value;
  });
  return updatedLineItem;
};

export const fakeDataRow = (
  year: string,
  month: string,
  contractId: string,
  prefix: string
): string => {
  return `{"month":"${month}", "year":"${year}", "contract_id":"${contractId}", "vendor_id": "${prefix}_vendor_id", "vendor_name": "${prefix} vendor_name", "service_name": "${prefix} service_name", "contract_name": "${prefix} contract_name", "billing_unit_price": "${prefix} bup", "billing_price_formatted": "${prefix} bpf", "transaction_price_formatted": "${prefix} tpf", "price_difference": "${prefix} pd", "billing_quantity":"2", "transaction_quantity":"11", "quantity_difference":"-9", "billing_amount_with_tax": "${prefix} bawt", "price_difference_percentage": "${prefix} pdp"}`;
};
