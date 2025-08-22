// lib/characters/character-service.ts
// Complete character service with state management

import { prisma } from "@/lib/prisma";

// ===== BASIC TYPES =====
export interface Character {
  id: string;
  name: string;
  species: string;
  gender: string | null;
  imageUrl: string | null;
  birthplace: string | null;
  family: string | null; // JSON string
  baseAppearance: string | null; // JSON string
  coreNature: string | null; // JSON string
  novelId: string;
  inspirations: string; // JSON string
  writerNotes: string | null;
  tags: string; // JSON string
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterWithCurrentState extends Character {
  currentState: CharacterState | null;
  povSceneCount: number;
}

export interface CharacterState {
  id: string;
  characterId: string;
  age: number | null;
  title: string | null;
  occupation: string | null;
  location: string | null;
  socialStatus: string | null;
  faction: string | null;
  currentTraits: string; // JSON string
  activeFears: string; // JSON string
  currentGoals: string; // JSON string
  motivations: string; // JSON string
  skills: string; // JSON string
  knowledge: string; // JSON string
  secrets: string; // JSON string
  currentAppearance: string | null; // JSON string
  mentalState: string | null;
  scopeType: string;
  startActId: string | null;
  startChapterId: string | null;
  startSceneId: string | null;
  endActId: string | null;
  endChapterId: string | null;
  endSceneId: string | null;
  changes: string | null; // JSON string
  triggerSceneId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===== CREATION OPTIONS =====
export interface CreateCharacterOptions {
  name: string;
  species?: string;
  gender?: string | null;
  imageUrl?: string | null;
  birthplace?: string | null;
  family?: object | null;
  baseAppearance?: object | null;
  coreNature?: object | null;
  inspirations?: string[];
  writerNotes?: string | null;
  tags?: string[];
}

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
  currentAppearance?: object;
  mentalState?: string;
  scopeType: "novel" | "act" | "chapter" | "scene";
  startActId?: string;
  startChapterId?: string;
  startSceneId?: string;
  endActId?: string;
  endChapterId?: string;
  endSceneId?: string;
  changes?: object;
  triggerSceneId?: string;
}

// ===== UPDATE OPTIONS =====
export interface UpdateCharacterStateOptions {
  age?: number | null;
  title?: string | null;
  occupation?: string | null;
  location?: string | null;
  socialStatus?: string | null;
  faction?: string | null;
  currentTraits?: string[];
  activeFears?: string[];
  currentGoals?: string[];
  motivations?: string[];
  skills?: string[];
  knowledge?: string[];
  secrets?: string[];
  currentAppearance?: object | null;
  mentalState?: string | null;
  scopeType?: "novel" | "act" | "chapter" | "scene";
  startActId?: string | null;
  startChapterId?: string | null;
  startSceneId?: string | null;
  endActId?: string | null;
  endChapterId?: string | null;
  endSceneId?: string | null;
  changes?: object | null;
  triggerSceneId?: string | null;
}

// ===== UTILITY FUNCTIONS =====
const safeStringify = (obj: unknown): string => {
  if (!obj) return "";
  if (Array.isArray(obj) && obj.length === 0) return "[]";
  if (typeof obj === "object" && Object.keys(obj).length === 0) return "{}";
  return JSON.stringify(obj);
};

const safeParse = (str: string): unknown => {
  if (!str || str === "") return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

const safeParseArray = (str: string): string[] => {
  if (!str || str === "") return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// ===== CHARACTER SERVICE =====
export class CharacterService {
  /**
   * Get all characters for a novel with their current states and POV scene counts
   */
  async getAllCharacters(
    novelId: string
  ): Promise<CharacterWithCurrentState[]> {
    // Get characters with their most recent state
    const characters = await prisma.character.findMany({
      where: { novelId },
      include: {
        states: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get most recent state
        },
      },
      orderBy: { name: "asc" },
    });

    // Get POV scene counts for each character
    const characterIds = characters.map((c) => c.id);
    const povSceneCounts = await Promise.all(
      characterIds.map(async (characterId) => {
        const count = await prisma.scene.count({
          where: { povCharacter: characterId },
        });
        return { characterId, count };
      })
    );

    // Combine the data
    return characters.map((character) => {
      const povData = povSceneCounts.find(
        (p) => p.characterId === character.id
      );
      return {
        ...character,
        currentState: character.states[0] || null,
        povSceneCount: povData?.count || 0,
        states: undefined, // Clean up the included states
      };
    });
  }

  /**
   * Get character by ID with full data
   */
  async getCharacterById(characterId: string): Promise<Character | null> {
    return await prisma.character.findUnique({
      where: { id: characterId },
    });
  }

  /**
   * Create a new character with optional initial state
   */
  async createCharacter(
    novelId: string,
    options: CreateCharacterOptions
  ): Promise<Character> {
    const character = await prisma.character.create({
      data: {
        novelId,
        name: options.name,
        species: options.species || "Human",
        gender: options.gender || null,
        imageUrl: options.imageUrl || null,
        birthplace: options.birthplace || null,
        family: safeStringify(options.family),
        baseAppearance: safeStringify(options.baseAppearance),
        coreNature: safeStringify(options.coreNature),
        inspirations: safeStringify(options.inspirations || []),
        writerNotes: options.writerNotes || null,
        tags: safeStringify(options.tags || []),
      },
    });

    return character;
  }

  /**
   * Update a character
   */
  async updateCharacter(
    characterId: string,
    options: Partial<CreateCharacterOptions>
  ): Promise<Character> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (options.name !== undefined) updateData.name = options.name;
    if (options.species !== undefined) updateData.species = options.species;
    if (options.gender !== undefined) updateData.gender = options.gender;
    if (options.imageUrl !== undefined) updateData.imageUrl = options.imageUrl;
    if (options.birthplace !== undefined)
      updateData.birthplace = options.birthplace;
    if (options.family !== undefined)
      updateData.family = safeStringify(options.family);
    if (options.baseAppearance !== undefined)
      updateData.baseAppearance = safeStringify(options.baseAppearance);
    if (options.coreNature !== undefined)
      updateData.coreNature = safeStringify(options.coreNature);
    if (options.inspirations !== undefined)
      updateData.inspirations = safeStringify(options.inspirations);
    if (options.writerNotes !== undefined)
      updateData.writerNotes = options.writerNotes;
    if (options.tags !== undefined)
      updateData.tags = safeStringify(options.tags);

    const character = await prisma.character.update({
      where: { id: characterId },
      data: updateData,
    });

    return character;
  }

  /**
   * Delete a character (cascades to states, relationships, arcs)
   */
  async deleteCharacter(characterId: string): Promise<void> {
    await prisma.character.delete({
      where: { id: characterId },
    });
  }

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
    options: Partial<CreateCharacterStateOptions>
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
   * Check if character name is unique in novel
   */
  async isCharacterNameUnique(
    novelId: string,
    name: string,
    excludeCharacterId?: string
  ): Promise<boolean> {
    const whereClause: Record<string, unknown> = {
      novelId,
      name: {
        equals: name,
      },
    };

    if (excludeCharacterId) {
      whereClause.id = { not: excludeCharacterId };
    }

    const existingCharacter = await prisma.character.findFirst({
      where: whereClause,
    });

    return !existingCharacter;
  }

  /**
   * Get character statistics for a novel
   */
  async getCharacterStatistics(novelId: string) {
    const [totalCharacters, povCharacterCount] = await Promise.all([
      prisma.character.count({ where: { novelId } }),
      prisma.character.count({
        where: {
          novelId,
          // For now, count characters with any POV scenes using a subquery approach
        },
      }),
    ]);

    // Get actual POV count with a separate query
    const charactersWithPov = await prisma.character.findMany({
      where: { novelId },
      select: { id: true },
    });

    let actualPovCount = 0;
    for (const character of charactersWithPov) {
      const povScenes = await prisma.scene.count({
        where: { povCharacter: character.id },
      });
      if (povScenes > 0) actualPovCount++;
    }

    return {
      totalCharacters,
      povCharacterCount: actualPovCount,
      primaryCharacters: actualPovCount, // For now, POV = Primary
      secondaryCharacters: Math.max(0, totalCharacters - actualPovCount),
    };
  }

  /**
   * Get POV characters (characters with POV scenes)
   */
  async getPOVCharacters(
    novelId: string
  ): Promise<CharacterWithCurrentState[]> {
    const allCharacters = await this.getAllCharacters(novelId);
    return allCharacters.filter((character) => character.povSceneCount > 0);
  }

  /**
   * Get character suggestions for POV selection (for manuscript integration)
   */
  async getCharacterSuggestions(
    novelId: string,
    searchTerm?: string
  ): Promise<Pick<Character, "id" | "name" | "imageUrl" | "species">[]> {
    const whereClause: Record<string, unknown> = { novelId };

    if (searchTerm) {
      whereClause.name = {
        contains: searchTerm,
      };
    }

    return await prisma.character.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        species: true,
      },
      orderBy: { name: "asc" },
      take: 10,
    });
  }
}

// Export singleton instance
export const characterService = new CharacterService();
