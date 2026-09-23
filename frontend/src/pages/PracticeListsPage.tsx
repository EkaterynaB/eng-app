import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { usePracticeLists } from "../hooks/usePracticeLists";
import { PracticeListInput } from "../types/practiceList";

export function PracticeListsPage() {
  const { lists, isLoading, error, createList, updateList, deleteList } = usePracticeLists();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PracticeListInput>({ name: "", description: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("List name is required");
      return;
    }

    try {
      setFormError(null);
      if (editingId) {
        await updateList(editingId, {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        });
        setEditingId(null);
      } else {
        await createList({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
        });
      }
      setFormData({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleEdit = (list: { _id: string; name: string; description?: string }) => {
    setEditingId(list._id);
    setFormData({ name: list.name, description: list.description || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This will not delete the sentences, only the list.`)) {
      try {
        await deleteList(id);
        if (editingId === id) {
          setEditingId(null);
          setShowForm(false);
          setFormData({ name: "", description: "" });
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete list");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({ name: "", description: "" });
    setFormError(null);
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Practice Lists</h1>
          <p className="page-subtitle">Organize sentences into themed practice lists.</p>
        </div>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create new list
          </button>
        )}
      </header>

      {showForm && (
        <form className="sentence-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">List name</label>
            <input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Daily Conversations"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              placeholder="What kind of sentences are in this list?"
              rows={2}
            />
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <div className="form-actions">
            <button type="submit">{editingId ? "Save changes" : "Create list"}</button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="form-error">{error}</p>}

      {isLoading ? (
        <p>Loading practice lists...</p>
      ) : lists.length === 0 ? (
        <EmptyState
          title="No practice lists yet"
          description="Create a list to organize your sentences by theme, topic, or difficulty."
        />
      ) : (
        <ul className="practice-list-grid">
          {lists.map((list) => (
            <li key={list._id} className="practice-list-card">
              <div className="practice-list-card-header">
                <h3>{list.name}</h3>
                <span className="practice-list-count">{list.sentenceIds.length} sentences</span>
              </div>
              {list.description && <p className="practice-list-description">{list.description}</p>}
              <div className="practice-list-actions">
                <Link className="btn-primary" to={`/lists/${list._id}`}>
                  Open
                </Link>
                <button className="btn-secondary" onClick={() => handleEdit(list)}>
                  Rename
                </button>
                <button className="btn-danger" onClick={() => handleDelete(list._id, list.name)}>
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
