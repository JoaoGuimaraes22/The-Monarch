// Barrel exports for manuscript-editor components

// Main component (default export)
export { ManuscriptEditor as default } from "./manuscript-editor";
export { ManuscriptEditor } from "./manuscript-editor";

// Sub-components (if needed elsewhere)
export { ManuscriptHeader } from "./manuscript-header";
export { ManuscriptStructureSidebar } from "./manuscript-structure-sidebar";
export { ManuscriptMetadataSidebar } from "./manuscript-metadata-sidebar";
export { ManuscriptContentArea } from "./manuscript-content-area";

// ✨ NEW: Export grid view components
export { SceneCard } from "./scene-card";
export { SceneGrid } from "./scene-grid";

// Re-export the ViewMode type from the view-mode-selector
export type { ViewMode } from "@/app/components/manuscript/manuscript-editor/view-mode-selector";

// ✨ NEW: Export ContentDisplayMode type
export type { ContentDisplayMode } from "./manuscript-header";

// Re-export types that components need
export type ViewInfo = {
  title: string;
  subtitle: string;
  wordCount: number;
  sceneCount: number;
};
