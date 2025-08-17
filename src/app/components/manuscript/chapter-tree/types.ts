// chapter-tree/types.ts
import { NovelWithStructure, Act, Chapter, Scene } from "@/lib/novels";

// Delete dialog state
export interface DeleteDialogState {
  isOpen: boolean;
  type: "scene" | "chapter" | "act" | "structure" | null;
  id: string;
  title: string;
  isDeleting: boolean;
}

// Main ChapterTree props
export interface ChapterTreeProps {
  novel: NovelWithStructure;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onActSelect?: (act: Act) => void;
  onRefresh: () => void;
}

// Common tree item props
export interface BaseTreeItemProps {
  level: number;
  children?: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  isSelected?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

// Scene item specific props
export interface SceneItemProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: (sceneId: string, scene: Scene) => void;
  onDelete: (sceneId: string, title: string) => void;
}

// Chapter item specific props
export interface ChapterItemProps {
  chapter: Chapter;
  isSelected: boolean;
  isExpanded: boolean;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  onToggle: () => void;
  onSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onDelete: (chapterId: string, title: string) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
}

// Act item specific props
export interface ActItemProps {
  act: Act;
  isSelected: boolean;
  isExpanded: boolean;
  expandedChapters: Set<string>;
  selectedSceneId?: string;
  selectedChapterId?: string;
  selectedActId?: string;
  onToggle: () => void;
  onSelect: (act: Act) => void;
  onChapterToggle: (chapterId: string) => void;
  onChapterSelect: (chapter: Chapter) => void;
  onSceneSelect: (sceneId: string, scene: Scene) => void;
  onDelete: (actId: string, title: string) => void;
  onChapterDelete: (chapterId: string, title: string) => void;
  onSceneDelete: (sceneId: string, title: string) => void;
}

// Utility types
export type DeleteType = "scene" | "chapter" | "act" | "structure";

export interface SceneStatus {
  icon: string;
  color: string;
}
