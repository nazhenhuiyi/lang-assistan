import type { Theme } from "baseui-sd/theme"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ISync {
  get(keys: string[]): Promise<Record<string, any>>
  set(items: Record<string, any>): Promise<void>
}

interface IStorage {
  sync: ISync
}

interface IRuntimeOnMessage {
  addListener(
    callback: (message: any, sender: any, sendResponse: any) => void
  ): void
  removeListener(
    callback: (message: any, sender: any, sendResponse: any) => void
  ): void
}

interface IRuntime {
  onMessage: IRuntimeOnMessage
  sendMessage(message: any): void
  getURL(path: string): string
}

interface II18n {
  detectLanguage(
    text: string
  ): Promise<{ languages: { language: string; percentage: number }[] }>
}

export interface IBrowser {
  storage: IStorage
  runtime: IRuntime
  i18n: II18n
}

export type BaseThemeType = "light" | "dark"
export type ThemeType = BaseThemeType | "followTheSystem"

export interface IThemedStyleProps {
  theme: Theme
  themeType: BaseThemeType
  isDesktopApp?: boolean
}

export interface ISettings {
  apiKeys: string
  apiURL: string
  apiURLPath: string
  apiModel: string
  provider: "OpenAI"
  autoTranslate: boolean
  defaultTargetLanguage: string
  alwaysShowIcons: boolean
  hotkey?: string
  ocrHotkey?: string
  themeType?: ThemeType
  i18n?: string
  ttsVoices?: {
    lang: string
    voice: string
  }[]
  restorePreviousPosition?: boolean
  runAtStartup?: boolean
}
