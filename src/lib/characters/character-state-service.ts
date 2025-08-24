// lib/characters/character-state-service.ts
// Character state management service - separated from main character service

import { prisma } from "@/lib/prisma";
import { APIError } from "@/lib/api";
import type { CharacterState } from "./character-service";

// ===== CHARACTER STATE OPTIONS =====
export interface CreateCharacterStateOptions {
  characterId: string;
  age?: number;
  title?: string;
  occupation?: string;
  location?: string;
  socialStatus?: string;
  faction?: string;
  currentTraits?: string[];
  activeFears?: string[];
  currentGoals?: string[];
  motivations?: string[];
  skills?: string[];
  knowledge?: string[];
  secrets?: string[];
  currentAppearance?: object | null;
  mentalState?: string;
  scopeType: "novel" | "act" | "chapter" | "scene";
  startActId?: string;
  startChapterId?: string;
  startSceneId?: string;
  endActId?: string;
  endChapterId?: string;
  endSceneId?: string;
  changes?: object | null;
  triggerSceneId?: string;
}

export interface UpdateCharacterStateOptions {
  age?: number;
  title?: string;
  occupation?: string;
  location?: string;
  socialStatus?: string;
  faction?: string;
  currentTraits?: string[];
  activeFears?: string[];
  currentGoals?: string[];
  motivations?: string[];
  skills?: string[];
  knowledge?: string[];
  secrets?: string[];
  currentAppearance?: object | null;
  mentalState?: string;
  scopeType?: "novel" | "act" | "chapter" | "scene";
  startActId?: string;
  startChapterId?: string;
  startSceneId?: string;
  endActId?: string;
  endChapterId?: string;
  endSceneId?: string;
  changes?: string; // ✅ FIXED: Should be string, not object (API transforms it to object)
  triggerSceneId?: string;
}

// ===== UTILITY FUNCTIONS =====
const safeStringify = (obj: unknown): string => {
  if (!obj) return "";
  if (Array.isArray(obj) && obj.length === 0) return "[]";
  if (typeof obj === "object" && Object.keys(obj).length === 0) return "{}";
  return JSON.stringify(obj);
};

// ===== CHARACTER STATE SERVICE =====
export class CharacterStateService {
  /**
   * Create a character state
   */
  async createCharacterState(
    options: CreateCharacterStateOptions
  ): Promise<CharacterState> {
    const state = await prisma.characterState.create({
      data: {
        characterId: options.characterId,
        age: options.age || null,
        title: options.title || null,
        occupation: options.occupation || null,
        location: options.location || null,
        socialStatus: options.socialStatus || null,
        faction: options.faction || null,
        currentTraits: safeStringify(options.currentTraits || []),
        activeFears: safeStringify(options.activeFears || []),
        currentGoals: safeStringify(options.currentGoals || []),
        motivations: safeStringify(options.motivations || []),
        skills: safeStringify(options.skills || []),
        knowledge: safeStringify(options.knowledge || []),
        secrets: safeStringify(options.secrets || []),
        currentAppearance: safeStringify(options.currentAppearance),
        mentalState: options.mentalState || null,
        scopeType: options.scopeType,
        startActId: options.startActId || null,
        startChapterId: options.startChapterId || null,
        startSceneId: options.startSceneId || null,
        endActId: options.endActId || null,
        endChapterId: options.endChapterId || null,
        endSceneId: options.endSceneId || null,
        changes: safeStringify(options.changes),
        triggerSceneId: options.triggerSceneId || null,
      },
    });

    return state;
  }

  /**
   * Get character states for a character
   */
  async getCharacterStates(characterId: string): Promise<CharacterState[]> {
    return await prisma.characterState.findMany({
      where: { characterId },
      orderBy: [
        { startActId: "asc" },
        { startChapterId: "asc" },
        { startSceneId: "asc" },
        { createdAt: "asc" },
      ],
    });
  }

  /**
   * Get a specific character state by ID
   */
  async getCharacterStateById(stateId: string): Promise<CharacterState | null> {
    const state = await prisma.characterState.findUnique({
      where: { id: stateId },
    });

    return state;
  }

  /**
   * Update a character state
   */
  async updateCharacterState(
    stateId: string,
    options: UpdateCharacterStateOptions
  ): Promise<CharacterState> {
    // Build update data object
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Handle simple fields
    if (options.age !== undefined) updateData.age = options.age;
    if (options.title !== undefined) updateData.title = options.title;
    if (options.occupation !== undefined)
      updateData.occupation = options.occupation;
    if (options.location !== undefined) updateData.location = options.location;
    if (options.socialStatus !== undefined)
      updateData.socialStatus = options.socialStatus;
    if (options.faction !== undefined) updateData.faction = options.faction;
    if (options.mentalState !== undefined)
      updateData.mentalState = options.mentalState;
    if (options.scopeType !== undefined)
      updateData.scopeType = options.scopeType;
    if (options.startActId !== undefined)
      updateData.startActId = options.startActId;
    if (options.startChapterId !== undefined)
      updateData.startChapterId = options.startChapterId;
    if (options.startSceneId !== undefined)
      updateData.startSceneId = options.startSceneId;
    if (options.endActId !== undefined) updateData.endActId = options.endActId;
    if (options.endChapterId !== undefined)
      updateData.endChapterId = options.endChapterId;
    if (options.endSceneId !== undefined)
      updateData.endSceneId = options.endSceneId;
    if (options.triggerSceneId !== undefined)
      updateData.triggerSceneId = options.triggerSceneId;

    // Handle JSON array fields with stringification
    if (options.currentTraits !== undefined)
      updateData.currentTraits = safeStringify(options.currentTraits);
    if (options.activeFears !== undefined)
      updateData.activeFears = safeStringify(options.activeFears);
    if (options.currentGoals !== undefined)
      updateData.currentGoals = safeStringify(options.currentGoals);
    if (options.motivations !== undefined)
      updateData.motivations = safeStringify(options.motivations);
    if (options.skills !== undefined)
      updateData.skills = safeStringify(options.skills);
    if (options.knowledge !== undefined)
      updateData.knowledge = safeStringify(options.knowledge);
    if (options.secrets !== undefined)
      updateData.secrets = safeStringify(options.secrets);

    // Handle changes and currentAppearance objects
    if (options.changes !== undefined) {
      updateData.changes = safeStringify(options.changes);
    }
    if (options.currentAppearance !== undefined) {
      updateData.currentAppearance = safeStringify(options.currentAppearance);
    }

    const state = await prisma.characterState.update({
      where: { id: stateId },
      data: updateData,
    });

    return state;
  }

