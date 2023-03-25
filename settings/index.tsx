import SectionAddTokenManually from "./SectionAddTokenManually"
import SectionLicenses from "./SectionLicenses"
import SectionSettings from "./SectionSettings"
import { SectionTokens } from "./SectionTokens"

function SettingsPage({ settingsStorage }) {
  return (
    <Page>
      <SectionTokens settingsStorage={settingsStorage} />

      <SectionAddTokenManually settingsStorage={settingsStorage} />

      <SectionSettings />

      <SectionLicenses />
    </Page>
  )
}

registerSettingsPage(SettingsPage)
