/* eslint-disable @typescript-eslint/no-explicit-any */

import type { IBrowser, ISettings } from "./types"

export const defaultAPIURL = "https://api.openai.com"
export const defaultAPIURLPath = "/v1/chat/completions"
export const defaultProvider = "OpenAI"
export const defaultAPIModel = "gpt-3.5-turbo"

export const defaultAutoTranslate = false
export const defaultTargetLanguage = "zh-Hans"
export const defaultAlwaysShowIcons = true

export const defaulti18n = "en"

// In order to let the type system remind you that all keys have been passed to browser.storage.sync.get(keys)
const settingKeys: Record<keyof ISettings, number> = {
  apiKeys: 1,
  apiURL: 1,
  apiURLPath: 1,
  apiModel: 1,
  provider: 1,
  autoTranslate: 1,
  alwaysShowIcons: 1,
  hotkey: 1,
  ocrHotkey: 1,
  themeType: 1,
  i18n: 1,
  ttsVoices: 1,
  restorePreviousPosition: 1,
  runAtStartup: 1
}

export async function getSettings(): Promise<ISettings> {
  const browser = await getBrowser()
  const items = await browser.storage.sync.get(Object.keys(settingKeys))

  const settings = items as ISettings
  if (!settings.apiKeys) {
    settings.apiKeys = ""
  }
  if (!settings.apiURL) {
    settings.apiURL = defaultAPIURL
  }
  if (!settings.apiURLPath) {
    settings.apiURLPath = defaultAPIURLPath
  }
  if (!settings.apiModel) {
    settings.apiModel = defaultAPIModel
  }
  if (!settings.provider) {
    settings.provider = defaultProvider
  }
  if (settings.autoTranslate === undefined || settings.autoTranslate === null) {
    settings.autoTranslate = defaultAutoTranslate
  }
  if (!settings.defaultTargetLanguage) {
    settings.defaultTargetLanguage = defaultTargetLanguage
  }
  if (
    settings.alwaysShowIcons === undefined ||
    settings.alwaysShowIcons === null
  ) {
    settings.alwaysShowIcons = defaultAlwaysShowIcons
  }
  if (!settings.i18n) {
    settings.i18n = defaulti18n
  }
  return settings
}

export async function setSettings(settings: Partial<ISettings>) {
  const browser = await getBrowser()
  await browser.storage.sync.set(settings)
}

export async function getBrowser(): Promise<IBrowser> {
  if (isElectron()) {
    return (await import("./electron-polyfill")).electronBrowser
  }
  if (isUserscript()) {
    return (await import("./userscript-polyfill")).userscriptBrowser
  }
  return await require("webextension-polyfill")
}

export const isElectron = () => {
  return navigator.userAgent.indexOf("Electron") >= 0
}

export const isTauri = () => {
  return window["__TAURI__" as any] !== undefined
}

export const isDesktopApp = () => {
  return isElectron() || isTauri()
}

export const isUserscript = () => {
  // eslint-disable-next-line camelcase
  return typeof GM_info !== "undefined"
}

export const isDarkMode = async () => {
  const settings = await getSettings()
  if (settings.themeType === "followTheSystem") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  }
  return settings.themeType === "dark"
}

export const isFirefox = /firefox/i.test(navigator.userAgent)

// js to csv
