// chapter-tree/index.ts

// Main component (default export)
export { ChapterTree as default } from "./chapter-tree";
export { ChapterTree } from "./chapter-tree";

// Sub-components (if needed elsewhere)
export { TreeItem } from "./tree-item";
export { SceneItem } from "./scene-item";
export { ChapterItem } from "./chapter-item";
export { ActItem } from "./act-item";

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
