import supertest from "supertest";
import { app } from "../app";
import { initApp } from "../init-app";
import { getOverviewRows } from "../extract-helpers/get-overview-rows";

jest.mock("../extract-helpers/get-overview-rows");
const mockedGetOverviewRows = getOverviewRows as jest.Mock;

describe("home page handler", () => {
  beforeEach(() => {
    initApp(app);

    // Arrange
    mockedGetOverviewRows.mockResolvedValue([
      {
        contractId: "c1",
        contractName: "C01234",
        vendorName: "Vendor One",
        year: "2023",
        month: "06",
        prettyMonth: "Jun",
        reconciliationDetails: {
          tagClass: "govuk-tag--grey",
          bannerMessage: "Invoice data missing",
        },
        details: "View Invoice",
      },
      {
        contractId: "m2",
        contractName: "MOU",
        vendorName: "Vendor Two",
        year: "2023",
        month: "06",
        prettyMonth: "Jun",
        reconciliationDetails: {
          tagClass: "govuk-tag--green",
          bannerMessage: "Invoice within threshold",
        },
        details: "View Invoice",
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
    expect(response.text).toContain("Invoice data missing");

    expect(response.text).toContain("MOU");
    expect(response.text).toContain("Vendor Two");
    expect(response.text).toContain("Jun 2023");
    expect(response.text).toContain("Invoice within threshold");

    expect(response.text).toContain("View Invoice");

    expect(response.text).toMatchSnapshot();
  });
});
