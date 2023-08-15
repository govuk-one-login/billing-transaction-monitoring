import { ConfigServicesRow } from "../../../shared/types";
import {
  getDueDate,
  getInvoiceReceiptDate,
  getInvoiceReceiptId,
  getItemDescription,
  getPrice,
  getQuantity,
  getSubtotal,
  getTax,
  getTaxPayerId,
  getTotal,
  getUnitPrice,
} from "../field-utils";
import { getStandardisedInvoice0 } from "./get-standardised-invoice-0";

jest.mock("../field-utils");
const mockedGetDueDate = getDueDate as jest.Mock;
const mockedGetInvoiceReceiptDate = getInvoiceReceiptDate as jest.Mock;
const mockedGetInvoiceReceiptId = getInvoiceReceiptId as jest.Mock;
const mockedGetItemDescription = getItemDescription as jest.Mock;
const mockedGetPrice = getPrice as jest.Mock;
const mockedGetQuantity = getQuantity as jest.Mock;
const mockedGetSubtotal = getSubtotal as jest.Mock;
const mockedGetTax = getTax as jest.Mock;
const mockedGetTaxPayerId = getTaxPayerId as jest.Mock;
const mockedGetTotal = getTotal as jest.Mock;
const mockedGetUnitPrice = getUnitPrice as jest.Mock;

