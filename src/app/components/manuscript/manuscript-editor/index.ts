// src/app/components/manuscript/manuscript-editor/index.ts
// Barrel exports for manuscript-editor components - organized by category

// Main component (default export)
export { ManuscriptEditor as default } from "./manuscript-editor";
export { ManuscriptEditor } from "./manuscript-editor";

// Layout components
export * from "./layout";

// Content view components
export * from "./content-views";

// UI controls
export * from "./controls";

// Services (business logic)
export * from "./services";

// Direct exports for backward compatibility (if needed)
export { ManuscriptHeader } from "./layout/manuscript-header";
export { ManuscriptStructureSidebar } from "./layout/manuscript-structure-sidebar";
export { ManuscriptMetadataSidebar } from "./layout/manuscript-metadata-sidebar";
export { ManuscriptContentArea } from "./content-views/manuscript-content-area";
export { SceneCard } from "./content-views/grid-view/scene-card";
export { SceneGrid } from "./content-views/grid-view/scene-grid";
export { ViewModeSelector } from "./controls/view-mode-selector";

// Re-export key types
export type { ViewMode } from "./controls/view-mode-selector";
// export type { ContentDisplayMode } from "./content-views";
export type { ViewInfo } from "./content-views";
