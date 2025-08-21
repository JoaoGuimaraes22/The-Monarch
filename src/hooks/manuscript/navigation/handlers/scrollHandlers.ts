// src/hooks/manuscript/navigation/handlers/scrollHandlers.ts
// Secondary scroll handlers - scroll to elements AND update selection for better UX

import { useCallback } from "react";
import { NovelWithStructure, Scene, Chapter } from "@/lib/novels";
import { ManuscriptStateActions } from "../../useManuscriptState";

export interface ScrollHandlerConfig {
  novel: NovelWithStructure | null;
  actions: ManuscriptStateActions;
}

export interface SecondaryScrollHandlers {
  scrollToScene: (sceneId: string) => void;
  scrollToChapter: (chapterId: string) => void;
}

export const useScrollHandlers = (
  config: ScrollHandlerConfig
): SecondaryScrollHandlers => {
  const { novel, actions } = config;

  // Helper function to find scene by ID
  const findSceneById = useCallback(
    (sceneId: string): Scene | null => {
      if (!novel?.acts) return null;

      for (const act of novel.acts) {
        for (const chapter of act.chapters) {
          const scene = chapter.scenes.find((s) => s.id === sceneId);
          if (scene) return scene;
        }
      }
      return null;
    },
    [novel]
  );

  // Helper function to find chapter by ID
  const findChapterById = useCallback(
    (chapterId: string): Chapter | null => {
      if (!novel?.acts) return null;

      for (const act of novel.acts) {
        const chapter = act.chapters.find((c) => c.id === chapterId);
        if (chapter) return chapter;
      }
      return null;
    },
    [novel]
  );

  // Secondary scroll to scene (used in chapter view)
  const scrollToScene = useCallback(
    (sceneId: string) => {
      console.log("🔄 scrollToScene called with:", sceneId);

      if (!novel) {
        console.log("❌ No novel available");
        return;
      }

      // 1. Find and select the scene
      const scene = findSceneById(sceneId);
      if (!scene) {
        console.log("❌ Scene not found:", sceneId);
        return;
      }

      console.log("✅ Found scene:", scene.title || `Scene ${scene.order}`);

      // 2. Update selection to this scene
      actions.setSelectedScene(scene);
      console.log("✅ Updated selectedScene");

      // 3. Scroll to the scene element
      // Try multiple possible element IDs that might exist in the DOM
      const possibleSelectors = [
        `scene-${sceneId}`,
        `scene-content-${sceneId}`,
        `scene-item-${sceneId}`,
      ];

      let elementFound = false;

      for (const selectorId of possibleSelectors) {
        const element = document.getElementById(selectorId);
        if (element) {
          console.log("✅ Found element with ID:", selectorId);
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          elementFound = true;
          break;
        }
      }

      // Also try data attribute selectors
      if (!elementFound) {
        const dataSelectors = [
          `[data-scene-id="${sceneId}"]`,
          `.scene-${sceneId}`,
        ];

        for (const selector of dataSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            console.log("✅ Found element with selector:", selector);
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
            elementFound = true;
            break;
          }
        }
      }

      if (!elementFound) {
        console.log("❌ No DOM element found for scene:", sceneId);
        console.log("Tried selectors:", possibleSelectors);
      }
    },
    [novel, actions, findSceneById]
  );

  // Secondary scroll to chapter (used in act view)
  const scrollToChapter = useCallback(
    (chapterId: string) => {
      console.log("🔄 scrollToChapter called with:", chapterId);

      if (!novel) {
        console.log("❌ No novel available");
        return;
      }

      // 1. Find and select the chapter
      const chapter = findChapterById(chapterId);
      if (!chapter) {
        console.log("❌ Chapter not found:", chapterId);
        return;
      }

      console.log("✅ Found chapter:", chapter.title);

      // 2. Update selection to this chapter
      actions.setSelectedChapter(chapter);

      // 3. Also select the first scene in this chapter for consistency
      const firstScene = chapter.scenes.sort((a, b) => a.order - b.order)[0];

      if (firstScene) {
        actions.setSelectedScene(firstScene);
        console.log("✅ Updated selectedChapter and selectedScene");
      } else {
        console.log("✅ Updated selectedChapter (no scenes in chapter)");
      }

      // 4. Scroll to the chapter element
      const possibleSelectors = [
        `chapter-${chapterId}`,
        `chapter-content-${chapterId}`,
        `chapter-item-${chapterId}`,
      ];

      let elementFound = false;

      for (const selectorId of possibleSelectors) {
        const element = document.getElementById(selectorId);
        if (element) {
          console.log("✅ Found element with ID:", selectorId);
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          elementFound = true;
          break;
        }
      }

      // Also try data attribute selectors
      if (!elementFound) {
        const dataSelectors = [
          `[data-chapter-id="${chapterId}"]`,
          `.chapter-${chapterId}`,
        ];

        for (const selector of dataSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            console.log("✅ Found element with selector:", selector);
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
            elementFound = true;
            break;
          }
        }
      }

      if (!elementFound) {
        console.log("❌ No DOM element found for chapter:", chapterId);
        console.log("Tried selectors:", possibleSelectors);
      }
    },
    [novel, actions, findChapterById]
  );

  return {
    scrollToScene,
    scrollToChapter,
  };
};

/*
===== REBUILT SCROLL HANDLERS =====

✅ CLEAR PURPOSE:
- Secondary navigation that updates selection AND scrolls
- Provides expected user experience
- Maintains distinction from primary navigation

✅ ROBUST SCENE FINDING:
- Searches through all acts and chapters
- Handles missing scenes gracefully
- Clear logging for debugging

✅ ROBUST CHAPTER FINDING:
- Searches through all acts
- Handles missing chapters gracefully
- Updates both chapter and first scene selection

✅ COMPREHENSIVE DOM SEARCHING:
- Tries multiple ID patterns: scene-{id}, scene-content-{id}, scene-item-{id}
- Falls back to data attributes: [data-scene-id="{id}"]
- Falls back to class selectors: .scene-{id}
- Detailed logging to help identify what elements exist

✅ PROPER STATE UPDATES:
- Updates selectedScene for scene scrolling
- Updates selectedChapter + selectedScene for chapter scrolling
- Maintains proper hierarchical selection

✅ SMOOTH SCROLLING:
- Uses smooth scroll behavior
- Scrolls to start of element
- Consistent scroll options

Ready for testing with detailed console logging!
*/
