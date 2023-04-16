export const life = 42
window.addEventListener("message", async function (event) {
  const source = event.source as {
    window: WindowProxy
  }
  console.log(event, "121212")
  source.window.postMessage(eval(event.data), event.origin)
})
