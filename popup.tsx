import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import { getSettings } from "~utils/getSettings"

import "./style.css"

const storage = new Storage()
function IndexPopup() {
  const [key, setKey] = useState("")
  useEffect(() => {
    const initSettings = async () => {
      const settins = await getSettings()
      setKey(settins.apiKey)
    }
    initSettings()
  }, [])
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}
      className="min-w-[300px]">
      <h3 className="text-xl">settings</h3>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">OpenAI key</span>
        </label>
        <input
          type="text"
          onChange={(e) => setKey(e.target.value)}
          value={key}
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <button
        className="btn mt-4 btn-sm"
        onClick={() => storage.set("openai_key", key)}>
        保存
      </button>

      <div className="divider"></div>
      <button
        className="btn btn-primary btn-sm"
        onClick={() => window.open("/tabs/learn.html")}>
        去复习
      </button>
    </div>
  )
}

export default IndexPopup