describe("Standardised invoice getter 0", () => {
  let givenOriginalInvoiceFileName: string;
  let givenParserVersion: string;
  let givenTextractPage: any;
  let givenTextractPages: any;
  let givenTextractPagesLineItemFields: any;
  let givenTextractPagesSummaryFields: any;
  let givenVendorServiceConfigRows: ConfigServicesRow[];

  beforeEach(() => {
    jest.resetAllMocks();

    mockedGetDueDate.mockReturnValue("mocked due date");
    mockedGetInvoiceReceiptDate.mockReturnValue("mocked invoice receipt date");
    mockedGetInvoiceReceiptId.mockReturnValue("mocked invoice receipt ID");
    mockedGetItemDescription.mockReturnValue(
      "Lying about speedruns to seem cool on the internet"
    );
    mockedGetPrice.mockReturnValue("mocked price");
    mockedGetQuantity.mockReturnValue("mocked quantity");
    mockedGetSubtotal.mockReturnValue("mocked subtotal");
    mockedGetTax.mockReturnValue("mocked tax");
    mockedGetTaxPayerId.mockReturnValue("mocked taxPayerId");
    mockedGetTotal.mockReturnValue("mocked total");
    mockedGetUnitPrice.mockReturnValue("mocked unit price");

    givenOriginalInvoiceFileName = "given-original-invoice-file.pdf";

    givenParserVersion = "123_4.5.6";

    givenTextractPagesLineItemFields = [
      {
        Type: {
          Text: "mocked line item field type",
          Confidence: 12,
        },
        ValueDetection: {
          Text: "mocked field value",
          Confidence: 34,
        },
      },
    ];

    givenTextractPagesSummaryFields = [
      {
        Type: {
          Text: "mocked summary field type",
          Confidence: 56,
        },
        ValueDetection: {
          Text: "mocked summary field value",
          Confidence: 78,
        },
      },
    ];

    givenTextractPage = {
      LineItemGroups: [
        {
          LineItems: [
            {
              LineItemExpenseFields: givenTextractPagesLineItemFields,
            },
          ],
        },
      ],
      SummaryFields: givenTextractPagesSummaryFields,
    };

    givenTextractPages = [givenTextractPage];

    givenVendorServiceConfigRows = [
      {
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
        service_name: "Lying About Speedruns",
        service_regex: "lying about speedruns",
        event_name: "DONKEY_KONG",
        contract_id: "1",
        invoice_is_quarterly: false,
      },
      {
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
        service_name: "Making fake Donkey Kong cabinets",
        service_regex: "fake Donkey",
        event_name: "donkey_kong",
        contract_id: "1",
        invoice_is_quarterly: false,
      },
    ];
  });

  test("Standardised invoice getter 0 with no vendor service config rows", () => {
    givenVendorServiceConfigRows = [];

    expect(() =>
      getStandardisedInvoice0(
        givenTextractPages,
        givenVendorServiceConfigRows,
        givenParserVersion,
        givenOriginalInvoiceFileName
      )
    ).toThrowError("vendor service config");
    expect(mockedGetInvoiceReceiptId).not.toHaveBeenCalled();
    expect(mockedGetTotal).not.toHaveBeenCalled();
    expect(mockedGetInvoiceReceiptDate).not.toHaveBeenCalled();
    expect(mockedGetSubtotal).not.toHaveBeenCalled();
    expect(mockedGetDueDate).not.toHaveBeenCalled();
    expect(mockedGetTax).not.toHaveBeenCalled();
    expect(mockedGetTaxPayerId).not.toHaveBeenCalled();
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter 0 with no pages", () => {
    givenTextractPages = [];

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith([]);
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith([]);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith([]);
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith([]);
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith([]);
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith([]);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith([]);
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter 0 with undefined summary fields", () => {
    givenTextractPages[0].SummaryFields = undefined;

    getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith([]);
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith([]);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith([]);
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith([]);
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith([]);
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith([]);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith([]);
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(2);
    expect(mockedGetItemDescription).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
  });

  test("Standardised invoice getter 0 with undefined line items", () => {
    givenTextractPages[0].LineItemGroups[0].LineItems = undefined;

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter 0 with undefined line item groups", () => {
    givenTextractPages[0].LineItemGroups = undefined;

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter 0 with no line items", () => {
    givenTextractPages[0].LineItemGroups[0].LineItems = [];

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).not.toHaveBeenCalled();
    expect(mockedGetUnitPrice).not.toHaveBeenCalled();
    expect(mockedGetQuantity).not.toHaveBeenCalled();
    expect(mockedGetPrice).not.toHaveBeenCalled();
  });

  test("Standardised invoice getter 0 with undefined line item fields", () => {
    givenTextractPages[0].LineItemGroups[0].LineItems[0].LineItemExpenseFields =
      undefined;

    getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(0);
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(0);
    expect(mockedGetQuantity).toHaveBeenCalledTimes(0);
    expect(mockedGetPrice).toHaveBeenCalledTimes(0);
  });

  test("Standardised invoice getter 0 with a line item", () => {
    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([
      {
        due_date: "mocked due date",
        invoice_receipt_date: "mocked invoice receipt date",
        invoice_receipt_id: "mocked invoice receipt ID",
        item_description: "Lying about speedruns to seem cool on the internet",
        parser_version: givenParserVersion,
        originalInvoiceFile: givenOriginalInvoiceFileName,
        invoice_is_quarterly: false,
        price: "mocked price",
        quantity: "mocked quantity",
        service_name: "Lying About Speedruns",
        contract_id: "1",
        event_name: "DONKEY_KONG",
        subtotal: "mocked subtotal",
        tax: "mocked tax",
        tax_payer_id: "mocked taxPayerId",
        total: "mocked total",
        unit_price: "mocked unit price",
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
      },
    ]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(2);
    expect(mockedGetItemDescription).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
  });

  test("Standardised invoice getter 0 with two pages of line items", () => {
    const givenTextractPagesLineItemFields2 = [
      ...givenTextractPagesLineItemFields,
    ];
    const givenTextractPagesSummaryFields2 = [
      ...givenTextractPagesSummaryFields,
    ];
    const givenTextractPagesSummaryFields3 = [
      ...givenTextractPagesSummaryFields,
    ];
    givenTextractPages = [
      givenTextractPage,
      {
        LineItemGroups: [
          {
            LineItems: [
              {
                LineItemExpenseFields: givenTextractPagesLineItemFields2,
              },
            ],
          },
        ],
        SummaryFields: givenTextractPagesSummaryFields2,
      },
      {
        LineItemGroups: [
          {
            LineItems: [
              {
                LineItemExpenseFields: [],
              },
            ],
          },
        ],
        SummaryFields: givenTextractPagesSummaryFields3,
      },
    ];

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([
      {
        due_date: "mocked due date",
        invoice_receipt_date: "mocked invoice receipt date",
        invoice_receipt_id: "mocked invoice receipt ID",
        item_description: "Lying about speedruns to seem cool on the internet",
        parser_version: givenParserVersion,
        originalInvoiceFile: givenOriginalInvoiceFileName,
        invoice_is_quarterly: false,
        price: "mocked price",
        quantity: "mocked quantity",
        service_name: "Lying About Speedruns",
        contract_id: "1",
        event_name: "DONKEY_KONG",
        subtotal: "mocked subtotal",
        tax: "mocked tax",
        tax_payer_id: "mocked taxPayerId",
        total: "mocked total",
        unit_price: "mocked unit price",
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
      },
    ]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(2);
    expect(mockedGetItemDescription).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
  });

  test("Standardised invoice getter 0 with three pages of line items", () => {
    const givenTextractPagesLineItemFields2 = [
      ...givenTextractPagesLineItemFields,
    ];
    const givenTextractPagesLineItemFields3 = [
      ...givenTextractPagesLineItemFields,
    ];
    const givenTextractPagesSummaryFields2 = [
      ...givenTextractPagesSummaryFields,
    ];
    const givenTextractPagesSummaryFields3 = [
      ...givenTextractPagesSummaryFields,
    ];
    givenTextractPages = [
      givenTextractPage,
      {
        LineItemGroups: [
          {
            LineItems: [
              {
                LineItemExpenseFields: givenTextractPagesLineItemFields2,
              },
            ],
          },
        ],
        SummaryFields: givenTextractPagesSummaryFields2,
      },
      {
        LineItemGroups: [
          {
            LineItems: [
              {
                LineItemExpenseFields: givenTextractPagesLineItemFields3,
              },
            ],
          },
        ],
        SummaryFields: givenTextractPagesSummaryFields3,
      },
      {},
    ];

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([
      {
        due_date: "mocked due date",
        invoice_receipt_date: "mocked invoice receipt date",
        invoice_receipt_id: "mocked invoice receipt ID",
        item_description: "Lying about speedruns to seem cool on the internet",
        parser_version: givenParserVersion,
        originalInvoiceFile: givenOriginalInvoiceFileName,
        invoice_is_quarterly: false,
        price: "mocked price",
        quantity: "mocked quantity",
        service_name: "Lying About Speedruns",
        contract_id: "1",
        event_name: "DONKEY_KONG",
        subtotal: "mocked subtotal",
        tax: "mocked tax",
        tax_payer_id: "mocked taxPayerId",
        total: "mocked total",
        unit_price: "mocked unit price",
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
      },
    ]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(2);
    expect(mockedGetItemDescription).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields3
    );
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields3
    );
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields3
    );
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields3
    );
  });

  test("Standardised invoice getter 0 with correct quantity and unit price in description instead of fields", () => {
    const mockedQuantity = 1234;
    const mockedUnitPrice = 5.6;
    const mockedDescription = `abc def (${mockedQuantity} @ ${mockedUnitPrice}\nGBP)`;
    mockedGetItemDescription.mockReturnValue(mockedDescription);
    mockedGetQuantity.mockReturnValue(1);
    mockedGetUnitPrice.mockReturnValue(100);
    givenVendorServiceConfigRows[0].service_regex = ".*";

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([
      {
        due_date: "mocked due date",
        invoice_receipt_date: "mocked invoice receipt date",
        invoice_receipt_id: "mocked invoice receipt ID",
        item_description: mockedDescription,
        parser_version: givenParserVersion,
        originalInvoiceFile: givenOriginalInvoiceFileName,
        invoice_is_quarterly: false,
        price: "mocked price",
        quantity: mockedQuantity,
        service_name: "Lying About Speedruns",
        contract_id: "1",
        event_name: "DONKEY_KONG",
        subtotal: "mocked subtotal",
        tax: "mocked tax",
        tax_payer_id: "mocked taxPayerId",
        total: "mocked total",
        unit_price: mockedUnitPrice,
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
      },
    ]);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTotal).toHaveBeenCalledTimes(1);
    expect(mockedGetTotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledTimes(1);
    expect(mockedGetInvoiceReceiptDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetSubtotal).toHaveBeenCalledTimes(1);
    expect(mockedGetSubtotal).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetDueDate).toHaveBeenCalledTimes(1);
    expect(mockedGetDueDate).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetTax).toHaveBeenCalledTimes(1);
    expect(mockedGetTax).toHaveBeenCalledWith(givenTextractPagesSummaryFields);
    expect(mockedGetTaxPayerId).toHaveBeenCalledTimes(1);
    expect(mockedGetTaxPayerId).toHaveBeenCalledWith(
      givenTextractPagesSummaryFields
    );
    expect(mockedGetItemDescription).toHaveBeenCalledTimes(2);
    expect(mockedGetItemDescription).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetUnitPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetUnitPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetQuantity).toHaveBeenCalledTimes(1);
    expect(mockedGetQuantity).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
    expect(mockedGetPrice).toHaveBeenCalledTimes(1);
    expect(mockedGetPrice).toHaveBeenCalledWith(
      givenTextractPagesLineItemFields
    );
  });

  test("Standardised invoice getter 0 with a quarterly invoice", () => {
    givenVendorServiceConfigRows[0].invoice_is_quarterly = true;

    const result = getStandardisedInvoice0(
      givenTextractPages,
      givenVendorServiceConfigRows,
      givenParserVersion,
      givenOriginalInvoiceFileName
    );

    expect(result).toEqual([
      {
        due_date: "mocked due date",
        invoice_receipt_date: "mocked invoice receipt date",
        invoice_receipt_id: "mocked invoice receipt ID",
        item_description: "Lying about speedruns to seem cool on the internet",
        parser_version: givenParserVersion,
        originalInvoiceFile: givenOriginalInvoiceFileName,
        invoice_is_quarterly: true,
        price: "mocked price",
        quantity: "mocked quantity",
        service_name: "Lying About Speedruns",
        contract_id: "1",
        event_name: "DONKEY_KONG",
        subtotal: "mocked subtotal",
        tax: "mocked tax",
        tax_payer_id: "mocked taxPayerId",
        total: "mocked total",
        unit_price: "mocked unit price",
        vendor_name: "Billy Mitchell LLC",
        vendor_id: "vendor_billy",
      },
    ]);
  });
});
