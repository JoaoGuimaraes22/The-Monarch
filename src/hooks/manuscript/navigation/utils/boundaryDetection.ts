// src/hooks/manuscript/navigation/utils/boundaryDetection.ts
// Enhanced boundary detection and cross-container navigation logic

import { Scene, Chapter, Act, NovelWithStructure } from "@/lib/novels";
import { NavigationButtonInfo, NavigationButtonState } from "../types";
import {
  getScenesInChapter,
  getChaptersInAct,
  getAllActsInNovel,
  findSceneIndexInChapter,
  findChapterIndexInAct,
  findActIndexInNovel,
  findChapterContainingScene,
  findActContainingScene,
  findActContainingChapter,
} from "./navigationUtils";

// ===== ENHANCED SCENE NAVIGATION =====

export const getNextSceneWithInfo = (
  novel: NovelWithStructure | null,
  selectedScene: Scene | null,
  selectedChapter: Chapter | null,
  selectedAct: Act | null
): { scene: Scene | null; info: NavigationButtonInfo } => {
  if (!selectedScene || !novel) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No scene selected" },
    };
  }

  if (!selectedChapter) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No chapter selected" },
    };
  }

  const scenes = getScenesInChapter(selectedChapter);
  const currentIndex = findSceneIndexInChapter(scenes, selectedScene.id);

  if (currentIndex === -1) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "Scene not found" },
    };
  }

  // Check if there's a next scene in current chapter
  if (currentIndex < scenes.length - 1) {
    const nextScene = scenes[currentIndex + 1];
    return {
      scene: nextScene,
      info: {
        state: "normal",
        tooltip: `Next Scene: ${nextScene.title || `Scene ${nextScene.order}`}`,
      },
    };
  }

  // At end of chapter - look for next chapter
  if (!selectedAct) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No act selected" },
    };
  }

  const chapters = getChaptersInAct(selectedAct);
  const currentChapterIndex = findChapterIndexInAct(
    chapters,
    selectedChapter.id
  );

  if (currentChapterIndex < chapters.length - 1) {
    // There's a next chapter in current act
    const nextChapter = chapters[currentChapterIndex + 1];
    const nextChapterScenes = getScenesInChapter(nextChapter);

    if (nextChapterScenes.length > 0) {
      const firstSceneInNextChapter = nextChapterScenes[0];
      return {
        scene: firstSceneInNextChapter,
        info: {
          state: "cross-boundary",
          tooltip: `First scene in ${nextChapter.title}`,
          destinationContainer: nextChapter.title,
        },
      };
    }
  }

  // At end of act - look for next act
  const acts = getAllActsInNovel(novel);
  const currentActIndex = findActIndexInNovel(acts, selectedAct.id);

  if (currentActIndex < acts.length - 1) {
    const nextAct = acts[currentActIndex + 1];
    const nextActChapters = getChaptersInAct(nextAct);

    if (nextActChapters.length > 0) {
      const firstChapterInNextAct = nextActChapters[0];
      const firstChapterScenes = getScenesInChapter(firstChapterInNextAct);

      if (firstChapterScenes.length > 0) {
        const firstSceneInNextAct = firstChapterScenes[0];
        return {
          scene: firstSceneInNextAct,
          info: {
            state: "cross-boundary",
            tooltip: `First scene in ${nextAct.title} - ${firstChapterInNextAct.title}`,
            destinationContainer: `${nextAct.title} - ${firstChapterInNextAct.title}`,
          },
        };
      }
    }
  }

  // No next scene available
  return {
    scene: null,
    info: { state: "disabled", tooltip: "Last scene in novel" },
  };
};

