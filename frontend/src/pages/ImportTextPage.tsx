import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { practiceListsApi } from "../api/practiceLists";
import { sentencesApi } from "../api/sentences";
import { splitSentences } from "../utils/splitSentences";

interface ReviewRow {
  englishText: string;
  translation: string;
}

type Step = "paste" | "review";

export function ImportTextPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("paste");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rawText, setRawText] = useState("");
  const [translationText, setTranslationText] = useState("");
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [countMismatch, setCountMismatch] = useState<{ english: number; translation: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSplit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("List name is required.");
      return;
    }

    const englishSentences = splitSentences(rawText);
    if (englishSentences.length === 0) {
      setError("Couldn't find any sentences in that text.");
      return;
    }

    const translationSentences = translationText.trim() ? splitSentences(translationText) : [];

    setRows(
      englishSentences.map((englishText, index) => ({
        englishText,
        translation: translationSentences[index] ?? "",
      }))
    );
    setCountMismatch(
      translationSentences.length > 0 && translationSentences.length !== englishSentences.length
        ? { english: englishSentences.length, translation: translationSentences.length }
        : null
    );
    setError(null);
    setStep("review");
  };

  const updateRow = (index: number, patch: Partial<ReviewRow>) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (rows.length === 0) {
      setError("Add at least one sentence, or go back and paste some text.");
      return;
    }
    if (rows.some((row) => !row.englishText.trim() || !row.translation.trim())) {
      setError("Every sentence needs both English text and a translation before you can create the list.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const list = await practiceListsApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        preserveOrder: true,
      });

      for (const row of rows) {
        await sentencesApi.create({
          englishText: row.englishText.trim(),
          translation: row.translation.trim(),
          practiceListId: list._id,
        });
      }

      navigate(`/lists/${list._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while creating the list.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "paste") {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1>Import from text</h1>
            <p className="page-subtitle">Paste English text and we'll split it into sentences to practice.</p>
          </div>
        </header>

        <form className="sentence-form" onSubmit={handleSplit}>
          <div className="form-field">
            <label htmlFor="import-name">List name</label>
            <input
              id="import-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chapter 1"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="import-description">Description (optional)</label>
            <textarea
              id="import-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-field">
            <label htmlFor="import-text">English text</label>
            <textarea
              id="import-text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste a paragraph or article in English..."
              rows={10}
            />
          </div>

          <div className="form-field">
            <label htmlFor="import-translation">Translation text (optional)</label>
            <textarea
              id="import-translation"
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              placeholder="Paste the matching translation, sentence by sentence, and we'll pair them up..."
              rows={10}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit">Split into sentences</button>
            <Link className="btn-secondary" to="/">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Review sentences</h1>
          <p className="page-subtitle">
            Add the translation for each sentence. Edit or remove any that split incorrectly.
          </p>
        </div>
      </header>

      {countMismatch && (
        <p className="form-warning">
          ⚠️ The English text split into {countMismatch.english} sentences, but the translation split into{" "}
          {countMismatch.translation}. They were paired up by order — double-check the pairing below, especially
          near the end.
        </p>
      )}

      <div className="import-sentence-list">
        {rows.map((row, index) => (
          <div className="import-sentence-row" key={index}>
            <input
              aria-label={`English sentence ${index + 1}`}
              value={row.englishText}
              onChange={(e) => updateRow(index, { englishText: e.target.value })}
              placeholder="English sentence"
              autoComplete="off"
            />
            <input
              aria-label={`Translation for sentence ${index + 1}`}
              value={row.translation}
              onChange={(e) => updateRow(index, { translation: e.target.value })}
              placeholder="Translation"
              autoComplete="off"
            />
            <button
              type="button"
              className="btn-danger"
              onClick={() => removeRow(index)}
              aria-label={`Delete sentence ${index + 1}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {rows.length === 0 && <p className="page-subtitle">No sentences left. Go back and paste some text.</p>}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-primary" onClick={handleCreate} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : `Create list (${rows.length} sentences)`}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setStep("paste")} disabled={isSubmitting}>
          Back
        </button>
      </div>
    </div>
  );
}
