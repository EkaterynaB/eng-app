export interface PracticeList {
  _id: string;
  name: string;
  description?: string;
  sentenceIds: string[];
  lastPracticedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeListInput {
  name: string;
  description?: string;
}

export interface PracticeListWithCount extends PracticeList {
  sentenceCount: number;
}
