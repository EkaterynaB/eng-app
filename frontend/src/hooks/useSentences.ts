import { useCallback, useEffect, useState } from "react";
import { sentencesApi } from "../api/sentences";
import { ApiError } from "../api/client";
import { Sentence, SentenceInput } from "../types/sentence";

export function useSentences() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sentencesApi.getAll();
      setSentences(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load sentences");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addSentence = useCallback(async (input: SentenceInput) => {
    const created = await sentencesApi.create(input);
    setSentences((prev) => [created, ...prev]);
  }, []);

  const editSentence = useCallback(async (id: string, input: SentenceInput) => {
    const updated = await sentencesApi.update(id, input);
    setSentences((prev) => prev.map((s) => (s._id === id ? updated : s)));
  }, []);

  const deleteSentence = useCallback(async (id: string) => {
    await sentencesApi.remove(id);
    setSentences((prev) => prev.filter((s) => s._id !== id));
  }, []);

  return { sentences, isLoading, error, reload: load, addSentence, editSentence, deleteSentence };
}
