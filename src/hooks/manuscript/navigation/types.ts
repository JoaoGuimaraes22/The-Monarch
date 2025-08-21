// src/hooks/manuscript/navigation/types.ts
// Clean navigation types with separation of concerns

import { NovelWithStructure, Scene, Chapter, Act } from "@/lib/novels";

export interface NavigationItem {
  id: string;
  title: string;
  order: number;
  isCurrent: boolean;
}

// Primary navigation changes view focus/selection
export interface PrimaryNavigation {
  type: "scene" | "chapter" | "act";
  current: NavigationItem | null;
  items: NavigationItem[];
  hasNext: boolean;
  hasPrevious: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (itemId: string) => void; // Changes view focus
}

// Secondary navigation just scrolls within current view
export interface SecondaryNavigation {
  type: "scene" | "chapter";
  current: NavigationItem | null;
  items: NavigationItem[];
  hasNext: boolean;
  hasPrevious: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onScrollTo: (itemId: string) => void; // Just scrolls, no state change
}

// View-specific navigation configurations
export interface SceneViewNavigation {
  primary: PrimaryNavigation;
}

export interface ChapterViewNavigation {
  primary: PrimaryNavigation; // Chapter selection
  secondary: SecondaryNavigation; // Scene scrolling
}

export interface ActViewNavigation {
  primary: PrimaryNavigation; // Act selection
  secondary: SecondaryNavigation; // Chapter scrolling
}

// Union type for all navigation contexts
export type NavigationContext =
  | { viewMode: "scene"; navigation: SceneViewNavigation }
  | { viewMode: "chapter"; navigation: ChapterViewNavigation }
  | { viewMode: "act"; navigation: ActViewNavigation };

// Configuration for the navigation system
export interface NavigationConfig {
  novel: NovelWithStructure | null;
  selectedScene: Scene | null;
  selectedChapter: Chapter | null;
  selectedAct: Act | null;
  viewMode: "scene" | "chapter" | "act";
  contentDisplayMode: "document" | "grid";
}

// Main navigation hook return interface
export interface NavigationHandlers {
  getNavigationContext: () => NavigationContext;

  // Primary selection handlers (change view focus)
  selectScene: (sceneId: string) => void;
  selectChapter: (chapterId: string) => void;
  selectAct: (actId: string) => void;

  // Secondary scroll handlers (just scroll within view)
  scrollToScene: (sceneId: string) => void;
  scrollToChapter: (chapterId: string) => void;
}
