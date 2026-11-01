import { Schema, model, InferSchemaType } from "mongoose";

export const DIALOGUE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const dialogueCharacterSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const dialogueLineSchema = new Schema(
  {
    speakerId: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    translation: { type: String, trim: true },
  },
  { _id: false }
);

const dialogueSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    level: { type: String, enum: DIALOGUE_LEVELS },
    characters: { type: [dialogueCharacterSchema], required: true },
    lines: { type: [dialogueLineSchema], required: true },
  },
  { timestamps: true }
);

export type DialogueDocument = InferSchemaType<typeof dialogueSchema>;

export const Dialogue = model("Dialogue", dialogueSchema);
