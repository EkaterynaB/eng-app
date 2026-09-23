import { Router } from "express";
import { practiceListController } from "../controllers/practiceList.controller";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  addSentenceSchema,
  createPracticeListSchema,
  updatePracticeListSchema,
} from "../validation/practiceList.schema";

export const practiceListRouter = Router();

practiceListRouter.get("/", asyncHandler(practiceListController.getAll));
practiceListRouter.post("/", validateBody(createPracticeListSchema), asyncHandler(practiceListController.create));
practiceListRouter.get("/:id", asyncHandler(practiceListController.getById));
practiceListRouter.put("/:id", validateBody(updatePracticeListSchema), asyncHandler(practiceListController.update));
practiceListRouter.delete("/:id", asyncHandler(practiceListController.remove));
practiceListRouter.post("/:id/sentences", validateBody(addSentenceSchema), asyncHandler(practiceListController.addSentence));
practiceListRouter.delete("/:id/sentences/:sentenceId", asyncHandler(practiceListController.removeSentence));
practiceListRouter.get("/:id/sentences", asyncHandler(practiceListController.getSentences));
