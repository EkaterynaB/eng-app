import { Sentence } from "../models/Sentence";
import { NotFoundError } from "../utils/AppError";
import { CreateSentenceInput, UpdateSentenceInput } from "../validation/sentence.schema";

export const sentenceService = {
  async create(input: CreateSentenceInput) {
    return Sentence.create(input);
  },

  async findAll() {
    return Sentence.find().sort({ createdAt: -1 });
  },

  async findById(id: string) {
    const sentence = await Sentence.findById(id);
    if (!sentence) {
      throw new NotFoundError("Sentence not found");
    }
    return sentence;
  },

  async update(id: string, input: UpdateSentenceInput) {
    const sentence = await Sentence.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!sentence) {
      throw new NotFoundError("Sentence not found");
    }
    return sentence;
  },

  async remove(id: string) {
    const sentence = await Sentence.findByIdAndDelete(id);
    if (!sentence) {
      throw new NotFoundError("Sentence not found");
    }
  },

  async findForPractice(limit?: number) {
    const sentences = await Sentence.aggregate([{ $sample: { size: limit ?? 1000 } }]);
    return sentences;
  },
};
