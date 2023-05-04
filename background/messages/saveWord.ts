import type { PlasmoMessaging } from "@plasmohq/messaging"

import { LocalDB } from "~/common/db"
import { isAWord } from "~components/isAWord"
import { getNextReviewTime } from "~utils/utils"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { textValue, translatedText } = req.body
  const addWordToDb = async () => {
    if (isAWord("en", textValue)) {
      const arr = await LocalDB.vocabulary
        .where("word")
        .equals(textValue.trim())
        .toArray()
      console.log(arr)
      if (arr.length > 0) {
        await LocalDB.vocabulary.put({
          ...arr[0],
          reviewCount: arr[0].reviewCount + 1
        })
      } else {
        await LocalDB.vocabulary.put({
          word: textValue.trim(),
          reviewCount: 1,
          description: translatedText.slice(textValue.trim().length + 1), // separate string after first '\n'
          updatedAt: new Date().valueOf(),
          createdAt: new Date().valueOf(),
          lastReviewed: new Date().valueOf(),
          nextReview: getNextReviewTime(new Date().valueOf(), 0),
          repeat: 0
        })
      }
    } else {
      // todo sentence
    }
  }
  try {
    await addWordToDb()
    res.send({
      success: true
    })
  } catch (e) {
    console.log(e)
    res.send({
      success: false
    })
  }
}

export default handler
