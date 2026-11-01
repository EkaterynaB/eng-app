import { Schema, model, InferSchemaType } from "mongoose";

export const DIALOGUE_STAGES = ["roleA", "roleB", "memory"] as const;

const dialogueProgressSchema = new Schema(
  {
    dialogueId: { type: Schema.Types.ObjectId, ref: "Dialogue", required: true, unique: true },
    practicedRoles: { type: [String], default: [] },
    completedStages: { type: [String], default: [] },
    sessionsCompleted: { type: Number, default: 0 },
    lastPracticedAt: { type: Date },
  },
  { timestamps: true }
);

export type DialogueProgressDocument = InferSchemaType<typeof dialogueProgressSchema>;

export const DialogueProgress = model("DialogueProgress", dialogueProgressSchema);
