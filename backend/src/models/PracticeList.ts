import { Schema, model, InferSchemaType, Types } from "mongoose";

const practiceListSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    sentenceIds: [{ type: Schema.Types.ObjectId, ref: "Sentence" }],
  },
  { timestamps: true }
);

export type PracticeListDocument = InferSchemaType<typeof practiceListSchema>;

export const PracticeList = model("PracticeList", practiceListSchema);
