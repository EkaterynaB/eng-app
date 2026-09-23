export interface Sentence {
  _id: string;
  englishText: string;
  translation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SentenceInput {
  englishText: string;
  translation: string;
  notes?: string;
  practiceListId?: string;
}
