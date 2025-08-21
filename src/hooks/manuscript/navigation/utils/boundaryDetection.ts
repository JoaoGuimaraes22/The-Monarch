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

  if (currentChapterIndex === -1) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "Chapter not found" },
    };
  }

  // Check next chapter in current act
  if (currentChapterIndex < chapters.length - 1) {
    const nextChapter = chapters[currentChapterIndex + 1];
    const nextChapterScenes = getScenesInChapter(nextChapter);

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
  const acts = getAllActsInNovel(novel);
  const currentActIndex = findActIndexInNovel(acts, selectedAct.id);

  if (currentActIndex < acts.length - 1) {
    const nextAct = acts[currentActIndex + 1];
    const nextActChapters = getChaptersInAct(nextAct);

    if (nextActChapters.length > 0) {
      const firstChapter = nextActChapters[0];
      const firstScenes = getScenesInChapter(firstChapter);

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
    const prevScene = scenes[currentIndex - 1];
    return {
      scene: prevScene,
      info: {
        state: "normal",
        tooltip: `Previous Scene: ${
          prevScene.title || `Scene ${prevScene.order}`
        }`,
      },
    };
  }

  // At beginning of chapter - look for previous chapter
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

  if (currentChapterIndex === -1) {
    return {
      scene: null,
      info: { state: "disabled", tooltip: "Chapter not found" },
    };
  }

  // Check previous chapter in current act
  if (currentChapterIndex > 0) {
    const prevChapter = chapters[currentChapterIndex - 1];
    const prevChapterScenes = getScenesInChapter(prevChapter);

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
  const acts = getAllActsInNovel(novel);
  const currentActIndex = findActIndexInNovel(acts, selectedAct.id);

  if (currentActIndex > 0) {
    const prevAct = acts[currentActIndex - 1];
    const prevActChapters = getChaptersInAct(prevAct);

    if (prevActChapters.length > 0) {
      const lastChapter = prevActChapters[prevActChapters.length - 1];
      const lastScenes = getScenesInChapter(lastChapter);

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
    const prevChapter = chapters[currentIndex - 1];
    return {
      chapter: prevChapter,
      info: {
        state: "normal",
        tooltip: `Previous Chapter: ${prevChapter.title}`,
      },
    };
  }

  // At beginning of act - look for previous act
  const acts = getAllActsInNovel(novel);
  const currentActIndex = findActIndexInNovel(acts, selectedAct.id);

  if (currentActIndex > 0) {
    const prevAct = acts[currentActIndex - 1];
    const prevActChapters = getChaptersInAct(prevAct);

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
};
