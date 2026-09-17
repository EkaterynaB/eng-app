import { Sentence } from "../types/sentence";

interface SentenceListProps {
  sentences: Sentence[];
  onEdit: (sentence: Sentence) => void;
  onDelete: (sentence: Sentence) => void;
}

export function SentenceList({ sentences, onEdit, onDelete }: SentenceListProps) {
  return (
    <ul className="sentence-list">
      {sentences.map((sentence) => (
        <li key={sentence._id} className="sentence-item">
          <div className="sentence-item-text">
            <p className="sentence-english">{sentence.englishText}</p>
            <p className="sentence-translation">{sentence.translation}</p>
            {sentence.notes && <p className="sentence-notes">{sentence.notes}</p>}
          </div>
          <div className="sentence-item-actions">
            <button className="btn-secondary" onClick={() => onEdit(sentence)}>
              Edit
            </button>
            <button className="btn-danger" onClick={() => onDelete(sentence)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
