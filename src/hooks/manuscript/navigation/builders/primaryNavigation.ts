// src/hooks/manuscript/navigation/builders/primaryNavigation.ts
// Primary navigation builders - for main view navigation

import { useCallback } from "react";
import { Scene, Chapter, Act, NovelWithStructure } from "@/lib/novels";
import { PrimaryNavigation } from "../types";
import { PrimarySelectionHandlers } from "../handlers/selectionHandlers";
import {
  getScenesInChapter,
  getChaptersInAct,
  getAllActsInNovel,
  buildSceneItems,
  buildChapterItems,
  buildActItems,
  getNextInList,
  getPreviousInList,
} from "../utils/navigationUtils";

export interface PrimaryNavigationConfig {
  novel: NovelWithStructure | null;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  selectionHandlers: PrimarySelectionHandlers;
}

export interface PrimaryNavigationBuilders {
  buildScenePrimaryNavigation: () => PrimaryNavigation;
  buildChapterPrimaryNavigation: () => PrimaryNavigation;
  buildActPrimaryNavigation: () => PrimaryNavigation;
}

export const usePrimaryNavigationBuilders = (
  config: PrimaryNavigationConfig
): PrimaryNavigationBuilders => {
  const {
    novel,
    selectedScene,
    selectedChapter,
    selectedAct,
    selectionHandlers,
  } = config;

  // ===== SCENE PRIMARY NAVIGATION =====
  const buildScenePrimaryNavigation = useCallback((): PrimaryNavigation => {
    if (!selectedChapter) {
      return {
        type: "scene",
        current: null,
        items: [],
        hasNext: false,
        hasPrevious: false,
        onNext: () => {},
        onPrevious: () => {},
        onSelect: selectionHandlers.selectScene,
      };
    }

    const scenes = getScenesInChapter(selectedChapter);
    const items = buildSceneItems(scenes, selectedScene?.id);
    const current = items.find((item) => item.isCurrent) || null;

    return {
      type: "scene",
      current,
      items,
      hasNext: !!getNextInList(scenes, selectedScene?.id),
      hasPrevious: !!getPreviousInList(scenes, selectedScene?.id),
      onNext: () => {
        const next = getNextInList(scenes, selectedScene?.id);
        if (next) selectionHandlers.selectScene(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(scenes, selectedScene?.id);
        if (previous) selectionHandlers.selectScene(previous.id);
      },
      onSelect: selectionHandlers.selectScene,
    };
  }, [selectedChapter, selectedScene?.id, selectionHandlers]);

  // ===== CHAPTER PRIMARY NAVIGATION =====
  const buildChapterPrimaryNavigation = useCallback((): PrimaryNavigation => {
    if (!selectedAct) {
      return {
        type: "chapter",
        current: null,
        items: [],
        hasNext: false,
        hasPrevious: false,
        onNext: () => {},
        onPrevious: () => {},
        onSelect: selectionHandlers.selectChapter,
      };
    }

    const chapters = getChaptersInAct(selectedAct);
    const items = buildChapterItems(chapters, selectedChapter?.id);
    const current = items.find((item) => item.isCurrent) || null;

    return {
      type: "chapter",
      current,
      items,
      hasNext: !!getNextInList(chapters, selectedChapter?.id),
      hasPrevious: !!getPreviousInList(chapters, selectedChapter?.id),
      onNext: () => {
        const next = getNextInList(chapters, selectedChapter?.id);
        if (next) selectionHandlers.selectChapter(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(chapters, selectedChapter?.id);
        if (previous) selectionHandlers.selectChapter(previous.id);
      },
      onSelect: selectionHandlers.selectChapter,
    };
  }, [selectedAct, selectedChapter?.id, selectionHandlers]);

  // ===== ACT PRIMARY NAVIGATION =====
  const buildActPrimaryNavigation = useCallback((): PrimaryNavigation => {
    if (!novel) {
      return {
        type: "act",
        current: null,
        items: [],
        hasNext: false,
        hasPrevious: false,
        onNext: () => {},
        onPrevious: () => {},
        onSelect: selectionHandlers.selectAct,
      };
    }

    const acts = getAllActsInNovel(novel);
    const items = buildActItems(acts, selectedAct?.id);
    const current = items.find((item) => item.isCurrent) || null;

    return {
      type: "act",
      current,
      items,
      hasNext: !!getNextInList(acts, selectedAct?.id),
      hasPrevious: !!getPreviousInList(acts, selectedAct?.id),
      onNext: () => {
        const next = getNextInList(acts, selectedAct?.id);
        if (next) selectionHandlers.selectAct(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(acts, selectedAct?.id);
        if (previous) selectionHandlers.selectAct(previous.id);
      },
      onSelect: selectionHandlers.selectAct,
    };
  }, [novel, selectedAct?.id, selectionHandlers]);

  return {
    buildScenePrimaryNavigation,
    buildChapterPrimaryNavigation,
    buildActPrimaryNavigation,
  };
};

/*
===== PRIMARY NAVIGATION BUILDERS =====

✅ VIEW-SPECIFIC BUILDERS:
- buildScenePrimaryNavigation: For scene view mode
- buildChapterPrimaryNavigation: For chapter view mode  
- buildActPrimaryNavigation: For act view mode

✅ COMPLETE NAVIGATION DATA:
- Current item information
- Full item lists for dropdowns/selectors
- Next/previous availability
- Proper handler assignments

✅ SELECTION-FOCUSED:
- All handlers use primary selection logic
- Changes view focus and updates state
- Maintains hierarchical selection consistency

✅ ERROR HANDLING:
- Graceful handling of missing selections
- Empty states with disabled navigation
- Consistent fallback behaviors

✅ PERFORMANCE OPTIMIZED:
- Memoized builders with proper dependencies
- Efficient list operations
- Minimal re-computation

Ready for secondary navigation builders!
*/
