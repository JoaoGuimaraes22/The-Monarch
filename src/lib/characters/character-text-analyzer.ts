// lib/characters/character-text-analyzer.ts
// Smart character mention detection engine

import type { Character } from "@/lib/characters/character-service";

// ===== TYPES =====
export interface CharacterMention {
  sceneId: string;
  characterId: string;
  mentionText: string;
  startPosition: number;
  endPosition: number;
  contextBefore: string;
  contextAfter: string;
  fullContext: string;
  mentionType: "name" | "title" | "pronoun" | "description";
  confidence: number;
  lineNumber?: number;
}

export interface TextAnalysisOptions {
  contextLength?: number; // Characters before/after mention
  fullContextLength?: number; // Full context snippet length
  minConfidence?: number; // Minimum confidence threshold
  includePronounMatches?: boolean; // Include pronoun detection
  caseSensitive?: boolean; // Case sensitive matching
}

export interface CharacterNameVariations {
  characterId: string;
  variations: string[];
  pronouns: string[];
  titles: string[];
  nicknames: string[];
}

// ===== CHARACTER TEXT ANALYZER =====
export class CharacterTextAnalyzer {
  private static readonly DEFAULT_OPTIONS: Required<TextAnalysisOptions> = {
    contextLength: 50,
    fullContextLength: 200,
    minConfidence: 0.7,
    includePronounMatches: false, // Disabled by default - too many false positives
    caseSensitive: false,
  };

  /**
   * Generate name variations for a character
   */
  static generateNameVariations(character: Character): CharacterNameVariations {
    const variations = new Set<string>();
    const pronouns = new Set<string>();
    const titles = new Set<string>();
    const nicknames = new Set<string>();

    // Core name
    const fullName = character.name.trim();
    variations.add(fullName);

    // Split full name into parts
    const nameParts = fullName.split(/\s+/);

    // Add individual name parts (first, middle, last)
    nameParts.forEach((part) => {
      if (part.length > 1) {
        // Skip single letters
        variations.add(part);
      }
    });

    // Add first + last name combinations
    if (nameParts.length >= 2) {
      variations.add(`${nameParts[0]} ${nameParts[nameParts.length - 1]}`);
    }

    // Add common title variations
    if (character.gender) {
      switch (character.gender.toLowerCase()) {
        case "male":
          titles.add("Mr.");
          titles.add("Lord");
          titles.add("Sir");
          pronouns.add("he");
          pronouns.add("him");
          pronouns.add("his");
          break;
        case "female":
          titles.add("Ms.");
          titles.add("Mrs.");
          titles.add("Lady");
          titles.add("Dame");
          pronouns.add("she");
          pronouns.add("her");
          pronouns.add("hers");
          break;
      }
    }

    // Add title + name combinations
    titles.forEach((title) => {
      variations.add(`${title} ${nameParts[0]}`);
      if (nameParts.length > 1) {
        variations.add(`${title} ${nameParts[nameParts.length - 1]}`);
      }
      variations.add(`${title} ${fullName}`);
    });

    // Add species-based descriptions
    if (character.species && character.species !== "Human") {
      const species = character.species.toLowerCase();
      variations.add(`the ${species}`);

      // Add gendered species descriptions
      if (character.gender) {
        const genderPrefix =
          character.gender.toLowerCase() === "male" ? "male" : "female";
        variations.add(`the ${genderPrefix} ${species}`);
      }
    }

    // Parse character states for additional names/titles
    // TODO: Could be enhanced to parse character states for temporal names

    return {
      characterId: character.id,
      variations: Array.from(variations),
      pronouns: Array.from(pronouns),
      titles: Array.from(titles),
      nicknames: Array.from(nicknames),
    };
  }

