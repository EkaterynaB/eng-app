import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { SentenceForm } from "../components/SentenceForm";
import { SentenceList } from "../components/SentenceList";
import { useSentences } from "../hooks/useSentences";
import { Sentence, SentenceInput } from "../types/sentence";

export function SentenceManagementPage() {
  const { sentences, isLoading, error, addSentence, editSentence, deleteSentence } = useSentences();
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);

  const handleSubmit = async (input: SentenceInput) => {
    if (editingSentence) {
      await editSentence(editingSentence._id, input);
      setEditingSentence(null);
    } else {
      await addSentence(input);
    }
  };

  const handleDelete = async (sentence: Sentence) => {
    if (window.confirm(`Delete "${sentence.englishText}"?`)) {
      await deleteSentence(sentence._id);
      if (editingSentence?._id === sentence._id) {
        setEditingSentence(null);
      }
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>My Sentences</h1>
          <p className="page-subtitle">Add sentences you want to learn, then practice them.</p>
        </div>
        {sentences.length > 0 && (
          <Link className="btn-primary" to="/practice">
            Start practicing
          </Link>
        )}
      </header>

      <SentenceForm
        initialValue={editingSentence}
        onSubmit={handleSubmit}
        onCancel={() => setEditingSentence(null)}
      />

      {error && <p className="form-error">{error}</p>}

      {isLoading ? (
        <p>Loading sentences...</p>
      ) : sentences.length === 0 ? (
        <EmptyState
          title="No sentences yet"
          description="Add your first sentence above to start building your practice set."
        />
      ) : (
        <SentenceList sentences={sentences} onEdit={setEditingSentence} onDelete={handleDelete} />
      )}
    </div>
  );
}
