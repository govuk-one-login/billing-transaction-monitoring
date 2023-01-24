import { Invoice } from "./invoice";
import placeNames from "./data/place-names.json";
import streetTypes from "./data/street-types.json";
import { Customer, InvoiceData, LineItem, Vendor } from "./types";

export interface InvoiceOptions {
  vendor?: Partial<Vendor>;
  customer?: Partial<Customer>;
  date?: Date;
  dueDate?: Date;
  invoiceNumber?: string;
  lineItemCount?: number;
  lineItemOptions?: LineItemOptions;
  lineItems?: LineItem[];
}

export interface LineItemOptions extends Partial<LineItem> {
  vatRate?: number;
}

const randomLetter = (): string => {
  return Math.ceil(10 + Math.random() * 25).toString(36);
};

const randomString = (length: number): string => {
  return new Array(length)
    .fill(null)
    .reduce<string>((acc) => acc + randomLetter(), "");
};

const randomStreetType = (): string => {
  return streetTypes[Math.floor(Math.random() * streetTypes.length)];
};

const randomName = (): string => {
  return placeNames[Math.floor(Math.random() * placeNames.length)];
};

const randomPostcode = (): string => {
  return `${randomLetter()}${randomLetter()}${Math.floor(
    1 + Math.random() * 8
  )} ${Math.floor(
    1 + Math.random() * 8
  )}${randomLetter()}${randomLetter()}`.toUpperCase();
};

const randomAddress = (): string[] => {
  return [
    `${randomName()} ${randomName()}`,
    `${Math.floor(Math.random() * 100)} ${randomName()} ${randomStreetType()}`,
    randomName(),
    randomPostcode(),
  ];
};

const randomVendor = (): Vendor => {
  return {
    name: "Client Three",
    vatNumber: `GB${Math.floor(Math.random() * 1_000_000_000)}`,
    address: randomAddress(),
  };
};

const randomCustomer = (): Customer => {
  return {
    name: randomName(),
    address: randomAddress(),
  };
};

export const randomLineItem = (options?: LineItemOptions): LineItem => {
  const priceTier = [
    { min: 0, max: 5, unitPrice: 6.5 },
    { min: 6, max: 10, unitPrice: 0.25 },
    { min: 10, unitPrice: 8.88 },
  ][Math.floor(Math.random() * 3)]; // These match fake-prices.csv
  const quantity =
    options?.quantity ??
    priceTier.min + Math.floor(Math.random() * (priceTier.max ?? 20));
  const unitPrice = options?.unitPrice ?? priceTier.unitPrice;
  const subtotal = options?.subtotal ?? quantity * unitPrice;
  const vatRate = options?.vatRate ?? 0.2;
  return {
    description:
      options?.description ??
      "Verification of sentience via address checking mechanism", // should match IPV_ADDRESS_CRI_END from fake-vendor-services.csv
    vat: options?.vat ?? vatRate * subtotal,
    quantity,
    unitPrice,
    subtotal,
  };
};

const randomLineItems = (
  quantity: number,
  options?: LineItemOptions
): LineItem[] => {
  return new Array(quantity).fill(null).map(() => randomLineItem(options));
};

export const randomInvoiceData = (options?: InvoiceOptions): InvoiceData => ({
  vendor: {
    ...randomVendor(),
    ...options?.vendor,
  },
  customer: {
    ...randomCustomer(),
    ...options?.customer,
  },
  date: options?.date ?? new Date(),
  invoiceNumber:
    options?.invoiceNumber ??
    `${randomString(3)}-${Math.floor(Math.random() * 1_000_000_000)}`,
  dueDate:
    options?.dueDate ??
    new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
  lineItems:
    options?.lineItems ??
    randomLineItems(options?.lineItemCount ?? 10, options?.lineItemOptions),
});

export const randomInvoice = (options?: InvoiceOptions): Invoice => {
  return new Invoice(randomInvoiceData(options));
};
