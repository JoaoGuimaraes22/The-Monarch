// lib/characters/character-manuscript-service.ts
// Service for integrating character detection with manuscript content

import { prisma } from "@/lib/prisma";
import { characterService } from "./character-service";
import { CharacterTextAnalyzer } from "./character-text-analyzer";
import type { Character } from "./character-service";
import type { CharacterMention } from "./character-text-analyzer";

// ===== TYPES =====
export interface CharacterAppearance {
  sceneId: string;
  sceneName: string;
  chapterName: string;
  actName: string;
  mentions: CharacterMention[];
  wordCount: number;
  characterScreenTime: number; // Percentage of scene content
}

export interface CharacterManuscriptData {
  characterId: string;
  characterName: string;
  totalMentions: number;
  totalScenes: number;
  appearances: CharacterAppearance[];
  povScenes: number;
  firstAppearance?: CharacterAppearance;
  lastAppearance?: CharacterAppearance;
  screenTimePercentage: number; // Overall manuscript screen time
}

export interface ManuscriptAnalysisOptions {
  includeMinorMentions?: boolean; // Include low-confidence mentions
  minConfidence?: number; // Minimum confidence threshold
  includePronouns?: boolean; // Include pronoun detection
  sceneIds?: string[]; // Analyze specific scenes only
}

export interface CharacterInteraction {
  scene: {
    id: string;
    title: string;
    chapter: string;
    act: string;
  };
  characters: Array<{
    characterId: string;
    characterName: string;
    mentionCount: number;
  }>;
  interactionStrength: number;
}

export interface CharacterTimelineEntry {
  sceneId: string;
  sceneName: string;
  chapterName: string;
  actName: string;
  sceneOrder: number;
  chapterOrder: number;
  actOrder: number;
  mentionCount: number;
  isPovScene: boolean;
  firstMention?: CharacterMention;
}

// ===== CHARACTER MANUSCRIPT SERVICE =====
export class CharacterManuscriptService {
  private static readonly DEFAULT_OPTIONS: Required<ManuscriptAnalysisOptions> =
    {
      includeMinorMentions: false,
      minConfidence: 0.8,
      includePronouns: false,
      sceneIds: [],
    };

  /**
   * Get comprehensive character manuscript data for a single character
   */
  async getCharacterManuscriptData(
    characterId: string,
    options: ManuscriptAnalysisOptions = {}
  ): Promise<CharacterManuscriptData | null> {
    const opts = { ...CharacterManuscriptService.DEFAULT_OPTIONS, ...options };

    // Get character data
    const character = await characterService.getCharacterById(characterId);
    if (!character) return null;

    // Get scenes to analyze
    const scenes = await this.getScenesForAnalysis(
      character.novelId,
      opts.sceneIds
    );
    if (scenes.length === 0) {
      return {
        characterId,
        characterName: character.name,
        totalMentions: 0,
        totalScenes: 0,
        appearances: [],
        povScenes: 0,
        screenTimePercentage: 0,
      };
    }

    // Analyze character appearances
    const appearances: CharacterAppearance[] = [];
    let totalMentions = 0;
    let povScenes = 0;
    let totalWordCount = 0;
    let characterWordCount = 0;

    for (const scene of scenes) {
      totalWordCount += scene.wordCount;

      // Check if this is a POV scene for this character
      if (scene.povCharacter === characterId) {
        povScenes++;
      }

      // Analyze mentions in scene content
      const mentions = CharacterTextAnalyzer.findCharacterMentions(
        scene.content,
        character,
        scene.id,
        {
          minConfidence: opts.minConfidence,
          includePronounMatches: opts.includePronouns,
        }
      );

      // Filter mentions based on options
      const filteredMentions = opts.includeMinorMentions
        ? mentions
        : mentions.filter((m) => m.confidence >= opts.minConfidence);

      if (filteredMentions.length > 0) {
        // Calculate screen time for this scene
        const mentionWordCount =
          this.calculateMentionWordCount(filteredMentions);
        characterWordCount += mentionWordCount;

        const screenTime =
          scene.wordCount > 0 ? (mentionWordCount / scene.wordCount) * 100 : 0;

        appearances.push({
          sceneId: scene.id,
          sceneName: scene.title || `Scene ${scene.order}`,
          chapterName:
            scene.chapter?.title || `Chapter ${scene.chapter?.order}`,
          actName:
            scene.chapter?.act?.title || `Act ${scene.chapter?.act?.order}`,
          mentions: filteredMentions,
          wordCount: scene.wordCount,
          characterScreenTime: screenTime,
        });

        totalMentions += filteredMentions.length;
      }
    }

    // Calculate overall screen time percentage
    const screenTimePercentage =
      totalWordCount > 0 ? (characterWordCount / totalWordCount) * 100 : 0;

    // Sort appearances by story order
    const sortedAppearances = this.sortAppearancesByStoryOrder(
      appearances,
      scenes
    );

    return {
      characterId,
      characterName: character.name,
      totalMentions,
      totalScenes: appearances.length,
      appearances: sortedAppearances,
      povScenes,
      firstAppearance:
        sortedAppearances.length > 0 ? sortedAppearances[0] : undefined,
      lastAppearance:
        sortedAppearances.length > 0
          ? sortedAppearances[sortedAppearances.length - 1]
          : undefined,
      screenTimePercentage,
    };
  }

