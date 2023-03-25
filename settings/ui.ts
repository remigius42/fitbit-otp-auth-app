interface Licenses {
  [key: string]: { version: string; copyright: string }
}

export function getVersion(licenses: Licenses) {
  return getOwnLicenseEntry(licenses).version
}

export function getCopyright(licenses: Licenses) {
  return getOwnLicenseEntry(licenses).copyright
}

export function thirdPartyLicenseKeys(licenses: Licenses) {
  return Object.keys(licenses).filter(
    key => !key.match(/^fitbit-otp-auth-app@/)
  )
}

function getOwnLicenseEntry(licenses: Licenses) {
  return licenses[
    Object.keys(licenses).filter(key => key.match(/^fitbit-otp-auth-app@/))[0]
  ]
}
