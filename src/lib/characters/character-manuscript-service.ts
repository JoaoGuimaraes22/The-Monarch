// lib/characters/character-manuscript-service.ts
// Service for character-manuscript integration and mention detection

import { prisma } from "@/lib/prisma";
import {
  CharacterTextAnalyzer,
  CharacterMention,
  TextAnalysisOptions,
} from "./character-text-analyzer";
import type { Character } from "./character-service";

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
   * Get all appearances of a character in the manuscript
   */
  async getCharacterAppearances(
    characterId: string,
    options: TextAnalysisOptions = {}
  ): Promise<CharacterAppearance[]> {
    // Get character data
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        novel: {
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
        },
      },
    });

    if (!character) {
      throw new Error("Character not found");
    }

    const appearances: CharacterAppearance[] = [];

    // Analyze each scene for character mentions
    for (const act of character.novel.acts) {
      for (const chapter of act.chapters) {
        for (const scene of chapter.scenes) {
          if (!scene.content || scene.content.trim() === "") {
            continue; // Skip empty scenes
          }

          const mentions = CharacterTextAnalyzer.findCharacterMentions(
            scene.content,
            character,
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
   * Get manuscript analytics for a character
   */
  async getCharacterManuscriptAnalytics(
    characterId: string,
    options: TextAnalysisOptions = {}
  ): Promise<CharacterManuscriptAnalytics> {
    const appearances = await this.getCharacterAppearances(
      characterId,
      options
    );
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: { name: true },
    });

    if (!character) {
      throw new Error("Character not found");
    }

    // Calculate analytics
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
    const firstAppearance = appearances[0];
    const lastAppearance = appearances[appearances.length - 1];

    // Distribution analysis
    const byAct: Record<string, number> = {};
    const byChapter: Record<string, number> = {};
    const byMentionType: Record<string, number> = {};

    appearances.forEach((appearance) => {
      // By act
      const actKey = `Act ${appearance.actOrder}`;
      byAct[actKey] = (byAct[actKey] || 0) + appearance.totalMentions;

      // By chapter
      const chapterKey = `${actKey}, Ch ${appearance.chapterOrder}`;
      byChapter[chapterKey] =
        (byChapter[chapterKey] || 0) + appearance.totalMentions;

      // By mention type
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
      firstAppearance: firstAppearance
        ? {
            sceneId: firstAppearance.sceneId,
            sceneTitle: firstAppearance.sceneTitle,
            actOrder: firstAppearance.actOrder,
            chapterOrder: firstAppearance.chapterOrder,
          }
        : undefined,
      lastAppearance: lastAppearance
        ? {
            sceneId: lastAppearance.sceneId,
            sceneTitle: lastAppearance.sceneTitle,
            actOrder: lastAppearance.actOrder,
            chapterOrder: lastAppearance.chapterOrder,
          }
        : undefined,
      mentionDistribution: {
        byAct,
        byChapter,
        byMentionType,
      },
    };
  }

  /**
   * Get character mentions for a specific scene
   */
  async getSceneCharacterMentions(
    sceneId: string,
    options: TextAnalysisOptions = {}
  ): Promise<SceneCharacterMentions | null> {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: {
        chapter: {
          include: {
            act: {
              include: {
                novel: {
                  include: {
                    characters: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!scene) {
      return null;
    }

    const characters: SceneCharacterMentions["characters"] = [];

    // Analyze scene content for each character
    for (const character of scene.chapter.act.novel.characters) {
      if (!scene.content || scene.content.trim() === "") {
        continue;
      }

      const mentions = CharacterTextAnalyzer.findCharacterMentions(
        scene.content,
        character,
        scene.id,
        options
      );

      if (mentions.length > 0) {
        characters.push({
          characterId: character.id,
          characterName: character.name,
          mentions,
        });
      }
    }

    return {
      sceneId: scene.id,
      sceneTitle: scene.title || `Scene ${scene.order}`,
      chapterTitle: scene.chapter.title,
      actTitle: scene.chapter.act.title,
      characters,
    };
  }

  /**
   * Scan entire manuscript for character mentions (heavy operation)
   */
  async scanManuscriptForCharacter(
    novelId: string,
    characterId: string,
    options: TextAnalysisOptions = {}
  ): Promise<{
    scannedScenes: number;
    foundMentions: number;
    processing: boolean;
  }> {
    // This could be enhanced to be a background job for large manuscripts
    const appearances = await this.getCharacterAppearances(
      characterId,
      options
    );
    const analytics = await this.getCharacterManuscriptAnalytics(
      characterId,
      options
    );

    return {
      scannedScenes: analytics.totalScenes,
      foundMentions: analytics.totalMentions,
      processing: false,
    };
  }

  /**
   * Get character mentions with pagination for large manuscripts
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

    const total = allAppearances.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const mentions = allAppearances.slice(offset, offset + limit);

    return {
      mentions,
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
   * Search for mentions by text content
   */
  async searchCharacterMentions(
    characterId: string,
    searchTerm: string,
    options: TextAnalysisOptions = {}
  ): Promise<CharacterAppearance[]> {
    const appearances = await this.getCharacterAppearances(
      characterId,
      options
    );

    return appearances.filter((appearance) =>
      appearance.mentions.some(
        (mention) =>
          mention.fullContext
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          mention.mentionText.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }
}

// Export singleton instance
export const characterManuscriptService = new CharacterManuscriptService();
