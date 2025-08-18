// src/app/components/manuscript/manuscript-editor/content-views/index.ts
// All content view components - different ways to display and edit manuscript content

// Document view (main content area)
export { ManuscriptContentArea } from "./manuscript-content-area";

// Grid view components
export * from "./grid-view";

// Content view related types
export type ViewInfo = {
  title: string;
  subtitle: string;
  wordCount: number;
  sceneCount: number;
};
