/* spellchecker:ignore HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ */

import { randomBytes } from "crypto"
import base32Encode from "base32-encode"

export const totpUriExamples = [
  {
    name: "key_uri_spec_example",
    url: "otpauth://totp/ACME%20Co:john.doe@email.com?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ&issuer=ACME%20Co&algorithm=SHA1&digits=6&period=30"
  },
  {
    name: "sha1_20_8",
    url: otpUri(
      "sha1_20_8",
      encodeURIComponent("Example co."),
      getRandomSecret(),
      "SHA1",
      20,
      8
    )
  },
  {
    name: "sha256_60_6",
    url: otpUri(
      "sha256_60_6",
      encodeURIComponent("Rather ltd."),
      getRandomSecret(),
      "SHA256",
      60,
      6
    )
  },
  {
    name: "sha512_120_8_no_issuer",
    url: otpUri(
      "sha512_120_8_no_issuer",
      undefined,
      getRandomSecret(),
      "SHA512",
      120,
      8
    )
  },
  {
    name: "sha1_30_6_issuer_in_label",
    url: otpUri(
      encodeURIComponent("issuer_in_label:sha1_30_6"),
      undefined,
      getRandomSecret(),
      "SHA1",
      30,
      6
    )
  },
  ...virtualListTileTestConfigurations(16)
]

function otpUri(
  rawLabel,
  issuerInParams,
  secret = "HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ",
  algorithm = "SHA1",
  period = 30,
  digits = 6
) {
  if (!rawLabel) {
    throw "The label within the TOTP URI is mandatory."
  }

  let uri = "otpauth://totp/"
  uri += rawLabel

  const params = []
  if (secret) {
    params.push(`secret=${secret}`)
  }
  if (issuerInParams) {
    params.push(`issuer=${issuerInParams}`)
  }
  if (algorithm) {
    params.push(`algorithm=${algorithm}`)
  }
  if (period) {
    params.push(`period=${period}`)
  }
  if (digits) {
    params.push(`digits=${digits}`)
  }

  if (params.length > 0) {
    uri += "?" + params.join("&")
  }

  return uri
}

function getRandomSecret() {
  return base32Encode(randomBytes(20), "RFC4648", { padding: false })
}

function virtualListTileTestConfigurations(amount) {
  const configurations = []
  for (let i = 1; i <= amount; i++) {
    const name = `tile_test_${i}`
    configurations.push({
      name,
      url: otpUri(encodeURIComponent(name))
    })
  }
  return configurations
}
