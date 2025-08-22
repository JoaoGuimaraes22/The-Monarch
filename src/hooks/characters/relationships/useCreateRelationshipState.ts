// hooks/characters/relationships/useCreateRelationshipState.ts
// Simplified relationship state creation hook for dialogs

import { useState, useCallback } from "react";
import type {
  RelationshipState,
  CreateRelationshipStateOptions,
} from "@/lib/characters/relationship-service";

// ===== TYPES =====
export interface UseCreateRelationshipStateReturn {
  createState: (
    options: Omit<CreateRelationshipStateOptions, "relationshipId">
  ) => Promise<RelationshipState | null>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

// ===== HOOK =====
export function useCreateRelationshipState(
  novelId: string,
  characterId: string,
  relationshipId: string
): UseCreateRelationshipStateReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createState = useCallback(
    async (
      options: Omit<CreateRelationshipStateOptions, "relationshipId">
    ): Promise<RelationshipState | null> => {
      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/relationships/${relationshipId}/states`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(options),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create relationship state"
          );
        }

        const data = await response.json();
        return data.data.state;
      } catch (err) {
        console.error("Error creating relationship state:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to create relationship state";
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [novelId, characterId, relationshipId]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createState,
    isCreating,
    error,
    clearError,
  };
}
