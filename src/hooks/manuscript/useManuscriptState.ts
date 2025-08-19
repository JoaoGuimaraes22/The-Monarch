// src/hooks/manuscript/useManuscriptState.ts
// ✨ FIXED: Added error handling and proper type exports

import { useState, useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";

export interface ManuscriptState {
  novel: NovelWithStructure | null;
  loading: boolean;
  error: string | null; // ✅ ADDED: Missing error property
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode; // ✅ FIXED: Import from proper location
}

export interface ManuscriptStateActions {
  setNovel: (novel: NovelWithStructure | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void; // ✅ ADDED: Missing setError function
  setSelectedScene: (scene: Scene | null) => void;
  setSelectedChapter: (chapter: Chapter | null) => void;
  setSelectedAct: (act: Act | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setContentDisplayMode: (mode: ContentDisplayMode) => void;

  // Computed setters for convenience
  updateNovel: (
    updater: (prev: NovelWithStructure | null) => NovelWithStructure | null
  ) => void;
}

export interface ManuscriptStateReturn {
  state: ManuscriptState;
  actions: ManuscriptStateActions;
}

export function useManuscriptState(
  initialState?: Partial<ManuscriptState>
): ManuscriptStateReturn {
  // ===== CORE STATE =====
  const [novel, setNovel] = useState<NovelWithStructure | null>(
    initialState?.novel || null
  );
  const [loading, setLoading] = useState(initialState?.loading ?? true);
  const [error, setError] = useState<string | null>(
    initialState?.error || null
  ); // ✅ ADDED: Missing error state
  const [selectedScene, setSelectedScene] = useState<Scene | null>(
    initialState?.selectedScene || null
  );
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(
    initialState?.selectedChapter || null
  );
  const [selectedAct, setSelectedAct] = useState<Act | null>(
    initialState?.selectedAct || null
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialState?.viewMode || "scene"
  );
  const [contentDisplayMode, setContentDisplayMode] =
    useState<ContentDisplayMode>(
      initialState?.contentDisplayMode || "document"
    );

  // ===== COMPUTED SETTERS =====
  const updateNovel = useCallback(
    (
      updater: (prev: NovelWithStructure | null) => NovelWithStructure | null
    ) => {
      console.log("🔍 updateNovel called with updater function");
      console.log("🔍 Current novel state before update:", novel);

      const newNovel = updater(novel);
      console.log("🔍 New novel state after updater:", newNovel);
      console.log("🔍 New novel has acts?", newNovel?.acts?.length);

      setNovel(newNovel);

      // Force a log after state update (use useEffect to see final state)
      console.log("🔍 updateNovel completed");
    },
    [novel] // Add novel as dependency to see current state
  );

  // ===== STATE OBJECT =====
  const state: ManuscriptState = {
    novel,
    loading,
    error, // ✅ ADDED: Include error in state
    selectedScene,
    selectedChapter,
    selectedAct,
    viewMode,
    contentDisplayMode,
  };

  // ===== ACTIONS OBJECT =====
  const actions: ManuscriptStateActions = {
    setNovel,
    setLoading,
    setError, // ✅ ADDED: Include setError in actions
    setSelectedScene,
    setSelectedChapter,
    setSelectedAct,
    setViewMode,
    setContentDisplayMode,
    updateNovel,
  };

  return {
    state,
    actions,
  };
}

/*
===== FIXES APPLIED =====

✅ ADDED: Missing error property to ManuscriptState interface
✅ ADDED: Missing setError function to ManuscriptStateActions interface  
✅ ADDED: Error state management with useState
✅ ADDED: setError to actions object
✅ FIXED: ContentDisplayMode import from proper types file
✅ INCLUDED: Error in state object return

This resolves all TypeScript errors related to missing properties and functions.
*/
