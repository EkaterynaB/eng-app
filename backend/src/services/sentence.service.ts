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
      // Get sentences from specific practice list, in the list's own order
      const list = await PracticeList.findById(listId);
      if (!list) {
        throw new NotFoundError("Practice list not found");
      }

      if (list.sentenceIds.length === 0) {
        return [];
      }

      // Update last practiced date
      list.lastPracticedAt = new Date();
      await list.save();

      const orderedIds = limit ? list.sentenceIds.slice(0, limit) : list.sentenceIds;
      const sentences = await Sentence.find({ _id: { $in: orderedIds } });
      const sentenceById = new Map(sentences.map((sentence) => [sentence._id.toString(), sentence]));
      return orderedIds.map((id) => sentenceById.get(id.toString())).filter((s): s is NonNullable<typeof s> => !!s);
    }

    // Get all sentences in creation order
    const query = Sentence.find().sort({ createdAt: 1 });
    if (limit) {
      query.limit(limit);
    }
    return query;
  },
};
