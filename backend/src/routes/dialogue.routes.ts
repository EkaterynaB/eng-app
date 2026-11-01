import { Router } from "express";
import { dialogueController } from "../controllers/dialogue.controller";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createDialogueSchema, recordProgressSchema, updateDialogueSchema } from "../validation/dialogue.schema";

export const dialogueRouter = Router();

dialogueRouter.get("/", asyncHandler(dialogueController.getAll));
dialogueRouter.post("/", validateBody(createDialogueSchema), asyncHandler(dialogueController.create));
dialogueRouter.get("/:id", asyncHandler(dialogueController.getById));
dialogueRouter.put("/:id", validateBody(updateDialogueSchema), asyncHandler(dialogueController.update));
dialogueRouter.delete("/:id", asyncHandler(dialogueController.remove));
dialogueRouter.get("/:id/progress", asyncHandler(dialogueController.getProgress));
dialogueRouter.patch(
  "/:id/progress",
  validateBody(recordProgressSchema),
  asyncHandler(dialogueController.recordProgress)
);
