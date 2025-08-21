// src/hooks/manuscript/useManuscriptUtils.ts
// Utility functions and helpers for manuscript operations

import { useCallback, useRef } from "react";
import { NovelWithStructure } from "@/lib/novels";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";
import { ManuscriptStateActions } from "./useManuscriptState";

export interface UtilsConfig {
  novelId: string;
  contentDisplayMode: ContentDisplayMode;
  actions: ManuscriptStateActions;
}

export interface UtilityHelpers {
  isInDocumentView: () => boolean;
  loadNovelStructure: (id: string) => Promise<void>;
  handleRefresh: () => void;
  hasStructure: (novel: NovelWithStructure | null) => boolean;
}

export function useManuscriptUtils(config: UtilsConfig): UtilityHelpers {
  const { novelId, contentDisplayMode, actions } = config;

  // ===== NOVEL LOADING LOGIC =====
  const loadNovelStructureRef = useRef<((id: string) => Promise<void>) | null>(
    null
  );

  loadNovelStructureRef.current = async (id: string) => {
    console.log("🔄 API CALL: loadNovelStructure called for novelId:", id);
    try {
      actions.setLoading(true);

      const response = await fetch(`/api/novels/${id}/structure`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load novel structure");
      }

      const result = await response.json();

      if (result.success && result.data) {
        actions.updateNovel(() => result.data.novel);
        console.log("✅ Novel structure loaded:", result.data.novel);
      } else {
        throw new Error(result.error || "Failed to load novel structure");
      }
    } catch (error) {
      console.error("❌ Error loading novel structure:", error);
      actions.setError(
        error instanceof Error ? error.message : "Failed to load novel"
      );
    } finally {
      actions.setLoading(false);
    }
  };

  // ===== UTILITY FUNCTIONS =====

  // Check if we're in document view mode
  const isInDocumentView = useCallback(() => {
    return contentDisplayMode === "document";
  }, [contentDisplayMode]);

  // Load novel structure wrapper
  const loadNovelStructure = useCallback(async (id: string) => {
    if (loadNovelStructureRef.current) {
      await loadNovelStructureRef.current(id);
    }
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    console.log("🔄 EXPLICIT REFRESH: User action triggered refresh");
    loadNovelStructure(novelId);
  }, [loadNovelStructure, novelId]);

  // Check if novel has structure
  const hasStructure = useCallback(
    (novel: NovelWithStructure | null): boolean => {
      return !!(novel && novel.acts && novel.acts.length > 0);
    },
    []
  );

  // ===== RETURN INTERFACE =====
  return {
    isInDocumentView,
    loadNovelStructure,
    handleRefresh,
    hasStructure,
  };
}
