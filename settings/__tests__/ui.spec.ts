jest.doMock("i18n", () => ({ gettext: jest.fn() }), { virtual: true })

import type { TotpConfig } from "../../companion/tokens"
import {
  NewTokenFieldName,
  NewTokenFieldNameValues
} from "../../companion/ui/NewTokenFieldName"
import {
  getCopyright,
  getDisplayName,
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

  describe("getDisplayName", () => {
    const SOME_TOTP_CONFIG_WITHOUT_ISSUER: TotpConfig = {
      label: "some label",
      secret: "some secret",
      algorithm: "some algorithm",
      digits: "some digits",
      period: "some period"
    }

    const SOME_TOTP_CONFIG_WITH_ISSUER: TotpConfig = {
      ...SOME_TOTP_CONFIG_WITHOUT_ISSUER,
      issuer: "some issuer"
    }

    it("should return the displayName if defined", () => {
      const DEFINED_DISPLAY_NAME = "some non-empty display name"

      const displayName = getDisplayName({
        ...SOME_TOTP_CONFIG_WITH_ISSUER,
        displayName: DEFINED_DISPLAY_NAME
      })

      expect(displayName).toBe(DEFINED_DISPLAY_NAME)
    })

    it("should return the label if requested even if a displayName is defined", () => {
      const DEFINED_DISPLAY_NAME = "some non-empty display name"

      const displayName = getDisplayName(
        {
          ...SOME_TOTP_CONFIG_WITH_ISSUER,
          displayName: DEFINED_DISPLAY_NAME
        },
        true
      )
      expect(displayName).toMatch(
        new RegExp(`\\b${SOME_TOTP_CONFIG_WITH_ISSUER.label}\\b`)
      )
    })

    it("should return the issuer if requested even if a displayName is defined", () => {
      const DEFINED_DISPLAY_NAME = "some non-empty display name"

      const displayName = getDisplayName(
        {
          ...SOME_TOTP_CONFIG_WITH_ISSUER,
          displayName: DEFINED_DISPLAY_NAME
        },
        true
      )
      expect(displayName).toMatch(
        new RegExp(`\\b${SOME_TOTP_CONFIG_WITH_ISSUER.issuer}\\b`)
      )
    })

    it("should return the label and the issuer in specific format if both are defined and no displayName is given", () => {
      const displayName = getDisplayName(SOME_TOTP_CONFIG_WITH_ISSUER)

      expect(displayName).toBe(
        `${SOME_TOTP_CONFIG_WITH_ISSUER.issuer} (${SOME_TOTP_CONFIG_WITH_ISSUER.label})`
      )
    })

    it("should return the label if both issuer and displayName are missing", () => {
      const displayName = getDisplayName(SOME_TOTP_CONFIG_WITHOUT_ISSUER)

      expect(displayName).toBe(SOME_TOTP_CONFIG_WITHOUT_ISSUER.label)
    })
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
