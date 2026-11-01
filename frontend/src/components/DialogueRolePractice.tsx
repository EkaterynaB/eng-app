import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "./ProgressBar";
import { Dialogue } from "../types/dialogue";
import { useDialogueSpeech } from "../hooks/useDialogueSpeech";

interface DialogueRolePracticeProps {
  dialogue: Dialogue;
  userCharacterId: string;
  mode: "role" | "memory";
  speech: ReturnType<typeof useDialogueSpeech>;
  voiceForCharacter: (characterId: string) => SpeechSynthesisVoice | undefined;
  onComplete: () => void;
}

export function DialogueRolePractice({
  dialogue,
  userCharacterId,
  mode,
  speech,
  voiceForCharacter,
  onComplete,
}: DialogueRolePracticeProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(mode !== "memory");
  const [restartKey, setRestartKey] = useState(0);
  const turnTokenRef = useRef(0);

  const userCharacter = dialogue.characters.find((c) => c.id === userCharacterId);
  const partnerCharacter = dialogue.characters.find((c) => c.id !== userCharacterId);
  const currentLine = dialogue.lines[index];
  const isUserTurn = currentLine.speakerId === userCharacterId;
  const speakerCharacter = isUserTurn ? userCharacter : partnerCharacter;

  useEffect(() => {
    turnTokenRef.current += 1;
    const token = turnTokenRef.current;
    const line = dialogue.lines[index];

    if (line.speakerId !== userCharacterId) {
      speech.speak(line.text, { voice: voiceForCharacter(line.speakerId) }).then(() => {
        if (turnTokenRef.current !== token) return;
        if (index + 1 >= dialogue.lines.length) {
          onComplete();
        } else {
          setIndex(index + 1);
        }
      });
    } else {
      setRevealed(mode !== "memory");
    }
    // Intentionally only re-run when the step changes; speech/voiceForCharacter/onComplete
    // identities aren't meant to retrigger the current turn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, restartKey]);

  const handleReplay = () => {
    turnTokenRef.current += 1;
    speech.speak(currentLine.text, { voice: voiceForCharacter(currentLine.speakerId) });
  };

  const handleNext = () => {
    turnTokenRef.current += 1;
    speech.stop();
    if (index + 1 >= dialogue.lines.length) {
      onComplete();
    } else {
      setIndex(index + 1);
    }
  };

  const handlePrevious = () => {
    if (index === 0) return;
    turnTokenRef.current += 1;
    speech.stop();
    setIndex(index - 1);
  };

  const handleRestart = () => {
    turnTokenRef.current += 1;
    speech.stop();
    setIndex(0);
    setRestartKey((k) => k + 1);
  };

  return (
    <div className="practice-card">
      <ProgressBar current={index} total={dialogue.lines.length} />

      <p className="practice-label">
        {mode === "memory" ? "Memory practice" : "Role practice"} — you are {userCharacter?.name}
      </p>

      <div className={`dialogue-bubble dialogue-turn-${isUserTurn ? "user" : "partner"}`}>
        <p className="dialogue-bubble-speaker">{speakerCharacter?.name}</p>
        {isUserTurn && !revealed ? (
          <button type="button" className="btn-secondary" onClick={() => setRevealed(true)}>
            Reveal line
          </button>
        ) : (
          <>
            <p className="dialogue-bubble-text">{currentLine.text}</p>
            {currentLine.translation && <p className="dialogue-bubble-translation">{currentLine.translation}</p>}
          </>
        )}
      </div>

      <div className="practice-actions">
        {!isUserTurn && (
          <button type="button" className="btn-secondary" onClick={handleReplay}>
            Replay partner's line
          </button>
        )}
        {isUserTurn && mode === "memory" && revealed && (
          <button type="button" className="btn-secondary" onClick={() => setRevealed(false)}>
            Hide line
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={handlePrevious} disabled={index === 0}>
          Previous
        </button>
        <button type="button" className="btn-primary" onClick={handleNext}>
          {isUserTurn ? "I've said it — Next" : "Next"}
        </button>
        <button type="button" className="btn-secondary" onClick={handleRestart}>
          Restart
        </button>
      </div>
    </div>
  );
}
