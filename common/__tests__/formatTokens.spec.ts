import { getDisplayName } from "../formatTokens"
import type { TotpConfig } from "../TotpConfig"

describe("formatTokens", () => {
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
})