  /**
   * Delete a character state
   */
  async deleteCharacterState(stateId: string): Promise<void> {
    await prisma.characterState.delete({
      where: { id: stateId },
    });
  }

  /**
   * Get the most recent state for a character
   */
  async getMostRecentCharacterState(
    characterId: string
  ): Promise<CharacterState | null> {
    const state = await prisma.characterState.findFirst({
      where: { characterId },
      orderBy: { createdAt: "desc" },
    });

    return state;
  }

  /**
   * Get character states for a specific scope
   */
  async getCharacterStatesForScope(
    characterId: string,
    scopeType: "novel" | "act" | "chapter" | "scene",
    scopeId?: string
  ): Promise<CharacterState[]> {
    const whereClause: Record<string, unknown> = {
      characterId,
      scopeType,
    };

    // Add scope-specific filters
    if (scopeId) {
      switch (scopeType) {
        case "act":
          whereClause.startActId = scopeId;
          break;
        case "chapter":
          whereClause.startChapterId = scopeId;
          break;
        case "scene":
          whereClause.startSceneId = scopeId;
          break;
      }
    }

    return await prisma.characterState.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Check if character has states
   */
  async hasCharacterStates(characterId: string): Promise<boolean> {
    const count = await prisma.characterState.count({
      where: { characterId },
    });
    return count > 0;
  }

  /**
   * Get character state statistics
   */
  async getCharacterStateStatistics(characterId: string) {
    const [totalStates, novelStates, actStates, chapterStates, sceneStates] =
      await Promise.all([
        prisma.characterState.count({ where: { characterId } }),
        prisma.characterState.count({
          where: { characterId, scopeType: "novel" },
        }),
        prisma.characterState.count({
          where: { characterId, scopeType: "act" },
        }),
        prisma.characterState.count({
          where: { characterId, scopeType: "chapter" },
        }),
        prisma.characterState.count({
          where: { characterId, scopeType: "scene" },
        }),
      ]);

    return {
      totalStates,
      novelStates,
      actStates,
      chapterStates,
      sceneStates,
    };
  }

  /**
   * Duplicate a character state (for creating similar states)
   */
  async duplicateCharacterState(
    stateId: string,
    overrides: Partial<CreateCharacterStateOptions> = {}
  ): Promise<CharacterState> {
    const originalState = await this.getCharacterStateById(stateId);
    if (!originalState) {
      throw new APIError("Character state not found", 404, "NOT_FOUND");
    }

    // Parse array fields for duplication
    const parseArrayField = (field: string): string[] => {
      if (!field) return [];
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const parseObjectField = (field: string | null): object | null => {
      if (!field) return null;
      try {
        return JSON.parse(field) as object;
      } catch {
        return null;
      }
    };

    const newStateOptions: CreateCharacterStateOptions = {
      characterId: originalState.characterId,
      age: originalState.age || undefined,
      title: originalState.title || undefined,
      occupation: originalState.occupation || undefined,
      location: originalState.location || undefined,
      socialStatus: originalState.socialStatus || undefined,
      faction: originalState.faction || undefined,
      currentTraits: parseArrayField(originalState.currentTraits),
      activeFears: parseArrayField(originalState.activeFears),
      currentGoals: parseArrayField(originalState.currentGoals),
      motivations: parseArrayField(originalState.motivations),
      skills: parseArrayField(originalState.skills),
      knowledge: parseArrayField(originalState.knowledge),
      secrets: parseArrayField(originalState.secrets),
      currentAppearance: parseObjectField(originalState.currentAppearance),
      mentalState: originalState.mentalState || undefined,
      scopeType: originalState.scopeType as
        | "novel"
        | "act"
        | "chapter"
        | "scene",
      startActId: originalState.startActId || undefined,
      startChapterId: originalState.startChapterId || undefined,
      startSceneId: originalState.startSceneId || undefined,
      endActId: originalState.endActId || undefined,
      endChapterId: originalState.endChapterId || undefined,
      endSceneId: originalState.endSceneId || undefined,
      changes: parseObjectField(originalState.changes),
      triggerSceneId: originalState.triggerSceneId || undefined,
      // Apply any overrides
      ...overrides,
    };

    return this.createCharacterState(newStateOptions);
  }
}

// Export singleton instance
export const characterStateService = new CharacterStateService();
