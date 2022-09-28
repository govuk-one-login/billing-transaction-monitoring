module.exports = {
    testRegex: 'tests\\.ts',
    preset: 'ts-jest',
    testTimeout:61000,
    transform: {
        "^.+\\.jsx$":"babel-jest",
        "^.+\\.ts?$":"ts-jest"
    }
}
