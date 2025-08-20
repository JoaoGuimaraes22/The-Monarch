// src/app/components/manuscript/contextual-import/utils.ts
// Utility functions for contextual import system

import { NovelWithStructure, Scene } from "@/lib/novels";
import { ImportContext, ImportTarget, ImportMode, ViewMode } from "./types";

// ===== IMPORT CONTEXT CREATION =====

interface CreateImportContextParams {
  novel: NovelWithStructure;
  selectedScene?: Scene | null;
  selectedChapterId?: string;
  selectedActId?: string;
  contentDisplayMode?: string;
}

/**
 * Create import context from current manuscript editor state
 */
export function createImportContext(
  params: CreateImportContextParams
): ImportContext {
  const {
    novel,
    selectedScene,
    selectedChapterId,
    selectedActId,
    contentDisplayMode,
  } = params;

  // Find current act
  let currentAct = selectedActId
    ? novel.acts.find((act) => act.id === selectedActId)
    : null;

  // If no act selected but we have a scene, find the act through the scene's chapter
  if (!currentAct && selectedScene) {
    const sceneChapter = novel.acts
      .flatMap((act) => act.chapters)
      .find((ch) => ch.id === selectedScene.chapterId);
    if (sceneChapter) {
      currentAct = novel.acts.find((act) => act.id === sceneChapter.actId);
    }
  }

  // Find current chapter
  let currentChapter = selectedChapterId
    ? novel.acts
        .flatMap((act) => act.chapters)
        .find((ch) => ch.id === selectedChapterId)
    : null;

  // If no chapter selected but we have a scene, find the chapter
  if (!currentChapter && selectedScene) {
    currentChapter = novel.acts
      .flatMap((act) => act.chapters)
      .find((ch) => ch.id === selectedScene.chapterId);
  }

  // Determine view mode
  const viewMode = determineViewMode({
    contentDisplayMode,
    hasSelectedScene: !!selectedScene,
    hasSelectedChapter: !!selectedChapterId,
    hasSelectedAct: !!selectedActId,
  });

  // Build available acts structure
  const availableActs = novel.acts.map((act) => ({
    id: act.id,
    title: act.title,
    order: act.order,
    chapters: act.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
    })),
  }));

  return {
    novelId: novel.id,
    currentAct: currentAct
      ? {
          id: currentAct.id,
          title: currentAct.title,
          order: currentAct.order,
        }
      : undefined,
    currentChapter: currentChapter
      ? {
          id: currentChapter.id,
          title: currentChapter.title,
          order: currentChapter.order,
          actId: currentChapter.actId,
        }
      : undefined,
    currentScene: selectedScene
      ? {
          id: selectedScene.id,
          title: selectedScene.title || `Scene ${selectedScene.order}`,
          order: selectedScene.order,
          chapterId: selectedScene.chapterId,
        }
      : undefined,
    viewMode,
    availableActs,
  };
}

// ===== VIEW MODE DETERMINATION =====

interface DetermineViewModeParams {
  contentDisplayMode?: string;
  hasSelectedScene: boolean;
  hasSelectedChapter: boolean;
  hasSelectedAct: boolean;
}

/**
 * Determine the current view mode from editor state
 */
export function determineViewMode(params: DetermineViewModeParams): ViewMode {
  const {
    contentDisplayMode,
    hasSelectedScene,
    hasSelectedChapter,
    hasSelectedAct,
  } = params;

  // Check if we're in document view mode
  if (contentDisplayMode === "document") {
    if (hasSelectedScene) return "scene";
    if (hasSelectedChapter) return "chapter";
    if (hasSelectedAct) return "act";
    return "novel";
  }

  // Check grid or sidebar view
  if (hasSelectedScene) return "scene";
  if (hasSelectedChapter) return "chapter";
  if (hasSelectedAct) return "act";
  return "novel";
}

// ===== IMPORT TARGET VALIDATION =====

/**
 * Validate that an import target is compatible with the current context
 */
