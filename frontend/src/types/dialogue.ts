export type DialogueLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const DIALOGUE_LEVELS: DialogueLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface DialogueCharacter {
  id: string;
  name: string;
}

export interface DialogueLine {
  speakerId: string;
  text: string;
  translation?: string;
}

export interface Dialogue {
  _id: string;
  title: string;
  description?: string;
  level?: DialogueLevel;
  characters: DialogueCharacter[];
  lines: DialogueLine[];
  createdAt: string;
  updatedAt: string;
}

export interface DialogueInput {
  title: string;
  description?: string;
  level?: DialogueLevel;
  characters: DialogueCharacter[];
  lines: DialogueLine[];
}

export type DialogueStage = "roleA" | "roleB" | "memory";

export interface DialogueProgress {
  dialogueId: string;
  practicedRoles: string[];
  completedStages: DialogueStage[];
  sessionsCompleted: number;
  lastPracticedAt: string | null;
}
