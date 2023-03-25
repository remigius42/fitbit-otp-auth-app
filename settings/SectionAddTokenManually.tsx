/* spell-checker:ignore MJUXILTMPEXTEWRWMNFEITY */

import { gettext } from "i18n"
import { NewTokenButton } from "../companion/ui/NewTokenButton"
import { NewTokenFieldName } from "../companion/ui/NewTokenFieldName"
import ConnectionStatus from "./ConnectionStatus"
import ValidationMessage from "./ValidationMessage"

export default function SectionAddTokenManually({ settingsStorage }) {
  return (
    <Section
      title={
        <Text bold align="center">
          {gettext("Add token manually")}
        </Text>
      }
    >
      <TextInput
        label={gettext("Label")}
        placeholder="SSH login"
        settingsKey={NewTokenFieldName.label}
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenFieldName.label}
      />

      <TextInput
        label={gettext("Issuer")}
        placeholder="ACME co."
        settingsKey={NewTokenFieldName.issuer}
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenFieldName.issuer}
      />

      <TextInput
        label={gettext("Secret in Base32")}
        placeholder="MJUXILTMPEXTEWRWMNFEITY"
        settingsKey={NewTokenFieldName.secret}
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenFieldName.secret}
      />

      <Select
        label={gettext("Algorithm")}
        selectViewTitle={gettext("Select token algorithm")}
        settingsKey={NewTokenFieldName.algorithm}
        options={[{ name: "SHA1" }, { name: "SHA256" }, { name: "SHA512" }]}
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenFieldName.algorithm}
      />

      <Select
        label={gettext("Number of digits")}
        selectViewTitle={gettext("Select number of digits")}
        settingsKey={NewTokenFieldName.digits}
        options={[{ name: "6" }, { name: "8" }]}
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenFieldName.digits}
      />

      <TextInput
        label={gettext("Period in seconds")}
        settingsKey={NewTokenFieldName.period}
        type="number"
        placeholder="30"
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenFieldName.period}
      />

      <Button
        label={gettext("Add token")}
        onClick={() =>
          settingsStorage.setItem(NewTokenButton.addTokenManually, "true")
        }
      />
      <ValidationMessage
        settingsStorage={settingsStorage}
        componentName={NewTokenButton.addTokenManually}
      />

      <Button
        label={gettext("Reset to defaults")}
        onClick={() =>
          settingsStorage.setItem(NewTokenButton.resetToDefaults, "true")
        }
      />

      <ConnectionStatus settingsStorage={settingsStorage} />
    </Section>
  )
}
