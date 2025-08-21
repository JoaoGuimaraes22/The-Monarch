// src/hooks/manuscript/navigation/useManuscriptNavigation.ts
// Enhanced navigation with cross-boundary support

import { useCallback } from "react";
import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";
import { ContentDisplayMode } from "@/app/components/manuscript/manuscript-editor/content-views/types";
import { SelectionHandlers, SelectionUtils } from "../useManuscriptSelection";
import { ManuscriptStateActions } from "../useManuscriptState";
import {
  NavigationContext,
  NavigationHandlers,
  NavigationItem,
  PrimaryNavigation,
  SecondaryNavigation,
} from "./types";

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

// ✅ NEW: Enhanced navigation button state
export type NavigationButtonState =
  | "normal" // Standard navigation within current container
  | "cross-boundary" // Will navigate to different container
  | "disabled"; // No navigation possible

// ✅ NEW: Enhanced navigation info
export interface NavigationButtonInfo {
  state: NavigationButtonState;
  tooltip: string;
  destinationContainer?: string; // e.g., "Chapter 3" or "Act 2"
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

  // ===== UTILITY FUNCTIONS =====

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

  // ===== ENHANCED SCENE NAVIGATION =====

  const getNextSceneWithInfo = useCallback((): {
    scene: Scene | null;
    info: NavigationButtonInfo;
  } => {
    if (!selectedScene || !novel) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "No scene selected" },
      };
    }

    const scenes = getScenesInCurrentChapter();
    const currentIndex = scenes.findIndex((s) => s.id === selectedScene.id);

    if (currentIndex === -1) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "Scene not found" },
      };
    }

    // Check if there's a next scene in current chapter
    if (currentIndex < scenes.length - 1) {
      return {
        scene: scenes[currentIndex + 1],
        info: {
          state: "normal",
          tooltip: `Next Scene: ${
            scenes[currentIndex + 1].title ||
            `Scene ${scenes[currentIndex + 1].order}`
          }`,
        },
      };
    }

    // At end of chapter - look for next chapter
    if (!selectedChapter) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "No chapter selected" },
      };
    }

    const chapters = getChaptersInCurrentAct();
    const currentChapterIndex = chapters.findIndex(
      (c) => c.id === selectedChapter.id
    );

    if (currentChapterIndex === -1) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "Chapter not found" },
      };
    }

    // Check next chapter in current act
    if (currentChapterIndex < chapters.length - 1) {
      const nextChapter = chapters[currentChapterIndex + 1];
      const nextChapterScenes = [...nextChapter.scenes].sort(
        (a, b) => a.order - b.order
      );

      if (nextChapterScenes.length > 0) {
        return {
          scene: nextChapterScenes[0],
          info: {
            state: "cross-boundary",
            tooltip: `Next Scene (${nextChapter.title})`,
            destinationContainer: nextChapter.title,
          },
        };
      }
    }

    // Check next act
    if (!selectedAct) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "No act selected" },
      };
    }

    const acts = getAllActs();
    const currentActIndex = acts.findIndex((a) => a.id === selectedAct.id);

    if (currentActIndex < acts.length - 1) {
      const nextAct = acts[currentActIndex + 1];
      const nextActChapters = [...nextAct.chapters].sort(
        (a, b) => a.order - b.order
      );

      if (nextActChapters.length > 0) {
        const firstChapter = nextActChapters[0];
        const firstScenes = [...firstChapter.scenes].sort(
          (a, b) => a.order - b.order
        );

        if (firstScenes.length > 0) {
          return {
            scene: firstScenes[0],
            info: {
              state: "cross-boundary",
              tooltip: `Next Scene (${nextAct.title} - ${firstChapter.title})`,
              destinationContainer: `${nextAct.title} - ${firstChapter.title}`,
            },
          };
        }
      }
    }

    // Truly at the end
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No more scenes" },
    };
  }, [
    selectedScene,
    selectedChapter,
    selectedAct,
    novel,
    getScenesInCurrentChapter,
    getChaptersInCurrentAct,
    getAllActs,
  ]);

  const getPreviousSceneWithInfo = useCallback((): {
    scene: Scene | null;
    info: NavigationButtonInfo;
  } => {
    if (!selectedScene || !novel) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "No scene selected" },
      };
    }

    const scenes = getScenesInCurrentChapter();
    const currentIndex = scenes.findIndex((s) => s.id === selectedScene.id);

    if (currentIndex === -1) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "Scene not found" },
      };
    }

    // Check if there's a previous scene in current chapter
    if (currentIndex > 0) {
      return {
        scene: scenes[currentIndex - 1],
        info: {
          state: "normal",
          tooltip: `Previous Scene: ${
            scenes[currentIndex - 1].title ||
            `Scene ${scenes[currentIndex - 1].order}`
          }`,
        },
      };
    }

    // At beginning of chapter - look for previous chapter
    if (!selectedChapter) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "No chapter selected" },
      };
    }

    const chapters = getChaptersInCurrentAct();
    const currentChapterIndex = chapters.findIndex(
      (c) => c.id === selectedChapter.id
    );

    if (currentChapterIndex === -1) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "Chapter not found" },
      };
    }

    // Check previous chapter in current act
    if (currentChapterIndex > 0) {
      const prevChapter = chapters[currentChapterIndex - 1];
      const prevChapterScenes = [...prevChapter.scenes].sort(
        (a, b) => a.order - b.order
      );

      if (prevChapterScenes.length > 0) {
        return {
          scene: prevChapterScenes[prevChapterScenes.length - 1],
          info: {
            state: "cross-boundary",
            tooltip: `Previous Scene (${prevChapter.title})`,
            destinationContainer: prevChapter.title,
          },
        };
      }
    }

    // Check previous act
    if (!selectedAct) {
      return {
        scene: null,
        info: { state: "disabled", tooltip: "No act selected" },
      };
    }

    const acts = getAllActs();
    const currentActIndex = acts.findIndex((a) => a.id === selectedAct.id);

    if (currentActIndex > 0) {
      const prevAct = acts[currentActIndex - 1];
      const prevActChapters = [...prevAct.chapters].sort(
        (a, b) => a.order - b.order
      );

      if (prevActChapters.length > 0) {
        const lastChapter = prevActChapters[prevActChapters.length - 1];
        const lastScenes = [...lastChapter.scenes].sort(
          (a, b) => a.order - b.order
        );

        if (lastScenes.length > 0) {
          return {
            scene: lastScenes[lastScenes.length - 1],
            info: {
              state: "cross-boundary",
              tooltip: `Previous Scene (${prevAct.title} - ${lastChapter.title})`,
              destinationContainer: `${prevAct.title} - ${lastChapter.title}`,
            },
          };
        }
      }
    }

    // Truly at the beginning
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No more scenes" },
    };
  }, [
    selectedScene,
    selectedChapter,
    selectedAct,
    novel,
    getScenesInCurrentChapter,
    getChaptersInCurrentAct,
    getAllActs,
  ]);

  // ===== ENHANCED CHAPTER NAVIGATION =====

  const getNextChapterWithInfo = useCallback((): {
    chapter: Chapter | null;
    info: NavigationButtonInfo;
  } => {
    if (!selectedChapter || !novel) {
      return {
        chapter: null,
        info: { state: "disabled", tooltip: "No chapter selected" },
      };
    }

    const chapters = getChaptersInCurrentAct();
    const currentIndex = chapters.findIndex((c) => c.id === selectedChapter.id);

    if (currentIndex === -1) {
      return {
        chapter: null,
        info: { state: "disabled", tooltip: "Chapter not found" },
      };
    }

    // Check if there's a next chapter in current act
    if (currentIndex < chapters.length - 1) {
      return {
        chapter: chapters[currentIndex + 1],
        info: {
          state: "normal",
          tooltip: `Next Chapter: ${chapters[currentIndex + 1].title}`,
        },
      };
    }

    // At end of act - look for next act
    if (!selectedAct) {
      return {
        chapter: null,
        info: { state: "disabled", tooltip: "No act selected" },
      };
    }

    const acts = getAllActs();
    const currentActIndex = acts.findIndex((a) => a.id === selectedAct.id);

    if (currentActIndex < acts.length - 1) {
      const nextAct = acts[currentActIndex + 1];
      const nextActChapters = [...nextAct.chapters].sort(
        (a, b) => a.order - b.order
      );

      if (nextActChapters.length > 0) {
        return {
          chapter: nextActChapters[0],
          info: {
            state: "cross-boundary",
            tooltip: `Next Chapter (${nextAct.title})`,
            destinationContainer: nextAct.title,
          },
        };
      }
    }

    // Truly at the end
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "No more chapters" },
    };
  }, [
    selectedChapter,
    selectedAct,
    novel,
    getChaptersInCurrentAct,
    getAllActs,
  ]);

  const getPreviousChapterWithInfo = useCallback((): {
    chapter: Chapter | null;
    info: NavigationButtonInfo;
  } => {
    if (!selectedChapter || !novel) {
      return {
        chapter: null,
        info: { state: "disabled", tooltip: "No chapter selected" },
      };
    }

    const chapters = getChaptersInCurrentAct();
    const currentIndex = chapters.findIndex((c) => c.id === selectedChapter.id);

    if (currentIndex === -1) {
      return {
        chapter: null,
        info: { state: "disabled", tooltip: "Chapter not found" },
      };
    }

    // Check if there's a previous chapter in current act
    if (currentIndex > 0) {
      return {
        chapter: chapters[currentIndex - 1],
        info: {
          state: "normal",
          tooltip: `Previous Chapter: ${chapters[currentIndex - 1].title}`,
        },
      };
    }

    // At beginning of act - look for previous act
    if (!selectedAct) {
      return {
        chapter: null,
        info: { state: "disabled", tooltip: "No act selected" },
      };
    }

    const acts = getAllActs();
    const currentActIndex = acts.findIndex((a) => a.id === selectedAct.id);

    if (currentActIndex > 0) {
      const prevAct = acts[currentActIndex - 1];
      const prevActChapters = [...prevAct.chapters].sort(
        (a, b) => a.order - b.order
      );

      if (prevActChapters.length > 0) {
        return {
          chapter: prevActChapters[prevActChapters.length - 1],
          info: {
            state: "cross-boundary",
            tooltip: `Previous Chapter (${prevAct.title})`,
            destinationContainer: prevAct.title,
          },
        };
      }
    }

    // Truly at the beginning
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "No more chapters" },
    };
  }, [
    selectedChapter,
    selectedAct,
    novel,
    getChaptersInCurrentAct,
    getAllActs,
  ]);

  // ===== NAVIGATION ITEM BUILDERS =====

  const buildSceneItems = useCallback(
    (scenes: Scene[]): NavigationItem[] => {
      return scenes.map((scene) => ({
        id: scene.id,
        title: scene.title || `Scene ${scene.order}`,
        order: scene.order,
        isCurrent: scene.id === selectedScene?.id,
      }));
    },
    [selectedScene?.id]
  );

  const buildChapterItems = useCallback(
    (chapters: Chapter[]): NavigationItem[] => {
      return chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        order: chapter.order,
        isCurrent: chapter.id === selectedChapter?.id,
      }));
    },
    [selectedChapter?.id]
  );

  const buildActItems = useCallback(
    (acts: Act[]): NavigationItem[] => {
      return acts.map((act) => ({
        id: act.id,
        title: act.title,
        order: act.order,
        isCurrent: act.id === selectedAct?.id,
      }));
    },
    [selectedAct?.id]
  );

  // ===== BASIC NAVIGATION LOGIC =====

  const getNextInList = useCallback(
    <T extends { id: string }>(
      items: T[],
      currentId: string | undefined
    ): T | null => {
      if (!currentId) return null;
      const currentIndex = items.findIndex((item) => item.id === currentId);
      if (currentIndex === -1 || currentIndex >= items.length - 1) return null;
      return items[currentIndex + 1];
    },
    []
  );

  const getPreviousInList = useCallback(
    <T extends { id: string }>(
      items: T[],
      currentId: string | undefined
    ): T | null => {
      if (!currentId) return null;
      const currentIndex = items.findIndex((item) => item.id === currentId);
      if (currentIndex <= 0) return null;
      return items[currentIndex - 1];
    },
    []
  );

  // ===== PRIMARY SELECTION HANDLERS =====

  const selectScene = useCallback(
    (sceneId: string) => {
      const scenes = getScenesInCurrentChapter();
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        selectionHandlers.handleSceneSelect(sceneId, scene);
      }
    },
    [getScenesInCurrentChapter, selectionHandlers]
  );

  const selectChapter = useCallback(
    (chapterId: string) => {
      const chapters = getChaptersInCurrentAct();
      const chapter = chapters.find((c) => c.id === chapterId);
      if (chapter) {
        selectionHandlers.handleChapterSelect(chapter);
      }
    },
    [getChaptersInCurrentAct, selectionHandlers]
  );

  const selectAct = useCallback(
    (actId: string) => {
      const acts = getAllActs();
      const act = acts.find((a) => a.id === actId);
      if (act) {
        selectionHandlers.handleActSelect(act);
      }
    },
    [getAllActs, selectionHandlers]
  );

  // ===== SECONDARY SCROLL HANDLERS =====

  const scrollToScene = useCallback(
    (sceneId: string) => {
      const scenes = getScenesInCurrentChapter();
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        actions.setSelectedScene(scene);
        if (contentDisplayMode !== "document") {
          actions.setContentDisplayMode("document");
        }
        setTimeout(() => {
          const element = document.getElementById(`scene-${sceneId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    },
    [getScenesInCurrentChapter, actions, contentDisplayMode]
  );

  const scrollToChapter = useCallback(
    (chapterId: string) => {
      const chapters = getChaptersInCurrentAct();
      const chapter = chapters.find((c) => c.id === chapterId);
      if (chapter) {
        actions.setSelectedChapter(chapter);
        const firstScene = selectionUtils.findFirstSceneInChapter(chapter);
        if (firstScene) {
          actions.setSelectedScene(firstScene);
        }
        if (contentDisplayMode !== "document") {
          actions.setContentDisplayMode("document");
        }
        setTimeout(() => {
          const element = document.getElementById(`chapter-${chapterId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    },
    [getChaptersInCurrentAct, actions, selectionUtils, contentDisplayMode]
  );

  // ===== PRIMARY NAVIGATION BUILDERS =====

  const buildScenePrimaryNavigation = useCallback((): PrimaryNavigation => {
    const scenes = getScenesInCurrentChapter();
    const items = buildSceneItems(scenes);
    const current = items.find((item) => item.isCurrent) || null;

    return {
      type: "scene",
      current,
      items,
      hasNext: !!getNextInList(scenes, selectedScene?.id),
      hasPrevious: !!getPreviousInList(scenes, selectedScene?.id),
      onNext: () => {
        const next = getNextInList(scenes, selectedScene?.id);
        if (next) selectScene(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(scenes, selectedScene?.id);
        if (previous) selectScene(previous.id);
      },
      onSelect: selectScene,
    };
  }, [
    getScenesInCurrentChapter,
    buildSceneItems,
    selectedScene?.id,
    getNextInList,
    getPreviousInList,
    selectScene,
  ]);

  const buildChapterPrimaryNavigation = useCallback((): PrimaryNavigation => {
    const chapters = getChaptersInCurrentAct();
    const items = buildChapterItems(chapters);
    const current = items.find((item) => item.isCurrent) || null;

    return {
      type: "chapter",
      current,
      items,
      hasNext: !!getNextInList(chapters, selectedChapter?.id),
      hasPrevious: !!getPreviousInList(chapters, selectedChapter?.id),
      onNext: () => {
        const next = getNextInList(chapters, selectedChapter?.id);
        if (next) selectChapter(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(chapters, selectedChapter?.id);
        if (previous) selectChapter(previous.id);
      },
      onSelect: selectChapter,
    };
  }, [
    getChaptersInCurrentAct,
    buildChapterItems,
    selectedChapter?.id,
    getNextInList,
    getPreviousInList,
    selectChapter,
  ]);

  const buildActPrimaryNavigation = useCallback((): PrimaryNavigation => {
    const acts = getAllActs();
    const items = buildActItems(acts);
    const current = items.find((item) => item.isCurrent) || null;

    return {
      type: "act",
      current,
      items,
      hasNext: !!getNextInList(acts, selectedAct?.id),
      hasPrevious: !!getPreviousInList(acts, selectedAct?.id),
      onNext: () => {
        const next = getNextInList(acts, selectedAct?.id);
        if (next) selectAct(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(acts, selectedAct?.id);
        if (previous) selectAct(previous.id);
      },
      onSelect: selectAct,
    };
  }, [
    getAllActs,
    buildActItems,
    selectedAct?.id,
    getNextInList,
    getPreviousInList,
    selectAct,
  ]);

  // ===== SECONDARY NAVIGATION BUILDERS =====

  const buildSceneSecondaryNavigation = useCallback((): SecondaryNavigation => {
    const scenes = getScenesInCurrentChapter();
    const items = buildSceneItems(scenes);
    const current = items.find((item) => item.isCurrent) || null;

    return {
      type: "scene",
      current,
      items,
      hasNext: !!getNextInList(scenes, selectedScene?.id),
      hasPrevious: !!getPreviousInList(scenes, selectedScene?.id),
      onNext: () => {
        const next = getNextInList(scenes, selectedScene?.id);
        if (next) scrollToScene(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(scenes, selectedScene?.id);
        if (previous) scrollToScene(previous.id);
      },
      onScrollTo: scrollToScene,
    };
  }, [
    getScenesInCurrentChapter,
    buildSceneItems,
    selectedScene?.id,
    getNextInList,
    getPreviousInList,
    scrollToScene,
  ]);

  const buildChapterSecondaryNavigation =
    useCallback((): SecondaryNavigation => {
      const chapters = getChaptersInCurrentAct();
      const items = buildChapterItems(chapters);
      const current = items.find((item) => item.isCurrent) || null;

      return {
        type: "chapter",
        current,
        items,
        hasNext: !!getNextInList(chapters, selectedChapter?.id),
        hasPrevious: !!getPreviousInList(chapters, selectedChapter?.id),
        onNext: () => {
          const next = getNextInList(chapters, selectedChapter?.id);
          if (next) scrollToChapter(next.id);
        },
        onPrevious: () => {
          const previous = getPreviousInList(chapters, selectedChapter?.id);
          if (previous) scrollToChapter(previous.id);
        },
        onScrollTo: scrollToChapter,
      };
    }, [
      getChaptersInCurrentAct,
      buildChapterItems,
      selectedChapter?.id,
      getNextInList,
      getPreviousInList,
      scrollToChapter,
    ]);

  // ===== MAIN NAVIGATION CONTEXT BUILDER =====

  const getNavigationContext = useCallback((): NavigationContext => {
    switch (viewMode) {
      case "scene":
        return {
          viewMode: "scene",
          navigation: {
            primary: buildScenePrimaryNavigation(),
          },
        };

      case "chapter":
        return {
          viewMode: "chapter",
          navigation: {
            primary: buildChapterPrimaryNavigation(),
            secondary: buildSceneSecondaryNavigation(),
          },
        };

      case "act":
        return {
          viewMode: "act",
          navigation: {
            primary: buildActPrimaryNavigation(),
            secondary: buildChapterSecondaryNavigation(),
          },
        };

      default:
        return {
          viewMode: "scene",
          navigation: {
            primary: buildScenePrimaryNavigation(),
          },
        };
    }
  }, [
    viewMode,
    buildScenePrimaryNavigation,
    buildChapterPrimaryNavigation,
    buildActPrimaryNavigation,
    buildSceneSecondaryNavigation,
    buildChapterSecondaryNavigation,
  ]);

  // ===== RETURN INTERFACE =====
  return {
    getNavigationContext,
    selectScene,
    selectChapter,
    selectAct,
    scrollToScene,
    scrollToChapter,

    // ✅ NEW: Enhanced navigation methods
    getNextSceneWithInfo,
    getPreviousSceneWithInfo,
    getNextChapterWithInfo,
    getPreviousChapterWithInfo,
  };
}

/*
===== STEP 1 COMPLETE =====

✅ NEW NAVIGATION LOGIC:
- getNextSceneWithInfo() - Returns scene + navigation button info
- getPreviousSceneWithInfo() - Returns scene + navigation button info  
- getNextChapterWithInfo() - Returns chapter + navigation button info
- getPreviousChapterWithInfo() - Returns chapter + navigation button info

✅ NAVIGATION BUTTON STATES:
- "normal" - Standard navigation within container
- "cross-boundary" - Will cross to different container (different color)
- "disabled" - No navigation possible

✅ ENHANCED TOOLTIPS:
- Shows destination container for cross-boundary navigation
- Clear messaging for all states

Next step: Update the NavigationBar component to use this enhanced info!
*/
