import { Schema, model, InferSchemaType } from "mongoose";

const sentenceSchema = new Schema(
  {
    englishText: { type: String, required: true, trim: true },
    translation: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export type SentenceDocument = InferSchemaType<typeof sentenceSchema>;

export const Sentence = model("Sentence", sentenceSchema);
