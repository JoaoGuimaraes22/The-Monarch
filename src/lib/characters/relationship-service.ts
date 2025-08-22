// lib/characters/relationship-service.ts
// Character relationship service with bidirectional support and temporal states

import { prisma } from "@/lib/prisma";

// ===== BASIC TYPES =====
export interface CharacterRelationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  baseType: string;
  origin: string | null;
  history: string | null;
  fundamentalDynamic: string | null;
  writerNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipState {
  id: string;
  relationshipId: string;
  currentType: string;
  subtype: string | null;
  strength: number;
  publicStatus: string | null;
  privateStatus: string | null;
  trustLevel: number;
  conflictLevel: number;
  powerBalance: string;
  scopeType: string;
  startActId: string | null;
  startChapterId: string | null;
  startSceneId: string | null;
  endActId: string | null;
  endChapterId: string | null;
  endSceneId: string | null;
  changes: string | null;
  triggerSceneId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipWithCharacters extends CharacterRelationship {
  fromCharacter: {
    id: string;
    name: string;
    species: string;
    imageUrl: string | null;
  };
  toCharacter: {
    id: string;
    name: string;
    species: string;
    imageUrl: string | null;
  };
  relationshipStates: RelationshipState[];
}

export interface RelationshipWithCurrentState
  extends RelationshipWithCharacters {
  currentState: RelationshipState | null;
}

// ===== CREATION OPTIONS =====
export interface CreateRelationshipOptions {
  fromCharacterId: string;
  toCharacterId: string;
  baseType: string;
  origin?: string;
  history?: string;
  fundamentalDynamic?: string;
  writerNotes?: string;
}

export interface CreateRelationshipPairOptions {
  characterAId: string;
  characterBId: string;
  baseType: string;
  originFromA?: string;
  originFromB?: string;
  history?: string;
  fundamentalDynamic?: string;
  writerNotes?: string;
  // Initial state options
  initialState?: {
    currentType?: string;
    strength?: number;
    trustLevel?: number;
    conflictLevel?: number;
    powerBalance?: string;
    scopeType?: "novel" | "act" | "chapter" | "scene";
  };
}

export interface CreateRelationshipStateOptions {
  relationshipId: string;
  currentType: string;
  subtype?: string;
  strength?: number;
  publicStatus?: string;
  privateStatus?: string;
  trustLevel?: number;
  conflictLevel?: number;
  powerBalance?: string;
  scopeType: "novel" | "act" | "chapter" | "scene";
  startActId?: string | null;
  startChapterId?: string | null;
  startSceneId?: string | null;
  endActId?: string | null;
  endChapterId?: string | null;
  endSceneId?: string | null;
  changes?: string;
  triggerSceneId?: string | null;
}

// ===== UPDATE OPTIONS =====
export interface UpdateRelationshipOptions {
  baseType?: string;
  origin?: string;
  history?: string;
  fundamentalDynamic?: string;
  writerNotes?: string;
}

export interface UpdateRelationshipStateOptions {
  currentType?: string;
  subtype?: string;
  strength?: number;
  publicStatus?: string;
  privateStatus?: string;
  trustLevel?: number;
  conflictLevel?: number;
  powerBalance?: string;
  scopeType?: "novel" | "act" | "chapter" | "scene";
  startActId?: string | null;
  startChapterId?: string | null;
  startSceneId?: string | null;
  endActId?: string | null;
  endChapterId?: string | null;
  endSceneId?: string | null;
  changes?: string;
  triggerSceneId?: string | null;
}

// ===== UTILITY FUNCTIONS =====
const safeStringify = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const safeParse = (value: string | null): unknown => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// ===== RECIPROCAL RELATIONSHIP HELPERS =====
const getReciprocalSuggestions = (
  baseType: string,
  origin?: string
): string => {
  const suggestions: Record<string, Record<string, string>> = {
    family: {
      "my little brother": "my big sister",
      "my big brother": "my little sister",
      "my little sister": "my big brother",
      "my big sister": "my little brother",
      "my father": "my child",
      "my mother": "my child",
      "my child": "my parent",
      "my cousin": "my cousin",
      default: "my family member",
    },
    mentor_student: {
      "my mentor": "my student",
      "my teacher": "my pupil",
      "my guide": "my apprentice",
      "my student": "my mentor",
      "my pupil": "my teacher",
      "my apprentice": "my guide",
      default: "my learning partner",
    },
    romantic: {
      "my lover": "my lover",
      "my spouse": "my spouse",
      "my partner": "my partner",
      "my secret affair": "my secret affair",
      default: "my romantic interest",
    },
    professional: {
      "my boss": "my employee",
      "my employee": "my boss",
      "my colleague": "my colleague",
      "my subordinate": "my supervisor",
      "my supervisor": "my subordinate",
      default: "my colleague",
    },
    friendship: {
      "my best friend": "my best friend",
      "my close friend": "my close friend",
      "my childhood friend": "my childhood friend",
      default: "my friend",
    },
    antagonistic: {
      "my enemy": "my enemy",
      "my rival": "my rival",
      "my nemesis": "my nemesis",
      default: "my adversary",
    },
  };

  const typeMap = suggestions[baseType];
  if (!typeMap) return "connected person";

  if (origin) {
    const normalized = origin.toLowerCase().trim();
    return typeMap[normalized] || typeMap.default;
  }

  return typeMap.default;
};

// ===== SERVICE CLASS =====
class RelationshipService {
  /**
   * Create a single directional relationship
   */
  async createRelationship(
    options: CreateRelationshipOptions
  ): Promise<CharacterRelationship> {
    const relationship = await prisma.characterRelationship.create({
      data: {
        fromCharacterId: options.fromCharacterId,
        toCharacterId: options.toCharacterId,
        baseType: options.baseType,
        origin: options.origin || null,
        history: options.history || null,
        fundamentalDynamic: options.fundamentalDynamic || null,
        writerNotes: options.writerNotes || null,
      },
    });

    return relationship;
  }

  /**
   * Create bidirectional relationship pair with auto-reciprocal
   */
  async createRelationshipPair(
    options: CreateRelationshipPairOptions
  ): Promise<{
    relationshipAB: CharacterRelationship;
    relationshipBA: CharacterRelationship;
  }> {
    // Auto-generate reciprocal origin if not provided
    const originFromB =
      options.originFromB ||
      getReciprocalSuggestions(options.baseType, options.originFromA);

    const result = await prisma.$transaction(async (tx) => {
      // Create A → B relationship
      const relationshipAB = await tx.characterRelationship.create({
        data: {
          fromCharacterId: options.characterAId,
          toCharacterId: options.characterBId,
          baseType: options.baseType,
          origin: options.originFromA || null,
          history: options.history || null,
          fundamentalDynamic: options.fundamentalDynamic || null,
          writerNotes: options.writerNotes || null,
        },
      });

      // Create B → A relationship (reciprocal)
      const relationshipBA = await tx.characterRelationship.create({
        data: {
          fromCharacterId: options.characterBId,
          toCharacterId: options.characterAId,
          baseType: options.baseType,
          origin: originFromB,
          history: options.history || null,
          fundamentalDynamic: options.fundamentalDynamic || null,
          writerNotes: options.writerNotes || null,
        },
      });

      // Create initial relationship states if provided
      if (options.initialState) {
        const stateData = {
          currentType: options.initialState.currentType || options.baseType,
          strength: options.initialState.strength || 5,
          trustLevel: options.initialState.trustLevel || 5,
          conflictLevel: options.initialState.conflictLevel || 1,
          powerBalance: options.initialState.powerBalance || "equal",
          scopeType: options.initialState.scopeType || "novel",
        };

        // Create state for A → B
        await tx.relationshipState.create({
          data: {
            relationshipId: relationshipAB.id,
            ...stateData,
          },
        });

        // Create state for B → A (potentially different dynamics)
        await tx.relationshipState.create({
          data: {
            relationshipId: relationshipBA.id,
            ...stateData,
            // Adjust power balance for reciprocal
            powerBalance:
              stateData.powerBalance === "a_dominant"
                ? "b_dominant"
                : stateData.powerBalance === "b_dominant"
                ? "a_dominant"
                : stateData.powerBalance,
          },
        });
      }

      return { relationshipAB, relationshipBA };
    });

    return result;
  }

  /**
   * Get all relationships for a character (from their perspective)
   */
  async getCharacterRelationships(
    characterId: string
  ): Promise<RelationshipWithCurrentState[]> {
    const relationships = await prisma.characterRelationship.findMany({
      where: { fromCharacterId: characterId },
      include: {
        toCharacter: {
          select: {
            id: true,
            name: true,
            species: true,
            imageUrl: true,
          },
        },
        fromCharacter: {
          select: {
            id: true,
            name: true,
            species: true,
            imageUrl: true,
          },
        },
        relationshipStates: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Add current state (most recent)
    return relationships.map((rel) => ({
      ...rel,
      currentState: rel.relationshipStates[0] || null,
    }));
  }

  /**
   * Get a specific relationship with full details
   */
  async getRelationship(
    relationshipId: string
  ): Promise<RelationshipWithCharacters | null> {
    const relationship = await prisma.characterRelationship.findUnique({
      where: { id: relationshipId },
      include: {
        fromCharacter: {
          select: {
            id: true,
            name: true,
            species: true,
            imageUrl: true,
          },
        },
        toCharacter: {
          select: {
            id: true,
            name: true,
            species: true,
            imageUrl: true,
          },
        },
        relationshipStates: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return relationship;
  }

  /**
   * Find reciprocal relationship
   */
  async getReciprocalRelationship(
    relationshipId: string
  ): Promise<CharacterRelationship | null> {
    const original = await prisma.characterRelationship.findUnique({
      where: { id: relationshipId },
      select: { fromCharacterId: true, toCharacterId: true },
    });

    if (!original) return null;

    return prisma.characterRelationship.findFirst({
      where: {
        fromCharacterId: original.toCharacterId,
        toCharacterId: original.fromCharacterId,
      },
    });
  }

  /**
   * Update relationship
   */
  async updateRelationship(
    relationshipId: string,
    options: UpdateRelationshipOptions
  ): Promise<CharacterRelationship> {
    const relationship = await prisma.characterRelationship.update({
      where: { id: relationshipId },
      data: options,
    });

    return relationship;
  }

  /**
   * Delete relationship (and optionally its reciprocal)
   */
  async deleteRelationship(
    relationshipId: string,
    deleteReciprocal = true
  ): Promise<void> {
    if (deleteReciprocal) {
      // Find and delete reciprocal first
      const reciprocal = await this.getReciprocalRelationship(relationshipId);
      if (reciprocal) {
        await prisma.characterRelationship.delete({
          where: { id: reciprocal.id },
        });
      }
    }

    // Delete original relationship (cascades to states)
    await prisma.characterRelationship.delete({
      where: { id: relationshipId },
    });
  }

  /**
   * Create relationship state
   */
  async createRelationshipState(
    options: CreateRelationshipStateOptions
  ): Promise<RelationshipState> {
    const state = await prisma.relationshipState.create({
      data: {
        relationshipId: options.relationshipId,
        currentType: options.currentType,
        subtype: options.subtype || null,
        strength: options.strength || 5,
        publicStatus: options.publicStatus || null,
        privateStatus: options.privateStatus || null,
        trustLevel: options.trustLevel || 5,
        conflictLevel: options.conflictLevel || 1,
        powerBalance: options.powerBalance || "equal",
        scopeType: options.scopeType,
        startActId: options.startActId || null,
        startChapterId: options.startChapterId || null,
        startSceneId: options.startSceneId || null,
        endActId: options.endActId || null,
        endChapterId: options.endChapterId || null,
        endSceneId: options.endSceneId || null,
        changes: options.changes || null,
        triggerSceneId: options.triggerSceneId || null,
      },
    });

    return state;
  }

  /**
   * Get relationship states for a relationship
   */
  async getRelationshipStates(
    relationshipId: string
  ): Promise<RelationshipState[]> {
    return prisma.relationshipState.findMany({
      where: { relationshipId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Update relationship state
   */
  async updateRelationshipState(
    stateId: string,
    options: UpdateRelationshipStateOptions
  ): Promise<RelationshipState> {
    const updateData: Record<string, unknown> = {};

    // Only include defined fields
    if (options.currentType !== undefined)
      updateData.currentType = options.currentType;
    if (options.subtype !== undefined) updateData.subtype = options.subtype;
    if (options.strength !== undefined) updateData.strength = options.strength;
    if (options.publicStatus !== undefined)
      updateData.publicStatus = options.publicStatus;
    if (options.privateStatus !== undefined)
      updateData.privateStatus = options.privateStatus;
    if (options.trustLevel !== undefined)
      updateData.trustLevel = options.trustLevel;
    if (options.conflictLevel !== undefined)
      updateData.conflictLevel = options.conflictLevel;
    if (options.powerBalance !== undefined)
      updateData.powerBalance = options.powerBalance;
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
    if (options.changes !== undefined) updateData.changes = options.changes;
    if (options.triggerSceneId !== undefined)
      updateData.triggerSceneId = options.triggerSceneId;

    const state = await prisma.relationshipState.update({
      where: { id: stateId },
      data: updateData,
    });

    return state;
  }

  /**
   * Delete relationship state
   */
  async deleteRelationshipState(stateId: string): Promise<void> {
    await prisma.relationshipState.delete({
      where: { id: stateId },
    });
  }

  /**
   * Get relationship statistics for a novel
   */
  async getRelationshipStats(novelId: string): Promise<{
    totalRelationships: number;
    relationshipsByType: Record<string, number>;
    charactersWithMostRelationships: Array<{
      characterId: string;
      name: string;
      count: number;
    }>;
  }> {
    // Get all characters in the novel
    const characters = await prisma.character.findMany({
      where: { novelId },
      select: { id: true, name: true },
    });

    const characterIds = characters.map((c) => c.id);

    // Get all relationships for these characters
    const relationships = await prisma.characterRelationship.findMany({
      where: { fromCharacterId: { in: characterIds } },
      include: { fromCharacter: true },
    });

    // Calculate stats
    const totalRelationships = relationships.length;

    const relationshipsByType = relationships.reduce((acc, rel) => {
      acc[rel.baseType] = (acc[rel.baseType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const characterCounts = relationships.reduce((acc, rel) => {
      const key = rel.fromCharacterId;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const charactersWithMostRelationships = Object.entries(characterCounts)
      .map(([characterId, count]) => {
        const character = characters.find((c) => c.id === characterId);
        return {
          characterId,
          name: character?.name || "Unknown",
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRelationships,
      relationshipsByType,
      charactersWithMostRelationships,
    };
  }
}

// Export singleton instance
export const relationshipService = new RelationshipService();
