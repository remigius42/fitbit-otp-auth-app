/* spell-checker:ignore msgstr */

import { i18nMockFactory } from "../__mocks__/i18n"
jest.doMock("i18n", i18nMockFactory, { virtual: true })
import { gettext } from "i18n"

import { gettextWithReplacement } from "../i18nUtils"

describe("i18nUtils", () => {
  beforeEach(jest.clearAllMocks)

  describe("gettextWithReplacement", () => {
    const MSG_ID_FOR_TRANSLATION_WITHOUT_REFERENCE = "some id"
    const MSG_STR_FOR_TRANSLATION_WITHOUT_REFERENCE = "some message string"

    const MSG_STR_REFERENCE = "@someReference"
    const MSG_ID_FOR_TRANSLATION_WITH_REFERENCE = "some other id"
    const MSG_STR_FOR_TRANSLATION_WITH_REFERENCE = `some message string using a reference twice: ${MSG_STR_REFERENCE} ${MSG_STR_REFERENCE}`

    beforeAll(() => {
      if (jest.isMockFunction(gettext)) {
        gettext.mockImplementation((msgid: string) => {
          if (msgid === MSG_ID_FOR_TRANSLATION_WITH_REFERENCE) {
            return MSG_STR_FOR_TRANSLATION_WITH_REFERENCE
          } else if (msgid === MSG_ID_FOR_TRANSLATION_WITHOUT_REFERENCE) {
            return MSG_STR_FOR_TRANSLATION_WITHOUT_REFERENCE
          } else {
            return msgid
          }
        })
      } else {
        throw new Error("Mocking of gettext failed")
      }
    })

    it("should replace all occurrences of the reference", () => {
      const SOME_REPLACEMENT = "some replacement"

      const actual = gettextWithReplacement(
        MSG_ID_FOR_TRANSLATION_WITH_REFERENCE,
        MSG_STR_REFERENCE,
        SOME_REPLACEMENT
      )

      expect(actual).toBe(
        MSG_STR_FOR_TRANSLATION_WITH_REFERENCE.replace(
          new RegExp(MSG_STR_REFERENCE, "g"),
          SOME_REPLACEMENT
        )
      )
    })

    it("should return the msgid if the translation isn't found", () => {
      const MISSING_MSG_ID = "some missing id"

      const actual = gettextWithReplacement(
        MISSING_MSG_ID,
        "@someMissingReference",
        "some replacement"
      )

      expect(actual).toBe(MISSING_MSG_ID)
    })

    it("should return the original msgstr if it doesn't contain a reference", () => {
      const actual = gettextWithReplacement(
        MSG_ID_FOR_TRANSLATION_WITHOUT_REFERENCE,
        "some reference",
        "some replacement"
      )

      expect(actual).toBe(MSG_STR_FOR_TRANSLATION_WITHOUT_REFERENCE)
    })

    it("should return the original msgstr if the reference isn't found", () => {
      const actual = gettextWithReplacement(
        MSG_ID_FOR_TRANSLATION_WITH_REFERENCE,
        "@missingReference",
        "some replacement"
      )

      expect(actual).toBe(MSG_STR_FOR_TRANSLATION_WITH_REFERENCE)
    })
  })
})
