import { PracticeList } from "../models/PracticeList";
import { Sentence } from "../models/Sentence";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { CreatePracticeListInput, UpdatePracticeListInput } from "../validation/practiceList.schema";

export const practiceListService = {
  async create(input: CreatePracticeListInput) {
    return PracticeList.create({ ...input, sentenceIds: [] });
  },

  async findAll() {
    return PracticeList.find().sort({ createdAt: -1 });
  },

  async findById(id: string) {
    const list = await PracticeList.findById(id);
    if (!list) {
      throw new NotFoundError("Practice list not found");
    }
    return list;
  },

  async update(id: string, input: UpdatePracticeListInput) {
    const list = await PracticeList.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!list) {
      throw new NotFoundError("Practice list not found");
    }
    return list;
  },

  async remove(id: string) {
    const list = await PracticeList.findByIdAndDelete(id);
    if (!list) {
      throw new NotFoundError("Practice list not found");
    }
  },

  async addSentence(listId: string, sentenceId: string) {
    // Verify sentence exists
    const sentence = await Sentence.findById(sentenceId);
    if (!sentence) {
      throw new NotFoundError("Sentence not found");
    }

    // Find list and check if sentence already exists
    const list = await PracticeList.findById(listId);
    if (!list) {
      throw new NotFoundError("Practice list not found");
    }

    if (list.sentenceIds.some((id) => id.toString() === sentenceId)) {
      throw new ValidationError("Sentence already exists in this list");
    }

    // Add sentence to list
    list.sentenceIds.push(sentenceId as any);
    await list.save();
    return list;
  },

  async removeSentence(listId: string, sentenceId: string) {
    const list = await PracticeList.findById(listId);
    if (!list) {
      throw new NotFoundError("Practice list not found");
    }

    list.sentenceIds = list.sentenceIds.filter((id) => id.toString() !== sentenceId);
    await list.save();
    return list;
  },

  async getSentences(listId: string) {
    const list = await PracticeList.findById(listId).populate("sentenceIds");
    if (!list) {
      throw new NotFoundError("Practice list not found");
    }
    return list.sentenceIds;
  },
};
