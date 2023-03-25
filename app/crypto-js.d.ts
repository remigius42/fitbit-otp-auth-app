/**
 *  Internal data structure used by crypto-js.
 *
 *  Only the necessary API has been typed.
 *  See https://github.com/brix/crypto-js/blob/7c26cc72a618053c294309c22c95a895af39b7b7/core.js#L241.
 */
interface WordArray {
  toString: () => string
}

declare module "crypto-js/enc-hex" {
  namespace EncHex {
    function parse(hexString: string): WordArray
  }
  export default EncHex
}

declare module "crypto-js/hmac-sha1" {
  export default function (message: WordArray, key: WordArray): WordArray
}

declare module "crypto-js/hmac-sha256" {
  export default function (wordArray: WordArray, key: WordArray): WordArray
}

declare module "crypto-js/hmac-sha512" {
  export default function (wordArray: WordArray, key: WordArray): WordArray
}
