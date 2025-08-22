// app/components/characters/character-detail-content/index.ts
// Barrel exports for character detail page components

// Main detail page coordinator
export { CharacterDetailPageContent } from "./character-detail-page-content";

// Header and navigation
export { CharacterDetailHeader } from "./character-global/character-detail-header";
export { CharacterDetailSidebar } from "./character-global/character-detail-sidebar";

// Content sections
export { CharacterProfileSection } from "./character-profile/character-profile-section";
export { CharacterStatesTimeline } from "./character-state/character-states-timeline";
export { CharacterRelationshipsSection } from "./character-relationships/character-relationships-section";
export { CharacterManuscriptSection } from "./character-manuscript-section";

// Dialogs and forms
export { CreateCharacterStateDialog } from "./character-state/create-character-state-dialog";
export { EditCharacterDialog } from "./character-profile/edit-character-dialog";
export { EditCharacterStateDialog } from "./character-state/edit-character-state-dialog";

// State components
export { CharacterDetailLoadingState } from "./character-global/character-detail-loading-state";
export { CharacterDetailErrorState } from "./character-global/character-detail-error-state";
