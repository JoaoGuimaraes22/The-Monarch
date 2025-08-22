// app/components/characters/character-detail-content/index.ts
// Barrel exports for character detail page components

// Main detail page coordinator
export { CharacterDetailPageContent } from "./character-detail-page-content";

// Header and navigation
export { CharacterDetailHeader } from "./character-detail-header";
export { CharacterDetailSidebar } from "./character-detail-sidebar";

// Content sections
export { CharacterProfileSection } from "./character-profile-section";
export { CharacterStatesTimeline } from "./character-states-timeline";
export { CharacterRelationshipsSection } from "./character-relationships-section";
export { CharacterManuscriptSection } from "./character-manuscript-section";

// Dialogs and forms
export { CreateCharacterStateDialog } from "./create-character-state-dialog";
export { EditCharacterDialog } from "./edit-character-dialog";
export { EditCharacterStateDialog } from "./edit-character-state-dialog"; // ✅ NEW: Add this export

// State components
export { CharacterDetailLoadingState } from "./character-detail-loading-state";
export { CharacterDetailErrorState } from "./character-detail-error-state";
