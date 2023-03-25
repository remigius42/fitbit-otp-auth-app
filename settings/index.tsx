import SectionAddTokenManually from "./SectionAddTokenManually"
import SectionLicenses from "./SectionLicenses"
import { SectionTokens } from "./SectionTokens"

function SettingsPage({ settingsStorage }) {
  return (
    <Page>
      <SectionTokens settingsStorage={settingsStorage} />

      <SectionAddTokenManually settingsStorage={settingsStorage} />

      <SectionLicenses />
    </Page>
  )
}

registerSettingsPage(SettingsPage)
