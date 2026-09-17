import { Router } from "express";
import { sentenceController } from "../controllers/sentence.controller";
import { validateBody, validateQuery } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createSentenceSchema,
  practiceQuerySchema,
  updateSentenceSchema,
} from "../validation/sentence.schema";

export const sentenceRouter = Router();

sentenceRouter.get("/practice", validateQuery(practiceQuerySchema), asyncHandler(sentenceController.getForPractice));
sentenceRouter.get("/", asyncHandler(sentenceController.getAll));
sentenceRouter.post("/", validateBody(createSentenceSchema), asyncHandler(sentenceController.create));
sentenceRouter.put("/:id", validateBody(updateSentenceSchema), asyncHandler(sentenceController.update));
sentenceRouter.delete("/:id", asyncHandler(sentenceController.remove));
