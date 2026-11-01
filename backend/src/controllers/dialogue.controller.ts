import { Request, Response } from "express";
import { dialogueService } from "../services/dialogue.service";

export const dialogueController = {
  async create(req: Request, res: Response) {
    const dialogue = await dialogueService.create(req.body);
    res.status(201).json(dialogue);
  },

  async getAll(_req: Request, res: Response) {
    const dialogues = await dialogueService.findAll();
    res.json(dialogues);
  },

  async getById(req: Request, res: Response) {
    const dialogue = await dialogueService.findById(req.params.id);
    res.json(dialogue);
  },

  async update(req: Request, res: Response) {
    const dialogue = await dialogueService.update(req.params.id, req.body);
    res.json(dialogue);
  },

  async remove(req: Request, res: Response) {
    await dialogueService.remove(req.params.id);
    res.status(204).send();
  },

  async getProgress(req: Request, res: Response) {
    const progress = await dialogueService.getProgress(req.params.id);
    res.json(progress);
  },

  async recordProgress(req: Request, res: Response) {
    const progress = await dialogueService.recordProgress(req.params.id, req.body);
    res.json(progress);
  },
};
