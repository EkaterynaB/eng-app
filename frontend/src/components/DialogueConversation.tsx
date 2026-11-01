import { Dialogue } from "../types/dialogue";

interface DialogueConversationProps {
  dialogue: Dialogue;
  activeIndex: number | null;
  onPlayLine: (index: number) => void;
}

export function DialogueConversation({ dialogue, activeIndex, onPlayLine }: DialogueConversationProps) {
  const firstCharacterId = dialogue.characters[0]?.id;

  return (
    <ul className="dialogue-conversation" aria-label={`${dialogue.title} transcript`}>
      {dialogue.lines.map((line, index) => {
        const character = dialogue.characters.find((c) => c.id === line.speakerId);
        const side = line.speakerId === firstCharacterId ? "a" : "b";
        const isActive = activeIndex === index;

        return (
          <li
            key={index}
            className={`dialogue-bubble-row dialogue-bubble-row-${side} ${isActive ? "dialogue-bubble-row-active" : ""}`}
          >
            <div className="dialogue-bubble">
              <p className="dialogue-bubble-speaker">{character?.name ?? line.speakerId}</p>
              <p className="dialogue-bubble-text">{line.text}</p>
              {line.translation && <p className="dialogue-bubble-translation">{line.translation}</p>}
              <button
                type="button"
                className="dialogue-bubble-play"
                onClick={() => onPlayLine(index)}
                aria-label={`Listen to ${character?.name ?? "this"} line: ${line.text}`}
              >
                ▶
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
