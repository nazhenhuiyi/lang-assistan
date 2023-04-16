import { isUndefined } from "lodash-es"
import { useEffect, useState } from "react"

interface PlayGroundProps {
  words: string[]
}
export async function translate(query) {
  const settings = {
    apiKey: "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",
    apiURL: "https://api.openai.com",
    apiURLPath: "/v1/chat/completions",
    apiModel: "gpt-3.5-turbo"
  }
  let systemPrompt = `你现在扮演一名非常优秀的英语助教，根据我给出的单词列表，请你设计为每个单词设计一道单项选择题，并给出对应的正确答案，请严格按照以下格式：
    [<序号><题目>]
    <大写字母序号>.<选项>
    [<答案>]
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
    presence_penalty: 1
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  }

  headers["Authorization"] = `Bearer ${settings.apiKey}`
  body["messages"] = [
    {
      role: "system",
      content: systemPrompt
    },
    { role: "user", content: `${query.text}` }
  ]
  await fetch(`${settings.apiURL}${settings.apiURLPath}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: query.signal
  })
    .then((res) => {
      return res.json()
    })
    .then((res) => {
      return res.choices[0].message
    })
}
export const PlayGround: React.FC<PlayGroundProps> = ({ words }) => {
  const [localWords, setLocalWords] = useState(words)
  console.log(words)
  const [mode, setMode] = useState<"selectWord" | "quiz">("selectWord")
  const [quiz, setQuiz] = useState<
    { title: string; options: string[]; answer: string }[]
  >([])

  const generateExam = async () => {
    const controller = new AbortController()
    const { signal } = controller

    try {
      const message = await translate({
        signal,
        text: localWords.join("\n"),
        selectedWord: "",
        detectFrom: "",
        detectTo: ""
      })
      const messageContent = `1. What does the word "available" mean?\nA. Unavailable\nB. Accessible or obtainable\nC. Expensive\nD. Difficult to find\n\nAnswer: B\n\n2. Which of the following is a synonym for "Extension"?\nA. Addition\nB. Reduction\nC. Subtraction \nD. Division \n\nAnswer: A\n\n3.What does the word "Content" mean in this sentence? "The content of this book is very interesting."\nA.The feeling that something is not worth considering.\nB.The amount of space that can be filled.\nC.The information contained within something.\nD.A state of peaceful happiness.\n\nAnswer: C\n\n4.What does the term "Quickstart" refer to?\nA.A slow and steady approach to learning something new.\nB.A way to start a fire quickly without matches or lighter fluid.\nC.An introduction or guide designed to help someone get started with a new product, service, or technology quickly and easily.\nD.A type of exercise routine that emphasizes speed over endurance.\n\nAnswer: C\n\n5.What does it mean when you expose something?\nA.To hide it from view \nB.To make it visible or known \nC.To destroy it completely \nD.To change its color \n\nAnswer: B\n\n6.Which definition best describes the verb 'walk' ?\nA) To run at top speed for short distances  \nB) To move forward by putting one foot in front of another on repeat   \nC) To jump up and down repeatedly  \nD) To crawl on hands and knees  \n\nAnswer : B\n\n\n7.What is Tailwind ?\nA) A strong wind blowing in opposite direction    \nB) A gentle breeze     \nC) An online tool used for web development      \nD) None of these   \n\n Answer : C`
      const dataLines = messageContent.split("\n")
      const quiz = []
      let index = 0
      while (index < dataLines.length) {
        if (isUndefined(dataLines[index])) {
          break
        }
        if (dataLines[index].match(/^\d+\..*$/)) {
          const result = {
            title: dataLines[index]
          }
          const options = []
          while (true) {
            index++
            console.log(index, dataLines[index])
            if (isUndefined(dataLines[index])) {
              break
            }
            if (dataLines[index].match(/^[A-Z]+[\.|))].*$/)) {
              options.push(dataLines[index])
            } else if (dataLines[index].match(/answer\s*:\s*([A-Z]*)/i)) {
              result["answer"] = dataLines[index].match(
                /answer\s*:\s*([A-Z]*)/i
              )[1]
              break
            } else {
              continue
            }
          }
          result["options"] = options
          quiz.push(result)
        }
        index++
      }
      setQuiz(quiz)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log(error)
    } finally {
    }
  }
  useEffect(() => {
    if (words.length > 0) {
      generateExam()
    }
  }, [words])
  useEffect(() => {
    setLocalWords(words)
  }, [words])
  console.log(mode)
  if (mode === "selectWord") {
    return (
      <div className="card w-120 bg-base-100 shadow-xl align-center mx-auto">
        <div className="card-body">
          <h2 className="card-title">将对以下单词进行测试</h2>
          <textarea
            className="textarea textarea-bordered min-h-[240px]"
            value={localWords.join("\n")}
            onChange={(e) =>
              setLocalWords(e.target.value.split("\n"))
            }></textarea>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={() => setMode("quiz")}>
              开始
            </button>
          </div>
        </div>
      </div>
    )
  }
  if (mode === "quiz") {
    return (
      <div className="grid grid-cols-1">
        {quiz.map((v) => {
          return (
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">{v.title}</h2>
                {v.options.map((option) => (
                  <p>{option}</p>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }
}
