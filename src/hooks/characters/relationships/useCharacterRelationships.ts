// hooks/characters/relationships/useCharacterRelationships.ts
// Main character relationships hook following your established patterns

import { useState, useEffect, useCallback } from "react";
import type {
  RelationshipWithCurrentState,
  CreateRelationshipPairOptions,
  UpdateRelationshipOptions,
} from "@/lib/characters/relationship-service";

// ===== TYPES =====
export interface UseCharacterRelationshipsReturn {
  relationships: RelationshipWithCurrentState[];
  isLoading: boolean;
  error: string | null;

  // CRUD Operations
  createRelationship: (
    options: Omit<CreateRelationshipPairOptions, "characterAId">
  ) => Promise<RelationshipWithCurrentState | null>;
  updateRelationship: (
    relationshipId: string,
    updates: UpdateRelationshipOptions
  ) => Promise<RelationshipWithCurrentState | null>;
  deleteRelationship: (relationshipId: string) => Promise<boolean>;

  // State Management
  refetch: () => Promise<void>;
  optimisticAdd: (relationship: RelationshipWithCurrentState) => void;
  optimisticUpdate: (
    relationshipId: string,
    updates: Partial<RelationshipWithCurrentState>
  ) => void;
  optimisticRemove: (relationshipId: string) => void;

  // Loading States
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ===== HOOK =====
export function useCharacterRelationships(
  novelId: string,
  characterId: string
): UseCharacterRelationshipsReturn {
  // Core state
  const [relationships, setRelationships] = useState<
    RelationshipWithCurrentState[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Operation states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ===== FETCH RELATIONSHIPS =====
  const fetchRelationships = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(
        `/api/novels/${novelId}/characters/${characterId}/relationships`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch relationships");
      }

      const data = await response.json();
      setRelationships(data.data.relationships || []);
    } catch (err) {
      console.error("Error fetching relationships:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch relationships"
      );
    } finally {
      setIsLoading(false);
    }
  }, [novelId, characterId]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  // ===== CREATE RELATIONSHIP =====
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
        const newRelationship = data.data.relationship;

        // Optimistic update
        setRelationships((prev) => [newRelationship, ...prev]);

        return newRelationship;
      } catch (err) {
        console.error("Error creating relationship:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create relationship"
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [novelId, characterId]
  );

  // ===== UPDATE RELATIONSHIP =====
  const updateRelationship = useCallback(
    async (
      relationshipId: string,
      updates: UpdateRelationshipOptions
    ): Promise<RelationshipWithCurrentState | null> => {
      try {
        setIsUpdating(true);
        setError(null);

        // Optimistic update
        const originalRelationships = [...relationships];
        setRelationships((prev) =>
          prev.map((rel) =>
            rel.id === relationshipId ? { ...rel, ...updates } : rel
          )
        );

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/relationships/${relationshipId}`,
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
          setRelationships(originalRelationships);
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update relationship");
        }

        const data = await response.json();
        const updatedRelationship = data.data.relationship;

        // Update with server response
        setRelationships((prev) =>
          prev.map((rel) =>
            rel.id === relationshipId ? { ...rel, ...updatedRelationship } : rel
          )
        );

        return updatedRelationship;
      } catch (err) {
        console.error("Error updating relationship:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update relationship"
        );
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [novelId, characterId, relationships]
  );

  // ===== DELETE RELATIONSHIP =====
  const deleteRelationship = useCallback(
    async (relationshipId: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        setError(null);

        // Optimistic update
        const originalRelationships = [...relationships];
        setRelationships((prev) =>
          prev.filter((rel) => rel.id !== relationshipId)
        );

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/relationships/${relationshipId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          // Revert optimistic update
          setRelationships(originalRelationships);
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete relationship");
        }

        return true;
      } catch (err) {
        console.error("Error deleting relationship:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete relationship"
        );
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [novelId, characterId, relationships]
  );

  // ===== OPTIMISTIC UPDATES =====
  const optimisticAdd = useCallback(
    (relationship: RelationshipWithCurrentState) => {
      setRelationships((prev) => [relationship, ...prev]);
    },
    []
  );

  const optimisticUpdate = useCallback(
    (
      relationshipId: string,
      updates: Partial<RelationshipWithCurrentState>
    ) => {
      setRelationships((prev) =>
        prev.map((rel) =>
          rel.id === relationshipId ? { ...rel, ...updates } : rel
        )
      );
    },
    []
  );

  const optimisticRemove = useCallback((relationshipId: string) => {
    setRelationships((prev) => prev.filter((rel) => rel.id !== relationshipId));
  }, []);

  // ===== REFETCH =====
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchRelationships();
  }, [fetchRelationships]);

  return {
    relationships,
    isLoading,
    error,

    // CRUD Operations
    createRelationship,
    updateRelationship,
    deleteRelationship,

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
