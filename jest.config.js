module.exports = {
    transform: {},
        "testEnvironment": "jsdom",
    setupFilesAfterEnv: ['<rootDir>/jest.config.js'],

    extensionsToTreatAsEsm: [],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testTimeout:10000,


    testEnvironment: 'node',
};