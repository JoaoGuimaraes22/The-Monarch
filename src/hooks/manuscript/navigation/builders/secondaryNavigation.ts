// src/hooks/manuscript/navigation/builders/secondaryNavigation.ts
// Secondary navigation builders - for scrolling within views

import { useCallback } from "react";
import { Scene, Chapter, Act, NovelWithStructure } from "@/lib/novels";
import { SecondaryNavigation } from "../types";
import { SecondaryScrollHandlers } from "../handlers/scrollHandlers";
import {
  getScenesInChapter,
  getChaptersInAct,
  buildSceneItems,
  buildChapterItems,
  getNextInList,
  getPreviousInList,
} from "../utils/navigationUtils";

export interface SecondaryNavigationConfig {
  novel: NovelWithStructure | null;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  scrollHandlers: SecondaryScrollHandlers;
}

export interface SecondaryNavigationBuilders {
  buildSceneSecondaryNavigation: () => SecondaryNavigation;
  buildChapterSecondaryNavigation: () => SecondaryNavigation;
}

export const useSecondaryNavigationBuilders = (
  config: SecondaryNavigationConfig
): SecondaryNavigationBuilders => {
  const { selectedScene, selectedChapter, selectedAct, scrollHandlers } =
    config;

  // ===== SCENE SECONDARY NAVIGATION =====
  // Used in chapter view to scroll between scenes within the chapter
  const buildSceneSecondaryNavigation = useCallback((): SecondaryNavigation => {
    if (!selectedChapter) {
      return {
        type: "scene",
        current: null,
        items: [],
        hasNext: false,
        hasPrevious: false,
        onNext: () => {},
        onPrevious: () => {},
        onScrollTo: scrollHandlers.scrollToScene,
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
        if (next) scrollHandlers.scrollToScene(next.id);
      },
      onPrevious: () => {
        const previous = getPreviousInList(scenes, selectedScene?.id);
        if (previous) scrollHandlers.scrollToScene(previous.id);
      },
      onScrollTo: scrollHandlers.scrollToScene,
    };
  }, [selectedChapter, selectedScene?.id, scrollHandlers]);

  // ===== CHAPTER SECONDARY NAVIGATION =====
  // Used in act view to scroll between chapters within the act
  const buildChapterSecondaryNavigation =
    useCallback((): SecondaryNavigation => {
      if (!selectedAct) {
        return {
          type: "chapter",
          current: null,
          items: [],
          hasNext: false,
          hasPrevious: false,
          onNext: () => {},
          onPrevious: () => {},
          onScrollTo: scrollHandlers.scrollToChapter,
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
          if (next) scrollHandlers.scrollToChapter(next.id);
        },
        onPrevious: () => {
          const previous = getPreviousInList(chapters, selectedChapter?.id);
          if (previous) scrollHandlers.scrollToChapter(previous.id);
        },
        onScrollTo: scrollHandlers.scrollToChapter,
      };
    }, [selectedAct, selectedChapter?.id, scrollHandlers]);

  return {
    buildSceneSecondaryNavigation,
    buildChapterSecondaryNavigation,
  };
};

/*
===== SECONDARY NAVIGATION BUILDERS =====

✅ SCROLL-ONLY BUILDERS:
- buildSceneSecondaryNavigation: For scrolling scenes within chapter view
- buildChapterSecondaryNavigation: For scrolling chapters within act view

✅ VIEW-SPECIFIC USAGE:
- Scene secondary: Used in chapter view mode
- Chapter secondary: Used in act view mode
- No act secondary: Scene view has no secondary navigation

✅ SCROLL-FOCUSED BEHAVIOR:
- All handlers use scroll logic only
- Does NOT change selection or view focus
- Pure scrolling within current view

✅ CONSISTENT INTERFACE:
- Same structure as primary navigation
- Different handler types (onScrollTo vs onSelect)
- Clear distinction in behavior

✅ PERFORMANCE OPTIMIZED:
- Memoized builders with minimal dependencies
- Efficient scroll operations
- No state updates or side effects

Ready for builders barrel export!
*/
