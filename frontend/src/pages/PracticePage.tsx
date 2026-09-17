import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { sentencesApi } from "../api/sentences";
import { ApiError } from "../api/client";
import { DiffView } from "../components/DiffView";
import { EmptyState } from "../components/EmptyState";
import { ProgressBar } from "../components/ProgressBar";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { Sentence } from "../types/sentence";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?;:]/g, "");
}

type CheckResult = "correct" | "incorrect" | null;

export function PracticePage() {
  const [sentences, setSentences] = useState<Sentence[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<CheckResult>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isSupported: ttsSupported, speak } = useSpeechSynthesis();

  useEffect(() => {
    sentencesApi
      .getForPractice()
      .then(setSentences)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load practice session"));
  }, []);

  const currentSentence = sentences?.[currentIndex] ?? null;

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const isCorrect = useMemo(() => {
    if (!currentSentence) return false;
    return normalize(answer) === normalize(currentSentence.englishText);
  }, [answer, currentSentence]);

  const handleCheck = () => {
    if (!currentSentence || !answer.trim()) return;
    setResult(isCorrect ? "correct" : "incorrect");
    if (isCorrect) {
      setCompletedCount((c) => c + 1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    if (result === "correct") {
      handleNext();
    } else {
      handleCheck();
    }
  };

  const handleNext = () => {
    if (!sentences) return;
    setResult(null);
    setAnswer("");
    setCurrentIndex((i) => i + 1);
  };

  const handleTryAgain = () => {
    setResult(null);
  };

  if (error) {
    return (
      <div className="page">
        <p className="form-error">{error}</p>
        <Link to="/">Back to sentences</Link>
      </div>
    );
  }

  if (sentences === null) {
    return (
      <div className="page">
        <p>Loading practice session...</p>
      </div>
    );
  }

  if (sentences.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="Nothing to practice yet"
          description="Add some sentences first, then come back here to practice them."
          action={
            <Link className="btn-primary" to="/">
              Add sentences
            </Link>
          }
        />
      </div>
    );
  }

  if (currentIndex >= sentences.length) {
    return (
      <div className="page">
        <EmptyState
          title="Session complete!"
          description={`You practiced ${sentences.length} sentence${sentences.length === 1 ? "" : "s"}. Nice work.`}
          action={
            <div className="form-actions">
              <Link className="btn-primary" to="/practice" onClick={() => window.location.reload()}>
                Practice again
              </Link>
              <Link className="btn-secondary" to="/">
                Back to sentences
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Practice</h1>
        <Link className="btn-secondary" to="/">
          Exit
        </Link>
      </header>

      <ProgressBar current={completedCount} total={sentences.length} />

      <div className="practice-card">
        <p className="practice-label">Translate to English:</p>
        <p className="practice-translation">{currentSentence?.translation}</p>

        <input
          ref={inputRef}
          className="practice-input"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type the English sentence..."
          autoComplete="off"
          disabled={result === "correct"}
        />

        <div className="practice-actions">
          {result === "correct" ? (
            <button className="btn-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button className="btn-primary" onClick={handleCheck} disabled={!answer.trim()}>
              Check
            </button>
          )}
          {ttsSupported && currentSentence && (
            <button
              className="btn-secondary"
              type="button"
              onClick={() => speak(currentSentence.englishText)}
              aria-label="Hear the correct English sentence"
            >
              Hear it
            </button>
          )}
        </div>

        {result === "correct" && (
          <div className="practice-feedback practice-feedback-correct">
            <p>Correct!</p>
          </div>
        )}

        {result === "incorrect" && currentSentence && (
          <div className="practice-feedback practice-feedback-incorrect">
            <p>Not quite. Here's the difference:</p>
            <DiffView expected={currentSentence.englishText} actual={answer} />
            <button className="btn-secondary" onClick={handleTryAgain}>
              Try again
            </button>
          </div>
        )}

        {currentSentence?.notes && <p className="practice-notes">Note: {currentSentence.notes}</p>}
      </div>
    </div>
  );
}
