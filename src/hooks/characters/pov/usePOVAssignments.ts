// hooks/characters/pov/usePOVAssignments.ts
// Main POV assignments management hook following established patterns

import { useState, useCallback, useEffect } from "react";
import {
  POVAssignmentWithCharacter,
  POVStatistics,
  CreatePOVAssignmentOptions,
  UpdatePOVAssignmentOptions,
} from "@/lib/characters/pov-service";

// ===== HOOK RETURN TYPE =====
export interface UsePOVAssignmentsReturn {
  // State
  assignments: POVAssignmentWithCharacter[];
  statistics: POVStatistics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createAssignment: (
    options: CreatePOVAssignmentOptions
  ) => Promise<POVAssignmentWithCharacter | null>;
  updateAssignment: (
    assignmentId: string,
    options: UpdatePOVAssignmentOptions
  ) => Promise<POVAssignmentWithCharacter | null>;
  deleteAssignment: (assignmentId: string) => Promise<boolean>;
  refreshAssignments: () => Promise<void>;

  // Queries
  getAssignmentsByScope: (
    scopeType: "novel" | "act" | "chapter" | "scene"
  ) => POVAssignmentWithCharacter[];
  getAssignmentsByCharacter: (
    characterId: string
  ) => POVAssignmentWithCharacter[];

  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ===== MAIN HOOK =====
export function usePOVAssignments(novelId: string): UsePOVAssignmentsReturn {
  const [assignments, setAssignments] = useState<POVAssignmentWithCharacter[]>(
    []
  );
  const [statistics, setStatistics] = useState<POVStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Operation loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ===== FETCH ASSIGNMENTS =====
  const fetchAssignments = useCallback(async () => {
    if (!novelId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/novels/${novelId}/pov-assignments`);

      if (!response.ok) {
        throw new Error("Failed to fetch POV assignments");
      }

      const data = await response.json();

      if (data.success) {
        setAssignments(data.data.assignments || []);
        setStatistics(data.data.stats || null);
      } else {
        throw new Error(data.error || "Failed to fetch POV assignments");
      }
    } catch (err) {
      console.error("Error fetching POV assignments:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setAssignments([]);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, [novelId]);

  // ===== CREATE ASSIGNMENT =====
  const createAssignment = useCallback(
    async (
      options: CreatePOVAssignmentOptions
    ): Promise<POVAssignmentWithCharacter | null> => {
      if (!novelId) return null;

      try {
        setIsCreating(true);
        setError(null);

        const response = await fetch(`/api/novels/${novelId}/pov-assignments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          throw new Error("Failed to create POV assignment");
        }

        const data = await response.json();

        if (data.success) {
          const newAssignment = data.data.assignment;

          // Optimistic update
          setAssignments((prev) => [...prev, newAssignment]);

          // Refresh to get updated statistics
          await fetchAssignments();

          return newAssignment;
        } else {
          throw new Error(data.error || "Failed to create POV assignment");
        }
      } catch (err) {
        console.error("Error creating POV assignment:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [novelId, fetchAssignments]
  );

  // ===== UPDATE ASSIGNMENT =====
  const updateAssignment = useCallback(
    async (
      assignmentId: string,
      options: UpdatePOVAssignmentOptions
    ): Promise<POVAssignmentWithCharacter | null> => {
      if (!novelId) return null;

      try {
        setIsUpdating(true);
        setError(null);

        const response = await fetch(
          `/api/novels/${novelId}/pov-assignments/${assignmentId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(options),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update POV assignment");
        }

        const data = await response.json();

        if (data.success) {
          const updatedAssignment = data.data.assignment;

          // Optimistic update
          setAssignments((prev) =>
            prev.map((assignment) =>
              assignment.id === assignmentId
                ? { ...assignment, ...updatedAssignment }
                : assignment
            )
          );

          return updatedAssignment;
        } else {
          throw new Error(data.error || "Failed to update POV assignment");
        }
      } catch (err) {
        console.error("Error updating POV assignment:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [novelId]
  );

  // ===== DELETE ASSIGNMENT =====
  const deleteAssignment = useCallback(
    async (assignmentId: string): Promise<boolean> => {
      if (!novelId) return false;

      try {
        setIsDeleting(true);
        setError(null);

        // Optimistic update
        const originalAssignments = assignments;
        setAssignments((prev) =>
          prev.filter((assignment) => assignment.id !== assignmentId)
        );

        const response = await fetch(
          `/api/novels/${novelId}/pov-assignments/${assignmentId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          // Rollback optimistic update
          setAssignments(originalAssignments);
          throw new Error("Failed to delete POV assignment");
        }

        const data = await response.json();

        if (!data.success || !data.data.deleted) {
          // Rollback optimistic update
          setAssignments(originalAssignments);
          throw new Error(data.error || "Failed to delete POV assignment");
        }

        // Refresh statistics after successful deletion
        await fetchAssignments();

        return true;
      } catch (err) {
        console.error("Error deleting POV assignment:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [novelId, assignments, fetchAssignments]
  );

  // ===== QUERY HELPERS =====
  const getAssignmentsByScope = useCallback(
    (
      scopeType: "novel" | "act" | "chapter" | "scene"
    ): POVAssignmentWithCharacter[] => {
      return assignments.filter(
        (assignment) => assignment.scopeType === scopeType
      );
    },
    [assignments]
  );

  const getAssignmentsByCharacter = useCallback(
    (characterId: string): POVAssignmentWithCharacter[] => {
      return assignments.filter(
        (assignment) => assignment.characterId === characterId
      );
    },
    [assignments]
  );

  // ===== REFRESH =====
  const refreshAssignments = useCallback(async () => {
    await fetchAssignments();
  }, [fetchAssignments]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    if (novelId) {
      fetchAssignments();
    }
  }, [novelId, fetchAssignments]);

  return {
    // State
    assignments,
    statistics,
    isLoading,
    error,

    // Actions
    createAssignment,
    updateAssignment,
    deleteAssignment,
    refreshAssignments,

    // Queries
    getAssignmentsByScope,
    getAssignmentsByCharacter,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
  };
}
