import { gettext } from "i18n"
import { SettingsButton } from "../companion/ui/SettingsButton"

export default function SectionSettings() {
  return (
    <Section
      title={
        <Text bold align="center">
          {gettext("Settings")}
        </Text>
      }
    >
      <Toggle
        settingsKey={SettingsButton.compensateClockDrift}
        label={gettext("Compensate clock drift")}
      />

      <Toggle
        settingsKey={SettingsButton.storeTokensOnDevice}
        label={gettext("Store tokens on device")}
      />

      <Toggle
        settingsKey={SettingsButton.showEnlargedTokensView}
        label={gettext("Enlarge token information")}
      />
    </Section>
  )
}
