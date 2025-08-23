// lib/characters/pov-service.ts
// POV management service following established character service patterns

import { prisma } from "@/lib/prisma";

// ===== CORE INTERFACES =====
export interface POVAssignment {
  id: string;
  novelId: string;
  characterId: string;
  scopeType: string;
  startActId: string | null;
  startChapterId: string | null;
  startSceneId: string | null;
  endActId: string | null;
  endChapterId: string | null;
  endSceneId: string | null;
  povType: string;
  importance: number;
  notes: string | null;
  assignedBy: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface POVAssignmentWithCharacter extends POVAssignment {
  character: {
    id: string;
    name: string;
    imageUrl: string | null;
    species: string;
  };
}

// ===== CREATION OPTIONS =====
export interface CreatePOVAssignmentOptions {
  novelId: string;
  characterId: string;
  scopeType: "novel" | "act" | "chapter" | "scene";
  startActId?: string | null;
  startChapterId?: string | null;
  startSceneId?: string | null;
  endActId?: string | null;
  endChapterId?: string | null;
  endSceneId?: string | null;
  povType?: "primary" | "secondary" | "shared";
  importance?: number;
  notes?: string;
  assignedBy?: string;
  reason?: string;
}

// ===== UPDATE OPTIONS =====
export interface UpdatePOVAssignmentOptions {
  scopeType?: "novel" | "act" | "chapter" | "scene";
  startActId?: string | null;
  startChapterId?: string | null;
  startSceneId?: string | null;
  endActId?: string | null;
  endChapterId?: string | null;
  endSceneId?: string | null;
  povType?: "primary" | "secondary" | "shared";
  importance?: number;
  notes?: string;
  assignedBy?: string;
  reason?: string;
}

// ===== STATISTICS INTERFACE =====
export interface POVStatistics {
  totalAssignments: number;
  uniquePOVCharacters: number;
  scopeDistribution: Record<string, number>;
  characterPOVCounts: Array<{
    characterId: string;
    characterName: string;
    assignmentCount: number;
  }>;
}

// ===== POV SERVICE =====
export class POVService {
  /**
   * Get all POV assignments for a novel
   */
  async getPOVAssignments(
    novelId: string
  ): Promise<POVAssignmentWithCharacter[]> {
    return await prisma.pOVAssignment.findMany({
      where: { novelId },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            species: true,
          },
        },
      },
      orderBy: [
        { scopeType: "desc" }, // More specific scopes first
        { importance: "desc" },
        { createdAt: "asc" },
      ],
    });
  }

  /**
   * Get POV assignments for a specific character
   */
  async getCharacterPOVAssignments(
    characterId: string
  ): Promise<POVAssignmentWithCharacter[]> {
    return await prisma.pOVAssignment.findMany({
      where: { characterId },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            species: true,
          },
        },
      },
      orderBy: [
        { scopeType: "desc" },
        { importance: "desc" },
        { createdAt: "asc" },
      ],
    });
  }

  /**
   * Create a new POV assignment
   */
  async createPOVAssignment(
    options: CreatePOVAssignmentOptions
  ): Promise<POVAssignment> {
    return await prisma.pOVAssignment.create({
      data: {
        novelId: options.novelId,
        characterId: options.characterId,
        scopeType: options.scopeType,
        startActId: options.startActId || null,
        startChapterId: options.startChapterId || null,
        startSceneId: options.startSceneId || null,
        endActId: options.endActId || null,
        endChapterId: options.endChapterId || null,
        endSceneId: options.endSceneId || null,
        povType: options.povType || "primary",
        importance: options.importance || 100,
        notes: options.notes || null,
        assignedBy: options.assignedBy || null,
        reason: options.reason || null,
      },
    });
  }

  /**
   * Update an existing POV assignment
   */
  async updatePOVAssignment(
    assignmentId: string,
    options: UpdatePOVAssignmentOptions
  ): Promise<POVAssignment> {
    return await prisma.pOVAssignment.update({
      where: { id: assignmentId },
      data: {
        scopeType: options.scopeType,
        startActId: options.startActId,
        startChapterId: options.startChapterId,
        startSceneId: options.startSceneId,
        endActId: options.endActId,
        endChapterId: options.endChapterId,
        endSceneId: options.endSceneId,
        povType: options.povType,
        importance: options.importance,
        notes: options.notes,
        assignedBy: options.assignedBy,
        reason: options.reason,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete a POV assignment
   */
  async deletePOVAssignment(assignmentId: string): Promise<boolean> {
    try {
      await prisma.pOVAssignment.delete({
        where: { id: assignmentId },
      });
      return true;
    } catch (error) {
      console.error("Error deleting POV assignment:", error);
      return false;
    }
  }

  /**
   * Get POV assignments for a specific scope
   */
  async getPOVAssignmentsByScope(
    novelId: string,
    scopeType: "novel" | "act" | "chapter" | "scene",
    scopeId?: string
  ): Promise<POVAssignmentWithCharacter[]> {
    const whereClause: Record<string, unknown> = {
      novelId,
      scopeType,
    };

    // Add specific scope ID filtering
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

    return await prisma.pOVAssignment.findMany({
      where: whereClause,
      include: {
        character: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            species: true,
          },
        },
      },
      orderBy: [{ importance: "desc" }, { createdAt: "asc" }],
    });
  }

  /**
   * Get POV statistics for a novel
   */
  async getPOVStatistics(novelId: string): Promise<POVStatistics> {
    const assignments = await this.getPOVAssignments(novelId);

    const uniqueCharacters = new Map<string, string>();
    const scopeCounts: Record<string, number> = {};
    const characterCounts: Record<string, number> = {};

    assignments.forEach((assignment) => {
      // Track unique characters
      uniqueCharacters.set(assignment.characterId, assignment.character.name);

      // Count by scope
      scopeCounts[assignment.scopeType] =
        (scopeCounts[assignment.scopeType] || 0) + 1;

      // Count by character
      characterCounts[assignment.characterId] =
        (characterCounts[assignment.characterId] || 0) + 1;
    });

    // Convert character counts to array format
    const characterPOVCounts = Array.from(uniqueCharacters.entries()).map(
      ([characterId, characterName]) => ({
        characterId,
        characterName,
        assignmentCount: characterCounts[characterId] || 0,
      })
    );

    return {
      totalAssignments: assignments.length,
      uniquePOVCharacters: uniqueCharacters.size,
      scopeDistribution: scopeCounts,
      characterPOVCounts,
    };
  }

  /**
   * Check if character has POV assignments
   */
  async hasCharacterPOVAssignments(characterId: string): Promise<boolean> {
    const count = await prisma.pOVAssignment.count({
      where: { characterId },
    });
    return count > 0;
  }
}

// Export singleton instance following your pattern
export const povService = new POVService();
