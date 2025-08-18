// src/lib/novels/types.ts
// All TypeScript interfaces and types for the novel system

// Core entity interfaces
export interface Novel {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Act {
  id: string;
  title: string;
  order: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  povCharacter: string | null;
  sceneType: string;
  notes: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Composite interfaces
export interface NovelWithStructure extends Novel {
  acts: Act[];
}

// Create/Update data interfaces
export interface CreateNovelData {
  title: string;
  description: string;
  coverImage?: string;
}

export interface UpdateActData {
  title?: string;
}

export interface UpdateChapterData {
  title?: string;
}

export interface UpdateSceneMetadata {
  title?: string;
  povCharacter?: string | null;
  sceneType?: string;
  notes?: string;
  status?: string;
}

// Import/export interfaces
export interface ImportStructureData {
  acts: {
    title: string;
    order: number;
    chapters: {
      title: string;
      order: number;
      scenes: {
        content: string;
        order: number;
        wordCount: number;
      }[];
    }[];
  }[];
}

// Reordering interfaces for drag-and-drop
export interface ReorderSceneData {
  sceneId: string;
  targetChapterId: string;
  newOrder: number;
}

export interface ReorderChapterData {
  chapterId: string;
  newOrder: number;
}

export interface ReorderActData {
  actId: string;
  newOrder: number;
}

// Service response interfaces
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Utility types
export type CreateSceneOptions = {
  chapterId: string;
  insertAfterSceneId?: string;
  title?: string;
};

export type CreateChapterOptions = {
  actId: string;
  insertAfterChapterId?: string;
  title?: string;
};

export type CreateActOptions = {
  novelId: string;
  insertAfterActId?: string;
  title?: string;
};
