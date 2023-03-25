import type { TotpConfig } from "../common/TotpConfig"

/**
 * Parse a key URI into a TotpConfig
 *
 * See
 * https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 * for further details.
 *
 * @param keyUri - string in key URI format
 * @returns totpConfig based on URI
 */
export function totpConfigFromUri(keyUri: string) {
  const url = new URL(keyUri)
  validateProtocol(url)
  return extractTotpConfig(url)
}

function extractTotpConfig(url: URL) {
  const label = getLabel(url)
  const issuer = getIssuer(url)
  const secret = getSecret(url)
  const algorithm = url.searchParams.get("algorithm") || "SHA1"
  const digits = url.searchParams.get("digits") || "6"
  const period = url.searchParams.get("period") || "30"
  const totpConfig: TotpConfig = {
    label,
    issuer,
    secret,
    algorithm,
    digits,
    period
  }
  return totpConfig
}

function validateProtocol(url: URL) {
  if (url.protocol !== "otpauth:") {
    throw Error(
      `Key URI protocol mismatch: expected "otpauth:" but got "${url.protocol}"`
    )
  }
}

function getLabel(url: URL) {
  const labelWithOptionalIssuer = getDecodedLabelWithOptionalIssuer(url)
  const label =
    labelWithOptionalIssuer.indexOf(":") !== -1
      ? labelWithOptionalIssuer.split(":")[1]
      : labelWithOptionalIssuer
  return label
}

function getIssuer(url: URL) {
  const labelWithOptionalIssuer = getDecodedLabelWithOptionalIssuer(url)
  const issuer = url.searchParams.get("issuer")
  const fallbackIssuer =
    labelWithOptionalIssuer.indexOf(":") !== -1
      ? labelWithOptionalIssuer.split(":")[0]
      : undefined
  return issuer || fallbackIssuer
}

function getDecodedLabelWithOptionalIssuer(url: URL) {
  return decodeURIComponent(
    url.href.match(/otpauth:\/\/(?:h|t)otp\/([^?]+)\?.*/)?.[1] ?? ""
  )
}

function getSecret(url: URL) {
  return url.searchParams.get("secret")
}