export const getPreviousSceneWithInfo = (
  novel: NovelWithStructure | null,
  selectedScene: Scene | null,
  selectedChapter: Chapter | null,
  selectedAct: Act | null
): { scene: Scene | null; info: NavigationButtonInfo } => {
  if (!selectedScene || !novel) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No scene selected" },
    };
  }

  if (!selectedChapter) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No chapter selected" },
    };
  }

  const scenes = getScenesInChapter(selectedChapter);
  const currentIndex = findSceneIndexInChapter(scenes, selectedScene.id);

  if (currentIndex === -1) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "Scene not found" },
    };
  }

  // Check if there's a previous scene in current chapter
  if (currentIndex > 0) {
    const previousScene = scenes[currentIndex - 1];
    return {
      scene: previousScene,
      info: {
        state: "normal",
        tooltip: `Previous Scene: ${
          previousScene.title || `Scene ${previousScene.order}`
        }`,
      },
    };
  }

  // At start of chapter - look for previous chapter
  if (!selectedAct) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "No act selected" },
    };
  }

  const chapters = getChaptersInAct(selectedAct);
  const currentChapterIndex = findChapterIndexInAct(
    chapters,
    selectedChapter.id
  );

  if (currentChapterIndex > 0) {
    // There's a previous chapter in current act
    const previousChapter = chapters[currentChapterIndex - 1];
    const previousChapterScenes = getScenesInChapter(previousChapter);

    if (previousChapterScenes.length > 0) {
      const lastSceneInPreviousChapter =
        previousChapterScenes[previousChapterScenes.length - 1];
      return {
        scene: lastSceneInPreviousChapter,
        info: {
          state: "cross-boundary",
          tooltip: `Last scene in ${previousChapter.title}`,
          destinationContainer: previousChapter.title,
        },
      };
    }
  }

  // At start of act - look for previous act
  const acts = getAllActsInNovel(novel);
  const currentActIndex = findActIndexInNovel(acts, selectedAct.id);

  if (currentActIndex > 0) {
    const previousAct = acts[currentActIndex - 1];
    const previousActChapters = getChaptersInAct(previousAct);

    if (previousActChapters.length > 0) {
      const lastChapterInPreviousAct =
        previousActChapters[previousActChapters.length - 1];
      const lastChapterScenes = getScenesInChapter(lastChapterInPreviousAct);

      if (lastChapterScenes.length > 0) {
        const lastSceneInPreviousAct =
          lastChapterScenes[lastChapterScenes.length - 1];
        return {
          scene: lastSceneInPreviousAct,
          info: {
            state: "cross-boundary",
            tooltip: `Last scene in ${previousAct.title} - ${lastChapterInPreviousAct.title}`,
            destinationContainer: `${previousAct.title} - ${lastChapterInPreviousAct.title}`,
          },
        };
      }
    }
  }

  // No previous scene available
  return {
    scene: null,
    info: { state: "disabled", tooltip: "First scene in novel" },
  };
};

// ===== ENHANCED CHAPTER NAVIGATION =====

export const getNextChapterWithInfo = (
  novel: NovelWithStructure | null,
  selectedChapter: Chapter | null,
  selectedAct: Act | null
): { chapter: Chapter | null; info: NavigationButtonInfo } => {
  if (!selectedChapter || !novel) {
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "No chapter selected" },
    };
  }

  if (!selectedAct) {
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "No act selected" },
    };
  }

  const chapters = getChaptersInAct(selectedAct);
  const currentIndex = findChapterIndexInAct(chapters, selectedChapter.id);

  if (currentIndex === -1) {
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "Chapter not found" },
    };
  }

  // Check if there's a next chapter in current act
  if (currentIndex < chapters.length - 1) {
    const nextChapter = chapters[currentIndex + 1];
    return {
      chapter: nextChapter,
      info: {
        state: "normal",
        tooltip: `Next Chapter: ${nextChapter.title}`,
      },
    };
  }

  // At end of act - look for next act
  const acts = getAllActsInNovel(novel);
  const currentActIndex = findActIndexInNovel(acts, selectedAct.id);

  if (currentActIndex < acts.length - 1) {
    const nextAct = acts[currentActIndex + 1];
    const nextActChapters = getChaptersInAct(nextAct);

    if (nextActChapters.length > 0) {
      const firstChapterInNextAct = nextActChapters[0];
      return {
        chapter: firstChapterInNextAct,
        info: {
          state: "cross-boundary",
          tooltip: `First chapter in ${nextAct.title}`,
          destinationContainer: nextAct.title,
        },
      };
    }
  }

  // No next chapter available
  return {
    chapter: null,
    info: { state: "disabled", tooltip: "Last chapter in novel" },
  };
};

export const getPreviousChapterWithInfo = (
  novel: NovelWithStructure | null,
  selectedChapter: Chapter | null,
  selectedAct: Act | null
): { chapter: Chapter | null; info: NavigationButtonInfo } => {
  if (!selectedChapter || !novel) {
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "No chapter selected" },
    };
  }

  if (!selectedAct) {
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "No act selected" },
    };
  }

  const chapters = getChaptersInAct(selectedAct);
  const currentIndex = findChapterIndexInAct(chapters, selectedChapter.id);

  if (currentIndex === -1) {
    return {
      chapter: null,
      info: { state: "disabled", tooltip: "Chapter not found" },
    };
  }

  // Check if there's a previous chapter in current act
  if (currentIndex > 0) {
    const previousChapter = chapters[currentIndex - 1];
    return {
      chapter: previousChapter,
      info: {
        state: "normal",
        tooltip: `Previous Chapter: ${previousChapter.title}`,
      },
    };
  }

  // At start of act - look for previous act
  const acts = getAllActsInNovel(novel);
  const currentActIndex = findActIndexInNovel(acts, selectedAct.id);

  if (currentActIndex > 0) {
    const previousAct = acts[currentActIndex - 1];
    const previousActChapters = getChaptersInAct(previousAct);

    if (previousActChapters.length > 0) {
      const lastChapterInPreviousAct =
        previousActChapters[previousActChapters.length - 1];
      return {
        chapter: lastChapterInPreviousAct,
        info: {
          state: "cross-boundary",
          tooltip: `Last chapter in ${previousAct.title}`,
          destinationContainer: previousAct.title,
        },
      };
    }
  }

  // No previous chapter available
  return {
    chapter: null,
    info: { state: "disabled", tooltip: "First chapter in novel" },
  };
};
