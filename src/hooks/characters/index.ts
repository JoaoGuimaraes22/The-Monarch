// hooks/characters/index.ts
// Updated barrel exports for character hooks - adding manuscript hooks

// ===== MAIN HOOKS =====
export { useCharacters } from "./useCharacters";
export {
  useCharacterStates,
  useCreateCharacterState,
  useUpdateCharacterState,
  useDeleteCharacterState,
} from "./useCharacterStates";

// ===== POV HOOKS =====
export {
  usePOVAssignments,
  useCharacterPOV,
  useCreatePOVAssignment,
} from "./pov";

// ===== MANUSCRIPT HOOKS =====
export { useCharacterMentions } from "./manuscript";

// ===== RELATIONSHIP HOOKS =====
export {
  useCharacterRelationships,
  useRelationshipStates,
  useCreateRelationship,
  useCreateRelationshipState,
} from "./relationships";

// ===== TYPE EXPORTS =====
export type { UseCharacterStatesReturn } from "./useCharacterStates";

// POV hook types
export type {
  UsePOVAssignmentsReturn,
  UseCharacterPOVReturn,
  UseCreatePOVAssignmentReturn,
} from "./pov";

// ✨ NEW: Manuscript hook types
export type {
  UseCharacterMentionsReturn,
  MentionAnalysisOptions,
} from "./manuscript";

// Relationship hook types
export type {
  UseCharacterRelationshipsReturn,
  UseRelationshipStatesReturn,
  UseCreateRelationshipReturn,
  UseCreateRelationshipStateReturn,
} from "./relationships";
