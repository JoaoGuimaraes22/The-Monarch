// src/hooks/manuscript/navigation/handlers/scrollHandlers.ts
// Secondary scroll logic - scrolls within current view without changing focus

import { useCallback } from "react";
import { NovelWithStructure } from "@/lib/novels";

export interface ScrollHandlerConfig {
  novel: NovelWithStructure | null;
}

export interface SecondaryScrollHandlers {
  scrollToScene: (sceneId: string) => void;
  scrollToChapter: (chapterId: string) => void;
}

export const useScrollHandlers = (
  config: ScrollHandlerConfig
): SecondaryScrollHandlers => {
  const { novel } = config;

  // ===== SECONDARY SCROLL HANDLERS =====
  // These only scroll within the current view without changing selection

  const scrollToScene = useCallback(
    (sceneId: string) => {
      if (!novel) return;

      // Find the scene element and scroll to it
      const sceneElement = document.getElementById(`scene-${sceneId}`);
      if (sceneElement) {
        sceneElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
        return;
      }

      // Fallback: try different element ID patterns
      const fallbackSelectors = [
        `#scene-content-${sceneId}`,
        `#scene-item-${sceneId}`,
        `[data-scene-id="${sceneId}"]`,
      ];

      for (const selector of fallbackSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          break;
        }
      }
    },
    [novel]
  );

  const scrollToChapter = useCallback(
    (chapterId: string) => {
      if (!novel) return;

      // Find the chapter element and scroll to it
      const chapterElement = document.getElementById(`chapter-${chapterId}`);
      if (chapterElement) {
        chapterElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
        return;
      }

      // Fallback: try different element ID patterns
      const fallbackSelectors = [
        `#chapter-content-${chapterId}`,
        `#chapter-item-${chapterId}`,
        `[data-chapter-id="${chapterId}"]`,
      ];

      for (const selector of fallbackSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
          break;
        }
      }
    },
    [novel]
  );

  return {
    scrollToScene,
    scrollToChapter,
  };
};

/*
===== SECONDARY SCROLL LOGIC =====

✅ FOCUSED RESPONSIBILITY:
- Only handles scrolling within current view
- Does NOT change manuscript state or selection
- Pure scroll behavior for navigation within views

✅ ROBUST ELEMENT FINDING:
- Primary ID patterns: scene-{id}, chapter-{id}
- Fallback patterns: scene-content-{id}, chapter-content-{id}
- Data attribute fallbacks: [data-scene-id], [data-chapter-id]
- Graceful handling when elements not found

✅ SMOOTH SCROLLING:
- Uses smooth scroll behavior for better UX
- Consistent scroll-to-start positioning
- Respects browser scroll preferences

✅ PERFORMANCE OPTIMIZED:
- No state updates or side effects
- Pure DOM manipulation only
- Lightweight and fast execution

✅ EXTENSIBLE DESIGN:
- Easy to add new scroll targets
- Configurable scroll behavior
- Clean separation from selection logic

Ready for navigation builders!
*/
