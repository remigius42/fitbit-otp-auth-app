/* spellchecker:ignore foob, fooba */

import { base16decode, base16encode } from "../base16codec"

describe("base16codec", () => {
  const RFC4648_TEST_VECTORS = [
    { decoded: "", encoded: "" },
    { decoded: "f", encoded: "66" },
    { decoded: "fo", encoded: "666F" },
    { decoded: "foo", encoded: "666F6F" },
    { decoded: "foob", encoded: "666F6F62" },
    { decoded: "fooba", encoded: "666F6F6261" },
    { decoded: "foobar", encoded: "666F6F626172" }
  ]

  describe("base16encode", () => {
    it.each(RFC4648_TEST_VECTORS)(
      "encodes the RFC test vector $decoded correctly",
      ({ decoded, encoded }) => {
        const decodedAsArray = uint8ArrayFromString(decoded)

        expect(base16encode(decodedAsArray)).toBe(encoded)
      }
    )
  })

  describe("base16decode", () => {
    it.each(RFC4648_TEST_VECTORS)(
      "decodes the RFC test vector $encoded correctly",
      ({ decoded, encoded }) => {
        const decodedAsArray = base16decode(encoded)

        const actualDecoded = uint8ArrayToString(decodedAsArray)
        expect(actualDecoded).toBe(decoded)
      }
    )
  })

  function uint8ArrayToString(array: Uint8Array) {
    return array.reduce(
      (currentString, byte) => currentString + String.fromCharCode(byte),
      ""
    )
  }

  function uint8ArrayFromString(input: string) {
    return Uint8Array.from(input, character => character.charCodeAt(0))
  }
})
