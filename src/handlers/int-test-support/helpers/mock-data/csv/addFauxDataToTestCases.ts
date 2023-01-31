export interface TestCase {
  givenEntity: string;
  givenLoa: string;
  givenStatus: string;
  expectedPath: "happy" | "sad";
  expectedEventId: string;
  expectedClientId: string;
  expectedEventName: string;
}

export type TestCases = TestCase[];

type AddFauxDataToTestCases = (
  testCases: TestCases,
  fauxData: Record<string, string | number>
) => Array<Record<string, string | number>>;

export const addFauxDataToTestCases: AddFauxDataToTestCases = (
  testCases,
  fauxData
) => {
  return testCases.map((testCase) => {
    return { ...testCase, ...fauxData };
  });
};
