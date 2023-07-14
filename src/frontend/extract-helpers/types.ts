export interface FullExtractLineItem {
  vendor_id: string;
  vendor_name: string;
  service_name: string;
  contract_id: string;
  contract_name: string;
  year: string;
  month: string;
  billing_price_formatted: string;
  transaction_price_formatted: string;
  price_difference: string;
  billing_quantity: string;
  transaction_quantity: string;
  quantity_difference: string;
  billing_amount_with_tax: string;
  price_difference_percentage: string;
}
