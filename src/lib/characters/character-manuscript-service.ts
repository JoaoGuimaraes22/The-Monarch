// lib/characters/character-manuscript-service.ts
// Updated service with titles support from character profile

import { prisma } from "@/lib/prisma";
import {
  CharacterTextAnalyzer,
  CharacterMention,
  TextAnalysisOptions,
} from "./character-text-analyzer";
import { characterService } from "./character-service";

// ===== INTERFACES =====
export interface CharacterAppearance {
  sceneId: string;
  sceneTitle: string;
  chapterTitle: string;
  actTitle: string;
  chapterOrder: number;
  actOrder: number;
  sceneOrder: number;
  mentions: CharacterMention[];
  totalMentions: number;
}

export interface CharacterManuscriptAnalytics {
  characterId: string;
  characterName: string;
  totalMentions: number;
  totalScenes: number;
  povScenes: number;
  firstAppearance?: {
    sceneId: string;
    sceneTitle: string;
    actOrder: number;
    chapterOrder: number;
  };
  lastAppearance?: {
    sceneId: string;
    sceneTitle: string;
    actOrder: number;
    chapterOrder: number;
  };
  mentionDistribution: {
    byAct: Record<string, number>;
    byChapter: Record<string, number>;
    byMentionType: Record<string, number>;
  };
}

export interface SceneCharacterMentions {
  sceneId: string;
  sceneTitle: string;
  chapterTitle: string;
  actTitle: string;
  characters: Array<{
    characterId: string;
    characterName: string;
    mentions: CharacterMention[];
  }>;
}

