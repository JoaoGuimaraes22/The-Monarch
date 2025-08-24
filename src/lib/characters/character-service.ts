// lib/characters/character-service.ts
// Core character service - refactored with titles support and separated states

import { prisma } from "@/lib/prisma";
import { APIError } from "@/lib/api";

// ===== BASIC TYPES =====
export interface Character {
  id: string;
  name: string;
  titles: string; // JSON string - ✅ Updated to match schema
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

// ===== CHARACTER-SPECIFIC INTERFACES =====
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

// ===== CHARACTER CREATION & UPDATE OPTIONS =====
export interface CreateCharacterOptions {
  novelId: string;
  name: string;
  titles?: string[]; // ✅ NEW: Support titles array in creation
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

export interface UpdateCharacterOptions {
  name?: string;
  titles?: string[]; // ✅ NEW: Support titles array in updates
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

// ✅ NEW: Helper to transform Character for external use (with parsed titles)
export interface CharacterWithParsedTitles extends Omit<Character, "titles"> {
  titles: string[]; // Parsed titles array
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
   * ✅ NEW: Get character by ID with parsed titles (for text analyzer)
   */
  async getCharacterByIdWithTitles(
    characterId: string
  ): Promise<CharacterWithParsedTitles | null> {
    const character = await this.getCharacterById(characterId);
    if (!character) return null;

    return {
      ...character,
      titles: safeParseArray(character.titles || ""),
    };
  }

  /**
   * Create a new character
   * ✅ UPDATED: Now supports titles
   */
  async createCharacter(options: CreateCharacterOptions): Promise<Character> {
    // Check if character name is unique in novel
    const isUnique = await this.isCharacterNameUnique(
      options.novelId,
      options.name
    );
    if (!isUnique) {
      throw new APIError(
        `Character "${options.name}" already exists in this novel`,
        409,
        "CONFLICT"
      );
    }

    const character = await prisma.character.create({
      data: {
        novelId: options.novelId,
        name: options.name.trim(),
        titles: safeStringify(options.titles || []), // ✅ NEW: Store titles as JSON
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
   * ✅ UPDATED: Now supports titles updates
   */
  async updateCharacter(
    characterId: string,
    options: UpdateCharacterOptions
  ): Promise<Character> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (options.name !== undefined) updateData.name = options.name.trim();
    if (options.titles !== undefined)
      updateData.titles = safeStringify(options.titles); // ✅ NEW: Handle titles
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

  // ===== ✅ NEW: TITLES-SPECIFIC METHODS =====

  /**
   * Get character titles as array (helper for text analysis)
   */
  async getCharacterTitles(characterId: string): Promise<string[]> {
    const character = await this.getCharacterById(characterId);
    if (!character || !character.titles) return [];
    return safeParseArray(character.titles);
  }

  /**
   * Update only character titles
   */
  async updateCharacterTitles(
    characterId: string,
    titles: string[]
  ): Promise<Character> {
    const character = await prisma.character.update({
      where: { id: characterId },
      data: {
        titles: safeStringify(titles),
        updatedAt: new Date(),
      },
    });

    return character;
  }

  /**
   * Add a title to character
   */
  async addCharacterTitle(
    characterId: string,
    title: string
  ): Promise<Character> {
    const currentTitles = await this.getCharacterTitles(characterId);
    if (!currentTitles.includes(title)) {
      currentTitles.push(title);
      return this.updateCharacterTitles(characterId, currentTitles);
    }

    // Return current character if title already exists
    const character = await this.getCharacterById(characterId);
    if (!character) throw new APIError("Character not found", 404, "NOT_FOUND");
    return character;
  }

  /**
   * Remove a title from character
   */
  async removeCharacterTitle(
    characterId: string,
    title: string
  ): Promise<Character> {
    const currentTitles = await this.getCharacterTitles(characterId);
    const updatedTitles = currentTitles.filter((t) => t !== title);
    return this.updateCharacterTitles(characterId, updatedTitles);
  }
}

// Export singleton instance
export const characterService = new CharacterService();
