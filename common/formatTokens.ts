import type { TotpConfig } from "./TotpConfig"

export function getDisplayName(
  { label, issuer, displayName }: TotpConfig,
  includeLabelAndIssuer = false
) {
  const formatLabelAndIssuer = (label: string, issuer: string) =>
    issuer ? `${issuer} (${label})` : label

  if (displayName) {
    if (includeLabelAndIssuer) {
      return `${displayName} / ${formatLabelAndIssuer(label, issuer)}`
    } else {
      return displayName
    }
  } else {
    return formatLabelAndIssuer(label, issuer)
  }
}
