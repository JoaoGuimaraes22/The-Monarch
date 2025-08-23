// hooks/characters/index.ts
// Updated barrel exports for character hooks - adding POV hooks

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

// Relationship hook types
export type {
  UseCharacterRelationshipsReturn,
  UseRelationshipStatesReturn,
  UseCreateRelationshipReturn,
  UseCreateRelationshipStateReturn,
} from "./relationships";

/*
===== CHARACTER HOOKS ARCHITECTURE =====

Following your established patterns from manuscript hooks:

✅ MAIN HOOKS (Public API):
- useCharacters: Complete character management for a novel
- useCharacterStates: Character state management with CRUD operations
- useCreateCharacterState: Simplified hook for character detail page
- useUpdateCharacterState: Simplified hook for updating states
- useDeleteCharacterState: Simplified hook for deleting states

✅ POV HOOKS (NEW):
- usePOVAssignments: Complete POV management for a novel
- useCharacterPOV: Character-specific POV queries and analysis
- useCreatePOVAssignment: Simplified hook for POV creation dialogs

✅ RELATIONSHIP HOOKS (Existing):
- useCharacterRelationships: Complete relationship management for a character
- useRelationshipStates: Relationship state management with CRUD operations
- useCreateRelationship: Simplified hook for relationship creation dialogs
- useCreateRelationshipState: Simplified hook for state creation dialogs

✅ MODULAR DESIGN:
- Each hook has a single responsibility
- Clean separation between character, states, POV, and relationships
- Type-safe interfaces throughout

✅ ESTABLISHED PATTERNS:
- Similar to useManuscript* hook family
- Consistent error handling and loading states
- Optimistic updates for better UX
- Parameter object patterns

===== USAGE PATTERNS =====

// Main characters page
const { characters, createCharacter, deleteCharacter } = useCharacters(novelId);

// Character detail page (full states management)
const statesHook = useCharacterStates(initialStates);

// Character detail page (simplified hooks)
const { createState, isCreating } = useCreateCharacterState(novelId, characterId);
const { updateState, isUpdating } = useUpdateCharacterState(novelId, characterId);
const { deleteState, isDeleting } = useDeleteCharacterState(novelId, characterId);

// Novel POV management (NEW)
const { assignments, statistics, createAssignment } = usePOVAssignments(novelId);

// Character POV analysis (NEW)
const { hasPOV, isPOVCharacterForScope } = useCharacterPOV(characterId);

// POV creation dialog (NEW)
const { createAssignment, isCreating } = useCreatePOVAssignment(novelId);

// Character relationships
const relationshipsHook = useCharacterRelationships(novelId, characterId);
const statesHook = useRelationshipStates(novelId, characterId, relationshipId);
const { createRelationship, isCreating } = useCreateRelationship(novelId, characterId);
const { createState, isCreating } = useCreateRelationshipState(novelId, characterId, relationshipId);
*/