  /**
   * Get manuscript data for all characters in a novel
   */
  async getNovelCharacterAnalysis(
    novelId: string,
    options: ManuscriptAnalysisOptions = {}
  ): Promise<CharacterManuscriptData[]> {
    // Get all characters in the novel
    const characters = await characterService.getAllCharacters(novelId);

    // Analyze each character
    const analysisPromises = characters.map((character) =>
      this.getCharacterManuscriptData(character.id, options)
    );

    const results = await Promise.all(analysisPromises);

    // Filter out null results and sort by total mentions
    return results
      .filter((result): result is CharacterManuscriptData => result !== null)
      .sort((a, b) => b.totalMentions - a.totalMentions);
  }

  /**
   * Find character mentions across multiple scenes
   */
  async findCharacterMentionsInScenes(
    characterId: string,
    sceneIds: string[],
    options: { minConfidence?: number } = {}
  ): Promise<CharacterMention[]> {
    const character = await characterService.getCharacterById(characterId);
    if (!character) return [];

    const scenes = await prisma.scene.findMany({
      where: { id: { in: sceneIds } },
      select: { id: true, content: true },
    });

    const allMentions: CharacterMention[] = [];

    for (const scene of scenes) {
      const mentions = CharacterTextAnalyzer.findCharacterMentions(
        scene.content,
        character,
        scene.id,
        {
          minConfidence: options.minConfidence || 0.8,
          includePronounMatches: false,
        }
      );
      allMentions.push(...mentions);
    }

    return allMentions.sort((a, b) => a.startPosition - b.startPosition);
  }

  /**
   * Get character interaction analysis (characters mentioned together)
   */
  async getCharacterInteractions(
    novelId: string,
    options: ManuscriptAnalysisOptions = {}
  ): Promise<CharacterInteraction[]> {
    const opts = { ...CharacterManuscriptService.DEFAULT_OPTIONS, ...options };
    const scenes = await this.getScenesForAnalysis(novelId, opts.sceneIds);
    const characters = await characterService.getAllCharacters(novelId);

    const interactions: CharacterInteraction[] = [];

    for (const scene of scenes) {
      const sceneCharacters: Array<{
        characterId: string;
        characterName: string;
        mentionCount: number;
      }> = [];

      // Analyze each character in this scene
      for (const character of characters) {
        const mentions = CharacterTextAnalyzer.findCharacterMentions(
          scene.content,
          character,
          scene.id,
          {
            minConfidence: opts.minConfidence,
            includePronounMatches: opts.includePronouns,
          }
        );

        if (mentions.length > 0) {
          sceneCharacters.push({
            characterId: character.id,
            characterName: character.name,
            mentionCount: mentions.length,
          });
        }
      }

      // Only include scenes with multiple characters
      if (sceneCharacters.length >= 2) {
        const interactionStrength = sceneCharacters.reduce(
          (sum, char) => sum + char.mentionCount,
          0
        );

        interactions.push({
          scene: {
            id: scene.id,
            title: scene.title || `Scene ${scene.order}`,
            chapter: scene.chapter?.title || `Chapter ${scene.chapter?.order}`,
            act:
              scene.chapter?.act?.title || `Act ${scene.chapter?.act?.order}`,
          },
          characters: sceneCharacters.sort(
            (a, b) => b.mentionCount - a.mentionCount
          ),
          interactionStrength,
        });
      }
    }

    return interactions.sort(
      (a, b) => b.interactionStrength - a.interactionStrength
    );
  }

