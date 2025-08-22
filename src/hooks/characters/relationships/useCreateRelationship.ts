// hooks/characters/relationships/useCreateRelationship.ts
// Simplified relationship creation hook for dialogs

import { useState, useCallback } from "react";
import type {
  RelationshipWithCurrentState,
  CreateRelationshipPairOptions,
} from "@/lib/characters/relationship-service";

// ===== TYPES =====
export interface UseCreateRelationshipReturn {
  createRelationship: (
    options: Omit<CreateRelationshipPairOptions, "characterAId">
  ) => Promise<RelationshipWithCurrentState | null>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

// ===== HOOK =====
export function useCreateRelationship(
  novelId: string,
  characterId: string
): UseCreateRelationshipReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRelationship = useCallback(
    async (
      options: Omit<CreateRelationshipPairOptions, "characterAId">
    ): Promise<RelationshipWithCurrentState | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/relationships`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              toCharacterId: options.characterBId,
              baseType: options.baseType,
              origin: options.originFromA,
              history: options.history,
              fundamentalDynamic: options.fundamentalDynamic,
              writerNotes: options.writerNotes,
              reciprocalOrigin: options.originFromB,
              initialState: options.initialState,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create relationship");
        }

        const data = await response.json();
        return data.data.relationship;
      } catch (err) {
        console.error("Error creating relationship:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create relationship";
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [novelId, characterId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createRelationship,
    isCreating,
    error,
    clearError,
  };
}
