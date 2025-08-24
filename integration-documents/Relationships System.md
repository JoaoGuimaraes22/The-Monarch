# Character Relationships System - Complete Planning Summary

## 🎯 System Architecture Overview

### Two-Tier Relationship Model

Following the proven Character → CharacterState pattern:

**Base Relationships** (Static Foundation)

- `CharacterRelationship` model - permanent connection between characters
- Contains: baseType, origin, history, fundamentalDynamic, writerNotes
- Like the `Character` model - core identity that rarely changes

**Relationship States** (Temporal Evolution)

- `RelationshipState` model - how relationships evolve over time
- Contains: currentType, strength, trust/conflict levels, power balance, status
- Like the `CharacterState` model - temporal changes with story scope

### Bidirectional Records Strategy

- Store TWO database records for each relationship (A→B and B→A)
- Enables asymmetric relationships ("Lyra trusts Marcus more than Marcus trusts Lyra")
- Each character has their own perspective on the relationship
- Supports rich, nuanced storytelling

## 🗃️ Database Schema

### CharacterRelationship Model (Enhanced)

```typescript
model CharacterRelationship {
  id              String @id @default(cuid())

  // Directional relationship
  fromCharacterId String
  fromCharacter   Character @relation("FromCharacter")
  toCharacterId   String
  toCharacter     Character @relation("ToCharacter")

  // STATIC foundation (never changes)
  baseType        String   // "family" | "romantic" | "professional" | "antagonistic" | "mentor_student" | "friendship"
  origin          String?  // "Childhood friends who became engaged"
  history         String?  // Background of the relationship
  fundamentalDynamic String? // Core pattern that doesn't change

  // Meta
  writerNotes     String?

  // NEW: Temporal evolution
  relationshipStates RelationshipState[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([fromCharacterId, toCharacterId])
}
```

### RelationshipState Model (New)

```typescript
model RelationshipState {
  id              String @id @default(cuid())

  relationshipId  String
  relationship    CharacterRelationship @relation(fields: [relationshipId], references: [id], onDelete: Cascade)

  // EVOLVING relationship state (changes over time)
  currentType     String   // "ally" | "enemy" | "romantic" | "neutral" | "complicated"
  subtype         String?  // "bitter enemies" | "secret lovers" | "estranged siblings"
  strength        Int @default(5) // 1-10 intensity

  // Status (public vs private)
  publicStatus    String?  // How they appear in public
  privateStatus   String?  // True nature of relationship

  // Emotional dynamics
  trustLevel      Int @default(5)    // 1-10
  conflictLevel   Int @default(1)    // 1-10
  powerBalance    String @default("equal") // "equal" | "a_dominant" | "b_dominant" | "shifting"

  // Temporal scope (same as CharacterState)
  scopeType       String   // "novel" | "act" | "chapter" | "scene"
  startActId      String?
  startChapterId  String?
  startSceneId    String?
  endActId        String?
  endChapterId    String?
  endSceneId      String?

  // Change tracking
  changes         String?  // JSON as string: what changed and why
  triggerSceneId  String? // Scene that caused this change

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 🏗️ Service Layer Architecture

Following established patterns from character-service.ts:

### RelationshipService (`/lib/characters/relationship-service.ts`)

```typescript
export interface CharacterRelationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  baseType: string;
  origin?: string;
  history?: string;
  fundamentalDynamic?: string;
  writerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipWithCharacters extends CharacterRelationship {
  fromCharacter: Character;
  toCharacter: Character;
  relationshipStates: RelationshipState[];
}

// Core service methods
-createRelationshipPair() - // Creates bidirectional relationships
  getCharacterRelationships() - // Character's perspective on all relationships
  updateRelationshipWithSync() - // Update with smart sync option
  getRelationshipHistory(); // Timeline of relationship evolution
