// chapter-tree/index.ts

// Main component (default export)
export { EnhancedChapterTree as default } from "./enhanced-chapter-tree";
export { EnhancedChapterTree } from "./enhanced-chapter-tree";

// Sub-components (if needed elsewhere)
export { EnhancedSceneItem } from "./enhanced-scene-item";
export { EnhancedChapterItem } from "./enhanced-chapter-item";
export { EnhancedActItem } from "./enhanced-act-item";

// Types (if needed elsewhere)
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

// Utility functions (if needed elsewhere)
export { formatWordCount, getSceneStatus } from "./utils";
