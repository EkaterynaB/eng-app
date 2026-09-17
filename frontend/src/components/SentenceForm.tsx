import { FormEvent, useEffect, useState } from "react";
import { Sentence, SentenceInput } from "../types/sentence";

interface SentenceFormProps {
  initialValue?: Sentence | null;
  onSubmit: (input: SentenceInput) => Promise<void>;
  onCancel?: () => void;
}

const emptyForm: SentenceInput = { englishText: "", translation: "", notes: "" };

export function SentenceForm({ initialValue, onSubmit, onCancel }: SentenceFormProps) {
  const [form, setForm] = useState<SentenceInput>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValue) {
      setForm({
        englishText: initialValue.englishText,
        translation: initialValue.translation,
        notes: initialValue.notes ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialValue]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.englishText.trim() || !form.translation.trim()) {
      setError("English sentence and translation are required.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        englishText: form.englishText.trim(),
        translation: form.translation.trim(),
        notes: form.notes?.trim() || undefined,
      });
      if (!initialValue) {
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="sentence-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="englishText">English sentence</label>
        <input
          id="englishText"
          value={form.englishText}
          onChange={(e) => setForm((f) => ({ ...f, englishText: e.target.value }))}
          placeholder="e.g. I would like a cup of coffee."
          autoComplete="off"
        />
      </div>

      <div className="form-field">
        <label htmlFor="translation">Translation</label>
        <input
          id="translation"
          value={form.translation}
          onChange={(e) => setForm((f) => ({ ...f, translation: e.target.value }))}
          placeholder="e.g. Я б хотів(ла) чашку кави."
          autoComplete="off"
        />
      </div>

      <div className="form-field">
        <label htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          placeholder="Any extra context, grammar notes, etc."
          rows={2}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {initialValue ? "Save changes" : "Add sentence"}
        </button>
        {initialValue && onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
