/* spell-checker:ignore MJUXILTMPEXTEWRWMNFEITY */

import { gettext } from "i18n"
import { NewTokenButton } from "../companion/ui/NewTokenButton"
import { NewTokenFieldName } from "../companion/ui/NewTokenFieldName"
import FieldValidationMessage from "./FieldValidationMessage"

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
      <FieldValidationMessage
        settingsStorage={settingsStorage}
        fieldName={NewTokenFieldName.label}
      />

      <TextInput
        label={gettext("Issuer")}
        placeholder="ACME co."
        settingsKey={NewTokenFieldName.issuer}
      />
      <FieldValidationMessage
        settingsStorage={settingsStorage}
        fieldName={NewTokenFieldName.issuer}
      />

      <TextInput
        label={gettext("Secret in Base32")}
        placeholder="MJUXILTMPEXTEWRWMNFEITY"
        settingsKey={NewTokenFieldName.secret}
      />
      <FieldValidationMessage
        settingsStorage={settingsStorage}
        fieldName={NewTokenFieldName.secret}
      />

      <Select
        label={gettext("Algorithm")}
        selectViewTitle={gettext("Select token algorithm")}
        settingsKey={NewTokenFieldName.algorithm}
        options={[{ name: "SHA1" }, { name: "SHA256" }, { name: "SHA512" }]}
      />
      <FieldValidationMessage
        settingsStorage={settingsStorage}
        fieldName={NewTokenFieldName.algorithm}
      />

      <Select
        label={gettext("Number of digits")}
        selectViewTitle={gettext("Select number of digits")}
        settingsKey={NewTokenFieldName.digits}
        options={[{ name: "6" }, { name: "8" }]}
      />
      <FieldValidationMessage
        settingsStorage={settingsStorage}
        fieldName={NewTokenFieldName.digits}
      />

      <TextInput
        label={gettext("Period in seconds")}
        settingsKey={NewTokenFieldName.period}
        type="number"
        placeholder="30"
      />
      <FieldValidationMessage
        settingsStorage={settingsStorage}
        fieldName={NewTokenFieldName.period}
      />

      <Button
        label={gettext("Add token")}
        onClick={() => settingsStorage.setItem(NewTokenButton.addToken, "true")}
      />
      <Button
        label={gettext("Reset")}
        onClick={() => settingsStorage.setItem(NewTokenButton.reset, "true")}
      />
    </Section>
  )
}
