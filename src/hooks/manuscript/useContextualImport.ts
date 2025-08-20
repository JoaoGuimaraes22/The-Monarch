// src/hooks/manuscript/useContextualImport.ts
// Custom hook for contextual import functionality

import { useState, useCallback } from "react";
import { ImportTarget } from "@/app/components/manuscript/contextual-import";

interface UseContextualImportOptions {
  novelId: string;
  onImportSuccess: () => void;
}

export function useContextualImport({
  novelId,
  onImportSuccess,
}: UseContextualImportOptions) {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performImport = useCallback(
    async (target: ImportTarget, file: File, autoFix: boolean = false) => {
      setIsImporting(true);
      setError(null);

      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("target", JSON.stringify(target));
        formData.append("autoFix", JSON.stringify(autoFix));

        console.log("🚀 Starting contextual import:", {
          mode: target.mode,
          fileName: file.name,
          fileSize: file.size,
          target: target,
        });

        // Make API request to contextual import endpoint
        const response = await fetch(
          `/api/novels/${novelId}/contextual-import`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(
            errorData.error || `Import failed with status ${response.status}`
          );
        }

        const result = await response.json();

        console.log("✅ Import successful:", result);

        // Call success callback
        onImportSuccess();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Import failed";
        console.error("❌ Import failed:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setIsImporting(false);
      }
    },
    [novelId, onImportSuccess]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    performImport,
    isImporting,
    error,
    clearError,
  };
}
