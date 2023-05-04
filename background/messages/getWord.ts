import type { PlasmoMessaging } from "@plasmohq/messaging"

import { LocalDB } from "~/common/db"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { textValue } = req.body
  try {
    const arr = await LocalDB.vocabulary
      .where("word")
      .equals(textValue.trim())
      .toArray()
    res.send({
      word: arr[0]
    })
  } catch (e) {
    console.error(e)
    res.send({
      success: false
    })
  }
}

export default handler
