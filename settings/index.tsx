import SectionLicenses from "./SectionLicenses"

function SettingsPage() {
  return (
    <Page>
      <SectionLicenses />
    </Page>
  )
}

registerSettingsPage(SettingsPage)
