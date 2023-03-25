import { gettext } from "i18n"
import { ColorSchemeName, ColorSchemes } from "../common/ColorSchemes"
import { SettingsButton } from "../companion/ui/SettingsButton"
import ConnectionStatus from "./ConnectionStatus"

export default function SectionSettings({ settingsStorage }) {
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

      <Text align="center">{gettext("Color scheme")}</Text>
      <ColorSelect
        centered={true}
        settingsKey={SettingsButton.colorScheme}
        colors={[
          {
            color: ColorSchemes[ColorSchemeName.default].primaryColor,
            value: ColorSchemeName.default
          },
          {
            color: ColorSchemes[ColorSchemeName.fb_aqua].primaryColor,
            value: ColorSchemeName.fb_aqua
          },
          {
            color: ColorSchemes[ColorSchemeName.fb_mint].primaryColor,
            value: ColorSchemeName.fb_mint
          },
          {
            color: ColorSchemes[ColorSchemeName.fb_pink].primaryColor,
            value: ColorSchemeName.fb_pink
          },
          {
            color: ColorSchemes[ColorSchemeName.white].primaryColor,
            value: ColorSchemeName.white
          },
          {
            color: ColorSchemes[ColorSchemeName.black].primaryColor,
            value: ColorSchemeName.black
          }
        ]}
      />

      <ConnectionStatus settingsStorage={settingsStorage} />
    </Section>
  )
}
