import Dexie, { type Table } from "dexie"

export interface VocabularyItem {
  word: string
  reviewCount: number
  description: string
  updatedAt: number
  createdAt: number
  [prop: string]: string | number
}

Dexie.debug = true
class MyDexie extends Dexie {
  vocabulary!: Table<VocabularyItem>

  constructor() {
    super("openai-translator")
    this.version(2).stores({
      vocabulary: "word, reviewCount, description, updatedAt, createdAt"
    })
  }
}

// init indexdb
export const LocalDB = new MyDexie()
