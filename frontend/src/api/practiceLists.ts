import { apiRequest } from "./client";
import { PracticeList, PracticeListInput } from "../types/practiceList";
import { Sentence } from "../types/sentence";

export const practiceListsApi = {
  getAll(): Promise<PracticeList[]> {
    return apiRequest<PracticeList[]>("/practice-lists");
  },

  getById(id: string): Promise<PracticeList> {
    return apiRequest<PracticeList>(`/practice-lists/${id}`);
  },

  create(input: PracticeListInput): Promise<PracticeList> {
    return apiRequest<PracticeList>("/practice-lists", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: PracticeListInput): Promise<PracticeList> {
    return apiRequest<PracticeList>(`/practice-lists/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/practice-lists/${id}`, { method: "DELETE" });
  },

  addSentence(listId: string, sentenceId: string): Promise<PracticeList> {
    return apiRequest<PracticeList>(`/practice-lists/${listId}/sentences`, {
      method: "POST",
      body: JSON.stringify({ sentenceId }),
    });
  },

  removeSentence(listId: string, sentenceId: string): Promise<PracticeList> {
    return apiRequest<PracticeList>(`/practice-lists/${listId}/sentences/${sentenceId}`, {
      method: "DELETE",
    });
  },

  getSentences(listId: string): Promise<Sentence[]> {
    return apiRequest<Sentence[]>(`/practice-lists/${listId}/sentences`);
  },
};
