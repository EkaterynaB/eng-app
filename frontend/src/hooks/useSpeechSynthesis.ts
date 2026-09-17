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
      window.speechSynthesis.speak(utterance);
    },
    [isSupported]
  );

  return { isSupported, speak };
}
