import supertest from "supertest";
import { app } from "../app";
import { initApp } from "../init-app";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";
import { unitTestMiddleware } from "../middleware";

jest.mock("../extract-helpers/get-overview-rows");
const mockedGetOverviewRows = getOverviewRows as jest.Mock;

describe("home page handler", () => {
  beforeEach(() => {
    initApp(app, unitTestMiddleware);

    // Arrange
    mockedGetOverviewRows.mockResolvedValue([
      {
        contractLinkData: {
          href: "/contracts/c1/invoices",
          text: "C01234",
        },
        vendorName: "Vendor One",
        year: "2023",
        prettyMonth: "Jun",
        reconciliationDetails: {
          tagClass: "govuk-tag--grey",
          bannerMessage: "Invoice data missing",
          statusLabel: {
            class: "govuk-tag--blue",
            message: "Pending",
          },
        },
        invoiceLinkData: {
          href: "/contracts/c1/invoices/2023-06",
          text: "View Invoice",
        },
      },
      {
        contractLinkData: {
          href: "/contracts/m2/invoices",
          text: "MOU",
        },
        vendorName: "Vendor Two",
        year: "2023",
        prettyMonth: "Jun",
        reconciliationDetails: {
          tagClass: "govuk-tag--green",
          bannerMessage: "Invoice within threshold",
          statusLabel: {
            class: "govuk-tag--green",
            message: "Within Threshold",
          },
        },
        invoiceLinkData: {
          href: "/contracts/m2/invoices/2023-06",
          text: "View Invoice",
        },
      },
    ]);
  });

  test("Page displays all overview rows", async () => {
    // Act
    const request = supertest(app);
    const response = await request.get("/");

    // Assert
    expect(response.status).toBe(200);

    expect(response.text).toContain(
      "Billings and reconciliation for the OneLogin programme"
    );

    expect(response.text).toContain("Overview");
    expect(response.text).toContain("C01234");
    expect(response.text).toContain("Vendor One");
    expect(response.text).toContain("Jun 2023");
    expect(response.text).toContain("Pending");

    expect(response.text).toContain("MOU");
    expect(response.text).toContain("Vendor Two");
    expect(response.text).toContain("Jun 2023");
    expect(response.text).toContain("Within Threshold");

    expect(response.text).toContain("View Invoice");

    expect(response.text).toMatchSnapshot();
  });
});
