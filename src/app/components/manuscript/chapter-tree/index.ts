// src/app/components/manuscript/chapter-tree/index.ts
// Updated barrel exports for chapter-tree components

// Main components
export { EnhancedChapterTree as default } from "./enhanced-chapter-tree";
export { EnhancedChapterTree } from "./enhanced-chapter-tree";

// ✅ NEW: Drag-and-drop components
export { DraggableManuscriptTree } from "./draggable-manuscript-tree";
export { DraggableChapterContainer } from "./draggable-chapter-container";
export { DraggableSceneItem } from "./draggable-scene-item";

// Legacy components (if still needed)
export { EnhancedSceneItem } from "./enhanced-scene-item";
export { EnhancedChapterItem } from "./enhanced-chapter-item";
export { EnhancedActItem } from "./enhanced-act-item";
export { SortableChapterContainer } from "./sortable-chapter-container";

// Other components
export { AddActInterface } from "./add-act-interface";

// Types
export type {
  ChapterTreeProps,
  DeleteDialogState,
  BaseTreeItemProps,
  SceneItemProps,
  ChapterItemProps,
  ActItemProps,
  DeleteType,
  SceneStatus,
} from "./types";

// Utility functions
export { formatWordCount, getSceneStatus } from "./utils";
