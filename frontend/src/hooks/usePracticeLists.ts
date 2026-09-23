import { useCallback, useEffect, useState } from "react";
import { practiceListsApi } from "../api/practiceLists";
import { PracticeList, PracticeListInput } from "../types/practiceList";

export function usePracticeLists() {
  const [lists, setLists] = useState<PracticeList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await practiceListsApi.getAll();
      setLists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load practice lists");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (input: PracticeListInput) => {
      const newList = await practiceListsApi.create(input);
      setLists((prev) => [newList, ...prev]);
      return newList;
    },
    []
  );

  const updateList = useCallback(async (id: string, input: PracticeListInput) => {
    const updated = await practiceListsApi.update(id, input);
    setLists((prev) => prev.map((list) => (list._id === id ? updated : list)));
    return updated;
  }, []);

  const deleteList = useCallback(async (id: string) => {
    await practiceListsApi.remove(id);
    setLists((prev) => prev.filter((list) => list._id !== id));
  }, []);

  return {
    lists,
    isLoading,
    error,
    createList,
    updateList,
    deleteList,
    refetch: fetchLists,
  };
}
