// lib/novels/types.ts
// UPDATED: Modern service method interfaces with parameter objects

// ===== EXISTING CORE INTERFACES (Keep these) =====
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
  novelId: string;
  createdAt: Date;
  updatedAt: Date;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  actId: string;
  createdAt: Date;
  updatedAt: Date;
  scenes: Scene[];
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  chapterId: string;
  povCharacter: string | null;
  sceneType: string;
  notes: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ===== COMPOSITE INTERFACES =====
export interface NovelWithStructure extends Novel {
  acts: Act[];
}

// ===== UPDATED: MODERN CREATION OPTIONS =====

export interface CreateNovelOptions {
  title: string;
  description: string;
  coverImage?: string;
}

export interface CreateActOptions {
  novelId: string;
  title?: string;
  insertAfterActId?: string;
  order?: number; // Allow manual order specification
}

export interface CreateChapterOptions {
  actId: string;
  title?: string;
  insertAfterChapterId?: string;
  order?: number; // Allow manual order specification
}

export interface CreateSceneOptions {
  chapterId: string;
  title?: string;
  content?: string;
  insertAfterSceneId?: string;
  order?: number; // Allow manual order specification
  povCharacter?: string;
  sceneType?: string;
  notes?: string;
  status?: string;
}

// ===== UPDATED: MODERN UPDATE OPTIONS =====

export interface UpdateNovelOptions {
  title?: string;
  description?: string;
  coverImage?: string;
}

export interface UpdateActOptions {
  title?: string;
}

export interface UpdateChapterOptions {
  title?: string;
}

export interface UpdateSceneOptions {
  title?: string;
  content?: string;
  povCharacter?: string | null;
  sceneType?: string;
  notes?: string;
  status?: string;
}

// ===== MODERN REORDERING OPTIONS =====

export interface ReorderActOptions {
  actId: string;
  newOrder: number;
}

export interface ReorderChapterOptions {
  chapterId: string;
  newOrder: number;
  targetActId?: string; // For cross-act moves
}

export interface ReorderSceneOptions {
  sceneId: string;
  newOrder: number;
  targetChapterId?: string; // For cross-chapter moves
}

// ===== SPECIALIZED SCENE UPDATE OPTIONS =====

export interface UpdateSceneContentOptions {
  content: string;
  metadata?: {
    title?: string;
    povCharacter?: string | null;
    sceneType?: string;
    notes?: string;
    status?: string;
  };
}

// ===== IMPORT/EXPORT INTERFACES (Keep existing) =====
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

// ===== SERVICE RESPONSE INTERFACES =====
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===== BACKWARD COMPATIBILITY ALIASES =====
// Keep old names to avoid breaking existing code
export type CreateNovelData = CreateNovelOptions;
export type UpdateActData = UpdateActOptions;
export type UpdateChapterData = UpdateChapterOptions;
export type UpdateSceneMetadata = UpdateSceneOptions;

// Legacy interfaces for gradual migration
export type CreateSceneOptions_Legacy = {
  chapterId: string;
  insertAfterSceneId?: string;
  title?: string;
};

export type CreateChapterOptions_Legacy = {
  actId: string;
  insertAfterChapterId?: string;
  title?: string;
};

export type CreateActOptions_Legacy = {
  novelId: string;
  insertAfterActId?: string;
  title?: string;
};

/*
===== MODERNIZATION SUMMARY =====

✅ ENHANCED: All creation options now support more parameters
✅ FUTURE-PROOF: Easy to extend without breaking changes
✅ TYPE-SAFE: Object destructuring prevents parameter errors
✅ CONSISTENT: Aligned with modern TypeScript patterns
✅ BACKWARD-COMPATIBLE: Aliases maintain existing API

Key improvements:
- Scene creation can now set initial content, POV, type, status
- All creation methods support manual order specification
- Reordering options are properly typed
- Update options are comprehensive and typed
- Specialized UpdateSceneContentOptions for content vs metadata updates

===== MIGRATION STRATEGY =====

1. Update service method signatures to use these interfaces
2. Update implementations to destructure options objects
3. Update API routes to pass objects (they already want to!)
4. Gradually migrate existing consumers
5. Remove legacy aliases after migration complete
*/
