import { Request, Response } from "express";
import { practiceListService } from "../services/practiceList.service";

export const practiceListController = {
  async create(req: Request, res: Response) {
    const list = await practiceListService.create(req.body);
    res.status(201).json(list);
  },

  async getAll(_req: Request, res: Response) {
    const lists = await practiceListService.findAll();
    res.json(lists);
  },

  async getById(req: Request, res: Response) {
    const list = await practiceListService.findById(req.params.id);
    res.json(list);
  },

  async update(req: Request, res: Response) {
    const list = await practiceListService.update(req.params.id, req.body);
    res.json(list);
  },

  async remove(req: Request, res: Response) {
    await practiceListService.remove(req.params.id);
    res.status(204).send();
  },

  async addSentence(req: Request, res: Response) {
    const list = await practiceListService.addSentence(req.params.id, req.body.sentenceId);
    res.json(list);
  },

  async removeSentence(req: Request, res: Response) {
    const list = await practiceListService.removeSentence(req.params.id, req.params.sentenceId);
    res.json(list);
  },

  async getSentences(req: Request, res: Response) {
    const sentences = await practiceListService.getSentences(req.params.id);
    res.json(sentences);
  },
};
