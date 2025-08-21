// src/hooks/manuscript/useManuscriptSelection.ts
// Selection logic and relationship management for manuscript elements

import { useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ManuscriptStateActions } from "./useManuscriptState";

export interface SelectionConfig {
  novel: NovelWithStructure | null;
  actions: ManuscriptStateActions;
}

export interface SelectionHandlers {
  handleSceneSelect: (sceneId: string, scene: Scene) => void;
  handleChapterSelect: (chapter: Chapter) => void;
  handleActSelect: (act: Act) => void;
}

export interface SelectionUtils {
  findFirstSceneInChapter: (chapter: Chapter) => Scene | null;
  findFirstSceneInAct: (act: Act) => Scene | null;
  findParentChapter: (sceneId: string) => Chapter | null;
  findParentAct: (chapterId: string) => Act | null;
  findParentActForScene: (sceneId: string) => Act | null;
}

export interface ManuscriptSelectionReturn {
  handlers: SelectionHandlers;
  utils: SelectionUtils;
}

export function useManuscriptSelection(
  config: SelectionConfig
): ManuscriptSelectionReturn {
  const { novel, actions } = config;

  // ===== UTILITY FUNCTIONS =====

  // Helper to find first scene in a chapter
  const findFirstSceneInChapter = useCallback(
    (chapter: Chapter): Scene | null => {
      if (!chapter.scenes || chapter.scenes.length === 0) return null;
      const sortedScenes = [...chapter.scenes].sort(
        (a, b) => a.order - b.order
      );
      return sortedScenes[0];
    },
    []
  );

  // Helper to find first scene in an act
  const findFirstSceneInAct = useCallback(
    (act: Act): Scene | null => {
      if (!act.chapters || act.chapters.length === 0) return null;
      const sortedChapters = [...act.chapters].sort(
        (a, b) => a.order - b.order
      );

      for (const chapter of sortedChapters) {
        const firstScene = findFirstSceneInChapter(chapter);
        if (firstScene) return firstScene;
      }
      return null;
    },
    [findFirstSceneInChapter]
  );

  // Find parent chapter for a scene
  const findParentChapter = useCallback(
    (sceneId: string): Chapter | null => {
      if (!novel) return null;

      for (const act of novel.acts) {
        for (const chapter of act.chapters) {
          if (chapter.scenes.some((scene) => scene.id === sceneId)) {
            return chapter;
          }
        }
      }
      return null;
    },
    [novel]
  );

  // Find parent act for a chapter
  const findParentAct = useCallback(
    (chapterId: string): Act | null => {
      if (!novel) return null;

      return (
        novel.acts.find((act) =>
          act.chapters.some((ch) => ch.id === chapterId)
        ) || null
      );
    },
    [novel]
  );

  // Find parent act for a scene
  const findParentActForScene = useCallback(
    (sceneId: string): Act | null => {
      if (!novel) return null;

      return (
        novel.acts.find((act) =>
          act.chapters.some((chapter) =>
            chapter.scenes.some((scene) => scene.id === sceneId)
          )
        ) || null
      );
    },
    [novel]
  );

  // ===== SELECTION HANDLERS =====

  const handleSceneSelect = useCallback(
    (sceneId: string, scene: Scene) => {
      actions.setSelectedScene(scene);
      actions.setViewMode("scene");

      // Find and set parent chapter/act
      const parentChapter = novel?.acts
        .flatMap((act) => act.chapters)
        .find((chapter) => chapter.scenes.some((s) => s.id === scene.id));

      if (parentChapter) {
        actions.setSelectedChapter(parentChapter);

        const parentAct = novel?.acts.find((act) =>
          act.chapters.some((ch) => ch.id === parentChapter.id)
        );

        if (parentAct) {
          actions.setSelectedAct(parentAct);
        }
      }
    },
    [novel, actions]
  );

  const handleChapterSelect = useCallback(
    (chapter: Chapter) => {
      actions.setSelectedChapter(chapter);
      actions.setViewMode("chapter");

      // Auto-select first scene for content aggregation
      const firstScene = findFirstSceneInChapter(chapter);
      if (firstScene) {
        actions.setSelectedScene(firstScene);
      }

      // Find and set parent act
      const parentAct = novel?.acts.find((act) =>
        act.chapters.some((ch) => ch.id === chapter.id)
      );

      if (parentAct) {
        actions.setSelectedAct(parentAct);
      }
    },
    [novel, actions, findFirstSceneInChapter]
  );

  const handleActSelect = useCallback(
    (act: Act) => {
      actions.setSelectedAct(act);
      actions.setViewMode("act");

      // Auto-select first scene for content aggregation
      const firstScene = findFirstSceneInAct(act);
      if (firstScene) {
        actions.setSelectedScene(firstScene);

        // Also set the chapter containing this scene
        const parentChapter = act.chapters.find((chapter) =>
          chapter.scenes.some((s) => s.id === firstScene.id)
        );
        if (parentChapter) {
          actions.setSelectedChapter(parentChapter);
        }
      }
    },
    [actions, findFirstSceneInAct]
  );

  // ===== RETURN INTERFACE =====
  return {
    handlers: {
      handleSceneSelect,
      handleChapterSelect,
      handleActSelect,
    },
    utils: {
      findFirstSceneInChapter,
      findFirstSceneInAct,
      findParentChapter,
      findParentAct,
      findParentActForScene,
    },
  };
}
