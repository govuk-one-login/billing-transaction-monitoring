module.exports = {
  testRegex: ".*\\.test\\.ts$",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: "node_modules/ts-jest-mock-import-meta", // or, alternatively, 'ts-jest-mock-import-meta' directly, without node_modules.
              options: {
                metaObjectReplacement: { url: __dirname },
              },
            },
          ],
        },
      },
    ],
  },
  collectCoverage: true,
  testRunner: "jasmine2",
  testTimeout: 300000,
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "reports",
        outputName: "testReport.xml",
      },
    ],
  ],
};
