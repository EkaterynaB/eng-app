import { apiRequest } from "./client";
import { Sentence, SentenceInput } from "../types/sentence";

export const sentencesApi = {
  getAll(): Promise<Sentence[]> {
    return apiRequest<Sentence[]>("/sentences");
  },

  getForPractice(limit?: number): Promise<Sentence[]> {
    const query = limit ? `?limit=${limit}` : "";
    return apiRequest<Sentence[]>(`/sentences/practice${query}`);
  },

  create(input: SentenceInput): Promise<Sentence> {
    return apiRequest<Sentence>("/sentences", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: SentenceInput): Promise<Sentence> {
    return apiRequest<Sentence>(`/sentences/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/sentences/${id}`, { method: "DELETE" });
  },
};
