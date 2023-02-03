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

type AugmentTestCases = (
  testCases: TestCases,
  fauxData: Record<string, string | number>
) => Array<Record<string, string | number>>;

export const augmentTestCases: AugmentTestCases = (testCases, fauxData) => {
  return testCases.map((testCase) => {
    return { ...testCase, ...fauxData };
  });
};
