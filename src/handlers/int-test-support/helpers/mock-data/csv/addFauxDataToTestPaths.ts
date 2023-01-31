export interface TestPath {
  givenEntity: string;
  givenLoa: string;
  givenStatus: string;
  expectedPath: "happy" | "sad";
  expectedEventId: string;
  expectedClientId: string;
  expectedEventName: string;
}

export type TestPaths = TestPath[];

type AddFauxDataToTestPaths = (
  testPaths: TestPaths,
  fauxData: Record<string, string | number>
) => Array<Record<string, string | number>>;

export const addFauxDataToTestPaths: AddFauxDataToTestPaths = (
  testPaths,
  fauxData
) => {
  return testPaths.map((testPath) => {
    return { ...testPath, ...fauxData };
  });
};
