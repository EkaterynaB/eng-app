import { z } from "zod";

export const createPracticeListSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100, "name is too long"),
  description: z.string().trim().max(500, "description is too long").optional(),
});

export const updatePracticeListSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100, "name is too long").optional(),
  description: z.string().trim().max(500, "description is too long").optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export const addSentenceSchema = z.object({
  sentenceId: z.string().min(1, "sentenceId is required"),
});

export type CreatePracticeListInput = z.infer<typeof createPracticeListSchema>;
export type UpdatePracticeListInput = z.infer<typeof updatePracticeListSchema>;
export type AddSentenceInput = z.infer<typeof addSentenceSchema>;
