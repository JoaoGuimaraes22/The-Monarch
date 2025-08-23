// app/components/characters/character-detail-content/character-relationships/index.ts
// Barrel exports for character relationships components

// Main section component
export { CharacterRelationshipsSection } from "./character-relationships-section";

// Dialog components
export { CreateRelationshipDialog } from "./create-relationship-dialog";
export { EditRelationshipDialog } from "./edit-relationship-dialog";
export { CreateRelationshipStateDialog } from "./create-relationship-state-dialog";
export { EditRelationshipStateDialog } from "./edit-relationship-state-dialog";

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
- EditRelationshipDialog: Edit base relationship information (NEW)
- CreateRelationshipStateDialog: Create relationship states
- EditRelationshipStateDialog: Edit existing relationship states

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

===== COMPLETE RELATIONSHIP MANAGEMENT =====

The Edit Relationship Dialog provides:
- Professional form for editing base relationship data
- Relationship type selection with icons and descriptions
- Character perspective editing (origin field)
- History, fundamental dynamic, and writer notes
- Pre-populated form with existing relationship data
- Full integration with useCharacterRelationships hook
- Proper validation and error handling
- Consistent styling matching your design system
*/
