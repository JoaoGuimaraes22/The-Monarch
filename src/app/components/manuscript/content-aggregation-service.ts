import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";

export interface ContentSection {
  id: string;
  type: "scene" | "chapter" | "act";
  title: string;
  content: string;
  wordCount: number;
  scenes: Scene[]; // For navigation
}

export interface AggregatedContent {
  sections: ContentSection[];
  totalWordCount: number;
  sceneMap: Map<string, { sectionIndex: number; sceneIndex: number }>; // For jump-to functionality
}

export const contentAggregationService = {
  // Get single scene content (current behavior)
  getSceneContent(scene: Scene): AggregatedContent {
    const section: ContentSection = {
      id: scene.id,
      type: "scene",
      title: `Scene ${scene.order}`,
      content: scene.content,
      wordCount: scene.wordCount,
      scenes: [scene],
    };

    const sceneMap = new Map();
    sceneMap.set(scene.id, { sectionIndex: 0, sceneIndex: 0 });

    return {
      sections: [section],
      totalWordCount: scene.wordCount,
      sceneMap,
    };
  },

  // Get all scenes in a chapter, concatenated
  getChapterContent(chapter: Chapter): AggregatedContent {
    const sortedScenes = [...chapter.scenes].sort((a, b) => a.order - b.order);

    // Create scene boundary separator
    const createSceneSeparator = (scene: Scene) =>
      `<div class="scene-boundary" data-scene-id="${scene.id}" style="margin: 2rem 0; text-align: center; border-top: 1px solid #4b5563; border-bottom: 1px solid #4b5563; padding: 1rem; color: #9ca3af;">
        <strong>Scene ${scene.order}</strong>
      </div>`;

    // Combine all scene content with separators
    let combinedContent = "";
    const sceneMap = new Map();

    sortedScenes.forEach((scene, index) => {
      if (index > 0) {
        combinedContent += createSceneSeparator(scene);
      }
      combinedContent += scene.content;
      sceneMap.set(scene.id, { sectionIndex: 0, sceneIndex: index });
    });

    const section: ContentSection = {
      id: chapter.id,
      type: "chapter",
      title: chapter.title,
      content: combinedContent,
      wordCount: sortedScenes.reduce((sum, scene) => sum + scene.wordCount, 0),
      scenes: sortedScenes,
    };

    return {
      sections: [section],
      totalWordCount: section.wordCount,
      sceneMap,
    };
  },

  // ✨ FIXED: Get all chapters in an act as SEPARATE SECTIONS
  getActContent(act: Act): AggregatedContent {
    const sortedChapters = [...act.chapters].sort((a, b) => a.order - b.order);
    const sceneMap = new Map();
    let totalWordCount = 0;
    const sections: ContentSection[] = [];

    // ✨ NEW: Create a separate section for each chapter
    sortedChapters.forEach((chapter, chapterIndex) => {
      const sortedScenes = [...chapter.scenes].sort(
        (a, b) => a.order - b.order
      );

      // For document view: create concatenated content with scene separators
      const createSceneSeparator = (scene: Scene) =>
        `<div class="scene-boundary" data-scene-id="${scene.id}" style="margin: 2rem 0; text-align: center; border-top: 1px solid #4b5563; border-bottom: 1px solid #4b5563; padding: 1rem; color: #9ca3af;">
          <strong>Scene ${scene.order}</strong>
        </div>`;

      let chapterContent = "";
      sortedScenes.forEach((scene, sceneIndex) => {
        if (sceneIndex > 0) {
          chapterContent += createSceneSeparator(scene);
        }
        chapterContent += scene.content;

        // Track scene positions within this chapter section
        sceneMap.set(scene.id, {
          sectionIndex: chapterIndex,
          sceneIndex: sceneIndex,
        });
      });

      const chapterWordCount = sortedScenes.reduce(
        (sum, scene) => sum + scene.wordCount,
        0
      );

      // Create section for this chapter
      const chapterSection: ContentSection = {
        id: chapter.id,
        type: "chapter", // ✨ Keep as "chapter" so we know this is a chapter within an act
        title: `${act.title}: ${chapter.title}`, // ✨ Include act context for grid display
        content: chapterContent,
        wordCount: chapterWordCount,
        scenes: sortedScenes,
      };

      sections.push(chapterSection);
      totalWordCount += chapterWordCount;
    });

    return {
      sections, // ✨ Multiple sections (one per chapter)
      totalWordCount,
      sceneMap,
    };
  },

  // ✨ ENHANCED: Act content with "Add Scene" and "Add Chapter" buttons
  getActContentCombined(act: Act): AggregatedContent {
    const sortedChapters = [...act.chapters].sort((a, b) => a.order - b.order);
    const sceneMap = new Map();
    let totalWordCount = 0;

    // Create chapter separator
    const createChapterSeparator = (chapter: Chapter) =>
      `<div class="chapter-boundary" style="margin: 3rem 0; text-align: center; border-top: 2px solid #dc2626; border-bottom: 2px solid #dc2626; padding: 2rem; color: #dc2626;">
        <h2 style="font-size: 1.5rem; font-weight: bold; margin: 0;">${chapter.title}</h2>
      </div>`;

    // Create scene separator within chapter
    const createSceneSeparator = (scene: Scene) =>
      `<div class="scene-boundary" data-scene-id="${scene.id}" style="margin: 2rem 0; text-align: center; border-top: 1px solid #4b5563; border-bottom: 1px solid #4b5563; padding: 1rem; color: #9ca3af;">
        <strong>Scene ${scene.order}</strong>
      </div>`;

    // ✨ NEW: Create "Add Scene" button
    const createAddSceneButton = (chapterId: string, afterSceneId?: string) =>
      `<div class="add-scene-button" data-chapter-id="${chapterId}" data-after-scene-id="${
        afterSceneId || ""
      }" style="margin: 3rem 0; text-align: center; padding: 2rem; border: 2px dashed #4b5563; border-radius: 8px; background: #1f2937; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#dc2626'; this.style.backgroundColor='#2d1b1b';" onmouseout="this.style.borderColor='#4b5563'; this.style.backgroundColor='#1f2937';">
        <div style="color: #dc2626; font-weight: bold; font-size: 1.1rem; margin-bottom: 0.5rem;">✨ Add Scene</div>
        <div style="color: #9ca3af; font-size: 0.9rem;">Click to insert a new scene here</div>
      </div>`;

    // ✨ NEW: Create "Add Chapter" button
    const createAddChapterButton = (actId: string, afterChapterId?: string) =>
      `<div class="add-chapter-button" data-act-id="${actId}" data-after-chapter-id="${
        afterChapterId || ""
      }" style="margin: 4rem 0; text-align: center; padding: 3rem; border: 3px dashed #dc2626; border-radius: 12px; background: #2d1b1b; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#ef4444'; this.style.backgroundColor='#3c1b1b';" onmouseout="this.style.borderColor='#dc2626'; this.style.backgroundColor='#2d1b1b';">
        <div style="color: #ef4444; font-weight: bold; font-size: 1.3rem; margin-bottom: 0.5rem;">📖 Add Chapter</div>
        <div style="color: #dc2626; font-size: 1rem;">Click to insert a new chapter here</div>
      </div>`;

    let combinedContent = "";
    let sceneCounter = 0;

    sortedChapters.forEach((chapter, chapterIndex) => {
      const sortedScenes = [...chapter.scenes].sort(
        (a, b) => a.order - b.order
      );

      // Add chapter separator (except for first chapter)
      if (chapterIndex > 0) {
        combinedContent += createChapterSeparator(chapter);
      }

      sortedScenes.forEach((scene, sceneIndex) => {
        // Add scene separator (except for first scene in first chapter)
        if (sceneCounter > 0) {
          combinedContent += createSceneSeparator(scene);
        }
        combinedContent += scene.content;

        // Add "Add Scene" button after each scene
        combinedContent += createAddSceneButton(chapter.id, scene.id);

        sceneMap.set(scene.id, { sectionIndex: 0, sceneIndex: sceneCounter });
        sceneCounter++;
      });

      // If chapter has no scenes, add an "Add Scene" button
      if (sortedScenes.length === 0) {
        combinedContent += createAddSceneButton(chapter.id);
      }

      const chapterWordCount = sortedScenes.reduce(
        (sum, scene) => sum + scene.wordCount,
        0
      );
      totalWordCount += chapterWordCount;

      // Add "Add Chapter" button after each chapter
      combinedContent += createAddChapterButton(act.id, chapter.id);
    });

    // If no chapters exist, add an "Add Chapter" button at the beginning
    if (sortedChapters.length === 0) {
      combinedContent = createAddChapterButton(act.id);
    }

    const allScenes = sortedChapters.flatMap((chapter) =>
      [...chapter.scenes].sort((a, b) => a.order - b.order)
    );

    const section: ContentSection = {
      id: act.id,
      type: "act",
      title: act.title,
      content: combinedContent,
      wordCount: totalWordCount,
      scenes: allScenes,
    };

    return {
      sections: [section],
      totalWordCount,
      sceneMap,
    };
  },

  // Main aggregation function - finds the right content based on what's selected
  aggregateContent(
    novel: NovelWithStructure,
    viewMode: "scene" | "chapter" | "act",
    selectedScene: Scene | null,
    contentDisplayMode?: "document" | "grid" // ✨ NEW: Add display mode parameter
  ): AggregatedContent | null {
    if (!selectedScene || !novel.acts) return null;

    // Find which chapter and act contain the selected scene
    let currentChapter: Chapter | null = null;
    let currentAct: Act | null = null;

    for (const act of novel.acts) {
      for (const chapter of act.chapters) {
        if (chapter.scenes.some((scene) => scene.id === selectedScene.id)) {
          currentChapter = chapter;
          currentAct = act;
          break;
        }
      }
      if (currentChapter) break;
    }

    if (!currentChapter || !currentAct) return null;

    switch (viewMode) {
      case "scene":
        return this.getSceneContent(selectedScene);
      case "chapter":
        return this.getChapterContent(currentChapter);
      case "act":
        // ✨ FIXED: Choose method based on display mode
        if (contentDisplayMode === "document") {
          // For document view: use combined content with separators and add buttons
          return this.getActContentCombined(currentAct);
        } else {
          // For grid view: use separate sections per chapter
          return this.getActContent(currentAct);
        }
      default:
        return null;
    }
  },
};
