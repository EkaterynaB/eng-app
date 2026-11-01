import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { dialoguesApi } from "../api/dialogues";
import { Dialogue, DialogueProgress } from "../types/dialogue";

function formatDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function DialogueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [progress, setProgress] = useState<DialogueProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([dialoguesApi.getById(id), dialoguesApi.getProgress(id)])
      .then(([dialogueData, progressData]) => {
        setDialogue(dialogueData);
        setProgress(progressData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dialogue"))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="page">
        <p>Loading dialogue...</p>
      </div>
    );
  }

  if (error || !dialogue) {
    return (
      <div className="page">
        <p className="form-error">{error || "Dialogue not found"}</p>
        <Link to="/dialogues">Back to dialogues</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{dialogue.title}</h1>
          {dialogue.level && <span className="dialogue-level-badge">{dialogue.level}</span>}
          {dialogue.description && <p className="page-subtitle">{dialogue.description}</p>}
        </div>
        <div className="form-actions">
          <Link className="btn-primary" to={`/dialogues/${dialogue._id}/practice`}>
            Start practicing
          </Link>
          <Link className="btn-secondary" to={`/dialogues/${dialogue._id}/edit`}>
            Edit
          </Link>
          <Link className="btn-secondary" to="/dialogues">
            Back to dialogues
          </Link>
        </div>
      </header>

      <div className="practice-card">
        <p className="practice-label">Characters</p>
        <p>{dialogue.characters.map((c) => c.name).join(" & ")}</p>
        <p className="practice-label">Lines</p>
        <p>{dialogue.lines.length}</p>
      </div>

      {progress && (
        <div className="practice-card">
          <p className="practice-label">Your progress</p>
          <ul className="dialogue-progress-list">
            <li>Practice sessions completed: {progress.sessionsCompleted}</li>
            <li>Last practiced: {formatDate(progress.lastPracticedAt)}</li>
            <li>
              Roles practiced:{" "}
              {progress.practicedRoles.length === 0
                ? "none yet"
                : dialogue.characters
                    .filter((c) => progress.practicedRoles.includes(c.id))
                    .map((c) => c.name)
                    .join(", ")}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
