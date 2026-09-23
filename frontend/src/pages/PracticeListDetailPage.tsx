import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { practiceListsApi } from "../api/practiceLists";
import { sentencesApi } from "../api/sentences";
import { EmptyState } from "../components/EmptyState";
import { SentenceForm } from "../components/SentenceForm";
import { PracticeList } from "../types/practiceList";
import { Sentence, SentenceInput } from "../types/sentence";

export function PracticeListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<PracticeList | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [listData, listSentences] = await Promise.all([
          practiceListsApi.getById(id),
          practiceListsApi.getSentences(id),
        ]);
        setList(listData);
        setSentences(listSentences);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load list");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmitSentence = async (input: SentenceInput) => {
    if (!id) return;

    try {
      if (editingSentence) {
        // Update existing sentence
        const updated = await sentencesApi.update(editingSentence._id, input);
        setSentences((prev) => prev.map((s) => (s._id === editingSentence._id ? updated : s)));
        setEditingSentence(null);
      } else {
        // Create new sentence with list association
        const created = await sentencesApi.create({ ...input, practiceListId: id });
        setSentences((prev) => [created, ...prev]);

        // Update list's sentenceIds count
        setList((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sentenceIds: [...prev.sentenceIds, created._id],
          };
        });
      }
    } catch (err) {
      throw err; // Let SentenceForm handle the error
    }
  };

  const handleDeleteSentence = async (sentence: Sentence) => {
    if (!id) return;
    if (!window.confirm(`Delete "${sentence.englishText}"?`)) return;

    try {
      await practiceListsApi.removeSentence(id, sentence._id);
      setSentences((prev) => prev.filter((s) => s._id !== sentence._id));
      setList((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sentenceIds: prev.sentenceIds.filter((sid) => sid !== sentence._id),
        };
      });

      if (editingSentence?._id === sentence._id) {
        setEditingSentence(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove sentence");
    }
  };

  if (isLoading) {
    return (
      <div className="page">
        <p>Loading list...</p>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="page">
        <p className="form-error">{error || "List not found"}</p>
        <Link to="/">Back to lists</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>{list.name}</h1>
          {list.description && <p className="page-subtitle">{list.description}</p>}
          <p className="page-subtitle">{sentences.length} sentences in this list</p>
        </div>
        <div className="form-actions">
          {sentences.length > 0 && (
            <Link className="btn-primary" to={`/practice?listId=${id}`}>
              Practice this list
            </Link>
          )}
          <Link className="btn-secondary" to="/">
            Back to lists
          </Link>
        </div>
      </header>

      <SentenceForm
        initialValue={editingSentence}
        onSubmit={handleSubmitSentence}
        onCancel={() => setEditingSentence(null)}
      />

      {sentences.length === 0 ? (
        <EmptyState
          title="No sentences yet"
          description="Add your first sentence above to start building this practice list."
        />
      ) : (
        <ul className="sentence-list">
          {sentences.map((sentence) => (
            <li key={sentence._id} className="sentence-item">
              <div className="sentence-item-text">
                <p className="sentence-english">{sentence.englishText}</p>
                <p className="sentence-translation">{sentence.translation}</p>
                {sentence.notes && <p className="sentence-notes">{sentence.notes}</p>}
              </div>
              <div className="sentence-item-actions">
                <button className="btn-secondary" onClick={() => setEditingSentence(sentence)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDeleteSentence(sentence)}>
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
