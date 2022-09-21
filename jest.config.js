module.exports = {
    testRegex: 'tests\\.ts',
    preset: 'ts-jest',
    transform: {
        "^.+\\.jsx$":"babel-jest",
        "^.+\\.ts?$":"ts-jest"
        

    }
}