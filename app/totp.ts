/* spellchecker:ignore HOTP */

import base32decode from "base32-decode"
import encHex from "crypto-js/enc-hex"
import HmacSHA1 from "crypto-js/hmac-sha1"
import HmacSHA256 from "crypto-js/hmac-sha256"
import HmacSHA512 from "crypto-js/hmac-sha512"
import { TotpConfig } from "../common/TotpConfig"
import { base16decode, base16encode } from "./base16codec"

/**
 * Calculate the current Time-based One-Time Password (TOTP) for a given TOTP
 * configuration.
 */
export function totp(
  totpConfig: TotpConfig,
  clockDriftSeconds = 0,
  isForNextPeriod = false
) {
  const {
    secret,
    algorithm,
    digits: digitsString,
    period: periodString
  } = totpConfig

  const digits = Number(digitsString)
  const period = Number(periodString)

  // Step 1 in https://www.rfc-editor.org/rfc/rfc4226#section-5.3
  const messageHexString = counterHexString(
    period,
    isForNextPeriod,
    clockDriftSeconds
  )
  const keyBytes = base32decode(secret.toUpperCase(), "RFC4648")
  const keyBytesHexString = base16encode(keyBytes)
  const hashHexString = hmac(messageHexString, keyBytesHexString, algorithm)

  // Step 2 in https://www.rfc-editor.org/rfc/rfc4226#section-5.3
  const hash = base16decode(hashHexString)
  const otp = dynamicTruncate(hash)

  // Step 3 in https://www.rfc-editor.org/rfc/rfc4226#section-5.3
  const otpDigits = (otp % 10 ** digits).toString(10)
  return padStartWithZeros(otpDigits, digits)
}

/**
 * Get the current counter as a base16 string to be used in the HMAC as the
 * message.
 *
 * RFC 6238 for Time-based One-Time Passwords (TOTP) extends RFC 4226 for
 * HMAC-based One-Time Passwords (HOTP) by using a time-based moving factor, ie.
 * the counter of HOTP used as the message parameter of the HMAC is replaced by
 * a counter based on the current time and an update interval.
 *
 * See https://www.rfc-editor.org/rfc/rfc6238#page-12 and
 * https://www.rfc-editor.org/rfc/rfc6238#page-13 for further information.
 */
function counterHexString(
  period: number,
  isForNextPeriod: boolean,
  clockDriftSeconds: number
) {
  const targetPeriod = isForNextPeriod
    ? currentPeriod(period, clockDriftSeconds) + 1
    : currentPeriod(period, clockDriftSeconds)
  const periodHexString = targetPeriod.toString(16)
  return padStartWithZeros(periodHexString, 16)
}

/**
 * Get the current period number with respect to the given duration in seconds.
 *
 * @returns current period index starting at 0
 */
export function currentPeriod(period: number, clockDriftSeconds = 0) {
  return Math.floor((Date.now() / 1000 + clockDriftSeconds) / period)
}

/**
 * Dynamically truncate the given hash as specified in RFC 4226 section 5.3.
 *
 * Note that the conversion to a string and back to a number again is skipped.
 * See https://www.rfc-editor.org/rfc/rfc4226#section-5.3 for further
 * information.
 */
function dynamicTruncate(hash: ArrayBuffer) {
  const offset = hash[hash.byteLength - 1] & 0xf
  const binaryOtp =
    ((hash[offset] & 0x7f) << 24) |
    (hash[offset + 1] << 16) |
    (hash[offset + 2] << 8) |
    hash[offset + 3]

  return binaryOtp
}

/**
 * Calculate the HMAC for the given message, key and algorithm and return it
 * encoded in base16 (hex).
 */
function hmac(
  messageHexString: string,
  keyHexString: string,
  algorithm: string
) {
  const message = encHex.parse(messageHexString)
  const key = encHex.parse(keyHexString)
  const hash =
    algorithm === "SHA1"
      ? HmacSHA1(message, key)
      : algorithm === "SHA256"
      ? HmacSHA256(message, key)
      : HmacSHA512(message, key)

  return hash.toString() // by default encodes to base16
}

/**
 * Pad a string by prepending "0" until the given targetLength is reached.
 *
 * Note that `String.prototype.padStart` has only been added in ECMAScript 2017
 * and is therefore not available. `String.prototype.repeat` was added with
 * ECMAScript 2015 and is missing as well.
 */
function padStartWithZeros(input: string, targetLength: number) {
  let paddedInput = input
  while (paddedInput.length < targetLength) {
    paddedInput = "0" + paddedInput
  }
  return paddedInput
}
