module.exports = {
    testRegex: '.*\\.test\\.ts',
    preset: 'ts-jest',
    transform: {
        "^.+\\.jsx$":"babel-jest",
        "^.+\\.ts?$":"ts-jest"
    },
    collectCoverage: true,
    testRunner: "jasmine2",
    setupFilesAfterEnv: ["jest-allure/dist/setup"],
    reporters: [
        "default",
        [
            "jest-junit",
            {
                outputDirectory: "reports",
                outputName: "testReport.xml",
            },
        ],
    ]
}
