import { useCallback, useEffect, useState } from "react"
import { AiFillStar } from "react-icons/ai"

import { sendToBackground } from "@plasmohq/messaging"

import icon from "~assets/icon.png"

import { translate } from "./translate"

interface TranslatePopupProps {
  mode: "button" | "translateCard"
  text: string
}
export const PopupCard: React.FC<TranslatePopupProps> = ({ mode, text }) => {
  const [localMode, setLocalMode] = useState<"button" | "translateCard">(mode)
  const [textValue, setTextValue] = useState(text)
  const [selectedWord, setSelectedWord] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [translatedLines, setTranslatedLines] = useState<string[]>([])

  const translateText = useCallback(
    async (text: string, selectedWord: string, signal: AbortSignal) => {
      const beforeTranslate = () => {}
      const afterTranslate = (reason: string) => {}
      beforeTranslate()
      // const cachedKey = `translate:${text}:${selectedWord}`
      // const cachedValue = cache.get(cachedKey)
      // if (cachedValue) {
      //     afterTranslate('stop')
      //     setTranslatedText(cachedValue as string)
      //     return
      // }
      //   let isStopped = false
      try {
        await translate({
          signal,
          text,
          selectedWord,
          detectFrom: "",
          detectTo: "",
          onMessage: (message) => {
            if (message.role) {
              return
            }
            setTranslatedText((translatedText) => {
              return translatedText + message.content
            })
          },
          onFinish: async (reason) => {
            afterTranslate(reason)

            setTranslatedText((translatedText) => {
              let result = translatedText

              sendToBackground({
                name: "saveWord",
                body: {
                  textValue,
                  translatedText
                }
              })
              if (
                translatedText &&
                ["”", '"', "」"].indexOf(
                  translatedText[translatedText.length - 1]
                ) >= 0
              ) {
                result = translatedText.slice(0, -1)
              }
              if (result && ["“", '"', "「"].indexOf(result[0]) >= 0) {
                result = result.slice(1)
              }
              return result
            })
          },
          onError: (error) => {
            // setActionStr('Error')
            // setErrorMessage(error)
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        // if error is a AbortError then ignore this error
        // if (error.name === 'AbortError') {
        //     isStopped = true
        //     return
        // }
        // setActionStr('Error')
        // setErrorMessage((error as Error).toString())
      } finally {
        // if (!isStopped) {
        //     stopLoading()
        //     isStopped = true
        // }
      }
    },
    []
  )
  useEffect(() => {
    if (localMode === "button") return
    const controller = new AbortController()
    const { signal } = controller
    translateText(textValue, selectedWord, signal)
    return () => {
      controller.abort()
    }
  }, [translateText, textValue, selectedWord, localMode])
  useEffect(() => {
    setTranslatedLines(translatedText.split("\n"))
  }, [translatedText])

  if (localMode === "button") {
    return (
      <img
        src={icon}
        className="w-6 h-6 p-1 select-none bg-white rounded-md"
        onClick={() => setLocalMode("translateCard")}
      />
    )
  }
  return (
    <div className="pb-3 bg-white shadow-lg rounded-md w-[650px]">
      <div className="h-8 flex mx-4 items-center">
        <img src={icon} className="w-4 h-4" />
        <h3 className="ml-2">Lang Assistant</h3>
        <div className="ml-auto">
          <AiFillStar />
        </div>
      </div>
      <div className="divider mt-0 h-2"></div>
      <div className="px-4">
        <textarea
          className="textarea  textarea-bordered w-full"
          placeholder="please input"
          value={textValue}></textarea>
      </div>
      <div className="divider">translate</div>
      <div className="min-h-20 mx-4">
        {translatedLines.map((v) => (
          <p>{v}</p>
        ))}
      </div>
    </div>
  )
}
