// app/components/characters/character-detail-content/character-relationships/index.ts
// Barrel exports for character relationships components

// Main section component
export { CharacterRelationshipsSection } from "./character-relationships-section";

// Dialog components
export { CreateRelationshipDialog } from "./create-relationship-dialog";

// Main grid and card components
export { RelationshipsGrid } from "./relationships-grid";
export { RelationshipCard } from "./relationship-card";

// Header and navigation
export { RelationshipsHeader } from "./relationships-header";

// State components
export { RelationshipsEmptyState } from "./relationships-empty-state";
export { RelationshipsLoadingState } from "./relationships-loading-state";
export { RelationshipsErrorState } from "./relationships-error-state";

/*
===== CHARACTER RELATIONSHIPS COMPONENTS =====

Following your established component patterns:

✅ MODULAR DESIGN:
- RelationshipsGrid: Container for relationship cards
- RelationshipCard: Individual relationship display
- RelationshipsHeader: Section header with actions

✅ STATE COMPONENTS:
- RelationshipsEmptyState: No relationships yet
- RelationshipsLoadingState: Loading with skeleton
- RelationshipsErrorState: Error with retry option

✅ CONSISTENT STYLING:
- Dark theme (bg-gray-900, text-white)
- Red accents (text-red-500, border-red-700)
- Clean card layouts matching character system

✅ INTERACTIVE FEATURES:
- Relationship type icons and colors
- Strength/Trust/Conflict metrics
- View details and delete actions
- Loading states for all operations

✅ TYPE SAFETY:
- Full TypeScript coverage
- Proper interface definitions
- No any types used

===== USAGE PATTERNS =====

// Main relationships section
<RelationshipsHeader character={character} relationshipCount={relationships.length} />
<RelationshipsGrid relationships={relationships} onViewDetails={handleView} />

// State-specific rendering
{isLoading && <RelationshipsLoadingState character={character} />}
{error && <RelationshipsErrorState character={character} error={error} />}
{relationships.length === 0 && <RelationshipsEmptyState character={character} />}
*/
