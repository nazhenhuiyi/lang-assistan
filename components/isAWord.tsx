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
