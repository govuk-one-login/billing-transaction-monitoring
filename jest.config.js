module.exports = {
    testRegex: '.*\\.test\\.ts',
    preset: 'ts-jest',
    transform: {
        "^.+\\.jsx$":"babel-jest",
        "^.+\\.ts?$":"ts-jest"
    }
}
