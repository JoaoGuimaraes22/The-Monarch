// src/app/components/manuscript/contextual-import/utils.ts
// Clean utility functions for explicit target selection flow

import { NovelWithStructure } from "@/lib/novels";
import { ImportContext, ImportTarget, ImportMode } from "./types";

// ===== IMPORT CONTEXT CREATION =====

interface CreateImportContextParams {
  novel: NovelWithStructure;
}

/**
 * Create import context - now just novel structure, no "current" context needed
 */
export function createImportContext(
  params: CreateImportContextParams
): ImportContext {
  const { novel } = params;

  // Build complete acts structure with full hierarchy for selection
  const availableActs = novel.acts.map((act) => ({
    id: act.id,
    title: act.title,
    order: act.order,
    chapters: act.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      scenes: chapter.scenes.map((scene) => ({
        id: scene.id,
        title: scene.title || `Scene ${scene.order}`,
        order: scene.order,
      })),
    })),
  }));

  return {
    novelId: novel.id,
    novelTitle: novel.title,
    availableActs,
  };
}

// ===== EXPLICIT TARGET VALIDATION =====

/**
 * Validate import target based on explicit selection flow
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

  // Validate based on mode
  switch (target.mode) {
    case "new-act":
      // New act only requires position selection
      if (!target.position || target.position === "replace") {
        errors.push("Position must be selected for new act");
      }
      if (target.position === "specific" && !target.specificPosition) {
        errors.push("Specific position number is required");
      }
      break;

    case "new-chapter":
      // New chapter requires act selection and position
      if (!target.targetActId) {
        errors.push("Target act must be selected for new chapter");
      } else {
        const targetAct = context.availableActs.find(
          (act) => act.id === target.targetActId
        );
        if (!targetAct) {
          errors.push("Selected target act does not exist");
        }
      }
      if (!target.position || target.position === "replace") {
        errors.push("Position must be selected for new chapter");
      }
      if (target.position === "specific" && !target.specificPosition) {
        errors.push("Specific position number is required");
      }
      break;

    case "new-scene":
      // New scene requires act and chapter selection and position
      if (!target.targetActId) {
        errors.push("Target act must be selected for new scene");
      }
      if (!target.targetChapterId) {
        errors.push("Target chapter must be selected for new scene");
      } else {
        const targetChapter = context.availableActs
          .flatMap((act) => act.chapters)
          .find((ch) => ch.id === target.targetChapterId);
        if (!targetChapter) {
          errors.push("Selected target chapter does not exist");
        }
      }
      if (!target.position || target.position === "replace") {
        errors.push("Position must be selected for new scene");
      }
      if (target.position === "specific" && !target.specificPosition) {
        errors.push("Specific position number is required");
      }
      break;

    case "replace-act":
      // Replace act requires act selection only
      if (!target.targetActId) {
        errors.push("Target act must be selected for replacement");
      } else {
        const targetAct = context.availableActs.find(
          (act) => act.id === target.targetActId
        );
        if (!targetAct) {
          errors.push("Selected target act does not exist");
        } else {
          warnings.push(`Act "${targetAct.title}" will be completely replaced`);
        }
      }
      break;

    case "replace-chapter":
      // Replace chapter requires act and chapter selection
      if (!target.targetActId) {
        errors.push("Target act must be selected");
      }
      if (!target.targetChapterId) {
        errors.push("Target chapter must be selected for replacement");
      } else {
        const targetChapter = context.availableActs
          .flatMap((act) => act.chapters)
          .find((ch) => ch.id === target.targetChapterId);
        if (!targetChapter) {
          errors.push("Selected target chapter does not exist");
        } else {
          warnings.push(
            `Chapter "${targetChapter.title}" will be completely replaced`
          );
        }
      }
      break;

    case "replace-scene":
      // Replace scene requires act, chapter, and scene selection
      if (!target.targetActId) {
        errors.push("Target act must be selected");
      }
      if (!target.targetChapterId) {
        errors.push("Target chapter must be selected");
      }
      if (!target.targetSceneId) {
        errors.push("Target scene must be selected for replacement");
      } else {
        const targetScene = context.availableActs
          .flatMap((act) => act.chapters)
          .flatMap((ch) => ch.scenes)
          .find((sc) => sc.id === target.targetSceneId);
        if (!targetScene) {
          errors.push("Selected target scene does not exist");
        } else {
          warnings.push(
            `Scene "${targetScene.title}" will be completely replaced`
          );
        }
      }
      break;

    default:
      errors.push(`Unknown import mode: ${target.mode}`);
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
      const actPosition = getPositionDescription(
        target.position,
        target.specificPosition
      );
      return `Create a new act ${actPosition}`;

    case "new-chapter":
      const targetAct = context.availableActs.find(
        (act) => act.id === target.targetActId
      );
      const chapterPosition = getPositionDescription(
        target.position,
        target.specificPosition
      );
      return `Create a new chapter in "${
        targetAct?.title || "selected act"
      }" ${chapterPosition}`;

    case "new-scene":
      const targetActForScene = context.availableActs.find(
        (act) => act.id === target.targetActId
      );
      const targetChapter = targetActForScene?.chapters.find(
        (ch) => ch.id === target.targetChapterId
      );
      const scenePosition = getPositionDescription(
        target.position,
        target.specificPosition
      );
      return `Create new scenes in "${
        targetChapter?.title || "selected chapter"
      }" ${scenePosition}`;

    case "replace-act":
      const replaceAct = context.availableActs.find(
        (act) => act.id === target.targetActId
      );
      return `Replace "${
        replaceAct?.title || "selected act"
      }" with imported content`;

    case "replace-chapter":
      const replaceActForChapter = context.availableActs.find(
        (act) => act.id === target.targetActId
      );
      const replaceChapter = replaceActForChapter?.chapters.find(
        (ch) => ch.id === target.targetChapterId
      );
      return `Replace "${
        replaceChapter?.title || "selected chapter"
      }" with imported content`;

    case "replace-scene":
      const replaceActForScene = context.availableActs.find(
        (act) => act.id === target.targetActId
      );
      const replaceChapterForScene = replaceActForScene?.chapters.find(
        (ch) => ch.id === target.targetChapterId
      );
      const replaceScene = replaceChapterForScene?.scenes.find(
        (sc) => sc.id === target.targetSceneId
      );
      return `Replace "${
        replaceScene?.title || "selected scene"
      }" with imported content`;

    default:
      return "Import document content";
  }
}

/**
 * Get a human-readable position description
 */
