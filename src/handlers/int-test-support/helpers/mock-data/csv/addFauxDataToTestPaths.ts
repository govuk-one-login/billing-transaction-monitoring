export interface TestPath {
  entity: string;
  loa: string;
  status: string;
  path: "happy" | "sad";
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
