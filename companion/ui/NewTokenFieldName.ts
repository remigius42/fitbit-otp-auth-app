export enum NewTokenFieldName {
  label = "newTokenLabel",
  issuer = "newTokenIssuer",
  secret = "newTokenSecret",
  algorithm = "newTokenAlgorithm",
  digits = "newTokenDigits",
  period = "newTokenPeriod"
}

export const NewTokenFieldNameValues = Object.keys(NewTokenFieldName).map(
  (key: keyof typeof NewTokenFieldName) => NewTokenFieldName[key]
)
