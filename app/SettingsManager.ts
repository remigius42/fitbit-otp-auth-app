import { AppSettings } from "../common/AppSettings"
import { UpdateSettingsMessage } from "../common/PeerMessage"
import * as fs from "fs"

type SettingsManagerObserver = (settingsManager: SettingsManager) => void

export class SettingsManager {
  public static readonly SETTINGS_CBOR_PATH = "settings.cbor"
  private settings: AppSettings = { shouldUseLargeTokenView: false }
  private readonly observers: Array<SettingsManagerObserver> = []

  restoreSettings() {
    if (fs.existsSync(SettingsManager.SETTINGS_CBOR_PATH)) {
      const restoredSettings = fs.readFileSync(
        SettingsManager.SETTINGS_CBOR_PATH,
        "cbor"
      ) as AppSettings
      this.mergeSettings(restoredSettings)
    }
  }

  getSettings() {
    return this.settings
  }

  updateSettings(updateSettingsMessage: UpdateSettingsMessage) {
    this.mergeSettings(updateSettingsMessage.updatedSettings)
    this.storeSettings()
    this.notifyObservers()
  }

  registerObserver(observer: SettingsManagerObserver) {
    this.observers.push(observer)
  }

  getObservers() {
    return this.observers
  }

  private notifyObservers() {
    this.observers.forEach(observer => observer(this))
  }

  private mergeSettings(newSettings: Partial<AppSettings>) {
    this.settings = {
      ...this.settings,
      ...newSettings
    }
  }

  private storeSettings() {
    fs.writeFileSync(SettingsManager.SETTINGS_CBOR_PATH, this.settings, "cbor")
  }
}