  /**
   * Get character appearance timeline
   */
  async getCharacterTimeline(
    characterId: string,
    options: ManuscriptAnalysisOptions = {}
  ): Promise<CharacterTimelineEntry[]> {
    const manuscriptData = await this.getCharacterManuscriptData(
      characterId,
      options
    );
    if (!manuscriptData) return [];

    const scenes = await this.getScenesForAnalysis("", []); // Get all scenes for this character's novel

    return manuscriptData.appearances
      .map((appearance) => {
        const scene = scenes.find((s) => s.id === appearance.sceneId);

        return {
          sceneId: appearance.sceneId,
          sceneName: appearance.sceneName,
          chapterName: appearance.chapterName,
          actName: appearance.actName,
          sceneOrder: scene?.order || 0,
          chapterOrder: scene?.chapter?.order || 0,
          actOrder: scene?.chapter?.act?.order || 0,
          mentionCount: appearance.mentions.length,
          isPovScene: manuscriptData.povScenes > 0, // Simplified check
          firstMention:
            appearance.mentions.length > 0 ? appearance.mentions[0] : undefined,
        };
      })
      .sort((a, b) => {
        // Sort by act, chapter, scene order
        if (a.actOrder !== b.actOrder) return a.actOrder - b.actOrder;
        if (a.chapterOrder !== b.chapterOrder)
          return a.chapterOrder - b.chapterOrder;
        return a.sceneOrder - b.sceneOrder;
      });
  }

  /**
   * Get character statistics for a novel
   */
  async getCharacterStatistics(novelId: string): Promise<{
    totalCharacters: number;
    activeCharacters: number; // Characters with manuscript appearances
    povCharacters: number;
    averageMentionsPerCharacter: number;
    averageScenesPerCharacter: number;
    topCharactersByMentions: Array<{
      characterId: string;
      characterName: string;
      mentionCount: number;
    }>;
  }> {
    const analysisData = await this.getNovelCharacterAnalysis(novelId);

    const totalCharacters = analysisData.length;
    const activeCharacters = analysisData.filter(
      (c) => c.totalScenes > 0
    ).length;
    const povCharacters = analysisData.filter((c) => c.povScenes > 0).length;

    const totalMentions = analysisData.reduce(
      (sum, char) => sum + char.totalMentions,
      0
    );
    const totalScenes = analysisData.reduce(
      (sum, char) => sum + char.totalScenes,
      0
    );

    const averageMentionsPerCharacter =
      totalCharacters > 0 ? totalMentions / totalCharacters : 0;
    const averageScenesPerCharacter =
      totalCharacters > 0 ? totalScenes / totalCharacters : 0;

    const topCharactersByMentions = analysisData
      .slice(0, 10) // Top 10
      .map((char) => ({
        characterId: char.characterId,
        characterName: char.characterName,
        mentionCount: char.totalMentions,
      }));

    return {
      totalCharacters,
      activeCharacters,
      povCharacters,
      averageMentionsPerCharacter,
      averageScenesPerCharacter,
      topCharactersByMentions,
    };
  }

  /**
   * ✅ NEW: Search character mentions across scenes (for API compatibility)
   */
  async searchCharacterMentions(
    characterId: string,
    searchTerm: string,
    options: { minConfidence?: number } = {}
  ): Promise<CharacterAppearance[]> {
    // Get all character appearances
    const manuscriptData = await this.getCharacterManuscriptData(characterId, {
      minConfidence: options.minConfidence || 0.8,
    });

    if (!manuscriptData) return [];

    // Filter appearances based on search term
    const searchTermLower = searchTerm.toLowerCase();
    return manuscriptData.appearances.filter((appearance) => {
      return (
        appearance.sceneName.toLowerCase().includes(searchTermLower) ||
        appearance.chapterName.toLowerCase().includes(searchTermLower) ||
        appearance.actName.toLowerCase().includes(searchTermLower) ||
        appearance.mentions.some(
          (mention) =>
            mention.fullContext.toLowerCase().includes(searchTermLower) ||
            mention.mentionText.toLowerCase().includes(searchTermLower)
        )
      );
    });
  }

