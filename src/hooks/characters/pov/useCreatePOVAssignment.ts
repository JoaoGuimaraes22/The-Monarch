// hooks/characters/pov/useCreatePOVAssignment.ts
// Simplified POV assignment creation hook for dialogs

import { useState, useCallback } from "react";
import {
  CreatePOVAssignmentOptions,
  POVAssignmentWithCharacter,
} from "@/lib/characters/pov-service";

// ===== HOOK RETURN TYPE =====
export interface UseCreatePOVAssignmentReturn {
  createAssignment: (
    options: CreatePOVAssignmentOptions
  ) => Promise<POVAssignmentWithCharacter | null>;
  isCreating: boolean;
  error: string | null;
  clearError: () => void;
}

// ===== SIMPLIFIED CREATION HOOK =====
export function useCreatePOVAssignment(
  novelId: string
): UseCreatePOVAssignmentReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== CREATE ASSIGNMENT =====
  const createAssignment = useCallback(
    async (
      options: CreatePOVAssignmentOptions
    ): Promise<POVAssignmentWithCharacter | null> => {
      if (!novelId) {
        setError("Novel ID is required");
        return null;
      }

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
          const data = await response.json();
          throw new Error(
            data.error ||
              `HTTP ${response.status}: Failed to create POV assignment`
          );
        }

        const data = await response.json();

        if (data.success) {
          return data.data.assignment;
        } else {
          throw new Error(data.error || "Failed to create POV assignment");
        }
      } catch (err) {
        console.error("Error creating POV assignment:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [novelId]
  );

  // ===== CLEAR ERROR =====
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createAssignment,
    isCreating,
    error,
    clearError,
  };
}
