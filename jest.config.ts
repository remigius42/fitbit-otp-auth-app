import type { Config } from "jest"

const config: Config = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/test/tsconfig.json"
      }
    ]
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/{app,common,companion,resources,settings}/**/*.{ts,js}"
  ],
  passWithNoTests: true,
  reporters: [["github-actions", { silent: false }], "default"],
  testEnvironment: "node",
  verbose: true
}

export default config
