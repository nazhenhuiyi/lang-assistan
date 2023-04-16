import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoRender } from "plasmo"
import { createRoot } from "react-dom/client"

import { PopupCard } from "~components/PopupCard"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText

  return style
}
function attachEventsToContainer($container: HTMLElement) {
  $container.addEventListener("mousedown", (event) => {
    event.stopPropagation()
  })
  $container.addEventListener("mouseup", (event) => {
    event.stopPropagation()
  })
}
let shadowHost = null
let shadowRoot = null
let shadowContainer = null
const showPopupThumb = (text, x, y) => {
  shadowHost = document.createElement("language-assistant")
  attachEventsToContainer(shadowHost)
  shadowHost.id = "language-assistant-popup"
  shadowHost.style.position = "absolute"
  shadowHost.style.top = `${y}px`
  shadowHost.style.left = `${x}px`
  shadowRoot = shadowHost.attachShadow({ mode: "open" })
  shadowRoot.prepend(getStyle())
  shadowContainer = document.createElement("div")

  shadowContainer.id = "plasmo-shadow-container"
  shadowContainer.style.zIndex = "2147483647"
  shadowContainer.style.position = "relative"
  shadowRoot.appendChild(shadowContainer)

  document.body.insertAdjacentElement("afterend", shadowHost)
  const root = createRoot(shadowContainer)
  root.render(<PopupCard mode="button" text={text} />)
}
export const render: PlasmoRender = () => {
  document.addEventListener("mouseup", (event: MouseEvent) => {
    window.setTimeout(async () => {
      let text = (window.getSelection()?.toString() ?? "").trim()
      if (!text) {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          const elem = event.target
          text = elem.value
            .substring(elem.selectionStart ?? 0, elem.selectionEnd ?? 0)
            .trim()
        }
      } else {
        showPopupThumb(text, event.pageX + 7, event.pageY + 7)
      }
    })
  })
  document.addEventListener("mousedown", (event: MouseEvent) => {
    shadowHost.remove()
  })
}
