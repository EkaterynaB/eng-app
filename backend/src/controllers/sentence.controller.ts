import { Request, Response } from "express";
import { sentenceService } from "../services/sentence.service";

export const sentenceController = {
  async create(req: Request, res: Response) {
    const sentence = await sentenceService.create(req.body);
    res.status(201).json(sentence);
  },

  async getAll(_req: Request, res: Response) {
    const sentences = await sentenceService.findAll();
    res.json(sentences);
  },

  async getForPractice(req: Request, res: Response) {
    const { limit, listId } = (req.parsedQuery ?? {}) as { limit?: number; listId?: string };
    const sentences = await sentenceService.findForPractice(limit, listId);
    res.json(sentences);
  },

  async update(req: Request, res: Response) {
    const sentence = await sentenceService.update(req.params.id, req.body);
    res.json(sentence);
  },

  async remove(req: Request, res: Response) {
    await sentenceService.remove(req.params.id);
    res.status(204).send();
  },
};
