/* spellchecker:ignore MJUXILTMPEXTEWRWMNFEITY */

import { TotpConfig } from "../../common/TotpConfig"
import { currentPeriod, totp } from "../totp"

describe("totp", () => {
  const RFC4226_TEST_VECTORS = [
    [0, 755224],
    [1, 287082],
    [2, 359152],
    [3, 969429],
    [4, 338314],
    [5, 254676],
    [6, 287922],
    [7, 162583],
    [8, 399871],
    [9, 520489]
  ]
  const RFC4226_TEST_VECTORS_BASE32_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ" // 12345678901234567890 encoded as text via https://emn178.github.io/online-tools/base32_encode.html // spellchecker:disable-line

  const RFC6238_TEST_VECTORS_BASE32_SECRETS = {
    SHA1: "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", // spellchecker:disable-line
    SHA256: "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZA====", // spellchecker:disable-line
    SHA512:
      "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQGEZDGNA=" // spellchecker:disable-line
  }
  const RFC6238_TEST_VECTORS = [
    ...[
      { algorithm: "SHA1", totp: "94287082" },
      { algorithm: "SHA256", totp: "46119246" },
      { algorithm: "SHA512", totp: "90693936" }
    ].map(entry => ({ ...entry, seconds: 59 })),
    ...[
      { algorithm: "SHA1", totp: "07081804" },
      { algorithm: "SHA256", totp: "68084774" },
      { algorithm: "SHA512", totp: "25091201" }
    ].map(entry => ({ ...entry, seconds: 1111111109 })),
    ...[
      { algorithm: "SHA1", totp: "14050471" },
      { algorithm: "SHA256", totp: "67062674" },
      { algorithm: "SHA512", totp: "99943326" }
    ].map(entry => ({ ...entry, seconds: 1111111111 })),
    ...[
      { algorithm: "SHA1", totp: "89005924" },
      { algorithm: "SHA256", totp: "91819424" },
      { algorithm: "SHA512", totp: "93441116" }
    ].map(entry => ({ ...entry, seconds: 1234567890 })),
    ...[
      { algorithm: "SHA1", totp: "69279037" },
      { algorithm: "SHA256", totp: "90698825" },
      { algorithm: "SHA512", totp: "38618901" }
    ].map(entry => ({ ...entry, seconds: 2000000000 })),
    ...[
      { algorithm: "SHA1", totp: "65353130" },
      { algorithm: "SHA256", totp: "77737706" },
      { algorithm: "SHA512", totp: "47863826" }
    ].map(entry => ({ ...entry, seconds: 20000000000 }))
  ]

  // see https://www.rfc-editor.org/rfc/rfc4226#page-32
  it.each(RFC4226_TEST_VECTORS)(
    "should yield the correct result for RFC 4226 test vector %i",
    (input, expected) => {
      const SOME_TOTP_PERIOD = 30
      jest.useFakeTimers()
      jest.setSystemTime(input * 1000 * SOME_TOTP_PERIOD)
      const totpConfig: TotpConfig = {
        label: "some label",
        secret: RFC4226_TEST_VECTORS_BASE32_SECRET,
        algorithm: "SHA1",
        digits: "6",
        period: String(SOME_TOTP_PERIOD)
      }

      expect(totp(totpConfig)).toBe(String(expected))
      jest.useRealTimers()
    }
  )

  // see https://www.rfc-editor.org/rfc/rfc6238#appendix-B
  it.each(RFC6238_TEST_VECTORS)(
    "should yield the correct result for RFC 6238 test vector at $seconds seconds with algorithm $algorithm",
    ({ seconds, algorithm, totp: expectedTotp }) => {
      jest.useFakeTimers()
      jest.setSystemTime(seconds * 1000)
      const totpConfig: TotpConfig = {
        label: "some label",
        secret:
          RFC6238_TEST_VECTORS_BASE32_SECRETS[
            algorithm as keyof typeof RFC6238_TEST_VECTORS_BASE32_SECRETS
          ],
        algorithm,
        digits: "8",
        period: "30"
      }

      expect(totp(totpConfig)).toBe(expectedTotp)
      jest.useRealTimers()
    }
  )

  it("ignores the casing of the base32 encoded secret", () => {
    const SOME_TOTP_PERIOD = 30
    jest.useFakeTimers()
    jest.setSystemTime(42 * 1000 * SOME_TOTP_PERIOD)
    const SECRET_IN_MIXED_CASE = "aBcDeFgHiJkLmNoPqRsT"
    const totpConfigMixedCaseSecret: TotpConfig = {
      label: "some label",
      secret: SECRET_IN_MIXED_CASE,
      algorithm: "SHA1",
      digits: "6",
      period: String(SOME_TOTP_PERIOD)
    }
    const totpConfigUpperCaseSecret = {
      ...totpConfigMixedCaseSecret,
      secret: SECRET_IN_MIXED_CASE.toUpperCase()
    }

    expect(totp(totpConfigMixedCaseSecret)).toBe(
      totp(totpConfigUpperCaseSecret)
    )
  })

  it("defaults to current period and not the next", () => {
    jest.useFakeTimers()
    jest.setSystemTime(42 * 1000)
    const totpConfig: TotpConfig = {
      label: "some label",
      secret: "MJUXILTMPEXTEWRWMNFEITY",
      algorithm: "SHA1",
      digits: "8",
      period: "30"
    }

    expect(totp(totpConfig)).toBe(totp(totpConfig, false))
    jest.useRealTimers()
  })

  it("when configured for next period returns the TOTP for the next period", () => {
    jest.useFakeTimers()
    jest.setSystemTime(42 * 1000)
    const SOME_PERIOD = 30
    const totpConfig: TotpConfig = {
      label: "some label",
      secret: "MJUXILTMPEXTEWRWMNFEITY",
      algorithm: "SHA1",
      digits: "8",
      period: String(SOME_PERIOD)
    }

    const totpForNextPeriod = totp(totpConfig, true)

    jest.advanceTimersByTime(SOME_PERIOD * 1000)
    expect(totpForNextPeriod).toBe(totp(totpConfig, false))
    jest.useRealTimers()
  })

  it("currentPeriod returns the current period (starting at 0) based on the given duration in seconds", () => {
    jest.useFakeTimers()
    const SOME_SECONDS = 42
    jest.setSystemTime(SOME_SECONDS * 1000)

    const period = currentPeriod(30)

    expect(period).toBe(1)
    jest.useRealTimers()
  })
})
