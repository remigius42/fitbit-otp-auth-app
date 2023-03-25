import SectionAddTokenManually from "./SectionAddTokenManually"
import SectionLicenses from "./SectionLicenses"

function SettingsPage({ settingsStorage }) {
  return (
    <Page>
      <SectionAddTokenManually settingsStorage={settingsStorage} />

      <SectionLicenses />
    </Page>
  )
}

registerSettingsPage(SettingsPage)
