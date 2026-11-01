import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { dialoguesApi } from "../api/dialogues";
import { DialogueEditor } from "../components/DialogueEditor";
import { Dialogue, DialogueInput } from "../types/dialogue";

export function DialogueEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    dialoguesApi
      .getById(id)
      .then(setDialogue)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dialogue"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (input: DialogueInput) => {
    if (!id) return;
    await dialoguesApi.update(id, input);
    navigate(`/dialogues/${id}`);
  };

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
        <h1>Edit dialogue</h1>
      </header>
      <DialogueEditor
        initialValue={dialogue}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/dialogues/${id}`)}
        submitLabel="Save changes"
      />
    </div>
  );
}
