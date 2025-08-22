// app/components/characters/index.ts
// Main aggregator for all character components

// ===== MAIN PAGE COMPONENTS =====
export { CharactersPageContent } from "./main-page-content/characters-page-content";
export { CharactersHeader } from "./main-page-content/characters-header";
export { CharactersStatsBar } from "./main-page-content/characters-stats-bar";
export { CharactersSearchBar } from "./main-page-content/characters-search-bar";
export { CharactersGrid } from "./main-page-content/characters-grid";
export { CharacterCard } from "./main-page-content/character-card";
export { CharactersEmptyState } from "./main-page-content/characters-empty-state";
export { CharactersLoadingState } from "./main-page-content/characters-loading-state";
export { CharactersErrorState } from "./main-page-content/characters-error-state";
export { CreateCharacterDialog } from "./main-page-content/create-character-dialog";

// ===== CHARACTER DETAIL COMPONENTS =====
export { CharacterDetailPageContent } from "./character-detail-content/character-detail-page-content";
export { CharacterDetailHeader } from "./character-detail-content/character-global/character-detail-header";
export { CharacterDetailSidebar } from "./character-detail-content/character-global/character-detail-sidebar";
export { CharacterProfileSection } from "./character-detail-content/character-profile/character-profile-section";
export { CharacterStatesTimeline } from "./character-detail-content/character-state/character-states-timeline";
export { CharacterRelationshipsSection } from "./character-detail-content/character-relationships-section";
export { CharacterManuscriptSection } from "./character-detail-content/character-manuscript-section";
export { CharacterDetailLoadingState } from "./character-detail-content/character-global/character-detail-loading-state";
export { CharacterDetailErrorState } from "./character-detail-content/character-global/character-detail-error-state";
export { CreateCharacterStateDialog } from "./character-detail-content/character-state/create-character-state-dialog";
export { EditCharacterStateDialog } from "./character-detail-content/character-state/edit-character-state-dialog"; // ✅ NEW: Add this export

// ===== TYPES =====
export type { CharacterWithCurrentState } from "@/lib/characters/character-service";