export function validateImportTarget(
  target: ImportTarget,
  context: ImportContext
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check mode-specific requirements
  switch (target.mode) {
    case "add-to-act":
      if (!target.targetId) {
        errors.push("Target act must be selected for add-to-act mode");
      } else if (
        !context.availableActs.find((act) => act.id === target.targetId)
      ) {
        errors.push("Selected target act does not exist");
      }
      break;

    case "add-to-chapter":
      if (!target.targetId) {
        errors.push("Target chapter must be selected for add-to-chapter mode");
      } else {
        const targetChapter = context.availableActs
          .flatMap((act) => act.chapters)
          .find((ch) => ch.id === target.targetId);
        if (!targetChapter) {
          errors.push("Selected target chapter does not exist");
        }
      }
      break;

    case "replace-scene":
      if (!context.currentScene) {
        errors.push("No current scene selected for replacement");
      }
      break;

    case "insert-scene":
      if (!context.currentScene) {
        errors.push("No current scene selected for insertion reference");
      }
      if (
        !target.position ||
        (target.position !== "before" && target.position !== "after")
      ) {
        errors.push(
          'Insert position must be "before" or "after" for scene insertion'
        );
      }
      break;

    case "new-act":
    case "new-chapter":
      // These don't require additional validation
      break;

    default:
      errors.push(`Unknown import mode: ${target.mode}`);
  }

  // Add contextual warnings
  if (target.mode === "replace-scene" && context.currentScene) {
    warnings.push("Current scene content will be completely replaced");
  }

  if (
    target.mode === "add-to-act" &&
    context.currentAct?.id === target.targetId
  ) {
    warnings.push("Adding content to the currently active act");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ===== DESCRIPTION FORMATTING =====

/**
 * Format a human-readable description of what the import will do
 */
export function formatImportDescription(
  target: ImportTarget,
  context: ImportContext
): string {
  switch (target.mode) {
    case "new-act":
      return "Create a new act with the imported content";

    case "add-to-act":
      const targetAct = context.availableActs.find(
        (act) => act.id === target.targetId
      );
      return `Add chapters to "${targetAct?.title || "selected act"}"`;

    case "new-chapter":
      if (context.currentAct) {
        return `Create a new chapter in "${context.currentAct.title}"`;
      }
      return "Create a new chapter";

    case "add-to-chapter":
      if (context.currentChapter) {
        return `Add scenes to "${context.currentChapter.title}"`;
      }
      return "Add scenes to current chapter";

    case "replace-scene":
      if (context.currentScene) {
        return `Replace "${context.currentScene.title}" with imported content`;
      }
      return "Replace current scene";

    case "insert-scene":
      if (context.currentScene) {
        const position = target.position === "before" ? "before" : "after";
        return `Insert new scene ${position} "${context.currentScene.title}"`;
      }
      return "Insert new scene";

    default:
      return "Import document content";
  }
}

// ===== CONTEXT DISPLAY HELPERS =====

/**
 * Get the current context as a readable string
 */
export function getContextDisplayString(context: ImportContext): string {
  const parts: string[] = [];

  if (context.currentAct) parts.push(context.currentAct.title);
  if (context.currentChapter) parts.push(context.currentChapter.title);
  if (context.currentScene) parts.push(context.currentScene.title);

  return parts.length > 0 ? parts.join(" > ") : "Novel Root";
}

/**
 * Get a short context description for tooltips
 */
export function getContextTooltip(context: ImportContext): string {
  switch (context.viewMode) {
    case "scene":
      return `Current: ${context.currentScene?.title || "Scene"}`;
    case "chapter":
      return `Current: ${context.currentChapter?.title || "Chapter"}`;
    case "act":
      return `Current: ${context.currentAct?.title || "Act"}`;
    case "novel":
      return "Novel level";
    default:
      return "Unknown context";
  }
}

// ===== IMPORT MODE HELPERS =====

/**
 * Get recommended import modes based on current context
 */
export function getRecommendedModes(context: ImportContext): ImportMode[] {
  const recommended: ImportMode[] = [];

  switch (context.viewMode) {
    case "scene":
      recommended.push("add-to-chapter", "insert-scene", "replace-scene");
      break;
    case "chapter":
      recommended.push("add-to-chapter", "add-to-act", "new-chapter");
      break;
    case "act":
      recommended.push("add-to-act", "new-chapter", "new-act");
      break;
    case "novel":
      recommended.push("new-act", "new-chapter");
      break;
  }

  return recommended;
}

/**
 * Check if an import mode is available in the current context
 */
export function isModeAvailable(
  mode: ImportMode,
  context: ImportContext
): boolean {
  switch (mode) {
    case "new-act":
    case "new-chapter":
      return true; // Always available

    case "add-to-act":
      return context.availableActs.length > 0;

    case "add-to-chapter":
      return (
        !!context.currentChapter ||
        context.availableActs.some((act) => act.chapters.length > 0)
      );

    case "replace-scene":
    case "insert-scene":
      return !!context.currentScene;

    default:
      return false;
  }
}

// ===== FILE VALIDATION =====

/**
 * Validate uploaded file for contextual import
 */
export function validateImportFile(file: File): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check file type
  if (!file.name.toLowerCase().endsWith(".docx")) {
    errors.push("Only .docx files are supported");
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push("File size must be less than 10MB");
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push("File appears to be empty");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ===== MERGE PREVIEW HELPERS =====

/**
 * Calculate what the structure will look like after import
 */
export function calculateMergePreview(
  context: ImportContext,
  target: ImportTarget,
  importedStructure: {
    acts: number;
    chapters: number;
    scenes: number;
    wordCount: number;
  }
) {
  // Get current structure
  const currentStructure = {
    acts: context.availableActs.length,
    chapters: context.availableActs.reduce(
      (sum, act) => sum + act.chapters.length,
      0
    ),
    scenes: 0, // Would need to be calculated from full novel structure
    wordCount: 0, // Would need to be calculated from full novel structure
  };

  // Calculate changes based on import mode
  const newStructure = { ...currentStructure };

  switch (target.mode) {
    case "new-act":
      newStructure.acts += importedStructure.acts || 1;
      newStructure.chapters += importedStructure.chapters || 0;
      newStructure.scenes += importedStructure.scenes || 0;
      break;

    case "add-to-act":
      newStructure.chapters += importedStructure.chapters || 0;
      newStructure.scenes += importedStructure.scenes || 0;
      break;

    case "new-chapter":
      newStructure.chapters += 1;
      newStructure.scenes += importedStructure.scenes || 0;
      break;

    case "add-to-chapter":
      newStructure.scenes += importedStructure.scenes || 0;
      break;

    case "replace-scene":
      // Scene count stays the same, just content changes
      break;

    case "insert-scene":
      newStructure.scenes += importedStructure.scenes || 1;
      break;
  }

  newStructure.wordCount += importedStructure.wordCount || 0;

  return {
    before: currentStructure,
    after: newStructure,
    changes: {
      acts: newStructure.acts - currentStructure.acts,
      chapters: newStructure.chapters - currentStructure.chapters,
      scenes: newStructure.scenes - currentStructure.scenes,
      wordCount: newStructure.wordCount - currentStructure.wordCount,
    },
  };
}
