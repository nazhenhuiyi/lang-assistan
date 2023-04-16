/* eslint-disable camelcase */
import * as utils from "../common/utils"
import { fetchSSE } from "../utils/fetchSSE"
import * as lang from "./lang"

export type TranslateMode =
  | "translate"
  | "polishing"
  | "summarize"
  | "analyze"
  | "explain-code"
  | "big-bang"
export type Provider = "OpenAI" | "Azure"
export type APIModel =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301"
  | "gpt-4"
  | "gpt-4-0314"
  | "gpt-4-32k"
  | "gpt-4-32k-0314"

export interface TranslateQuery {
  text: string
  selectedWord: string
  detectFrom: string
  detectTo: string
  onMessage: (message: {
    content: string
    role: string
    isWordMode: boolean
  }) => void
  onError: (error: string) => void
  onFinish: (reason: string) => void
  signal: AbortSignal
  articlePrompt?: string
}

export interface TranslateResult {
  text?: string
  from?: string
  to?: string
  error?: string
}

export const isAWord = (lang: string, text: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Segmenter = (Intl as any).Segmenter
  if (!Segmenter) {
    return false
  }
  const segmenter = new Segmenter(lang, { granularity: "word" })
  const iterator = segmenter.segment(text)[Symbol.iterator]()
  return iterator.next().value?.segment === text
}

const chineseLangs = ["zh-Hans", "zh-Hant", "wyw", "yue"]

export async function translate(query: TranslateQuery) {
  const settings = {
    apiKey: "",
    apiURL: "https://api.openai.com",
    apiURLPath: "/v1/chat/completions",
    apiModel: "gpt-3.5-turbo"
  }
  let systemPrompt = `请给出英语单词原始形态（如果有）、单词的语种、对应的音标（如果有）、所有含义（含词性）、双语示例，至少三条例句，请严格按照下面格式给到翻译结果：
  <原始文本>
  [<语种>] · / <单词音标>
  [<词性缩写>] <中文含义>]
  例句：
  <序号><例句>(例句翻译)
  `
  let assistantPrompt = ``
  // a word could be collected
  let isWordMode = false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    model: settings.apiModel,
    temperature: 0,
    max_tokens: 1000,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    stream: true
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  }

  let isChatAPI = true
  headers["Authorization"] = `Bearer ${settings.apiKey}`
  body["messages"] = [
    {
      role: "system",
      content: systemPrompt
    },
    { role: "user", content: `${query.text}` }
  ]
  await fetchSSE(`${settings.apiURL}${settings.apiURLPath}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: query.signal,
    onMessage: (msg) => {
      let resp
      try {
        resp = JSON.parse(msg)
        // eslint-disable-next-line no-empty
      } catch {
        query.onFinish("stop")
        return
      }
      const { choices } = resp
      if (!choices || choices.length === 0) {
        return { error: "No result" }
      }
      const { finish_reason: finishReason } = choices[0]
      if (finishReason) {
        query.onFinish(finishReason)
        return
      }

      let targetTxt = ""

      if (!isChatAPI) {
        // It's used for Azure OpenAI Service's legacy parameters.
        targetTxt = choices[0].text

        query.onMessage({ content: targetTxt, role: "", isWordMode })
      } else {
        const { content = "", role } = choices[0].delta
        targetTxt = content

        query.onMessage({ content: targetTxt, role, isWordMode })
      }
    },
    onError: (err) => {
      const { error } = err
      query.onError(error.message)
    }
  })
}
