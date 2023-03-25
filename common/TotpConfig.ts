export interface TotpConfig {
  label: string
  issuer?: string
  displayName?: string
  secret: string
  algorithm: string
  digits: string
  period: string
}
