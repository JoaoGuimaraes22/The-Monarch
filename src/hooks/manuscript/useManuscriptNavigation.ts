// src/hooks/manuscript/useManuscriptNavigation.ts
// Navigation logic for manuscript elements following the behavior matrix

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

    // Find current scene position
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

    // Try next scene in same chapter
    if (currentSceneIndex < currentScenes.length - 1) {
      return currentScenes[currentSceneIndex + 1];
    }

    // Try first scene of next chapter in same act
    if (currentChapterIndex < currentChapters.length - 1) {
      const nextChapter = currentChapters[currentChapterIndex + 1];
      const nextScenes = [...nextChapter.scenes].sort(
        (a, b) => a.order - b.order
      );
      return nextScenes[0] || null;
    }

    // Try first scene of first chapter in next act
    if (currentActIndex < allActs.length - 1) {
      const nextAct = allActs[currentActIndex + 1];
      const nextChapters = [...nextAct.chapters].sort(
        (a, b) => a.order - b.order
      );
      if (nextChapters.length > 0) {
        const firstScenes = [...nextChapters[0].scenes].sort(
          (a, b) => a.order - b.order
        );
        return firstScenes[0] || null;
      }
    }

    return null;
  }, [selectedScene, novel, getAllActs]);

  const getPreviousScene = useCallback((): Scene | null => {
    if (!selectedScene || !novel) return null;

    // Find current scene position
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

    // Try previous scene in same chapter
    if (currentSceneIndex > 0) {
      return currentScenes[currentSceneIndex - 1];
    }

    // Try last scene of previous chapter in same act
    if (currentChapterIndex > 0) {
      const prevChapter = currentChapters[currentChapterIndex - 1];
      const prevScenes = [...prevChapter.scenes].sort(
        (a, b) => a.order - b.order
      );
      return prevScenes[prevScenes.length - 1] || null;
    }

    // Try last scene of last chapter in previous act
    if (currentActIndex > 0) {
      const prevAct = allActs[currentActIndex - 1];
      const prevChapters = [...prevAct.chapters].sort(
        (a, b) => a.order - b.order
      );
      if (prevChapters.length > 0) {
        const lastChapter = prevChapters[prevChapters.length - 1];
        const lastScenes = [...lastChapter.scenes].sort(
          (a, b) => a.order - b.order
        );
        return lastScenes[lastScenes.length - 1] || null;
      }
    }

    return null;
  }, [selectedScene, novel, getAllActs]);

  // ===== CHAPTER NAVIGATION =====

  const getNextChapter = useCallback((): Chapter | null => {
    if (!selectedChapter || !selectedAct) return null;

    const chapters = getChaptersInCurrentAct();
    const currentIndex = chapters.findIndex(
      (ch) => ch.id === selectedChapter.id
    );

    // Next chapter in same act
    if (currentIndex !== -1 && currentIndex < chapters.length - 1) {
      return chapters[currentIndex + 1];
    }

    // First chapter of next act
    if (novel) {
      const acts = getAllActs();
      const currentActIndex = acts.findIndex(
        (act) => act.id === selectedAct.id
      );

      if (currentActIndex !== -1 && currentActIndex < acts.length - 1) {
        const nextAct = acts[currentActIndex + 1];
        const nextActChapters = [...nextAct.chapters].sort(
          (a, b) => a.order - b.order
        );
        return nextActChapters[0] || null;
      }
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
    if (!selectedChapter || !selectedAct) return null;

    const chapters = getChaptersInCurrentAct();
    const currentIndex = chapters.findIndex(
      (ch) => ch.id === selectedChapter.id
    );

    // Previous chapter in same act
    if (currentIndex > 0) {
      return chapters[currentIndex - 1];
    }

    // Last chapter of previous act
    if (novel) {
      const acts = getAllActs();
      const currentActIndex = acts.findIndex(
        (act) => act.id === selectedAct.id
      );

      if (currentActIndex > 0) {
        const prevAct = acts[currentActIndex - 1];
        const prevActChapters = [...prevAct.chapters].sort(
          (a, b) => a.order - b.order
        );
        return prevActChapters[prevActChapters.length - 1] || null;
      }
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
      // Scene View: Previous scene (cross-chapter if needed)
      const prevScene = getPreviousScene();
      if (prevScene) {
        selectionHandlers.handleSceneSelect(prevScene.id, prevScene);
      }
    } else if (viewMode === "chapter") {
      // Chapter View: Previous chapter (cross-act if needed)
      const prevChapter = getPreviousChapter();
      if (prevChapter) {
        selectionHandlers.handleChapterSelect(prevChapter);
      }
    } else if (viewMode === "act") {
      // Act View: Chapter navigation within act OR act navigation
      const prevChapter = getPreviousChapter();
      if (
        prevChapter &&
        selectedAct &&
        selectionUtils.findParentAct(prevChapter.id)?.id === selectedAct.id
      ) {
        // Same act: chapter navigation
        if (contentDisplayMode === "document") {
          // Scroll to chapter
          actions.setSelectedChapter(prevChapter);
          const firstScene =
            selectionUtils.findFirstSceneInChapter(prevChapter);
          if (firstScene) {
            actions.setSelectedScene(firstScene);
          }
          scrollToChapter(prevChapter.id);
        } else {
          // Grid: switch to document and scroll
          actions.setContentDisplayMode("document");
          actions.setSelectedChapter(prevChapter);
          const firstScene =
            selectionUtils.findFirstSceneInChapter(prevChapter);
          if (firstScene) {
            actions.setSelectedScene(firstScene);
          }
          scrollToChapter(prevChapter.id);
        }
      } else {
        // Different act: act navigation
        const prevAct = getPreviousAct();
        if (prevAct) {
          selectionHandlers.handleActSelect(prevAct);
        }
      }
    }
  }, [
    viewMode,
    contentDisplayMode,
    selectedAct,
    getPreviousScene,
    getPreviousChapter,
    getPreviousAct,
    selectionHandlers,
    selectionUtils,
    actions,
    scrollToChapter,
  ]);

  const handleNextNavigation = useCallback(() => {
    if (viewMode === "scene") {
      // Scene View: Next scene (cross-chapter if needed)
      const nextScene = getNextScene();
      if (nextScene) {
        selectionHandlers.handleSceneSelect(nextScene.id, nextScene);
      }
    } else if (viewMode === "chapter") {
      // Chapter View: Next chapter (cross-act if needed)
      const nextChapter = getNextChapter();
      if (nextChapter) {
        selectionHandlers.handleChapterSelect(nextChapter);
      }
    } else if (viewMode === "act") {
      // Act View: Chapter navigation within act OR act navigation
      const nextChapter = getNextChapter();
      if (
        nextChapter &&
        selectedAct &&
        selectionUtils.findParentAct(nextChapter.id)?.id === selectedAct.id
      ) {
        // Same act: chapter navigation
        if (contentDisplayMode === "document") {
          // Scroll to chapter
          actions.setSelectedChapter(nextChapter);
          const firstScene =
            selectionUtils.findFirstSceneInChapter(nextChapter);
          if (firstScene) {
            actions.setSelectedScene(firstScene);
          }
          scrollToChapter(nextChapter.id);
        } else {
          // Grid: switch to document and scroll
          actions.setContentDisplayMode("document");
          actions.setSelectedChapter(nextChapter);
          const firstScene =
            selectionUtils.findFirstSceneInChapter(nextChapter);
          if (firstScene) {
            actions.setSelectedScene(firstScene);
          }
          scrollToChapter(nextChapter.id);
        }
      } else {
        // Different act: act navigation
        const nextAct = getNextAct();
        if (nextAct) {
          selectionHandlers.handleActSelect(nextAct);
        }
      }
    }
  }, [
    viewMode,
    contentDisplayMode,
    selectedAct,
    getNextScene,
    getNextChapter,
    getNextAct,
    selectionHandlers,
    selectionUtils,
    actions,
    scrollToChapter,
  ]);

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
          currentIndex,
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

      return {
        primary: {
          items: chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            order: chapter.order,
            isCurrent: chapter.id === selectedChapter?.id,
          })),
          currentIndex,
          hasNext: !!getNextChapter(),
          hasPrevious: !!getPreviousChapter(),
          title: selectedChapter?.title || "Chapter",
          type: "chapter",
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
          currentIndex: currentActIndex,
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
          currentIndex: currentChapterIndex,
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

    // Fallback
    return {
      primary: {
        items: [],
        currentIndex: -1,
        hasNext: false,
        hasPrevious: false,
        title: "",
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
