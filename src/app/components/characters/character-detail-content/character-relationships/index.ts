// app/components/characters/character-detail-content/character-relationships/index.ts
// Barrel exports for character relationships components

// Main section component
export { CharacterRelationshipsSection } from "./character-relationships-section";

// Dialog components
export { CreateRelationshipDialog } from "./create-relationship-dialog";
export { CreateRelationshipStateDialog } from "./create-relationship-state-dialog";

// Detail view
export { RelationshipDetailView } from "./relationship-detail-view";

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
- RelationshipDetailView: Full relationship detail with timeline

✅ DIALOG COMPONENTS:
- CreateRelationshipDialog: Create new relationships
- CreateRelationshipStateDialog: Create relationship states (NEW)

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
- Professional form controls with sliders and selects

✅ TYPE SAFETY:
- Full TypeScript coverage
- Proper interface definitions
- No any types used

===== USAGE PATTERNS =====

// Main relationships section
<RelationshipsHeader character={character} relationshipCount={relationships.length} />
<RelationshipsGrid relationships={relationships} onViewDetails={handleView} />

// Detail view with create state capability
<RelationshipDetailView
  relationship={relationship}
  novelId={novelId}
  characterId={characterId}
  onBack={handleBack}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// State-specific rendering
{isLoading && <RelationshipsLoadingState character={character} />}
{error && <RelationshipsErrorState character={character} error={error} />}
{relationships.length === 0 && <RelationshipsEmptyState character={character} />}

===== COMPLETE RELATIONSHIP STATE CREATION =====

The CreateRelationshipStateDialog provides:
- Professional form with current type selection
- Dynamic sliders for strength, trust, and conflict levels
- Power balance selection with smart defaults
- Public vs private status fields
- Story context with scope type selection
- Full integration with useCreateRelationshipState hook
- Proper validation and error handling
*/