  /**
   * Find all character mentions in text
   */
  static findCharacterMentions(
    content: string,
    character: Character,
    sceneId: string,
    options: TextAnalysisOptions = {}
  ): CharacterMention[] {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const mentions: CharacterMention[] = [];
    const nameVariations = this.generateNameVariations(character);

    // Search for each name variation
    nameVariations.variations.forEach((variation) => {
      const matches = this.findTextMatches(content, variation, opts);

      matches.forEach((match) => {
        const mention: CharacterMention = {
          sceneId,
          characterId: character.id,
          mentionText: match.matchedText,
          startPosition: match.startPosition,
          endPosition: match.endPosition,
          contextBefore: this.extractContext(
            content,
            match.startPosition,
            -opts.contextLength
          ),
          contextAfter: this.extractContext(
            content,
            match.endPosition,
            opts.contextLength
          ),
          fullContext: this.extractFullContext(
            content,
            match.startPosition,
            match.endPosition,
            opts.fullContextLength
          ),
          mentionType: this.determineMentionType(variation, nameVariations),
          confidence: this.calculateConfidence(
            variation,
            character,
            content,
            match.startPosition
          ),
          lineNumber: this.getLineNumber(content, match.startPosition),
        };

        // Only include mentions above confidence threshold
        if (mention.confidence >= opts.minConfidence) {
          mentions.push(mention);
        }
      });
    });

    // Add pronoun matches if enabled
    if (opts.includePronounMatches) {
      nameVariations.pronouns.forEach((pronoun) => {
        const matches = this.findTextMatches(content, pronoun, opts);

        matches.forEach((match) => {
          // Pronouns need higher confidence threshold and context analysis
          const confidence = this.calculatePronounConfidence(
            pronoun,
            character,
            content,
            match.startPosition
          );

          if (confidence >= Math.max(opts.minConfidence, 0.8)) {
            // Higher threshold for pronouns
            const mention: CharacterMention = {
              sceneId,
              characterId: character.id,
              mentionText: match.matchedText,
              startPosition: match.startPosition,
              endPosition: match.endPosition,
              contextBefore: this.extractContext(
                content,
                match.startPosition,
                -opts.contextLength
              ),
              contextAfter: this.extractContext(
                content,
                match.endPosition,
                opts.contextLength
              ),
              fullContext: this.extractFullContext(
                content,
                match.startPosition,
                match.endPosition,
                opts.fullContextLength
              ),
              mentionType: "pronoun",
              confidence,
              lineNumber: this.getLineNumber(content, match.startPosition),
            };

            mentions.push(mention);
          }
        });
      });
    }

    // Sort by position and remove overlapping matches
    return this.deduplicateMatches(
      mentions.sort((a, b) => a.startPosition - b.startPosition)
    );
  }

