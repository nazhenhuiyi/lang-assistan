import Dexie, { type Table } from "dexie"

export interface VocabularyItem {
  word: string
  reviewCount: number
  description: string
  updatedAt: number
  createdAt: number
  lastReviewed: number
  nextReview: number
  repeat: number
  [prop: string]: string | number
}

class MyDexie extends Dexie {
  vocabulary!: Table<VocabularyItem>

  constructor() {
    super("openai-translator")
    this.version(2).stores({
      vocabulary:
        "word, reviewCount, description, updatedAt, createdAt, lastReviewed, nextReview"
    })
  }
}

// init indexdb
export const LocalDB = new MyDexie()
