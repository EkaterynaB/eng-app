import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { dialoguesApi } from "../api/dialogues";
import { DialogueConversation } from "../components/DialogueConversation";
import { DialogueRolePractice } from "../components/DialogueRolePractice";
import { EmptyState } from "../components/EmptyState";
import { NORMAL_RATE, SLOW_RATE, useDialogueSpeech } from "../hooks/useDialogueSpeech";
import { Dialogue, DialogueStage } from "../types/dialogue";

type Stage = "read" | "roleSelect" | "rolePractice" | "roleSwitchPrompt" | "memory" | "finished";

export function DialoguePracticePage() {
  const { id } = useParams<{ id: string }>();
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stage, setStage] = useState<Stage>("read");
  const [userCharacterId, setUserCharacterId] = useState<string | null>(null);
  const [practiceRunId, setPracticeRunId] = useState(0);

  const speech = useDialogueSpeech();

  useEffect(() => {
    if (!id) return;
    dialoguesApi
      .getById(id)
      .then(setDialogue)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load dialogue"))
      .finally(() => setIsLoading(false));
  }, [id]);

  const voiceForCharacter = useCallback(
    (characterId: string): SpeechSynthesisVoice | undefined => {
      if (!dialogue || speech.voices.length === 0) return undefined;
      const index = dialogue.characters.findIndex((c) => c.id === characterId);
      if (index < 0) return undefined;
      return speech.voices[index % speech.voices.length];
    },
    [dialogue, speech.voices]
  );

  const stageLabelForCharacter = useCallback(
    (characterId: string): DialogueStage => (dialogue?.characters[0]?.id === characterId ? "roleA" : "roleB"),
    [dialogue]
  );

  const recordProgress = useCallback(
    (role: string, progressStage: DialogueStage) => {
      if (!id) return;
      dialoguesApi.recordProgress(id, role, progressStage).catch(() => {
        // Progress tracking is a nice-to-have; a failed write shouldn't block the lesson.
      });
    },
    [id]
  );

  const playFullDialogue = () => {
    if (!dialogue) return;
    if (speech.isSpeaking) {
      speech.stop();
      return;
    }
    speech.playSequence(dialogue.lines.map((line) => ({ text: line.text, voice: voiceForCharacter(line.speakerId) })));
  };

  const startRolePractice = (characterId: string) => {
    speech.stop();
    setUserCharacterId(characterId);
    setPracticeRunId((n) => n + 1);
    setStage("rolePractice");
  };

  const handleRoleComplete = () => {
    if (!userCharacterId) return;
    recordProgress(userCharacterId, stageLabelForCharacter(userCharacterId));
    setStage("roleSwitchPrompt");
  };

  const handleMemoryComplete = () => {
    if (!userCharacterId) return;
    recordProgress(userCharacterId, "memory");
    setStage("finished");
  };

  const practiceOtherRole = () => {
    if (!dialogue || !userCharacterId) return;
    const other = dialogue.characters.find((c) => c.id !== userCharacterId);
    if (!other) return;
    speech.stop();
    setUserCharacterId(other.id);
    setPracticeRunId((n) => n + 1);
    setStage("rolePractice");
  };

  const repeatSameRole = () => {
    speech.stop();
    setPracticeRunId((n) => n + 1);
    setStage("rolePractice");
  };

  const continueToMemory = () => {
    speech.stop();
    setPracticeRunId((n) => n + 1);
    setStage("memory");
  };

  const restartLesson = () => {
    speech.stop();
    setUserCharacterId(null);
    setStage("read");
  };

  const rateOptions = useMemo(
    () => [
      { label: "Normal speed", value: NORMAL_RATE },
      { label: "Slower", value: SLOW_RATE },
    ],
    []
  );

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
        </div>
        <Link className="btn-secondary" to={`/dialogues/${dialogue._id}`}>
          Exit
        </Link>
      </header>

      {speech.isSupported && (
        <div className="dialogue-speed-control">
          <label htmlFor="speech-rate">Speech speed</label>
          <select
            id="speech-rate"
            value={speech.rate}
            onChange={(e) => speech.setRate(Number(e.target.value))}
          >
            {rateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {stage === "read" && (
        <>
          <DialogueConversation
            dialogue={dialogue}
            activeIndex={speech.activeIndex}
            onPlayLine={(index) =>
              speech.speak(dialogue.lines[index].text, { voice: voiceForCharacter(dialogue.lines[index].speakerId) })
            }
          />
          <div className="practice-actions">
            <button className="btn-secondary" onClick={playFullDialogue} disabled={!speech.isSupported}>
              {speech.isSpeaking ? "Stop" : "Play full dialogue"}
            </button>
            <button className="btn-primary" onClick={() => setStage("roleSelect")}>
              I understand it — let's practice
            </button>
          </div>
        </>
      )}

      {stage === "roleSelect" && (
        <div className="practice-card">
          <p className="practice-label">Choose your role</p>
          <div className="practice-actions">
            {dialogue.characters.map((character) => (
              <button key={character.id} className="btn-primary" onClick={() => startRolePractice(character.id)}>
                Practice as {character.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "rolePractice" && userCharacterId && (
        <DialogueRolePractice
          key={`role-${practiceRunId}`}
          dialogue={dialogue}
          userCharacterId={userCharacterId}
          mode="role"
          speech={speech}
          voiceForCharacter={voiceForCharacter}
          onComplete={handleRoleComplete}
        />
      )}

      {stage === "roleSwitchPrompt" && (
        <EmptyState
          title="Nice work!"
          description="You finished a full run-through. What would you like to do next?"
          action={
            <div className="form-actions">
              <button className="btn-primary" onClick={practiceOtherRole}>
                Practice the other role
              </button>
              <button className="btn-secondary" onClick={repeatSameRole}>
                Repeat the same role
              </button>
              <button className="btn-secondary" onClick={continueToMemory}>
                Continue to memory practice
              </button>
              <button className="btn-secondary" onClick={() => setStage("finished")}>
                Finish the lesson
              </button>
            </div>
          }
        />
      )}

      {stage === "memory" && userCharacterId && (
        <DialogueRolePractice
          key={`memory-${practiceRunId}`}
          dialogue={dialogue}
          userCharacterId={userCharacterId}
          mode="memory"
          speech={speech}
          voiceForCharacter={voiceForCharacter}
          onComplete={handleMemoryComplete}
        />
      )}

      {stage === "finished" && (
        <EmptyState
          title="Lesson complete!"
          description="You can repeat this dialogue as many times as you like."
          action={
            <div className="form-actions">
              <button className="btn-primary" onClick={restartLesson}>
                Practice again
              </button>
              <Link className="btn-secondary" to={`/dialogues/${dialogue._id}`}>
                Back to dialogue
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
}
