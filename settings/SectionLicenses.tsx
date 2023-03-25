import { gettext } from "i18n"
import licenses from "./licenses"
import { getCopyright, getVersion, thirdPartyLicenseKeys } from "./ui"

export default function SectionLicenses() {
  return (
    <Section
      title={
        <Text bold align="center">
          {gettext("License information")}
        </Text>
      }
    >
      <Text>
        <Text bold>fitbit-otp-auth-app</Text> v{getVersion(licenses)}
      </Text>
      <Text>{getCopyright(licenses)}</Text>
      <Text bold>{gettext("Third-party licenses")}</Text>
      {thirdPartyLicenseKeys(licenses).map(key => (
        <Text>
          <Text bold>{licenses[key].name}</Text>@{licenses[key].version},{" "}
          {licenses[key].licenses}, {licenses[key].copyright},{" "}
          {licenses[key].repository}
        </Text>
      ))}
    </Section>
  )
}
