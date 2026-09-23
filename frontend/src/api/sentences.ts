import { apiRequest } from "./client";
import { Sentence, SentenceInput } from "../types/sentence";

export const sentencesApi = {
  getAll(): Promise<Sentence[]> {
    return apiRequest<Sentence[]>("/sentences");
  },

  getForPractice(limit?: number, listId?: string): Promise<Sentence[]> {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (listId) params.append("listId", listId);
    const query = params.toString() ? `?${params.toString()}` : "";
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
