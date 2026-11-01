import { z } from "zod";
import { DIALOGUE_LEVELS } from "../models/Dialogue";
import { DIALOGUE_STAGES } from "../models/DialogueProgress";

const dialogueCharacterSchema = z.object({
  id: z.string().trim().min(1, "character id is required"),
  name: z.string().trim().min(1, "character name is required"),
});

const dialogueLineSchema = z.object({
  speakerId: z.string().trim().min(1, "speakerId is required"),
  text: z.string().trim().min(1, "line text is required"),
  translation: z.string().trim().max(2000).optional(),
});

function withCrossFieldChecks<T extends z.ZodType<{ characters: { id: string }[]; lines: { speakerId: string }[] }>>(
  schema: T
) {
  return schema.superRefine((data, ctx) => {
    const ids = data.characters.map((c) => c.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "character ids must be unique" });
    }
    data.lines.forEach((line, index) => {
      if (!uniqueIds.has(line.speakerId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `line ${index + 1} speakerId "${line.speakerId}" does not match any character`,
        });
      }
    });
  });
}

export const createDialogueSchema = withCrossFieldChecks(
  z.object({
    title: z.string().trim().min(1, "title is required").max(200, "title is too long"),
    description: z.string().trim().max(1000).optional(),
    level: z.enum(DIALOGUE_LEVELS).optional(),
    characters: z.array(dialogueCharacterSchema).length(2, "exactly 2 characters are required"),
    lines: z.array(dialogueLineSchema).min(1, "at least one line is required"),
  })
);

export const updateDialogueSchema = createDialogueSchema;

export const recordProgressSchema = z.object({
  role: z.string().trim().min(1, "role is required"),
  stage: z.enum(DIALOGUE_STAGES),
});

export type CreateDialogueInput = z.infer<typeof createDialogueSchema>;
export type UpdateDialogueInput = z.infer<typeof updateDialogueSchema>;
export type RecordProgressInput = z.infer<typeof recordProgressSchema>;
