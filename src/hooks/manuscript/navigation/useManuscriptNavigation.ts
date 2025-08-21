// src/hooks/manuscript/navigation/useManuscriptNavigation.ts
// Clean navigation implementation with clear separation of concerns

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

  // ===== NAVIGATION LOGIC =====

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

  // ===== PRIMARY SELECTION HANDLERS (Change view focus) =====

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

  // ===== SECONDARY SCROLL HANDLERS (Just scroll within view) =====

  const scrollToScene = useCallback(
    (sceneId: string) => {
      // Just update selected scene for highlighting, don't change view
      const scenes = getScenesInCurrentChapter();
      const scene = scenes.find((s) => s.id === sceneId);
      if (scene) {
        actions.setSelectedScene(scene);
        // Ensure document mode for scrolling
        if (contentDisplayMode !== "document") {
          actions.setContentDisplayMode("document");
        }
        // Scroll to scene
        setTimeout(() => {
          const element = document.getElementById(`scene-${sceneId}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100); // Small delay to ensure DOM is ready after mode change
      }
    },
    [getScenesInCurrentChapter, actions, contentDisplayMode]
  );

  const scrollToChapter = useCallback(
    (chapterId: string) => {
      // Just update selected chapter for highlighting, don't change view
      const chapters = getChaptersInCurrentAct();
      const chapter = chapters.find((c) => c.id === chapterId);
      if (chapter) {
        actions.setSelectedChapter(chapter);
        // Also update scene to first scene in chapter
        const firstScene = selectionUtils.findFirstSceneInChapter(chapter);
        if (firstScene) {
          actions.setSelectedScene(firstScene);
        }
        // Ensure document mode for scrolling
        if (contentDisplayMode !== "document") {
          actions.setContentDisplayMode("document");
        }
        // Scroll to chapter
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
        // Fallback to scene view
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
  };
}

/*
===== CLEAN NAVIGATION ARCHITECTURE =====

✅ CLEAR SEPARATION OF CONCERNS:
- Primary navigation = Changes view focus/selection
- Secondary navigation = Scrolls within current view

✅ VIEW-SPECIFIC NAVIGATION:
- Scene View: Only primary (scene selection)
- Chapter View: Primary (chapter selection) + Secondary (scene scrolling)
- Act View: Primary (act selection) + Secondary (chapter scrolling)

✅ CLEAN HANDLERS:
- selectScene/Chapter/Act = Changes selection and switches view
- scrollToScene/Chapter = Just scrolls within current view

✅ CONSISTENT PATTERNS:
- All navigation builders follow same pattern
- Clear distinction between selection and scrolling
- Proper state management separation

This architecture is much cleaner and easier to understand!
*/
