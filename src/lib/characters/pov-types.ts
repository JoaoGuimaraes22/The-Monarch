// lib/characters/pov-types.ts
// POV-specific types and validation schemas

import { z } from "zod";

// ===== POV VALIDATION SCHEMAS =====
export const CreatePOVAssignmentSchema = z.object({
  characterId: z.string().cuid("Invalid character ID format"),
  scopeType: z.enum(["novel", "act", "chapter", "scene"]),
  startActId: z.string().cuid("Invalid act ID format").nullable().optional(),
  startChapterId: z
    .string()
    .cuid("Invalid chapter ID format")
    .nullable()
    .optional(),
  startSceneId: z
    .string()
    .cuid("Invalid scene ID format")
    .nullable()
    .optional(),
  endActId: z.string().cuid("Invalid act ID format").nullable().optional(),
  endChapterId: z
    .string()
    .cuid("Invalid chapter ID format")
    .nullable()
    .optional(),
  endSceneId: z.string().cuid("Invalid scene ID format").nullable().optional(),
  povType: z.enum(["primary", "secondary", "shared"]).default("primary"),
  importance: z.number().int().min(1).max(100).default(100),
  notes: z.string().max(1000, "Notes too long").optional(),
  assignedBy: z.string().max(255, "Assigned by too long").optional(),
  reason: z.string().max(500, "Reason too long").optional(),
});

export const UpdatePOVAssignmentSchema = z.object({
  scopeType: z.enum(["novel", "act", "chapter", "scene"]).optional(),
  startActId: z.string().cuid("Invalid act ID format").nullable().optional(),
  startChapterId: z
    .string()
    .cuid("Invalid chapter ID format")
    .nullable()
    .optional(),
  startSceneId: z
    .string()
    .cuid("Invalid scene ID format")
    .nullable()
    .optional(),
  endActId: z.string().cuid("Invalid act ID format").nullable().optional(),
  endChapterId: z
    .string()
    .cuid("Invalid chapter ID format")
    .nullable()
    .optional(),
  endSceneId: z.string().cuid("Invalid scene ID format").nullable().optional(),
  povType: z.enum(["primary", "secondary", "shared"]).optional(),
  importance: z.number().int().min(1).max(100).optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  assignedBy: z.string().max(255, "Assigned by too long").optional(),
  reason: z.string().max(500, "Reason too long").optional(),
});

export const POVAssignmentParamsSchema = z.object({
  id: z.string().cuid("Invalid novel ID format"),
  assignmentId: z.string().cuid("Invalid assignment ID format"),
});

export const CharacterPOVParamsSchema = z.object({
  id: z.string().cuid("Invalid novel ID format"),
  characterId: z.string().cuid("Invalid character ID format"),
});

export const POVQuerySchema = z.object({
  scopeType: z.enum(["novel", "act", "chapter", "scene"]).optional(),
  characterId: z.string().cuid("Invalid character ID format").optional(),
});

// ===== TYPE EXPORTS =====
export type POVScopeType = "novel" | "act" | "chapter" | "scene";
export type POVType = "primary" | "secondary" | "shared";

// Inferred types from schemas
export type CreatePOVAssignmentData = z.infer<typeof CreatePOVAssignmentSchema>;
export type UpdatePOVAssignmentData = z.infer<typeof UpdatePOVAssignmentSchema>;
export type POVQueryParams = z.infer<typeof POVQuerySchema>;
