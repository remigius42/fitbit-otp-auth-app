jest.doMock("i18n", () => ({ gettext: jest.fn() }), { virtual: true })

import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "../../companion/ui/NewTokenFieldName"
import {
  getCopyright,
  getValidationMessageSetting,
  getVersion,
  thirdPartyLicenseKeys
} from "../ui"

describe("ui", () => {
  const testLicenses = {
    "some-package@3.2.1": {
      version: "3.2.1",
      copyright: "some package copyright"
    },
    "fitbit-otp-auth-app@1.2.3": {
      version: "1.2.3",
      copyright: "some copyright notice"
    },
    "some-other-package@0.1.2": {
      version: "0.1.2",
      copyright: "some other package copyright"
    }
  }

  describe("getValidationMessageSetting", () => {
    it.each(NewTokenFieldNameValues)(
      "returns the given field name with validation key suffix for %s",
      (fieldName: NewTokenFieldName) => {
        const VALIDATION_FIELD_SUFFIX = "Error"

        const validationSettingsKey = getValidationMessageSetting(fieldName)

        expect(validationSettingsKey).toBe(fieldName + VALIDATION_FIELD_SUFFIX)
      }
    )
  })

  describe("getVersion", () => {
    it("extracts the version of this NPM package from the license data", () => {
      expect(getVersion(testLicenses)).toBe("1.2.3")
    })
  })

  describe("getCopyright", () => {
    it("extracts the copyright of this NPM package from the license data", () => {
      expect(getCopyright(testLicenses)).toBe("some copyright notice")
    })
  })

  describe("thirdPartyLicenseKeys", () => {
    it("returns the third-party license keys", () => {
      const keys = thirdPartyLicenseKeys(testLicenses)

      expect(keys).toContain("some-package@3.2.1")
      expect(keys).toContain("some-other-package@0.1.2")
      expect(keys).toHaveLength(2)
    })

    it("does not return the license key of this NPM package", () => {
      expect(thirdPartyLicenseKeys(testLicenses)).not.toContain(
        "fitbit-otp-auth-app@1.2.3"
      )
    })
  })
})
