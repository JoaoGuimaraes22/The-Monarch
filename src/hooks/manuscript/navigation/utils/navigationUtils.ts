// src/hooks/manuscript/navigation/utils/navigationUtils.ts
// Basic navigation utilities and item builders

import { Scene, Chapter, Act } from "@/lib/novels";
import { NavigationItem } from "../types";

// ===== COLLECTION UTILITIES =====

export const getScenesInChapter = (chapter: Chapter | null): Scene[] => {
  if (!chapter) return [];
  return [...chapter.scenes].sort((a, b) => a.order - b.order);
};

export const getChaptersInAct = (act: Act | null): Chapter[] => {
  if (!act) return [];
  return [...act.chapters].sort((a, b) => a.order - b.order);
};

export const getAllActsInNovel = (novel: { acts: Act[] } | null): Act[] => {
  if (!novel) return [];
  return [...novel.acts].sort((a, b) => a.order - b.order);
};

// ===== NAVIGATION ITEM BUILDERS =====

export const buildSceneItems = (
  scenes: Scene[],
  selectedSceneId?: string
): NavigationItem[] => {
  return scenes.map((scene) => ({
    id: scene.id,
    title: scene.title || `Scene ${scene.order}`,
    order: scene.order,
    isCurrent: scene.id === selectedSceneId,
  }));
};

export const buildChapterItems = (
  chapters: Chapter[],
  selectedChapterId?: string
): NavigationItem[] => {
  return chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    order: chapter.order,
    isCurrent: chapter.id === selectedChapterId,
  }));
};

export const buildActItems = (
  acts: Act[],
  selectedActId?: string
): NavigationItem[] => {
  return acts.map((act) => ({
    id: act.id,
    title: act.title,
    order: act.order,
    isCurrent: act.id === selectedActId,
  }));
};

// ===== BASIC LIST NAVIGATION =====

export const getNextInList = <T extends { id: string }>(
  items: T[],
  currentId: string | undefined
): T | null => {
  if (!currentId) return null;
  const currentIndex = items.findIndex((item) => item.id === currentId);
  if (currentIndex === -1 || currentIndex >= items.length - 1) return null;
  return items[currentIndex + 1];
};

export const getPreviousInList = <T extends { id: string }>(
  items: T[],
  currentId: string | undefined
): T | null => {
  if (!currentId) return null;
  const currentIndex = items.findIndex((item) => item.id === currentId);
  if (currentIndex <= 0) return null;
  return items[currentIndex - 1];
};

// ===== INDEX FINDING =====

export const findSceneIndexInChapter = (
  scenes: Scene[],
  sceneId: string
): number => {
  return scenes.findIndex((scene) => scene.id === sceneId);
};

export const findChapterIndexInAct = (
  chapters: Chapter[],
  chapterId: string
): number => {
  return chapters.findIndex((chapter) => chapter.id === chapterId);
};

export const findActIndexInNovel = (acts: Act[], actId: string): number => {
  return acts.findIndex((act) => act.id === actId);
};

// ===== CONTAINER FINDING =====

export const findChapterContainingScene = (
  acts: Act[],
  sceneId: string
): Chapter | null => {
  for (const act of acts) {
    for (const chapter of act.chapters) {
      if (chapter.scenes.some((scene) => scene.id === sceneId)) {
        return chapter;
      }
    }
  }
  return null;
};

export const findActContainingScene = (
  acts: Act[],
  sceneId: string
): Act | null => {
  for (const act of acts) {
    if (
      act.chapters.some((chapter) =>
        chapter.scenes.some((scene) => scene.id === sceneId)
      )
    ) {
      return act;
    }
  }
  return null;
};

export const findActContainingChapter = (
  acts: Act[],
  chapterId: string
): Act | null => {
  return (
    acts.find((act) =>
      act.chapters.some((chapter) => chapter.id === chapterId)
    ) || null
  );
};
