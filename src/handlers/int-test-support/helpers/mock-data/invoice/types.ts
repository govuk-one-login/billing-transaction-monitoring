export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vat: number;
  subtotal: number;
}

export interface Vendor {
  id: string;
  name: string;
  address: string[];
  vatNumber: string;
}

export interface Customer {
  name: string;
  address: string[];
}

export interface InvoiceData {
  vendor: Vendor;
  customer: Customer;
  date: Date;
  dueDate: Date;
  invoiceNumber: string;
  lineItems: LineItem[];
}
