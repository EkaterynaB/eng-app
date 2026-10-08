import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { sentencesApi } from "../api/sentences";
import { practiceListsApi } from "../api/practiceLists";
import { ApiError } from "../api/client";
import { DiffView } from "../components/DiffView";
import { EmptyState } from "../components/EmptyState";
import { ProgressBar } from "../components/ProgressBar";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { Sentence } from "../types/sentence";
import { PracticeList } from "../types/practiceList";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,!?;:]/g, "");
}

type CheckResult = "correct" | "incorrect" | null;

export function PracticePage() {
  const [searchParams] = useSearchParams();
  const listId = searchParams.get("listId") || undefined;
  const [sentences, setSentences] = useState<Sentence[] | null>(null);
  const [listInfo, setListInfo] = useState<PracticeList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<CheckResult>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [mistakeCounts, setMistakeCounts] = useState<Map<string, number>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);
  const { isSupported: ttsSupported, speak } = useSpeechSynthesis();

  useEffect(() => {
    const loadPracticeSession = async () => {
      try {
        if (listId) {
          const [list, sents] = await Promise.all([
            practiceListsApi.getById(listId),
            sentencesApi.getForPractice(undefined, listId),
          ]);
          setListInfo(list);
          setSentences(sents);
        } else {
          const sents = await sentencesApi.getForPractice();
          setSentences(sents);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load practice session");
      }
    };

    loadPracticeSession();
  }, [listId]);

  const currentSentence = sentences?.[currentIndex] ?? null;

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const isCorrect = useMemo(() => {
    if (!currentSentence) return false;
    return normalize(answer) === normalize(currentSentence.englishText);
  }, [answer, currentSentence]);

  const handleNext = useCallback(() => {
    if (!sentences) return;
    setResult(null);
    setAnswer("");
    setCurrentIndex((i) => i + 1);
  }, [sentences]);

  const handleCheck = useCallback(() => {
    if (!currentSentence || !answer.trim() || !sentences) return;
    setResult(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
      setCompletedCount((c) => c + 1);

      // Check if the user made 2 or more mistakes on this sentence
      const currentMistakes = mistakeCounts.get(currentSentence._id) || 0;
      if (currentMistakes >= 2) {
        // Duplicate the sentence and add it to the end for more practice
        const newSentences = [...sentences];
        newSentences.push(currentSentence);
        setSentences(newSentences);

        // Reset mistake count for this sentence
        const newMistakeCounts = new Map(mistakeCounts);
        newMistakeCounts.delete(currentSentence._id);
        setMistakeCounts(newMistakeCounts);
      }
    } else {
      // Increment mistake count for the current sentence
      const currentMistakes = mistakeCounts.get(currentSentence._id) || 0;
      setMistakeCounts(new Map(mistakeCounts).set(currentSentence._id, currentMistakes + 1));
    }
  }, [currentSentence, answer, sentences, isCorrect, mistakeCounts]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") return;

      // When result is correct, allow Enter from anywhere to proceed
      if (result === "correct") {
        handleNext();
        return;
      }

      // For checking answers, only handle if we're in the practice input
      const target = event.target as HTMLElement;
      const isPracticeInput = target === inputRef.current;
      if (!isPracticeInput) {
        return;
      }

      if (!answer.trim()) {
        // Do nothing if answer is empty
        return;
      }

      handleCheck();
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [result, answer, handleNext, handleCheck]);

  const handleTryAgain = () => {
    setResult(null);
    setAnswer("");
  };

  if (error) {
    return (
      <div className="page">
        <p className="form-error">{error}</p>
        <Link to="/">Back to lists</Link>
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
          description="Create a practice list and add some sentences first, then come back here to practice them."
          action={
            <Link className="btn-primary" to="/">
              Go to practice lists
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
                Back to lists
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
        <div>
          <h1>Practice{listInfo ? `: ${listInfo.name}` : ""}</h1>
          {listInfo && listInfo.description && (
            <p className="page-subtitle">{listInfo.description}</p>
          )}
        </div>
        <Link className="btn-secondary" to={listId ? `/lists/${listId}` : "/"}>
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
          onChange={(e) => {
            setAnswer(e.target.value);
            if (result === "incorrect") {
              setResult(null);
            }
          }}
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
