// src/app/components/manuscript/manuscript-editor/content-views/types.ts
// Content view types and interfaces

export type ContentDisplayMode = "document" | "grid";

export interface ViewInfo {
  title: string;
  subtitle: string;
  wordCount: number;
  sceneCount: number;
}
