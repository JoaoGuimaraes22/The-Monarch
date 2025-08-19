// src/hooks/useNovels.ts
// UPDATED: Fixed to work with new standardized API response format

import { useState, useEffect } from "react";
import { Novel, CreateNovelData } from "@/lib/novels";

interface UseNovelReturn {
  novel: Novel | null;
  loading: boolean;
  error: string | null;
  updateNovel: (data: Partial<CreateNovelData>) => Promise<Novel>;
  refetch: () => Promise<void> | null;
}

export const useNovel = (id: string | null): UseNovelReturn => {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== LOAD NOVEL (Updated for new API format) =====
  const loadNovel = async (novelId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/novels/${novelId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load novel");
      }

      // ✅ UPDATED: Handle new standardized response format
      const result = await response.json();

      if (result.success && result.data) {
        setNovel(result.data);
      } else {
        throw new Error(result.error || "Failed to load novel");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load novel";
      setError(errorMessage);
      setNovel(null);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===== UPDATE NOVEL (Updated for new API format) =====
  const updateNovel = async (
    data: Partial<CreateNovelData>
  ): Promise<Novel> => {
    if (!id) throw new Error("No novel ID provided");

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
        const error = await response.json();
        throw new Error(error.error || "Failed to update novel");
      }

      // ✅ UPDATED: Handle new standardized response format
      const result = await response.json();

      if (result.success && result.data) {
        const updatedNovel = result.data;
        setNovel(updatedNovel);
        return updatedNovel;
      } else {
        throw new Error(result.error || "Failed to update novel");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update novel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // ===== EFFECTS =====
  useEffect(() => {
    if (id) {
      loadNovel(id);
    }
  }, [id]);

  return {
    novel,
    loading,
    error,
    updateNovel,
    refetch: () => (id ? loadNovel(id) : null),
  };
};

// ===== NOVELS LIST HOOK (for novel selection page) =====
interface UseNovelsReturn {
  novels: Novel[];
  loading: boolean;
  error: string | null;
  createNovel: (data: CreateNovelData) => Promise<Novel>;
  deleteNovel: (novelId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useNovels = (): UseNovelsReturn => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== LOAD NOVELS LIST (Updated for new API format) =====
  const loadNovels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/novels");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load novels");
      }

      // ✅ UPDATED: Handle new standardized response format
      const result = await response.json();

      if (result.success && result.data) {
        setNovels(result.data);
      } else {
        throw new Error(result.error || "Failed to load novels");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load novels";
      setError(errorMessage);
      setNovels([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== CREATE NOVEL (Updated for new API format) =====
  const createNovel = async (data: CreateNovelData): Promise<Novel> => {
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
        const error = await response.json();
        throw new Error(error.error || "Failed to create novel");
      }

      // ✅ UPDATED: Handle new standardized response format
      const result = await response.json();

      if (result.success && result.data) {
        const newNovel = result.data;

        // Update local state
        setNovels((prev) => [newNovel, ...prev]);

        return newNovel;
      } else {
        throw new Error(result.error || "Failed to create novel");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create novel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // ===== DELETE NOVEL (Updated for new API format) =====
  const deleteNovel = async (novelId: string): Promise<void> => {
    try {
      setError(null);

      const response = await fetch(`/api/novels/${novelId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete novel");
      }

      // ✅ UPDATED: Handle new standardized response format
      const result = await response.json();

      if (result.success) {
        // Update local state
        setNovels((prev) => prev.filter((novel) => novel.id !== novelId));
      } else {
        throw new Error(result.error || "Failed to delete novel");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete novel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // ===== EFFECTS =====
  useEffect(() => {
    loadNovels();
  }, []);

  return {
    novels,
    loading,
    error,
    createNovel,
    deleteNovel,
    refetch: loadNovels,
  };
};

/*
===== CHANGES MADE =====

✅ UPDATED: loadNovel now handles new standardized response format
   - Checks result.success and uses result.data
   - Proper error handling with result.error

✅ UPDATED: updateNovel now handles new standardized response format
   - Returns updated novel from result.data
   - Proper error handling

✅ UPDATED: loadNovels (list) now handles new standardized response format
   - Processes array of novels from result.data
   - Proper error handling

✅ UPDATED: createNovel now handles new standardized response format
   - Gets created novel from result.data
   - Updates local state automatically

✅ UPDATED: deleteNovel now handles new standardized response format
   - Checks result.success before updating state
   - Removes deleted novel from local state

===== NEW RESPONSE FORMATS =====

GET /api/novels/{id}:
{
  "success": true,
  "data": { Novel object  },
  "message": "Novel retrieved successfully"
}

GET /api/novels:
{
  "success": true, 
  "data": [  Array of Novel objects  ],
  "message": "Retrieved 5 novels"
}

POST /api/novels:
{
  "success": true,
  "data": {  Created Novel object  },
  "message": "Novel created successfully"
}

PUT /api/novels/{id}:
{
  "success": true,
  "data": { Updated Novel object  },
  "message": "Novel updated successfully"
}

DELETE /api/novels/{id}:
{
  "success": true,
  "data": null,
  "message": "Novel deleted successfully"
}

===== USAGE =====

No changes needed in components using these hooks:
- Same interface and behavior
- Same return values and methods
- Automatic compatibility with new API
- Better error handling and user feedback
*/