// ===== CHARACTER MANUSCRIPT SERVICE =====
export class CharacterManuscriptService {
  /**
   * ✅ UPDATED: Get all appearances of a character in the manuscript
   * Now uses character with parsed titles for better accuracy
   */
  async getCharacterAppearances(
    characterId: string,
    options: TextAnalysisOptions = {}
  ): Promise<CharacterAppearance[]> {
    // ✅ NEW: Get character with parsed titles for text analysis
    const character = await characterService.getCharacterByIdWithTitles(
      characterId
    );
    if (!character) {
      throw new Error("Character not found");
    }

    // Get novel structure
    const novel = await prisma.novel.findUnique({
      where: { id: character.novelId },
      include: {
        acts: {
          include: {
            chapters: {
              include: {
                scenes: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!novel) {
      throw new Error("Novel not found");
    }

    const appearances: CharacterAppearance[] = [];

    // ✅ IMPROVED: Analyze each scene with character titles
    for (const act of novel.acts) {
      for (const chapter of act.chapters) {
        for (const scene of chapter.scenes) {
          if (!scene.content || scene.content.trim() === "") {
            continue; // Skip empty scenes
          }

          const mentions = CharacterTextAnalyzer.findCharacterMentions(
            scene.content,
            character, // Now includes parsed titles
            scene.id,
            options
          );

          if (mentions.length > 0) {
            appearances.push({
              sceneId: scene.id,
              sceneTitle: scene.title || `Scene ${scene.order}`,
              chapterTitle: chapter.title,
              actTitle: act.title,
              chapterOrder: chapter.order,
              actOrder: act.order,
              sceneOrder: scene.order,
              mentions,
              totalMentions: mentions.length,
            });
          }
        }
      }
    }

    return appearances.sort((a, b) => {
      // Sort by act, then chapter, then scene
      if (a.actOrder !== b.actOrder) return a.actOrder - b.actOrder;
      if (a.chapterOrder !== b.chapterOrder)
        return a.chapterOrder - b.chapterOrder;
      return a.sceneOrder - b.sceneOrder;
    });
  }

  /**
   * ✅ UPDATED: Get manuscript analytics for a character
   * Enhanced with better title-based detection
   */
  async getCharacterManuscriptAnalytics(
    characterId: string,
    options: TextAnalysisOptions = {}
  ): Promise<CharacterManuscriptAnalytics> {
    const appearances = await this.getCharacterAppearances(
      characterId,
      options
    );
    const character = await characterService.getCharacterById(characterId);

    if (!character) {
      throw new Error("Character not found");
    }

    // Calculate totals
    const totalMentions = appearances.reduce(
      (sum, app) => sum + app.totalMentions,
      0
    );
    const totalScenes = appearances.length;

    // Get POV scene count
    const povScenes = await prisma.scene.count({
      where: { povCharacter: characterId },
    });

    // Find first and last appearances
    let firstAppearance;
    let lastAppearance;

    if (appearances.length > 0) {
      const first = appearances[0];
      const last = appearances[appearances.length - 1];

      firstAppearance = {
        sceneId: first.sceneId,
        sceneTitle: first.sceneTitle,
        actOrder: first.actOrder,
        chapterOrder: first.chapterOrder,
      };

      lastAppearance = {
        sceneId: last.sceneId,
        sceneTitle: last.sceneTitle,
        actOrder: last.actOrder,
        chapterOrder: last.chapterOrder,
      };
    }

    // Calculate distributions
    const byAct: Record<string, number> = {};
    const byChapter: Record<string, number> = {};
    const byMentionType: Record<string, number> = {};

    appearances.forEach((appearance) => {
      const actKey = `Act ${appearance.actOrder}`;
      const chapterKey = `${actKey}, Chapter ${appearance.chapterOrder}`;

      byAct[actKey] = (byAct[actKey] || 0) + appearance.totalMentions;
      byChapter[chapterKey] =
        (byChapter[chapterKey] || 0) + appearance.totalMentions;

      appearance.mentions.forEach((mention) => {
        byMentionType[mention.mentionType] =
          (byMentionType[mention.mentionType] || 0) + 1;
      });
    });

    return {
      characterId,
      characterName: character.name,
      totalMentions,
      totalScenes,
      povScenes,
      firstAppearance,
      lastAppearance,
      mentionDistribution: {
        byAct,
        byChapter,
        byMentionType,
      },
    };
  }

  /**
   * Get paginated character appearances for API responses
   */
  async getCharacterMentionsPaginated(
    characterId: string,
    page: number = 1,
    limit: number = 20,
    options: TextAnalysisOptions = {}
  ): Promise<{
    mentions: CharacterAppearance[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const allAppearances = await this.getCharacterAppearances(
      characterId,
      options
    );

    // Calculate pagination
    const total = allAppearances.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedAppearances = allAppearances.slice(startIndex, endIndex);

    return {
      mentions: paginatedAppearances,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Search character mentions by context
   */
  async searchCharacterMentions(
    characterId: string,
    searchTerm: string,
    options: TextAnalysisOptions = {}
  ): Promise<CharacterAppearance[]> {
    const allAppearances = await this.getCharacterAppearances(
      characterId,
      options
    );

    if (!searchTerm.trim()) {
      return allAppearances;
    }

    const searchLower = searchTerm.toLowerCase();

    return allAppearances
      .map((appearance) => ({
        ...appearance,
        mentions: appearance.mentions.filter(
          (mention) =>
            mention.fullContext.toLowerCase().includes(searchLower) ||
            mention.mentionText.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((appearance) => appearance.mentions.length > 0)
      .map((appearance) => ({
        ...appearance,
        totalMentions: appearance.mentions.length,
      }));
  }

  /**
   * Get all character mentions in a specific scene
   */
  async getSceneCharacterMentions(
    sceneId: string,
    options: TextAnalysisOptions = {}
  ): Promise<SceneCharacterMentions | null> {
    // Get scene with structure info
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        chapter: {
          include: {
            act: true,
          },
        },
      },
    });

    if (!scene || !scene.content) {
      return null;
    }

    // Get all characters in the novel
    const characters = await characterService.getAllCharacters(
      scene.chapter.act.novelId
    );

    const sceneCharacters: Array<{
      characterId: string;
      characterName: string;
      mentions: CharacterMention[];
    }> = [];

    // ✅ IMPROVED: Analyze mentions for each character using titles
    for (const character of characters) {
      const characterWithTitles =
        await characterService.getCharacterByIdWithTitles(character.id);
      if (!characterWithTitles) continue;

      const mentions = CharacterTextAnalyzer.findCharacterMentions(
        scene.content,
        characterWithTitles,
        sceneId,
        options
      );

      if (mentions.length > 0) {
        sceneCharacters.push({
          characterId: character.id,
          characterName: character.name,
          mentions,
        });
      }
    }

    return {
      sceneId,
      sceneTitle: scene.title || `Scene ${scene.order}`,
      chapterTitle: scene.chapter.title,
      actTitle: scene.chapter.act.title,
      characters: sceneCharacters,
    };
  }

  /**
   * Batch update character mentions analysis
   * Useful for re-analyzing after character title changes
   */
  async refreshCharacterMentions(
    characterId: string,
    options: TextAnalysisOptions = {}
  ): Promise<CharacterManuscriptAnalytics> {
    // This method would trigger a fresh analysis
    // In a production system, you might want to cache results
    // and only refresh when character data changes

    return await this.getCharacterManuscriptAnalytics(characterId, options);
  }

  /**
   * Get characters that appear together in scenes (co-occurrence)
   */
  async getCharacterCoOccurrence(
    characterId: string,
    options: TextAnalysisOptions = {}
  ): Promise<
    Array<{
      characterId: string;
      characterName: string;
      sharedScenes: number;
      scenes: Array<{
        sceneId: string;
        sceneTitle: string;
        chapterTitle: string;
        actTitle: string;
      }>;
    }>
  > {
    const character = await characterService.getCharacterById(characterId);
    if (!character) {
      throw new Error("Character not found");
    }

    const appearances = await this.getCharacterAppearances(
      characterId,
      options
    );
    const sceneIds = appearances.map((app) => app.sceneId);

    if (sceneIds.length === 0) {
      return [];
    }

    // Get all other characters in the novel
    const allCharacters = await characterService.getAllCharacters(
      character.novelId
    );
    const otherCharacters = allCharacters.filter((c) => c.id !== characterId);

    const coOccurrences = [];

    for (const otherCharacter of otherCharacters) {
      const otherAppearances = await this.getCharacterAppearances(
        otherCharacter.id,
        options
      );

      // Find shared scenes
      const sharedScenes = otherAppearances.filter((app) =>
        sceneIds.includes(app.sceneId)
      );

      if (sharedScenes.length > 0) {
        coOccurrences.push({
          characterId: otherCharacter.id,
          characterName: otherCharacter.name,
          sharedScenes: sharedScenes.length,
          scenes: sharedScenes.map((scene) => ({
            sceneId: scene.sceneId,
            sceneTitle: scene.sceneTitle,
            chapterTitle: scene.chapterTitle,
            actTitle: scene.actTitle,
          })),
        });
      }
    }

    // Sort by number of shared scenes (descending)
    return coOccurrences.sort((a, b) => b.sharedScenes - a.sharedScenes);
  }
}

// Export singleton instance
export const characterManuscriptService = new CharacterManuscriptService();
