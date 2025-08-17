import { useState, useEffect } from "react";
import { Novel, CreateNovelData } from "@/lib/novels";

// Hook for managing all novels
export const useNovels = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load novels on mount
  useEffect(() => {
    loadNovels();
  }, []);

  const loadNovels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/novels");
      if (!response.ok) {
        throw new Error("Failed to fetch novels");
      }

      const novelsData = await response.json();
      setNovels(novelsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load novels");
    } finally {
      setLoading(false);
    }
  };

  const createNovel = async (data: CreateNovelData) => {
    try {
      setError(null);

      const response = await fetch("/api/novels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create novel");
      }

      const newNovel = await response.json();
      setNovels((prev) => [newNovel, ...prev]); // Add to beginning of list
      return newNovel;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create novel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteNovel = async (id: string) => {
    try {
      setError(null);

      const response = await fetch(`/api/novels/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete novel");
      }

      setNovels((prev) => prev.filter((novel) => novel.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete novel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    novels,
    loading,
    error,
    createNovel,
    deleteNovel,
    refetch: loadNovels,
  };
};

// Hook for managing a single novel
export const useNovel = (id: string | null) => {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadNovel(id);
    }
  }, [id]);

  const loadNovel = async (novelId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/novels/${novelId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch novel");
      }

      const novelData = await response.json();
      setNovel(novelData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load novel");
    } finally {
      setLoading(false);
    }
  };

  const updateNovel = async (data: Partial<CreateNovelData>) => {
    if (!id) return;

    try {
      setError(null);

      const response = await fetch(`/api/novels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update novel");
      }

      const updatedNovel = await response.json();
      setNovel(updatedNovel);
      return updatedNovel;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update novel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    novel,
    loading,
    error,
    updateNovel,
    refetch: () => (id ? loadNovel(id) : null),
  };
};
