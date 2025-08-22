// hooks/characters/useCharacterStates.ts
// Character states management hook - following your established patterns

import { useState, useCallback } from "react";
import type {
  CharacterState,
  CreateCharacterStateOptions,
} from "@/lib/characters/character-service";

// ===== TYPES =====
export interface UseCharacterStatesReturn {
  // State
  states: CharacterState[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createState: (
    options: CreateCharacterStateOptions
  ) => Promise<CharacterState | null>;
  updateStates: (newStates: CharacterState[]) => void;
  refreshStates: (novelId: string, characterId: string) => Promise<void>;

  // Utilities
  getStateById: (stateId: string) => CharacterState | null;
  getStatesByScope: (scopeType: string) => CharacterState[];
}

// ===== MAIN HOOK =====
export function useCharacterStates(
  initialStates: CharacterState[] = []
): UseCharacterStatesReturn {
  // State
  const [states, setStates] = useState<CharacterState[]>(initialStates);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== CREATE CHARACTER STATE =====
  const createState = useCallback(
    async (
      options: CreateCharacterStateOptions
    ): Promise<CharacterState | null> => {
      try {
        setError(null);
        setIsLoading(true);

        // Extract novelId from options (assuming it's passed through)
        const character = await fetch(
          `/api/novels/*/characters/${options.characterId}`
        )
          .then((res) => res.json())
          .then((data) => data.data.character);

        if (!character) {
          throw new Error("Character not found");
        }

        const response = await fetch(
          `/api/novels/${character.novelId}/characters/${options.characterId}/states`,
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
            errorData.error || "Failed to create character state"
          );
        }

        const data = await response.json();
        const newState = data.data;

        // Add to local state with proper sorting
        setStates((prev) =>
          [...prev, newState].sort((a, b) => {
            // Sort by creation date for consistent ordering
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          })
        );

        return newState;
      } catch (err) {
        console.error("Error creating character state:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create character state"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ===== UPDATE STATES =====
  const updateStates = useCallback((newStates: CharacterState[]) => {
    setStates(newStates);
  }, []);

  // ===== REFRESH STATES =====
  const refreshStates = useCallback(
    async (novelId: string, characterId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/states`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch character states"
          );
        }

        const data = await response.json();
        setStates(data.data.states);
      } catch (err) {
        console.error("Error fetching character states:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch character states"
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ===== UTILITIES =====
  const getStateById = useCallback(
    (stateId: string): CharacterState | null => {
      return states.find((state) => state.id === stateId) || null;
    },
    [states]
  );

  const getStatesByScope = useCallback(
    (scopeType: string): CharacterState[] => {
      return states.filter((state) => state.scopeType === scopeType);
    },
    [states]
  );

  return {
    // State
    states,
    isLoading,
    error,

    // Actions
    createState,
    updateStates,
    refreshStates,

    // Utilities
    getStateById,
    getStatesByScope,
  };
}

// ===== SIMPLIFIED CREATE STATE HOOK =====
// For use in character detail page where we already have novelId and characterId
export function useCreateCharacterState(novelId: string, characterId: string) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createState = useCallback(
    async (
      options: Omit<CreateCharacterStateOptions, "characterId">
    ): Promise<CharacterState | null> => {
      try {
        setError(null);
        setIsCreating(true);

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/states`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...options,
              characterId,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create character state"
          );
        }

        const data = await response.json();
        return data.data;
      } catch (err) {
        console.error("Error creating character state:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create character state"
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [novelId, characterId]
  );

  return {
    createState,
    isCreating,
    error,
  };
}
