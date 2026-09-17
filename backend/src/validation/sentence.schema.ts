import { z } from "zod";

export const createSentenceSchema = z.object({
  englishText: z.string().trim().min(1, "englishText is required"),
  translation: z.string().trim().min(1, "translation is required"),
  notes: z.string().trim().max(2000).optional(),
});

export const updateSentenceSchema = createSentenceSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);

export const practiceQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).optional(),
});

export type CreateSentenceInput = z.infer<typeof createSentenceSchema>;
export type UpdateSentenceInput = z.infer<typeof updateSentenceSchema>;
