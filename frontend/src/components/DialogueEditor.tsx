import { FormEvent, useEffect, useState } from "react";
import { Dialogue, DialogueInput, DialogueLevel, DIALOGUE_LEVELS } from "../types/dialogue";

interface EditorLine {
  speakerId: "a" | "b";
  text: string;
  translation: string;
}

interface EditorState {
  title: string;
  description: string;
  level: DialogueLevel | "";
  characterNameA: string;
  characterNameB: string;
  lines: EditorLine[];
}

const emptyState: EditorState = {
  title: "",
  description: "",
  level: "",
  characterNameA: "",
  characterNameB: "",
  lines: [],
};

function toEditorState(dialogue: Dialogue): EditorState {
  const [first, second] = dialogue.characters;
  return {
    title: dialogue.title,
    description: dialogue.description ?? "",
    level: dialogue.level ?? "",
    characterNameA: first?.name ?? "",
    characterNameB: second?.name ?? "",
    lines: dialogue.lines.map((line) => ({
      speakerId: line.speakerId === first?.id ? "a" : "b",
      text: line.text,
      translation: line.translation ?? "",
    })),
  };
}

interface DialogueEditorProps {
  initialValue?: Dialogue | null;
  onSubmit: (input: DialogueInput) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}

export function DialogueEditor({ initialValue, onSubmit, onCancel, submitLabel }: DialogueEditorProps) {
  const [form, setForm] = useState<EditorState>(initialValue ? toEditorState(initialValue) : emptyState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialValue ? toEditorState(initialValue) : emptyState);
  }, [initialValue]);

  const addLine = () => {
    const lastSpeaker = form.lines[form.lines.length - 1]?.speakerId;
    const nextSpeaker: "a" | "b" = lastSpeaker === "a" ? "b" : "a";
    setForm((f) => ({ ...f, lines: [...f.lines, { speakerId: nextSpeaker, text: "", translation: "" }] }));
  };

  const updateLine = (index: number, patch: Partial<EditorLine>) => {
    setForm((f) => ({
      ...f,
      lines: f.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)),
    }));
  };

  const removeLine = (index: number) => {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== index) }));
  };

  const moveLine = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.lines.length) return;
    setForm((f) => {
      const lines = [...f.lines];
      [lines[index], lines[target]] = [lines[target], lines[index]];
      return { ...f, lines };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.characterNameA.trim() || !form.characterNameB.trim()) {
      setError("Both character names are required.");
      return;
    }
    if (form.lines.length === 0) {
      setError("Add at least one dialogue line.");
      return;
    }
    if (form.lines.some((line) => !line.text.trim())) {
      setError("Every line needs text.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const input: DialogueInput = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        level: form.level || undefined,
        characters: [
          { id: "a", name: form.characterNameA.trim() },
          { id: "b", name: form.characterNameB.trim() },
        ],
        lines: form.lines.map((line) => ({
          speakerId: line.speakerId,
          text: line.text.trim(),
          translation: line.translation.trim() || undefined,
        })),
      };
      await onSubmit(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="sentence-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="dialogue-title">Title</label>
        <input
          id="dialogue-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Ordering Coffee"
          autoComplete="off"
        />
      </div>

      <div className="form-field">
        <label htmlFor="dialogue-description">Description (optional)</label>
        <textarea
          id="dialogue-description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What is this conversation about?"
          rows={2}
        />
      </div>

      <div className="form-field">
        <label htmlFor="dialogue-level">English level (optional)</label>
        <select
          id="dialogue-level"
          value={form.level}
          onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as DialogueLevel | "" }))}
        >
          <option value="">-- None --</option>
          {DIALOGUE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="dialogue-characters-row">
        <div className="form-field">
          <label htmlFor="character-a">Character A</label>
          <input
            id="character-a"
            value={form.characterNameA}
            onChange={(e) => setForm((f) => ({ ...f, characterNameA: e.target.value }))}
            placeholder="e.g. Customer"
            autoComplete="off"
          />
        </div>
        <div className="form-field">
          <label htmlFor="character-b">Character B</label>
          <input
            id="character-b"
            value={form.characterNameB}
            onChange={(e) => setForm((f) => ({ ...f, characterNameB: e.target.value }))}
            placeholder="e.g. Barista"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="form-field">
        <label>Dialogue lines, in order</label>
        <div className="dialogue-line-editor-list">
          {form.lines.map((line, index) => (
            <div className="dialogue-line-editor-row" key={index}>
              <select
                aria-label={`Speaker for line ${index + 1}`}
                value={line.speakerId}
                onChange={(e) => updateLine(index, { speakerId: e.target.value as "a" | "b" })}
              >
                <option value="a">{form.characterNameA.trim() || "Character A"}</option>
                <option value="b">{form.characterNameB.trim() || "Character B"}</option>
              </select>
              <input
                aria-label={`Line ${index + 1} text`}
                value={line.text}
                onChange={(e) => updateLine(index, { text: e.target.value })}
                placeholder="English line"
                autoComplete="off"
              />
              <input
                aria-label={`Line ${index + 1} translation`}
                value={line.translation}
                onChange={(e) => updateLine(index, { translation: e.target.value })}
                placeholder="Translation (optional)"
                autoComplete="off"
              />
              <div className="dialogue-line-editor-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => moveLine(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move line ${index + 1} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => moveLine(index, 1)}
                  disabled={index === form.lines.length - 1}
                  aria-label={`Move line ${index + 1} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => removeLine(index)}
                  aria-label={`Delete line ${index + 1}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn-secondary" onClick={addLine}>
          Add line
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
