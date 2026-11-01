import { Dialogue } from "../models/Dialogue";
import { DialogueProgress } from "../models/DialogueProgress";
import { NotFoundError } from "../utils/AppError";
import { CreateDialogueInput, RecordProgressInput, UpdateDialogueInput } from "../validation/dialogue.schema";

export const dialogueService = {
  async create(input: CreateDialogueInput) {
    return Dialogue.create(input);
  },

  async findAll() {
    return Dialogue.find().sort({ createdAt: -1 });
  },

  async findById(id: string) {
    const dialogue = await Dialogue.findById(id);
    if (!dialogue) {
      throw new NotFoundError("Dialogue not found");
    }
    return dialogue;
  },

  async update(id: string, input: UpdateDialogueInput) {
    const dialogue = await Dialogue.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });
    if (!dialogue) {
      throw new NotFoundError("Dialogue not found");
    }
    return dialogue;
  },

  async remove(id: string) {
    const dialogue = await Dialogue.findByIdAndDelete(id);
    if (!dialogue) {
      throw new NotFoundError("Dialogue not found");
    }
    await DialogueProgress.deleteOne({ dialogueId: id });
  },

  async getProgress(dialogueId: string) {
    const dialogue = await Dialogue.findById(dialogueId);
    if (!dialogue) {
      throw new NotFoundError("Dialogue not found");
    }
    const progress = await DialogueProgress.findOne({ dialogueId });
    return (
      progress ?? {
        dialogueId,
        practicedRoles: [],
        completedStages: [],
        sessionsCompleted: 0,
        lastPracticedAt: null,
      }
    );
  },

  async recordProgress(dialogueId: string, input: RecordProgressInput) {
    const dialogue = await Dialogue.findById(dialogueId);
    if (!dialogue) {
      throw new NotFoundError("Dialogue not found");
    }

    const progress = await DialogueProgress.findOneAndUpdate(
      { dialogueId },
      {
        $addToSet: { practicedRoles: input.role, completedStages: input.stage },
        $inc: { sessionsCompleted: 1 },
        $set: { lastPracticedAt: new Date() },
      },
      { new: true, upsert: true }
    );
    return progress;
  },
};