function getPositionDescription(
  position: ImportTarget["position"],
  specificPosition?: number
): string {
  switch (position) {
    case "beginning":
      return "at the beginning";
    case "end":
      return "at the end";
    case "specific":
      return `at position ${specificPosition}`;
    default:
      return "";
  }
}

// ===== SELECTION HELPERS =====

/**
 * Get display text for target selection (Order • Title format)
 */
export function getTargetDisplayText(
  type: "act" | "chapter" | "scene",
  item: { order: number; title: string }
): string {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  return `${typeLabel} ${item.order} • ${item.title}`;
}

/**
 * Get chapters for a specific act
 */
export function getChaptersForAct(
  context: ImportContext,
  actId: string
): Array<{
  id: string;
  title: string;
  order: number;
  scenes: Array<{ id: string; title: string; order: number }>;
}> {
  const act = context.availableActs.find((act) => act.id === actId);
  return act?.chapters || [];
}

/**
 * Get scenes for a specific chapter
 */
export function getScenesForChapter(
  context: ImportContext,
  chapterId: string
): Array<{ id: string; title: string; order: number }> {
  const chapter = context.availableActs
    .flatMap((act) => act.chapters)
    .find((ch) => ch.id === chapterId);
  return chapter?.scenes || [];
}

// ===== POSITION HELPERS =====

/**
 * Calculate what happens to existing items when inserting at a specific position
 */
export function calculatePositionBumping(
  targetPosition: number,
  existingItems: Array<{ order: number; title: string }>,
  newItemCount: number = 1
): {
  itemsToMove: Array<{
    title: string;
    oldPosition: number;
    newPosition: number;
  }>;
  preview: string;
} {
  const itemsToMove = existingItems
    .filter((item) => item.order >= targetPosition)
    .map((item) => ({
      title: item.title,
      oldPosition: item.order,
      newPosition: item.order + newItemCount,
    }));

  let preview = "";
  if (itemsToMove.length > 0) {
    if (itemsToMove.length === 1) {
      preview = `${itemsToMove[0].title} becomes position ${itemsToMove[0].newPosition}`;
    } else {
      preview = `${itemsToMove.length} items shift to positions ${itemsToMove[0].newPosition}+`;
    }
  }

  return { itemsToMove, preview };
}

/**
 * Get available positions for a target
 */
export function getAvailablePositions(
  existingItems: Array<{ order: number }>
): Array<{ value: number; label: string; description?: string }> {
  const maxOrder = existingItems.length;
  const positions = [];

  // Beginning
  positions.push({
    value: 1,
    label: "Beginning",
    description: "Insert at the very start",
  });

  // Specific positions (2 through max+1)
  for (let i = 2; i <= maxOrder + 1; i++) {
    if (i === maxOrder + 1) {
      positions.push({
        value: i,
        label: "End",
        description: "Insert at the very end",
      });
    } else {
      positions.push({
        value: i,
        label: `Position ${i}`,
        description: `Insert before current position ${i}`,
      });
    }
  }

  return positions;
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
    scenes: context.availableActs.reduce(
      (sum, act) =>
        sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
      0
    ),
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

    case "new-chapter":
      newStructure.chapters += 1;
      newStructure.scenes += importedStructure.scenes || 0;
      break;

    case "new-scene":
      newStructure.scenes += importedStructure.scenes || 0;
      break;

    case "replace-act":
    case "replace-chapter":
    case "replace-scene":
      // Structure count stays the same for replacements, just content changes
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
