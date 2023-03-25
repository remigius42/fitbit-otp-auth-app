/**
 * Decode a string in base16 (hex) into a Uint8Array
 *
 * Based on https://stackoverflow.com/a/71083193.
 */
export function base16decode(hexString: string) {
  const hexBytes = hexString.match(/../g) || []
  return Uint8Array.from(hexBytes, hexByte => parseInt(hexByte, 16))
}

/**
 * Encode an ArrayBuffer into a base16 (hex) string.
 *
 * Based on https://stackoverflow.com/a/55200387 but switched to reduce since
 * `Array.prototype.map` is supposed to preserve the type which would require
 * type assertions.
 */
export function base16encode(buffer: ArrayBuffer) {
  const byteToHex = (byteValue: number) =>
    ("0" + byteValue.toString(16).toUpperCase()).slice(-2)
  const byteArray = new Uint8Array(buffer)
  const hexString = byteArray.reduce(
    (hexString: string, byteValue: number) => hexString + byteToHex(byteValue),
    ""
  )
  return hexString
}
