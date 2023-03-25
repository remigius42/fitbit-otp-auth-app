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

/**
 * JSON representation of the default values.
 *
 * See
 * https://dev.fitbit.com/build/reference/settings-api/#select and
 * https://community.fitbit.com/t5/SDK-Development/TextInput-storing-JSON-string/m-p/2255929#M977
 * for further details.
 */
export const NEW_TOKEN_DEFAULT_VALUES = {
  [NewTokenFieldName.algorithm]:
    '{"selected": [0], "values": [{"name": "SHA1"}]}',
  [NewTokenFieldName.digits]: '{"selected": [0], "values": [{"name": "6"}]}',
  [NewTokenFieldName.period]: '{"name": "30"}'
}
