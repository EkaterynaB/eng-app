import { Sentence } from "../models/Sentence";
import { PracticeList } from "../models/PracticeList";
import { NotFoundError } from "../utils/AppError";
import { CreateSentenceInput, UpdateSentenceInput } from "../validation/sentence.schema";

export const sentenceService = {
  async create(input: CreateSentenceInput) {
    const { practiceListId, ...sentenceData } = input;
    const sentence = await Sentence.create(sentenceData);

    // If a practice list is specified, add the sentence to it
    if (practiceListId) {
      const list = await PracticeList.findById(practiceListId);
      if (list) {
        list.sentenceIds.push(sentence._id as any);
        await list.save();
      }
      // Note: We don't throw an error if the list doesn't exist
      // to avoid failing sentence creation due to stale list references
    }

    return sentence;
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

  async findForPractice(limit?: number, listId?: string) {
    if (listId) {
      // Get sentences from specific practice list
      const list = await PracticeList.findById(listId);
      if (!list) {
        throw new NotFoundError("Practice list not found");
      }

      if (list.sentenceIds.length === 0) {
        return [];
      }

      // Get random sentences from the list
      const sampleSize = Math.min(limit ?? list.sentenceIds.length, list.sentenceIds.length);
      const sentences = await Sentence.aggregate([
        { $match: { _id: { $in: list.sentenceIds } } },
        { $sample: { size: sampleSize } },
      ]);
      return sentences;
    }

    // Get all sentences
    const sentences = await Sentence.aggregate([{ $sample: { size: limit ?? 1000 } }]);
    return sentences;
  },
};