  /**
   * ✅ NEW: Get paginated character mentions (for API compatibility)
   */
  async getCharacterMentionsPaginated(
    characterId: string,
    page: number = 1,
    limit: number = 20,
    options: ManuscriptAnalysisOptions = {}
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
    // Get all character appearances
    const manuscriptData = await this.getCharacterManuscriptData(
      characterId,
      options
    );

    if (!manuscriptData) {
      return {
        mentions: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // Implement pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAppearances = manuscriptData.appearances.slice(
      startIndex,
      endIndex
    );
    const totalAppearances = manuscriptData.appearances.length;
    const totalPages = Math.ceil(totalAppearances / limit);

    return {
      mentions: paginatedAppearances,
      pagination: {
        page,
        limit,
        total: totalAppearances,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * ✅ NEW: Get novel-wide character interactions summary
   */
  async getNovelInteractionSummary(
    novelId: string,
    options: ManuscriptAnalysisOptions = {}
  ): Promise<{
    totalInteractions: number;
    mostInteractiveScenes: Array<{
      sceneId: string;
      sceneName: string;
      characterCount: number;
      totalMentions: number;
    }>;
    topCharacterPairs: Array<{
      character1: { id: string; name: string };
      character2: { id: string; name: string };
      sharedScenes: number;
    }>;
  }> {
    const interactions = await this.getCharacterInteractions(novelId, options);

    const totalInteractions = interactions.length;

    const mostInteractiveScenes = interactions
      .slice(0, 10)
      .map((interaction) => ({
        sceneId: interaction.scene.id,
        sceneName: interaction.scene.title,
        characterCount: interaction.characters.length,
        totalMentions: interaction.interactionStrength,
      }));

    // Calculate character pairs (simplified version)
    const characterPairMap = new Map<
      string,
      {
        character1: { id: string; name: string };
        character2: { id: string; name: string };
        sharedScenes: number;
      }
    >();

    interactions.forEach((interaction) => {
      const characters = interaction.characters;
      for (let i = 0; i < characters.length; i++) {
        for (let j = i + 1; j < characters.length; j++) {
          const char1 = characters[i];
          const char2 = characters[j];
          const pairKey = [char1.characterId, char2.characterId]
            .sort()
            .join("-");

          if (characterPairMap.has(pairKey)) {
            characterPairMap.get(pairKey)!.sharedScenes++;
          } else {
            characterPairMap.set(pairKey, {
              character1: { id: char1.characterId, name: char1.characterName },
              character2: { id: char2.characterId, name: char2.characterName },
              sharedScenes: 1,
            });
          }
        }
      }
    });

    const topCharacterPairs = Array.from(characterPairMap.values())
      .sort((a, b) => b.sharedScenes - a.sharedScenes)
      .slice(0, 10);

    return {
      totalInteractions,
      mostInteractiveScenes,
      topCharacterPairs,
    };
  }

  /**
   * Get scenes with full structure for analysis
   */
  private async getScenesForAnalysis(novelId: string, sceneIds?: string[]) {
    const whereClause: Record<string, unknown> = {};

    if (novelId) {
      whereClause.chapter = {
        act: {
          novelId,
        },
      };
    }

    if (sceneIds && sceneIds.length > 0) {
      whereClause.id = { in: sceneIds };
    }

    return await prisma.scene.findMany({
      where: whereClause,
      include: {
        chapter: {
          include: {
            act: true,
          },
        },
      },
      orderBy: [
        { chapter: { act: { order: "asc" } } },
        { chapter: { order: "asc" } },
        { order: "asc" },
      ],
    });
  }

  /**
   * Calculate approximate word count for character mentions
   */
  private calculateMentionWordCount(mentions: CharacterMention[]): number {
    return mentions.reduce((total, mention) => {
      // Estimate word count based on context length and mention frequency
      const contextWords = mention.fullContext.split(/\s+/).length;
      // Weight by confidence - higher confidence mentions count more
      return total + Math.floor(contextWords * mention.confidence);
    }, 0);
  }

  /**
   * Sort appearances by story order (act > chapter > scene)
   */
  private sortAppearancesByStoryOrder(
    appearances: CharacterAppearance[],
    scenes: Array<{
      id: string;
      order: number;
      chapter?: { order: number; act?: { order: number } };
    }>
  ): CharacterAppearance[] {
    return appearances.sort((a, b) => {
      const sceneA = scenes.find((s) => s.id === a.sceneId);
      const sceneB = scenes.find((s) => s.id === b.sceneId);

      if (!sceneA || !sceneB) return 0;

      // Compare by act order
      const actOrderA = sceneA.chapter?.act?.order || 0;
      const actOrderB = sceneB.chapter?.act?.order || 0;
      if (actOrderA !== actOrderB) return actOrderA - actOrderB;

      // Compare by chapter order
      const chapterOrderA = sceneA.chapter?.order || 0;
      const chapterOrderB = sceneB.chapter?.order || 0;
      if (chapterOrderA !== chapterOrderB) return chapterOrderA - chapterOrderB;

      // Compare by scene order
      return sceneA.order - sceneB.order;
    });
  }
}

// Export singleton instance
export const characterManuscriptService = new CharacterManuscriptService();
