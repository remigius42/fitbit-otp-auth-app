import SectionAddTokenManually from "./SectionAddTokenManually"
import SectionIntroduction from "./SectionIntroduction"
import SectionLicenses from "./SectionLicenses"
import SectionSettings from "./SectionSettings"
import { SectionTokens } from "./SectionTokens"

function SettingsPage({ settingsStorage }) {
  return (
    <Page>
      <SectionIntroduction />

      <SectionTokens settingsStorage={settingsStorage} />

      <SectionAddTokenManually settingsStorage={settingsStorage} />

      <SectionSettings settingsStorage={settingsStorage} />

      <SectionLicenses />
    </Page>
  )
}

registerSettingsPage(SettingsPage)
