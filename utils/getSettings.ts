import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export const getSettings = async () => {
  return {
    apiKey: await storage.get("openai_key"),
    apiURL: "https://api.openai.com",
    apiURLPath: "/v1/chat/completions",
    apiModel: "gpt-3.5-turbo"
  }
}
