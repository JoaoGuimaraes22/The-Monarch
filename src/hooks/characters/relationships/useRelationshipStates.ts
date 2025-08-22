// hooks/characters/relationships/useRelationshipStates.ts
// Relationship states management hook following character states patterns

import { useState, useEffect, useCallback } from "react";
import type {
  RelationshipState,
  CreateRelationshipStateOptions,
  UpdateRelationshipStateOptions,
} from "@/lib/characters/relationship-service";

// ===== TYPES =====
export interface UseRelationshipStatesReturn {
  states: RelationshipState[];
  isLoading: boolean;
  error: string | null;

  // CRUD Operations
  createState: (
    options: Omit<CreateRelationshipStateOptions, "relationshipId">
  ) => Promise<RelationshipState | null>;
  updateState: (
    stateId: string,
    updates: UpdateRelationshipStateOptions
  ) => Promise<RelationshipState | null>;
  deleteState: (stateId: string) => Promise<boolean>;

  // State Management
  refetch: () => Promise<void>;
  optimisticAdd: (state: RelationshipState) => void;
  optimisticUpdate: (
    stateId: string,
    updates: Partial<RelationshipState>
  ) => void;
  optimisticRemove: (stateId: string) => void;

  // Loading States
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ===== HOOK =====
export function useRelationshipStates(
  novelId: string,
  characterId: string,
  relationshipId: string
): UseRelationshipStatesReturn {
  // Core state
  const [states, setStates] = useState<RelationshipState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Operation states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ===== FETCH STATES =====
  const fetchStates = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(
        `/api/novels/${novelId}/characters/${characterId}/relationships/${relationshipId}/states`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch relationship states"
        );
      }

      const data = await response.json();
      setStates(data.data.states || []);
    } catch (err) {
      console.error("Error fetching relationship states:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch relationship states"
      );
    } finally {
      setIsLoading(false);
    }
  }, [novelId, characterId, relationshipId]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  // ===== CREATE STATE =====
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
        const newState = data.data.state;

        // Optimistic update - add to end (chronological order)
        setStates((prev) => [...prev, newState]);

        return newState;
      } catch (err) {
        console.error("Error creating relationship state:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create relationship state"
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [novelId, characterId, relationshipId]
  );

  // ===== UPDATE STATE =====
  const updateState = useCallback(
    async (
      stateId: string,
      updates: UpdateRelationshipStateOptions
    ): Promise<RelationshipState | null> => {
      try {
        setIsUpdating(true);
        setError(null);

        // Optimistic update
        const originalStates = [...states];
        setStates((prev) =>
          prev.map((state) =>
            state.id === stateId ? { ...state, ...updates } : state
          )
        );

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/relationships/${relationshipId}/states/${stateId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          // Revert optimistic update
          setStates(originalStates);
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to update relationship state"
          );
        }

        const data = await response.json();
        const updatedState = data.data.state;

        // Update with server response
        setStates((prev) =>
          prev.map((state) =>
            state.id === stateId ? { ...state, ...updatedState } : state
          )
        );

        return updatedState;
      } catch (err) {
        console.error("Error updating relationship state:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update relationship state"
        );
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [novelId, characterId, relationshipId, states]
  );

  // ===== DELETE STATE =====
  const deleteState = useCallback(
    async (stateId: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);

        // Optimistic update
        const originalStates = [...states];
        setStates((prev) => prev.filter((state) => state.id !== stateId));

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/relationships/${relationshipId}/states/${stateId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          // Revert optimistic update
          setStates(originalStates);
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to delete relationship state"
          );
        }

        return true;
      } catch (err) {
        console.error("Error deleting relationship state:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete relationship state"
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [novelId, characterId, relationshipId, states]
  );

  // ===== OPTIMISTIC UPDATES =====
  const optimisticAdd = useCallback((state: RelationshipState) => {
    setStates((prev) => [...prev, state]);
  }, []);

  const optimisticUpdate = useCallback(
    (stateId: string, updates: Partial<RelationshipState>) => {
      setStates((prev) =>
        prev.map((state) =>
          state.id === stateId ? { ...state, ...updates } : state
        )
      );
    },
    []
  );

  const optimisticRemove = useCallback((stateId: string) => {
    setStates((prev) => prev.filter((state) => state.id !== stateId));
  }, []);

  // ===== REFETCH =====
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchStates();
  }, [fetchStates]);

  return {
    states,
    isLoading,
    error,

    // CRUD Operations
    createState,
    updateState,
    deleteState,

    // State Management
    refetch,
    optimisticAdd,
    optimisticUpdate,
    optimisticRemove,

    // Loading States
    isCreating,
    isUpdating,
    isDeleting,
  };
}
