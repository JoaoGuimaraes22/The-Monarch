// src/hooks/manuscript/navigation/handlers/selectionHandlers.ts
// Primary selection logic - changes view focus

import { useCallback } from "react";
import { Scene, Chapter, Act, NovelWithStructure } from "@/lib/novels";
import { ManuscriptStateActions } from "../../useManuscriptState";
import { SelectionHandlers } from "../../useManuscriptSelection";
import {
  findChapterContainingScene,
  findActContainingScene,
} from "../utils/navigationUtils";

export interface SelectionHandlerConfig {
  novel: NovelWithStructure | null;
  actions: ManuscriptStateActions;
  legacyHandlers: SelectionHandlers; // For backward compatibility
}

export interface PrimarySelectionHandlers {
  selectScene: (sceneId: string) => void;
  selectChapter: (chapterId: string) => void;
  selectAct: (actId: string) => void;
}

export const useSelectionHandlers = (
  config: SelectionHandlerConfig
): PrimarySelectionHandlers => {
  const { novel, actions, legacyHandlers } = config;

  // ===== PRIMARY SELECTION HANDLERS =====
  // These change the view focus and update the manuscript state

  const selectScene = useCallback(
    (sceneId: string) => {
      if (!novel) return;

      // Find the scene and its containers
      const scene = novel.acts
        .flatMap((act) => act.chapters)
        .flatMap((chapter) => chapter.scenes)
        .find((s) => s.id === sceneId);

      if (!scene) return;

      const chapter = findChapterContainingScene(novel.acts, sceneId);
      const act = findActContainingScene(novel.acts, sceneId);

      if (!chapter || !act) return;

      // Update all levels of selection for proper context
      actions.setSelectedAct(act);
      actions.setSelectedChapter(chapter);
      actions.setSelectedScene(scene);

      // Use legacy handler for any additional side effects
      legacyHandlers.handleSceneSelect(sceneId, scene);
    },
    [novel, actions, legacyHandlers]
  );

  const selectChapter = useCallback(
    (chapterId: string) => {
      if (!novel) return;

      // Find the chapter and its containing act
      const chapter = novel.acts
        .flatMap((act) => act.chapters)
        .find((c) => c.id === chapterId);

      if (!chapter) return;

      const act = novel.acts.find((a) =>
        a.chapters.some((c) => c.id === chapterId)
      );

      if (!act) return;

      // Update act and chapter selection
      actions.setSelectedAct(act);
      actions.setSelectedChapter(chapter);

      // Clear scene selection when changing chapters
      actions.setSelectedScene(null);

      // Use legacy handler for any additional side effects
      legacyHandlers.handleChapterSelect(chapter);
    },
    [novel, actions, legacyHandlers]
  );

  const selectAct = useCallback(
    (actId: string) => {
      if (!novel) return;

      const act = novel.acts.find((a) => a.id === actId);
      if (!act) return;

      // Update act selection
      actions.setSelectedAct(act);

      // Clear chapter and scene selection when changing acts
      actions.setSelectedChapter(null);
      actions.setSelectedScene(null);

      // Use legacy handler for any additional side effects
      legacyHandlers.handleActSelect(act);
    },
    [novel, actions, legacyHandlers]
  );

  return {
    selectScene,
    selectChapter,
    selectAct,
  };
};

/*
===== PRIMARY SELECTION LOGIC =====

✅ FOCUSED RESPONSIBILITY:
- Only handles primary selection that changes view focus
- Updates manuscript state to reflect new selection
- Maintains proper hierarchical selection (act → chapter → scene)

✅ PROPER STATE MANAGEMENT:
- selectScene: Updates act, chapter, and scene
- selectChapter: Updates act and chapter, clears scene
- selectAct: Updates act, clears chapter and scene

✅ BACKWARD COMPATIBILITY:
- Uses legacy handlers for any existing side effects
- Maintains all existing functionality
- Clean separation between new and legacy logic

✅ ERROR HANDLING:
- Validates that novel exists
- Checks that target entities exist
- Graceful handling of missing containers

✅ TYPE SAFETY:
- Clear interfaces for configuration and return types
- Proper typing for all handlers
- Uses existing type definitions from manuscript state

Ready for scroll handlers!
*/
