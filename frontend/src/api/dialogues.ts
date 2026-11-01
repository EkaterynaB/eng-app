import { apiRequest } from "./client";
import { Dialogue, DialogueInput, DialogueProgress, DialogueStage } from "../types/dialogue";

export const dialoguesApi = {
  getAll(): Promise<Dialogue[]> {
    return apiRequest<Dialogue[]>("/dialogues");
  },

  getById(id: string): Promise<Dialogue> {
    return apiRequest<Dialogue>(`/dialogues/${id}`);
  },

  create(input: DialogueInput): Promise<Dialogue> {
    return apiRequest<Dialogue>("/dialogues", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: string, input: DialogueInput): Promise<Dialogue> {
    return apiRequest<Dialogue>(`/dialogues/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/dialogues/${id}`, { method: "DELETE" });
  },

  getProgress(id: string): Promise<DialogueProgress> {
    return apiRequest<DialogueProgress>(`/dialogues/${id}/progress`);
  },

  recordProgress(id: string, role: string, stage: DialogueStage): Promise<DialogueProgress> {
    return apiRequest<DialogueProgress>(`/dialogues/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ role, stage }),
    });
  },
};
