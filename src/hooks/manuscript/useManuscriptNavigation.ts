// src/hooks/manuscript/useManuscriptNavigation.ts
// ✅ FIXED: Navigation logic with proper context generation and navigation handling

import { useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";
import { SelectionHandlers, SelectionUtils } from "./useManuscriptSelection";
import { ManuscriptStateActions } from "./useManuscriptState";

export interface NavigationConfig {
  novel: NovelWithStructure | null;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: ViewMode;
  contentDisplayMode: ContentDisplayMode;
  actions: ManuscriptStateActions;
  selectionHandlers: SelectionHandlers;
  selectionUtils: SelectionUtils;
}

export interface NavigationContext {
  primary: NavigationLevel;
  secondary?: NavigationLevel;
}

export interface NavigationLevel {
  items: NavigationItem[];
  currentIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
  title: string;
  type: "scene" | "chapter" | "act";
}

export interface NavigationItem {
  id: string;
  title: string;
  order: number;
  isCurrent: boolean;
}

export interface NavigationHandlers {
  handlePreviousNavigation: () => void;
  handleNextNavigation: () => void;
  handleNavigationSelect: (
    itemId: string,
    level?: "primary" | "secondary"
  ) => void;
  getNavigationContext: () => NavigationContext;
}

export function useManuscriptNavigation(
  config: NavigationConfig
): NavigationHandlers {
  const {
    novel,
    selectedScene,
    selectedChapter,
    selectedAct,
    viewMode,
    contentDisplayMode,
    actions,
    selectionHandlers,
    selectionUtils,
  } = config;

  // ===== COLLECTION UTILITIES =====

  const getScenesInCurrentChapter = useCallback((): Scene[] => {
    if (!selectedChapter) return [];
    return [...selectedChapter.scenes].sort((a, b) => a.order - b.order);
  }, [selectedChapter]);

  const getChaptersInCurrentAct = useCallback((): Chapter[] => {
    if (!selectedAct) return [];
    return [...selectedAct.chapters].sort((a, b) => a.order - b.order);
  }, [selectedAct]);

  const getAllActs = useCallback((): Act[] => {
    if (!novel) return [];
    return [...novel.acts].sort((a, b) => a.order - b.order);
  }, [novel]);

  // ===== SCENE NAVIGATION =====

  const getNextScene = useCallback((): Scene | null => {
    if (!selectedScene || !novel) return null;

    // Find current scene position across all acts/chapters
    const allActs = getAllActs();
    let currentActIndex = -1;
    let currentChapterIndex = -1;
    let currentSceneIndex = -1;

    for (let actIndex = 0; actIndex < allActs.length; actIndex++) {
      const act = allActs[actIndex];
      const chapters = [...act.chapters].sort((a, b) => a.order - b.order);

      for (
        let chapterIndex = 0;
        chapterIndex < chapters.length;
        chapterIndex++
      ) {
        const chapter = chapters[chapterIndex];
        const scenes = [...chapter.scenes].sort((a, b) => a.order - b.order);

        const sceneIndex = scenes.findIndex(
          (scene) => scene.id === selectedScene.id
        );
        if (sceneIndex !== -1) {
          currentActIndex = actIndex;
          currentChapterIndex = chapterIndex;
          currentSceneIndex = sceneIndex;
          break;
        }
      }
      if (currentActIndex !== -1) break;
    }

    if (currentActIndex === -1) return null;

    const currentAct = allActs[currentActIndex];
    const currentChapters = [...currentAct.chapters].sort(
      (a, b) => a.order - b.order
    );
    const currentChapter = currentChapters[currentChapterIndex];
    const currentScenes = [...currentChapter.scenes].sort(
      (a, b) => a.order - b.order
    );

    // Next scene in same chapter
    if (currentSceneIndex < currentScenes.length - 1) {
      return currentScenes[currentSceneIndex + 1];
    }

    // First scene of next chapter in same act
    if (currentChapterIndex < currentChapters.length - 1) {
      const nextChapter = currentChapters[currentChapterIndex + 1];
      const nextChapterScenes = [...nextChapter.scenes].sort(
        (a, b) => a.order - b.order
      );
      return nextChapterScenes[0] || null;
    }

    // First scene of first chapter in next act
    if (currentActIndex < allActs.length - 1) {
      const nextAct = allActs[currentActIndex + 1];
      const nextActChapters = [...nextAct.chapters].sort(
        (a, b) => a.order - b.order
      );
      if (nextActChapters.length > 0) {
        const firstChapter = nextActChapters[0];
        const firstChapterScenes = [...firstChapter.scenes].sort(
          (a, b) => a.order - b.order
        );
        return firstChapterScenes[0] || null;
      }
    }

    return null;
  }, [selectedScene, novel, getAllActs]);

  const getPreviousScene = useCallback((): Scene | null => {
    if (!selectedScene || !novel) return null;

    // Find current scene position across all acts/chapters
    const allActs = getAllActs();
    let currentActIndex = -1;
    let currentChapterIndex = -1;
    let currentSceneIndex = -1;

    for (let actIndex = 0; actIndex < allActs.length; actIndex++) {
      const act = allActs[actIndex];
      const chapters = [...act.chapters].sort((a, b) => a.order - b.order);

      for (
        let chapterIndex = 0;
        chapterIndex < chapters.length;
        chapterIndex++
      ) {
        const chapter = chapters[chapterIndex];
        const scenes = [...chapter.scenes].sort((a, b) => a.order - b.order);

        const sceneIndex = scenes.findIndex(
          (scene) => scene.id === selectedScene.id
        );
        if (sceneIndex !== -1) {
          currentActIndex = actIndex;
          currentChapterIndex = chapterIndex;
          currentSceneIndex = sceneIndex;
          break;
        }
      }
      if (currentActIndex !== -1) break;
    }

    if (currentActIndex === -1) return null;

    const currentAct = allActs[currentActIndex];
    const currentChapters = [...currentAct.chapters].sort(
      (a, b) => a.order - b.order
    );
    const currentChapter = currentChapters[currentChapterIndex];
    const currentScenes = [...currentChapter.scenes].sort(
      (a, b) => a.order - b.order
    );

    // Previous scene in same chapter
    if (currentSceneIndex > 0) {
      return currentScenes[currentSceneIndex - 1];
    }

    // Last scene of previous chapter in same act
    if (currentChapterIndex > 0) {
      const prevChapter = currentChapters[currentChapterIndex - 1];
      const prevChapterScenes = [...prevChapter.scenes].sort(
        (a, b) => a.order - b.order
      );
      return prevChapterScenes[prevChapterScenes.length - 1] || null;
    }

    // Last scene of last chapter in previous act
    if (currentActIndex > 0) {
      const prevAct = allActs[currentActIndex - 1];
      const prevActChapters = [...prevAct.chapters].sort(
        (a, b) => a.order - b.order
      );
      if (prevActChapters.length > 0) {
        const lastChapter = prevActChapters[prevActChapters.length - 1];
        const lastChapterScenes = [...lastChapter.scenes].sort(
          (a, b) => a.order - b.order
        );
        return lastChapterScenes[lastChapterScenes.length - 1] || null;
      }
    }

    return null;
  }, [selectedScene, novel, getAllActs]);

  // ===== CHAPTER NAVIGATION =====

  const getNextChapter = useCallback((): Chapter | null => {
    if (!selectedChapter || !selectedAct || !novel) return null;

    const chapters = getChaptersInCurrentAct();
    const currentIndex = chapters.findIndex(
      (ch) => ch.id === selectedChapter.id
    );

    // Next chapter in same act
    if (currentIndex !== -1 && currentIndex < chapters.length - 1) {
      return chapters[currentIndex + 1];
    }

    // First chapter of next act
    const acts = getAllActs();
    const currentActIndex = acts.findIndex((act) => act.id === selectedAct.id);

    if (currentActIndex !== -1 && currentActIndex < acts.length - 1) {
      const nextAct = acts[currentActIndex + 1];
      const nextActChapters = [...nextAct.chapters].sort(
        (a, b) => a.order - b.order
      );
      return nextActChapters[0] || null;
    }

    return null;
  }, [
    selectedChapter,
    selectedAct,
    novel,
    getChaptersInCurrentAct,
    getAllActs,
  ]);

  const getPreviousChapter = useCallback((): Chapter | null => {
    if (!selectedChapter || !selectedAct || !novel) return null;

    const chapters = getChaptersInCurrentAct();
    const currentIndex = chapters.findIndex(
      (ch) => ch.id === selectedChapter.id
    );

    // Previous chapter in same act
    if (currentIndex > 0) {
      return chapters[currentIndex - 1];
    }

    // Last chapter of previous act
    const acts = getAllActs();
    const currentActIndex = acts.findIndex((act) => act.id === selectedAct.id);

    if (currentActIndex > 0) {
      const prevAct = acts[currentActIndex - 1];
      const prevActChapters = [...prevAct.chapters].sort(
        (a, b) => a.order - b.order
      );
      return prevActChapters[prevActChapters.length - 1] || null;
    }

    return null;
  }, [
    selectedChapter,
    selectedAct,
    novel,
    getChaptersInCurrentAct,
    getAllActs,
  ]);

  // ===== ACT NAVIGATION =====

  const getNextAct = useCallback((): Act | null => {
    if (!selectedAct || !novel) return null;

    const acts = getAllActs();
    const currentIndex = acts.findIndex((act) => act.id === selectedAct.id);

    if (currentIndex !== -1 && currentIndex < acts.length - 1) {
      return acts[currentIndex + 1];
    }

    return null;
  }, [selectedAct, novel, getAllActs]);

  const getPreviousAct = useCallback((): Act | null => {
    if (!selectedAct || !novel) return null;

    const acts = getAllActs();
    const currentIndex = acts.findIndex((act) => act.id === selectedAct.id);

    if (currentIndex > 0) {
      return acts[currentIndex - 1];
    }

    return null;
  }, [selectedAct, novel, getAllActs]);

  // ===== SCROLL UTILITIES =====

  const scrollToChapter = useCallback((chapterId: string) => {
    setTimeout(() => {
      const chapterElement = document.querySelector(
        `[data-chapter-id="${chapterId}"]`
      );
      if (chapterElement) {
        chapterElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  }, []);

  // ===== MAIN NAVIGATION HANDLERS =====

  const handlePreviousNavigation = useCallback(() => {
    if (viewMode === "scene") {
      // Scene View: Navigate to previous scene across chapters/acts
      const prevScene = getPreviousScene();
      if (prevScene) {
        selectionHandlers.handleSceneSelect(prevScene.id, prevScene);
      }
    } else if (viewMode === "chapter") {
      // Chapter View: Navigate to previous chapter
      const prevChapter = getPreviousChapter();
      if (prevChapter) {
        selectionHandlers.handleChapterSelect(prevChapter);
      }
    } else if (viewMode === "act") {
      // Act View: Navigate to previous act
      const prevAct = getPreviousAct();
      if (prevAct) {
        selectionHandlers.handleActSelect(prevAct);
      }
    }
  }, [
    viewMode,
    getPreviousScene,
    getPreviousChapter,
    getPreviousAct,
    selectionHandlers,
  ]);

  const handleNextNavigation = useCallback(() => {
    if (viewMode === "scene") {
      // Scene View: Navigate to next scene across chapters/acts
      const nextScene = getNextScene();
      if (nextScene) {
        selectionHandlers.handleSceneSelect(nextScene.id, nextScene);
      }
    } else if (viewMode === "chapter") {
      // Chapter View: Navigate to next chapter
      const nextChapter = getNextChapter();
      if (nextChapter) {
        selectionHandlers.handleChapterSelect(nextChapter);
      }
    } else if (viewMode === "act") {
      // Act View: Navigate to next act
      const nextAct = getNextAct();
      if (nextAct) {
        selectionHandlers.handleActSelect(nextAct);
      }
    }
  }, [viewMode, getNextScene, getNextChapter, getNextAct, selectionHandlers]);

  const handleNavigationSelect = useCallback(
    (itemId: string, level: "primary" | "secondary" = "primary") => {
      if (viewMode === "scene") {
        // Scene dropdown: select specific scene
        const scenes = getScenesInCurrentChapter();
        const selectedScene = scenes.find((scene) => scene.id === itemId);
        if (selectedScene) {
          selectionHandlers.handleSceneSelect(selectedScene.id, selectedScene);
        }
      } else if (viewMode === "chapter") {
        // Chapter dropdown: select specific chapter
        const chapters = getChaptersInCurrentAct();
        const selectedChapter = chapters.find(
          (chapter) => chapter.id === itemId
        );
        if (selectedChapter) {
          selectionHandlers.handleChapterSelect(selectedChapter);
        }
      } else if (viewMode === "act") {
        // Act view has dual navigation
        if (level === "primary") {
          // Act selection
          const acts = getAllActs();
          const selectedAct = acts.find((act) => act.id === itemId);
          if (selectedAct) {
            selectionHandlers.handleActSelect(selectedAct);
          }
        } else {
          // Chapter selection within act
          const chapters = getChaptersInCurrentAct();
          const selectedChapter = chapters.find(
            (chapter) => chapter.id === itemId
          );
          if (selectedChapter) {
            if (contentDisplayMode === "document") {
              // Scroll to chapter
              actions.setSelectedChapter(selectedChapter);
              const firstScene =
                selectionUtils.findFirstSceneInChapter(selectedChapter);
              if (firstScene) {
                actions.setSelectedScene(firstScene);
              }
              scrollToChapter(selectedChapter.id);
            } else {
              // Switch to document and scroll
              actions.setContentDisplayMode("document");
              actions.setSelectedChapter(selectedChapter);
              const firstScene =
                selectionUtils.findFirstSceneInChapter(selectedChapter);
              if (firstScene) {
                actions.setSelectedScene(firstScene);
              }
              scrollToChapter(selectedChapter.id);
            }
          }
        }
      }
    },
    [
      viewMode,
      contentDisplayMode,
      getScenesInCurrentChapter,
      getChaptersInCurrentAct,
      getAllActs,
      selectionHandlers,
      selectionUtils,
      actions,
      scrollToChapter,
    ]
  );

  // ===== NAVIGATION CONTEXT GENERATION =====

  const getNavigationContext = useCallback((): NavigationContext => {
    if (viewMode === "scene") {
      const scenes = getScenesInCurrentChapter();
      const currentIndex = scenes.findIndex(
        (scene) => scene.id === selectedScene?.id
      );

      return {
        primary: {
          items: scenes.map((scene) => ({
            id: scene.id,
            title: scene.title || `Scene ${scene.order}`,
            order: scene.order,
            isCurrent: scene.id === selectedScene?.id,
          })),
          currentIndex: currentIndex !== -1 ? currentIndex : 0,
          hasNext: !!getNextScene(),
          hasPrevious: !!getPreviousScene(),
          title: selectedScene?.title || `Scene ${selectedScene?.order || 1}`,
          type: "scene",
        },
      };
    } else if (viewMode === "chapter") {
      const chapters = getChaptersInCurrentAct();
      const currentIndex = chapters.findIndex(
        (chapter) => chapter.id === selectedChapter?.id
      );

      // ✅ FIXED: For chapter view, show both chapter AND scene navigation
      const scenes = getScenesInCurrentChapter();
      const currentSceneIndex = scenes.findIndex(
        (scene) => scene.id === selectedScene?.id
      );

      return {
        primary: {
          items: chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            order: chapter.order,
            isCurrent: chapter.id === selectedChapter?.id,
          })),
          currentIndex: currentIndex !== -1 ? currentIndex : 0,
          hasNext: !!getNextChapter(),
          hasPrevious: !!getPreviousChapter(),
          title: selectedChapter?.title || "Chapter",
          type: "chapter",
        },
        secondary: {
          items: scenes.map((scene) => ({
            id: scene.id,
            title: scene.title || `Scene ${scene.order}`,
            order: scene.order,
            isCurrent: scene.id === selectedScene?.id,
          })),
          currentIndex: currentSceneIndex !== -1 ? currentSceneIndex : 0,
          hasNext: !!getNextScene(),
          hasPrevious: !!getPreviousScene(),
          title: selectedScene?.title || `Scene ${selectedScene?.order || 1}`,
          type: "scene",
        },
      };
    } else if (viewMode === "act") {
      const acts = getAllActs();
      const chapters = getChaptersInCurrentAct();
      const currentActIndex = acts.findIndex(
        (act) => act.id === selectedAct?.id
      );
      const currentChapterIndex = chapters.findIndex(
        (chapter) => chapter.id === selectedChapter?.id
      );

      return {
        primary: {
          items: acts.map((act) => ({
            id: act.id,
            title: act.title,
            order: act.order,
            isCurrent: act.id === selectedAct?.id,
          })),
          currentIndex: currentActIndex !== -1 ? currentActIndex : 0,
          hasNext: !!getNextAct(),
          hasPrevious: !!getPreviousAct(),
          title: selectedAct?.title || "Act",
          type: "act",
        },
        secondary: {
          items: chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            order: chapter.order,
            isCurrent: chapter.id === selectedChapter?.id,
          })),
          currentIndex: currentChapterIndex !== -1 ? currentChapterIndex : 0,
          hasNext:
            !!getNextChapter() && getNextChapter()?.actId === selectedAct?.id,
          hasPrevious:
            !!getPreviousChapter() &&
            getPreviousChapter()?.actId === selectedAct?.id,
          title: selectedChapter?.title || "Chapter",
          type: "chapter",
        },
      };
    }

    // Fallback for edge cases
    return {
      primary: {
        items: [],
        currentIndex: 0,
        hasNext: false,
        hasPrevious: false,
        title: "No Selection",
        type: "scene",
      },
    };
  }, [
    viewMode,
    selectedScene,
    selectedChapter,
    selectedAct,
    getScenesInCurrentChapter,
    getChaptersInCurrentAct,
    getAllActs,
    getNextScene,
    getPreviousScene,
    getNextChapter,
    getPreviousChapter,
    getNextAct,
    getPreviousAct,
  ]);

  // ===== RETURN INTERFACE =====
  return {
    handlePreviousNavigation,
    handleNextNavigation,
    handleNavigationSelect,
    getNavigationContext,
  };
}

/*
===== KEY FIXES APPLIED =====

✅ PROPER CHAPTER VIEW NAVIGATION:
- Fixed chapter view to show BOTH chapter and scene navigation (dual-level)
- Corrected currentIndex calculation with proper fallbacks
- Proper scene navigation within current chapter

✅ ROBUST CROSS-BOUNDARY NAVIGATION:
- Scene navigation now properly crosses chapter and act boundaries
- Chapter navigation properly crosses act boundaries
- Improved edge case handling throughout

✅ ACCURATE CONTEXT GENERATION:
- Fixed currentIndex calculations with -1 fallback handling
- Proper hasNext/hasPrevious calculations
- Better title generation with fallbacks

✅ CONSISTENT BEHAVIOR:
- Navigation logic matches the expected behavior matrix
- Proper selection handlers called for each navigation type
- Clean separation between navigation levels

✅ PERFORMANCE IMPROVEMENTS:
- Better memoization of expensive calculations
- Reduced unnecessary re-renders
- Cleaner dependency arrays

This should fix the navigation issues you're experiencing! 🎯
*/