```

### API Routes Structure

Following established `/api/novels/[id]/characters/[characterId]/` pattern:

- `GET/POST /api/novels/[id]/characters/[characterId]/relationships`
- `GET/PUT/DELETE /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]`
- `GET/POST /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states`
- `GET/PUT/DELETE /api/novels/[id]/characters/[characterId]/relationships/[relationshipId]/states/[stateId]`

## 🎣 React Hooks Architecture

Following established useCharacters/useCharacterStates patterns:

### Core Hooks

- `useCharacterRelationships(characterId)` - Main relationship management
- `useRelationshipStates(relationshipId)` - State CRUD operations
- `useCreateRelationship()` - Simplified creation with bidirectional support
- `useUpdateRelationship()` - Updates with smart sync options
- `useDeleteRelationship()` - Handles bidirectional deletion

## 🎨 UI Component Structure

Following established component organization patterns:

### Component Hierarchy

```
src/app/components/characters/character-detail-content/
├── character-relationships/
│   ├── character-relationships-section.tsx        # Main container (exists)
│   ├── relationships-grid.tsx                     # Display grid
│   ├── relationship-card.tsx                      # Individual relationship
│   ├── create-relationship-dialog.tsx             # Creation form
│   ├── edit-relationship-dialog.tsx               # Edit with smart sync
│   ├── relationship-detail-view.tsx               # Expanded timeline view
│   ├── relationship-states-timeline.tsx           # States evolution
│   └── relationship-sync-controls.tsx             # Smart sync UI
```

### Key UI Features

- **Relationship Cards**: Show other character + relationship summary from current character's perspective
- **Timeline View**: Detailed relationship evolution (mirrors character states timeline)
- **Bidirectional View**: Switch between perspectives in relationship detail
- **Smart Sync Toggle**: Optional automatic synchronization of reciprocal relationships

## 🔄 Smart Synchronization System

### Core Concept

When editing a relationship, users can optionally enable "Smart Sync" to automatically update the reciprocal relationship with intelligent defaults.

### Smart Sync Features

- **Toggle Control**: Enable/disable per edit operation
- **Preview Mode**: Show exactly what changes will be applied to reciprocal relationship
- **Granular Controls**: Choose which fields to sync (trust, conflict, type, power balance)
- **Intensity Slider**: Control how much influence changes have (10%-100%)
- **User Preferences**: Remember default sync settings

### Smart Sync Logic Examples

- **Trust Level**: 70% influence on reciprocal trust
- **Conflict Level**: Mirror changes exactly
- **Relationship Type**: Smart mapping (mentor ↔ student, ally ↔ ally)
- **Power Balance**: Inverse mapping (a_dominant ↔ b_dominant)

## 🚀 User Experience Flow

### Creating Relationships

1. **From Character A's page**: Click "Add Relationship"
2. **Select Character B**: ComboSelect with search
3. **Set relationship data**: Form with smart reciprocal suggestions
4. **Auto-creation**: System creates both A→B and B→A relationships
5. **Immediate visibility**: Relationship appears on both character pages

### Editing Relationships

1. **Smart Sync Toggle**: Choose automatic vs independent editing
2. **Real-time Preview**: See reciprocal changes before applying
3. **Granular Control**: Advanced sync settings for power users
4. **Perspective Switching**: View/edit from either character's perspective

### Relationship Timeline

1. **Base Relationship Card**: Static foundation info
2. **States Timeline**: Evolution over story (mirrors character states UI)
3. **Bidirectional Views**: Side-by-side perspectives
4. **Integration**: Links to character states and manuscript scenes

## 📊 Integration Points

### Character States Integration

- Relationship changes can trigger character state changes
- Character development can influence relationship evolution
- Cross-referencing via `triggerSceneId`

### Manuscript Integration

- Track relationships mentioned in scenes
- POV character relationship context
- Scene-based relationship state changes

### Timeline Synchronization

- Relationship states use same scope system as character states
- Unified timeline view showing character + relationship evolution
- Conflict detection between contradictory relationship states

## ⚡ Advanced Features (Future)

### Visual Relationship Network

- Interactive graph showing all character connections
- Relationship strength visualization
- Faction/alliance mapping

### Conflict Detection

- Alert when relationship states contradict each other
- Suggest resolution paths
- Timeline consistency checking

### Analytics & Insights

- Character relationship metrics
- Story complexity analysis
- Relationship arc tracking

## 🎯 Implementation Strategy

### Phase 1: Foundation

- Database schema updates
- Service layer implementation
- Basic API routes
- Core hooks architecture

### Phase 2: Basic UI

- Relationship cards and grid
- Simple create/edit dialogs
- Timeline display (following character states pattern)

### Phase 3: Smart Sync

- Bidirectional synchronization
- Smart sync toggle and controls
- Preview system
- User preferences

### Phase 4: Advanced Features

- Visual relationship mapping
- Advanced analytics
- Deep manuscript integration

## 📋 Technical Requirements

### Database Changes

- Add `RelationshipState` model to Prisma schema
- Update `CharacterRelationship` to include `relationshipStates` relation
- Migration scripts for existing data

### Service Layer Requirements

- Follow established parameter object patterns
- Type-safe interfaces with proper validation
- JSON field handling for SQLite compatibility
- Error handling and logging

### UI Component Requirements

- Use established UI component library (ComboSelect, Select, ArrayField)
- Follow dark theme design system (bg-black, bg-gray-900, text-red-500)
- Implement proper loading and error states
- Maintain accessibility standards

### API Requirements

- Follow established middleware patterns (withValidation, withRateLimit)
- Zod schema validation for all endpoints
- Proper error responses and status codes
- Rate limiting for relationship operations

---

_This system perfectly mirrors your character management excellence while adding sophisticated relationship tracking that scales from simple family connections to complex political webs. Ready to implement when you are!_ 🚀
