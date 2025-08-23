// hooks/characters/pov/useCharacterPOV.ts
// Character-specific POV management hook following established patterns

import { useState, useCallback, useEffect } from "react";
import { POVAssignmentWithCharacter } from "@/lib/characters/pov-service";

// ===== HOOK RETURN TYPE =====
export interface UseCharacterPOVReturn {
  // State
  assignments: POVAssignmentWithCharacter[];
  hasPOV: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshAssignments: () => Promise<void>;

  // Queries
  getPrimaryPOVAssignments: () => POVAssignmentWithCharacter[];
  getSecondaryPOVAssignments: () => POVAssignmentWithCharacter[];
  getNovelWidePOV: () => POVAssignmentWithCharacter | null;
  getActPOVAssignments: () => POVAssignmentWithCharacter[];
  getChapterPOVAssignments: () => POVAssignmentWithCharacter[];
  getScenePOVAssignments: () => POVAssignmentWithCharacter[];

  // Helper methods
  isPOVCharacterForScope: (
    scopeType: "novel" | "act" | "chapter" | "scene",
    scopeId?: string
  ) => boolean;
  getPOVImportanceTotal: () => number;
}

// ===== CHARACTER POV HOOK =====
export function useCharacterPOV(
  characterId: string,
  novelId: string
): UseCharacterPOVReturn {
  const [assignments, setAssignments] = useState<POVAssignmentWithCharacter[]>(
    []
  );
  const [hasPOV, setHasPOV] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== FETCH CHARACTER POV =====
  const fetchCharacterPOV = useCallback(async () => {
    if (!characterId || !novelId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/novels/${novelId}/characters/${characterId}/pov-assignments`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch character POV assignments");
      }

      const data = await response.json();

      if (data.success) {
        setAssignments(data.data.assignments || []);
        setHasPOV(data.data.hasPOV || false);
      } else {
        throw new Error(
          data.error || "Failed to fetch character POV assignments"
        );
      }
    } catch (err) {
      console.error("Error fetching character POV:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setAssignments([]);
      setHasPOV(false);
    } finally {
      setIsLoading(false);
    }
  }, [characterId, novelId]);

  // ===== QUERY HELPERS =====
  const getPrimaryPOVAssignments =
    useCallback((): POVAssignmentWithCharacter[] => {
      return assignments.filter(
        (assignment) => assignment.povType === "primary"
      );
    }, [assignments]);

  const getSecondaryPOVAssignments =
    useCallback((): POVAssignmentWithCharacter[] => {
      return assignments.filter(
        (assignment) => assignment.povType === "secondary"
      );
    }, [assignments]);

  const getNovelWidePOV = useCallback((): POVAssignmentWithCharacter | null => {
    const novelAssignment = assignments.find(
      (assignment) => assignment.scopeType === "novel"
    );
    return novelAssignment || null;
  }, [assignments]);

  const getActPOVAssignments = useCallback((): POVAssignmentWithCharacter[] => {
    return assignments.filter((assignment) => assignment.scopeType === "act");
  }, [assignments]);

  const getChapterPOVAssignments =
    useCallback((): POVAssignmentWithCharacter[] => {
      return assignments.filter(
        (assignment) => assignment.scopeType === "chapter"
      );
    }, [assignments]);

  const getScenePOVAssignments =
    useCallback((): POVAssignmentWithCharacter[] => {
      return assignments.filter(
        (assignment) => assignment.scopeType === "scene"
      );
    }, [assignments]);

  // ===== HELPER METHODS =====
  const isPOVCharacterForScope = useCallback(
    (
      scopeType: "novel" | "act" | "chapter" | "scene",
      scopeId?: string
    ): boolean => {
      return assignments.some((assignment) => {
        if (assignment.scopeType !== scopeType) return false;

        // For novel scope, no specific ID needed
        if (scopeType === "novel") return true;

        // For other scopes, check the specific ID
        if (!scopeId) return false;

        switch (scopeType) {
          case "act":
            return assignment.startActId === scopeId;
          case "chapter":
            return assignment.startChapterId === scopeId;
          case "scene":
            return assignment.startSceneId === scopeId;
          default:
            return false;
        }
      });
    },
    [assignments]
  );

  const getPOVImportanceTotal = useCallback((): number => {
    return assignments.reduce(
      (total, assignment) => total + assignment.importance,
      0
    );
  }, [assignments]);

  // ===== REFRESH =====
  const refreshAssignments = useCallback(async () => {
    await fetchCharacterPOV();
  }, [fetchCharacterPOV]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    if (characterId && novelId) {
      fetchCharacterPOV();
    }
  }, [characterId, novelId, fetchCharacterPOV]);

  return {
    // State
    assignments,
    hasPOV,
    isLoading,
    error,

    // Actions
    refreshAssignments,

    // Queries
    getPrimaryPOVAssignments,
    getSecondaryPOVAssignments,
    getNovelWidePOV,
    getActPOVAssignments,
    getChapterPOVAssignments,
    getScenePOVAssignments,

    // Helper methods
    isPOVCharacterForScope,
    getPOVImportanceTotal,
  };
}
