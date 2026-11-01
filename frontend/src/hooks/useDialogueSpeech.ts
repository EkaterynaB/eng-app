import { useCallback, useEffect, useRef, useState } from "react";

export const SLOW_RATE = 0.75;
export const NORMAL_RATE = 1;

export interface SpeechSequenceItem {
  text: string;
  voice?: SpeechSynthesisVoice;
}

export function useDialogueSpeech() {
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rate, setRate] = useState<number>(NORMAL_RATE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const generationRef = useRef(0);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const englishVoices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
      setVoices(englishVoices);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported]);

  const stop = useCallback(() => {
    generationRef.current += 1;
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveIndex(null);
  }, [isSupported]);

  // Cancel any in-flight speech on unmount (navigating away, restarting, switching roles).
  useEffect(() => stop, [stop]);

  // Speaks one utterance under a given "generation" token, without starting a new
  // operation itself. Shared by speak() (its own generation) and playSequence()
  // (one generation for the whole sequence) so a mid-sequence stop() is honored
  // instead of being immediately overwritten by the sequence's next item.
  const speakUnderGeneration = useCallback(
    (text: string, options: { voice?: SpeechSynthesisVoice; rate?: number }, generation: number): Promise<void> => {
      if (!isSupported) return Promise.resolve();

      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = options.rate ?? rate;
        if (options.voice) {
          utterance.voice = options.voice;
        }

        const finish = () => {
          if (generationRef.current === generation) {
            setIsSpeaking(false);
          }
          resolve();
        };

        utterance.onend = finish;
        utterance.onerror = finish;

        if (generationRef.current === generation) {
          setIsSpeaking(true);
        }
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          finish();
        }
      });
    },
    [isSupported, rate]
  );

  const speak = useCallback(
    (text: string, options: { voice?: SpeechSynthesisVoice; rate?: number } = {}): Promise<void> => {
      if (!isSupported) return Promise.resolve();
      window.speechSynthesis.cancel();
      generationRef.current += 1;
      return speakUnderGeneration(text, options, generationRef.current);
    },
    [isSupported, speakUnderGeneration]
  );

  const playSequence = useCallback(
    async (items: SpeechSequenceItem[], onItemStart?: (index: number) => void): Promise<void> => {
      if (!isSupported || items.length === 0) return;

      window.speechSynthesis.cancel();
      generationRef.current += 1;
      const generation = generationRef.current;

      for (let i = 0; i < items.length; i++) {
        if (generationRef.current !== generation) return;
        setActiveIndex(i);
        onItemStart?.(i);
        await speakUnderGeneration(items[i].text, { voice: items[i].voice }, generation);
      }

      if (generationRef.current === generation) {
        setActiveIndex(null);
      }
    },
    [isSupported, speakUnderGeneration]
  );

  return { isSupported, voices, rate, setRate, isSpeaking, activeIndex, speak, playSequence, stop };
}
