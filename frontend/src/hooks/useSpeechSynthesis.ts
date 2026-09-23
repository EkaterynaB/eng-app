import { useCallback, useMemo } from "react";

export function useSpeechSynthesis() {
  const isSupported = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );

  const speak = useCallback(
    (text: string, lang = "en-US") => {
      if (!isSupported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.voice = window.speechSynthesis.getVoices()[0];
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  return { isSupported, speak };
}
