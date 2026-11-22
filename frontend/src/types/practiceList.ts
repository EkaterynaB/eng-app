export interface PracticeList {
  _id: string;
  name: string;
  description?: string;
  sentenceIds: string[];
  lastPracticedAt?: string;
  preserveOrder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeListInput {
  name: string;
  description?: string;
  preserveOrder?: boolean;
}

export interface PracticeListWithCount extends PracticeList {
  sentenceCount: number;
}
