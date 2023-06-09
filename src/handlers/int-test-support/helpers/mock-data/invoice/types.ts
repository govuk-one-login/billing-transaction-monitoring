export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  subtotal: number;
};

export type Vendor = {
  id: string;
  name: string;
  address: string[];
  vatNumber: string;
};

export type Customer = {
  name: string;
  address: string[];
};

export type InvoiceData = {
  vendor: Vendor;
  customer: Customer;
  dateString: string;
  dueDateString: string;
  invoiceNumber: string;
  lineItems: LineItem[];
};