  /**
   * Find all occurrences of a text pattern
   */
  private static findTextMatches(
    content: string,
    pattern: string,
    options: Required<TextAnalysisOptions>
  ): Array<{
    matchedText: string;
    startPosition: number;
    endPosition: number;
  }> {
    const matches: Array<{
      matchedText: string;
      startPosition: number;
      endPosition: number;
    }> = [];
    const flags = options.caseSensitive ? "g" : "gi";

    // Create word boundary regex for more accurate matching
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedPattern}\\b`, flags);

    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        matchedText: match[0],
        startPosition: match.index,
        endPosition: match.index + match[0].length,
      });

      // Prevent infinite loop
      if (!regex.global) break;
    }

    return matches;
  }

  /**
   * Extract context around a position
   */
  private static extractContext(
    content: string,
    position: number,
    length: number
  ): string {
    if (length < 0) {
      // Extract before position
      const start = Math.max(0, position + length);
      return content.substring(start, position).trim();
    } else {
      // Extract after position
      const end = Math.min(content.length, position + length);
      return content.substring(position, end).trim();
    }
  }

  /**
   * Extract full context around a mention
   */
  private static extractFullContext(
    content: string,
    startPosition: number,
    endPosition: number,
    contextLength: number
  ): string {
    const halfLength = Math.floor(contextLength / 2);
    const start = Math.max(0, startPosition - halfLength);
    const end = Math.min(content.length, endPosition + halfLength);

    return content.substring(start, end).trim();
  }

  /**
   * Determine the type of mention based on the matched text
   */
  private static determineMentionType(
    matchedText: string,
    nameVariations: CharacterNameVariations
  ): CharacterMention["mentionType"] {
    if (nameVariations.pronouns.includes(matchedText.toLowerCase())) {
      return "pronoun";
    }

    if (nameVariations.titles.some((title) => matchedText.includes(title))) {
      return "title";
    }

    if (matchedText.includes("the ")) {
      return "description";
    }

    return "name";
  }

  /**
   * Calculate confidence score for a mention
   */
  private static calculateConfidence(
    matchedText: string,
    character: Character,
    content: string,
    position: number
  ): number {
    let confidence = 0.5; // Base confidence

    // Exact name match = high confidence
    if (matchedText === character.name) {
      confidence = 0.95;
    }

    // Partial name match
    else if (
      character.name.includes(matchedText) ||
      matchedText.includes(character.name)
    ) {
      confidence = 0.8;
    }

    // Title-based matches
    else if (
      matchedText.includes("Lord") ||
      matchedText.includes("Lady") ||
      matchedText.includes("Sir") ||
      matchedText.includes("Dame")
    ) {
      confidence = 0.75;
    }

    // Adjust based on context (simple heuristics)
    const contextBefore = content
      .substring(Math.max(0, position - 50), position)
      .toLowerCase();
    const contextAfter = content
      .substring(position, Math.min(content.length, position + 50))
      .toLowerCase();

    // Dialogue context increases confidence
    if (contextBefore.includes('"') || contextAfter.includes('"')) {
      confidence += 0.1;
    }

    // Action context increases confidence
    if (
      contextBefore.includes("said") ||
      contextAfter.includes("said") ||
      contextBefore.includes("walked") ||
      contextAfter.includes("walked")
    ) {
      confidence += 0.05;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Calculate confidence for pronoun matches (more complex)
   */
  private static calculatePronounConfidence(
    pronoun: string,
    character: Character,
    content: string,
    position: number
  ): number {
    // Pronoun matching is complex and needs character name proximity analysis
    // This is a simplified implementation - could be much more sophisticated

    let confidence = 0.3; // Lower base confidence for pronouns

    // Look for character name in nearby context (within 100 characters)
    const contextWindow = 100;
    const start = Math.max(0, position - contextWindow);
    const end = Math.min(content.length, position + contextWindow);
    const nearbyContext = content.substring(start, end).toLowerCase();

    // If character name appears nearby, increase confidence
    const nameParts = character.name.toLowerCase().split(/\s+/);
    let nameFoundNearby = false;

    nameParts.forEach((namePart) => {
      if (nearbyContext.includes(namePart)) {
        nameFoundNearby = true;
        confidence += 0.3;
      }
    });

    // Gender matching
    const genderMatch = this.checkGenderPronounMatch(pronoun, character.gender);
    if (genderMatch) {
      confidence += 0.2;
    }

    // If no name found nearby, confidence is very low
    if (!nameFoundNearby) {
      confidence *= 0.3;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Check if pronoun matches character gender
   */
  private static checkGenderPronounMatch(
    pronoun: string,
    gender: string | null
  ): boolean {
    if (!gender) return false;

    const malePronouns = ["he", "him", "his"];
    const femalePronouns = ["she", "her", "hers"];

    const genderLower = gender.toLowerCase();
    const pronounLower = pronoun.toLowerCase();

    if (genderLower === "male" && malePronouns.includes(pronounLower)) {
      return true;
    }

    if (genderLower === "female" && femalePronouns.includes(pronounLower)) {
      return true;
    }

    return false;
  }

  /**
   * Get line number for a position in text
   */
  private static getLineNumber(content: string, position: number): number {
    const beforePosition = content.substring(0, position);
    return beforePosition.split("\n").length;
  }

  /**
   * Remove overlapping and duplicate matches
   */
  private static deduplicateMatches(
    mentions: CharacterMention[]
  ): CharacterMention[] {
    const deduplicated: CharacterMention[] = [];

    for (const mention of mentions) {
      // Check for overlaps with existing mentions
      const hasOverlap = deduplicated.some(
        (existing) =>
          mention.startPosition < existing.endPosition &&
          mention.endPosition > existing.startPosition
      );

      if (!hasOverlap) {
        deduplicated.push(mention);
      } else {
        // If there's an overlap, keep the one with higher confidence
        const overlappingIndex = deduplicated.findIndex(
          (existing) =>
            mention.startPosition < existing.endPosition &&
            mention.endPosition > existing.startPosition
        );

        if (
          overlappingIndex !== -1 &&
          mention.confidence > deduplicated[overlappingIndex].confidence
        ) {
          deduplicated[overlappingIndex] = mention;
        }
      }
    }

    return deduplicated;
  }
}
