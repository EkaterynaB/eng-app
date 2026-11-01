import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { useDialogues } from "../hooks/useDialogues";

export function DialoguesPage() {
  const { dialogues, isLoading, error, deleteDialogue } = useDialogues();

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      try {
        await deleteDialogue(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete dialogue");
      }
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Dialogue Practice</h1>
          <p className="page-subtitle">Learn real-life conversations by playing both roles.</p>
        </div>
        <Link className="btn-primary" to="/dialogues/new">
          Create new dialogue
        </Link>
      </header>

      {error && <p className="form-error">{error}</p>}

      {isLoading ? (
        <p>Loading dialogues...</p>
      ) : dialogues.length === 0 ? (
        <EmptyState
          title="No dialogues yet"
          description="Create a dialogue to start practicing real-life conversations."
        />
      ) : (
        <ul className="practice-list-grid">
          {dialogues.map((dialogue) => (
            <li key={dialogue._id} className="practice-list-card">
              <div className="practice-list-card-header">
                <h3>{dialogue.title}</h3>
                {dialogue.level && <span className="dialogue-level-badge">{dialogue.level}</span>}
              </div>
              {dialogue.description && <p className="practice-list-description">{dialogue.description}</p>}
              <p className="practice-list-count">
                {dialogue.characters.map((c) => c.name).join(" & ")} · {dialogue.lines.length} lines
              </p>
              <div className="practice-list-actions">
                <Link className="btn-primary" to={`/dialogues/${dialogue._id}`}>
                  Open
                </Link>
                <Link className="btn-secondary" to={`/dialogues/${dialogue._id}/edit`}>
                  Edit
                </Link>
                <button className="btn-danger" onClick={() => handleDelete(dialogue._id, dialogue.title)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
