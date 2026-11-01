import { useCallback, useEffect, useState } from "react";
import { dialoguesApi } from "../api/dialogues";
import { Dialogue, DialogueInput } from "../types/dialogue";

export function useDialogues() {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDialogues = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dialoguesApi.getAll();
      setDialogues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dialogues");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDialogues();
  }, [fetchDialogues]);

  const createDialogue = useCallback(async (input: DialogueInput) => {
    const created = await dialoguesApi.create(input);
    setDialogues((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateDialogue = useCallback(async (id: string, input: DialogueInput) => {
    const updated = await dialoguesApi.update(id, input);
    setDialogues((prev) => prev.map((d) => (d._id === id ? updated : d)));
    return updated;
  }, []);

  const deleteDialogue = useCallback(async (id: string) => {
    await dialoguesApi.remove(id);
    setDialogues((prev) => prev.filter((d) => d._id !== id));
  }, []);

  return {
    dialogues,
    isLoading,
    error,
    createDialogue,
    updateDialogue,
    deleteDialogue,
    refetch: fetchDialogues,
  };
}
