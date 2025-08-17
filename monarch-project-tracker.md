# The Monarch Story Platform - Project Handoff Document

## 🎯 Project Overview

**Goal**: Build a story development platform tailored for _The Monarch_ epic fantasy series, focusing on practical utility over marketing fluff.

**User**: Aspiring fantasy writer building a complex narrative management system
**Philosophy**: Build what's genuinely useful, component-first architecture, dark theme matching Claude interface

## 🎨 Design System

**Theme**: Clean black/white/red aesthetic

- **Backgrounds**: `bg-black` (headers), `bg-gray-900` (pages), `bg-gray-800` (cards), `bg-gray-700` (inputs)
- **Text**: `text-white` (primary), `text-gray-300` (secondary), `text-gray-400` (tertiary)
- **Accents**: `text-red-500` (highlights), `border-red-700` (active states)
- **NO gradients or fancy effects** - clean and minimal like Claude interface

## 🗂️ Current Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── novels/
│   │   ├── page.tsx               # Novel selection page
│   │   ├── layout.tsx             # Temporary minimal layout
│   │   └── [novelId]/
│   │       ├── layout.tsx         # Workspace wrapper layout
│   │       ├── dashboard/page.tsx # Main workspace dashboard
│   │       ├── manuscript/page.tsx # Manuscript manager coordinator
│   │       └── characters/page.tsx # Placeholder
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── logo.tsx
│   │   │   ├── editable-text.tsx
│   │   │   └── index.ts           # Barrel exports
│   │   ├── novel-selection-page/  # Feature components
│   │   │   ├── page-header.tsx
│   │   │   ├── novel-card.tsx
│   │   │   ├── create-novel-form.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── novels-grid.tsx
│   │   │   └── delete-confirmation-dialog.tsx
│   │   ├── workspace/             # Workspace components
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-context.tsx # Context for sidebar state management
│   │   │   ├── workspace-layout.tsx
│   │   │   └── dashboard-page.tsx
│   │   └── manuscript/            # ✅ COMPLETE: Clean component architecture
│   │       ├── manuscript-editor/ # Main editor with sub-components
│   │       │   ├── manuscript-header.tsx          # Header with view selector
│   │       │   ├── manuscript-structure-sidebar.tsx # Left sidebar
│   │       │   ├── manuscript-metadata-sidebar.tsx  # Right sidebar
│   │       │   ├── manuscript-content-area.tsx   # Editor area
│   │       │   ├── manuscript-editor.tsx         # Main coordinator
│   │       │   ├── scene-card.tsx                # ✅ Scene grid cards
│   │       │   ├── scene-grid.tsx                # ✅ Grid layout component
│   │       │   └── index.ts                      # Barrel exports
│   │       ├── chapter-tree/      # ✅ COMPLETE: Hierarchical navigation with CRUD
│   │       │   ├── types.ts                      # Shared interfaces
│   │       │   ├── utils.ts                      # Utility functions
│   │       │   ├── enhanced-act-item.tsx         # Act tree items with inline editing
│   │       │   ├── enhanced-chapter-item.tsx     # Chapter tree items with inline editing
│   │       │   ├── enhanced-scene-item.tsx       # Scene tree items with inline editing
│   │       │   ├── enhanced-chapter-tree.tsx     # Main tree component
│   │       │   ├── add-act-interface.tsx         # ✅ NEW: Add act UI component
│   │       │   └── index.ts                      # Barrel exports
│   │       ├── docx-uploader.tsx
│   │       ├── delete-confirmation-dialog.tsx
│   │       ├── manuscript-empty-state.tsx
│   │       ├── scene-text-editor.tsx # ✅ Professional Tiptap editor
│   │       ├── view-mode-selector.tsx # Scene/Chapter/Act view toggle
│   │       └── content-aggregation-service.ts # Multi-level content logic
│   └── api/
│       └── novels/
│           ├── route.ts           # GET, POST /api/novels
│           ├── [id]/
│           │   ├── route.ts       # GET, PUT, DELETE /api/novels/[id]
│           │   ├── import/route.ts # POST /api/novels/[id]/import
│           │   ├── structure/route.ts # GET, DELETE /api/novels/[id]/structure
│           │   ├── acts/
│           │   │   ├── route.ts   # ✅ NEW: POST /api/novels/[id]/acts (create act)
│           │   │   └── [actId]/
│           │   │       ├── route.ts # PUT, DELETE /api/novels/[id]/acts/[actId]
│           │   │       └── chapters/
│           │   │           └── route.ts # POST /api/novels/[id]/acts/[actId]/chapters
│           │   ├── chapters/[chapterId]/
│           │   │   ├── route.ts # PUT, DELETE /api/novels/[id]/chapters/[chapterId]
│           │   │   └── scenes/
│           │   │       └── route.ts # POST /api/novels/[id]/chapters/[chapterId]/scenes
│           │   └── scenes/[sceneId]/
│           │       └── route.ts # PUT, DELETE /api/novels/[id]/scenes/[sceneId]
├── hooks/
│   └── useNovels.ts              # React hooks for novel operations
├── lib/
│   ├── prisma.ts                 # Database client
│   ├── novels.ts                 # Novel service layer (comprehensive CRUD)
│   └── docx-parser.ts            # Document parsing using mammoth
└── prisma/
    └── schema.prisma             # Database schema (Acts, Chapters, Scenes)
```

## 🗄️ Database Setup

**Stack**: Prisma + SQLite
**Current Schema**:

```prisma
model Novel {
  id          String   @id @default(cuid())
  title       String
  description String
  coverImage  String?
  wordCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  acts        Act[]
  @@map("novels")
}

model Act {
  id        String   @id @default(cuid())
  title     String
  order     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  novelId   String
  novel     Novel     @relation(fields: [novelId], references: [id], onDelete: Cascade)
  chapters  Chapter[]
  @@map("acts")
}

model Chapter {
  id        String   @id @default(cuid())
  title     String
  order     Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  actId     String
  act       Act     @relation(fields: [actId], references: [id], onDelete: Cascade)
  scenes    Scene[]
  @@map("chapters")
}

model Scene {
  id        String   @id @default(cuid())
  title     String   @default("")          # Scene title field
  content   String   @default("")
  wordCount Int      @default(0)
  order     Int
  povCharacter String?
  sceneType    String   @default("")
  notes        String   @default("")
  status       String   @default("draft") # draft, review, complete
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  chapterId String
  chapter   Chapter @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  @@map("scenes")
}
```

## ✅ Completed Features

### **1. Landing Page**
- **File**: `src/app/page.tsx`
- Royal dark theme hero section
- Navigation to `/novels` via "Start Your Story" button
- Uses Logo component and Button components

### **2. Novel Selection Page**
- **Route**: `/novels`
- **Components**: All in `src/app/components/novel-selection-page/`
- **Features**:
  - Create new novels (title, description, optional cover image)
  - Display novels in card grid layout
  - Delete novels with confirmation dialog
  - Empty state for first-time users
  - Dark theme throughout

### **3. Workspace Layout with Collapsible Sidebars**
- **Route**: `/novels/[novelId]/dashboard` (and other sections)
- **Components**: `src/app/components/workspace/`
- **Features**:
  - Main sidebar (256px ↔ 64px) with 8 navigation sections
  - Context-based sidebar state management
  - Active state highlighting with red theme
  - Novel context in sidebar header
  - Dashboard with stats, recent activity, quick actions

### **4. UI Component Library**
- **Location**: `src/app/components/ui/`
- **Components**: Button, Card, Input, Textarea, Badge, Alert, Logo, EditableText
- **All themed** with dark Claude interface colors
- **Barrel exports** for clean imports: `import { Button, Card } from '@/app/components/ui'`

### **5. Data Layer**
- **Prisma service**: `src/lib/novels.ts` - Database operations
- **React hooks**: `src/hooks/useNovels.ts` - Client-side state management
- **API routes**: Proper Next.js API routes for all CRUD operations
- **Type safety**: TypeScript interfaces throughout

### **6. ✅ COMPLETE: Professional Manuscript Manager**

**Current Status**: Fully functional multi-level writing environment with excellent UX

**Features Implemented**:

1. **Document Import System**
   - DocxUploader component with drag-and-drop
   - Server-side parsing using mammoth.js
   - Automatic detection of Acts (H1), Chapters (H2), Scenes (*** or ---)
   - Word count calculation and structure validation
   - Progress feedback and error handling

2. **✅ COMPLETE: Multi-Level Content Viewing**
   - **Scene Mode**: Single scene editing (editable)
   - **Chapter Mode**: All scenes in chapter with separators (read-only)
   - **Act Mode**: All scenes + chapters with clear boundaries (read-only)
   - **Smart View Switching**: Click view mode buttons to auto-select parent containers
   - **Intelligent Navigation**: Click chapters/acts in sidebar to switch view modes
   - **Content Aggregation**: Clean HTML separators between scenes/chapters

3. **✅ COMPLETE: Clean Component Architecture**
   - **ManuscriptEditor**: Main coordinator (80 lines vs 200+)
   - **ManuscriptHeader**: View selector and title display
   - **ManuscriptStructureSidebar**: Chapter tree navigation
   - **ManuscriptMetadataSidebar**: Scene details panel
   - **ManuscriptContentArea**: Editor area wrapper
   - **EnhancedChapterTree**: Hierarchical navigation (enhanced sub-components)

4. **Enhanced Chapter Tree Navigation**
   - **Hierarchical view**: Acts → Chapters → Scenes
   - **Smart selection highlighting**: Shows exactly what level you're viewing
   - **Expand/collapse functionality** with auto-expansion for selected content
   - **Status indicators** for scenes (draft/review/complete)
   - **Word count display** for each level
   - **Action buttons** with edit/delete options (hover-to-show)

5. **✅ COMPREHENSIVE DELETE SYSTEM**
   - **Delete Individual Scenes**: Remove single scenes with confirmation
   - **Delete Chapters**: Remove chapter + all scenes within it
   - **Delete Acts**: Remove act + all chapters + all scenes within it
   - **Delete Entire Manuscript**: Nuclear option to wipe all content
   - **Smart Features**:
     - Cascading deletes (parent removes all children)
     - Automatic reordering (no gaps in numbering)
     - Word count recalculation after deletions
     - Transaction safety (atomic database operations)
     - Confirmation dialogs with appropriate warnings

6. **✅ PROFESSIONAL RICH TEXT EDITOR**
   - **Technology**: Tiptap with StarterKit extensions
   - **Font Size Controls**: 12px-24px with +/- buttons and current size display
   - **Reliable Text Editing**:
     - Enter = New paragraph (proper spacing)
     - Shift + Enter = Hard line break (single line)
     - No cursor jumping or positioning issues
     - Professional text editing behavior
   - **Formatting Toolbar**:
     - Bold, Italic, Strikethrough with active state indicators
     - Clean, minimal interface matching dark theme
   - **Auto-Save & Feedback**:
     - Debounced auto-save (1 second after stopping typing)
     - "Saving..." indicator during saves
     - Real-time word count display
     - Clean HTML output for export
   - **SSR Safe**: Proper client-side only rendering with `immediatelyRender: false`

7. **✅ COMPLETE: Scene Grid View System**
   **Features**:
   - Toggle between "Document View" and "Grid View"
   - Chapter Grid View: Shows all scenes in chapter as clickable cards
   - Act Grid View: Shows all scenes across all chapters with chapter grouping
   - Scene cards display: Scene number, word count, status icon, content preview
   - Responsive grid layout (2-4 columns based on screen size)
   - Smart content aggregation based on display mode
   - Remembers preference per view mode

8. **✅ OPTIMIZED PERFORMANCE**
   - **No API call blinking**: Fixed unnecessary refetches when navigating
   - **Smooth navigation**: No page "blinks" when switching between scenes/chapters/acts
   - **Smart state management**: View mode and display mode state properly managed
   - **Efficient rendering**: Only refreshes on actual data changes

## ✅ COMPLETE: Full CRUD Operations with Inline Editing

**Goal**: Complete create, read, update, delete operations for all manuscript elements with inline name editing

**Completed Features**:

1. **✅ COMPLETE: Create Operations**
   - **Create Acts**: `POST /api/novels/[id]/acts` with positioning support
   - **Create Chapters**: `POST /api/novels/[id]/acts/[actId]/chapters` with positioning
   - **Create Scenes**: `POST /api/novels/[id]/chapters/[chapterId]/scenes` with positioning
   - **Auto Scene/Chapter Creation**: New acts get Chapter 1 + Scene 1, new chapters get Scene 1
   - **Smart positioning**: Insert after specific items or append to end

2. **✅ COMPLETE: Add Interfaces in UI**
   - **AddActInterface**: Inline creation with title input and positioning
   - **Add buttons on ActItem**: Blue "+" button for adding chapters
   - **Add buttons on ChapterItem**: Green "+" button for adding scenes
   - **Empty state buttons**: "Add first act/chapter/scene" for empty containers
   - **Between-item insertion**: Add acts between existing acts with proper positioning

3. **✅ COMPLETE: Inline Editing System**
   - **Act Name Editing**: Click to edit act titles with save/cancel
   - **Chapter Name Editing**: Click to edit chapter titles with save/cancel
   - **Scene Name Editing**: Click to edit scene titles with save/cancel
   - **API Integration**: PUT endpoints for updating names with validation
   - **Real-time Updates**: Direct state updates with server sync
   - **Error Handling**: Fallback to refresh on API errors

4. **✅ COMPLETE: Delete Operations**
   - **Enhanced delete buttons**: Red trash icons on hover with confirmations
   - **Cascading deletes**: Delete act → deletes all chapters and scenes
   - **Transaction safety**: Atomic database operations with rollback
   - **Auto-reordering**: Automatic sequential numbering after deletions
   - **Selection clearing**: Smart clearing of selected items when deleted

5. **✅ COMPLETE: Simple State Management**
   - **Page-level handlers**: All CRUD operations managed in `manuscript/page.tsx`
   - **Direct state updates**: Use `setNovel()` with real server data immediately
   - **No page refreshes**: All operations update React state instantly
   - **Error resilience**: Graceful handling of API failures with user feedback

**Implementation Details**:
- All buttons appear on hover with smooth transitions
- Operations use direct React state updates with `setNovel(prevNovel => {...})`
- Color-coded buttons: green for scenes, blue for chapters, red for delete
- Auto-clear selected scene/chapter/act when deleted items were selected
- Professional UX with instant feedback and loading states

**Performance**: Buttery smooth interactions with zero page refreshes for all CRUD operations

## 🚧 IN PROGRESS: Enhanced Document Import System

**Goal**: Build an intelligent import system with conflict resolution and structure validation

**Next Major Feature**: Interactive Import Preview with Smart Conflict Resolution

**Planned Implementation**:

### **Phase 1: Enhanced Document Parser** ⬅️ **CURRENT FOCUS**
- **Improved structure detection**: Better handling of inconsistent formatting
- **Ordering validation**: Detect duplicate chapter numbers, gaps, inconsistencies
- **Content analysis**: Identify orphaned scenes, empty sections, formatting issues
- **Conflict detection**: Compare against existing manuscript structure

### **Phase 2: Interactive Import Preview**
- **Parse-first workflow**: Analyze document before importing
- **Issue visualization**: Show detected problems in a preview interface
- **User-guided resolution**: Let users fix conflicts before committing
- **One-click fixes**: Smart defaults for common issues (renumbering, gap filling)

### **Phase 3: Smart Import Modes**
- **Content-aware decisions**: Detect if importing revisions vs new content
- **Conflict resolution strategies**: Replace, keep both, merge, or skip
- **Import modes**: Full replace, add new only, smart merge
- **Version awareness**: Foundation for future version control

### **Phase 4: Advanced Features** (Future)
- **Diff visualization**: Show exact changes between versions
- **Selective import**: Choose specific chapters/scenes to import
- **Backup and restore**: Automatic backups before major imports
- **Collaborative features**: Handle multi-author document conflicts

**Current Status**: Ready to begin enhanced parser development

## 🎯 Future Enhancements

1. **Character Management System** - Track characters, relationships, scene appearances
2. **Enhanced metadata editing** - Make right panel interactive (edit POV, status, notes)
3. **Export functionality** - Clean HTML/Word document export with formatting options
4. **Search across content** - Find text across scenes/chapters/acts with filtering
5. **Writing analytics** - Progress tracking, writing goals, productivity insights
6. **Version control system** - Branch manuscripts, track changes, collaborative editing
7. **Drag-and-drop reordering** - Visual reordering of acts/chapters/scenes in sidebar

## 🔧 Technical Notes

### **Dependencies Added**:
- `@tiptap/react` - React integration for Tiptap editor
- `@tiptap/starter-kit` - Essential Tiptap extensions

### **Import Patterns**:
- UI components: `import { Button, Card } from '@/app/components/ui'`
- Feature components: `import { ManuscriptEditor } from '@/app/components/manuscript/manuscript-editor/'`
- Chapter tree: `import { EnhancedChapterTree } from '@/app/components/manuscript/chapter-tree'`
- All paths use `@/app/` alias

### **Component Architecture**:
- **Pages** (`page.tsx`) are simple coordinators - import and compose components
- **Feature components** in dedicated folders with single responsibilities
- **Sub-components** organized in folders (manuscript-editor/, chapter-tree/)
- **UI components** are reusable and themed consistently
- **Layouts** handle common structure (sidebar, headers, etc.)

### **Styling Standards**:
- **Dark theme**: black/gray backgrounds, white text, red accents
- **No gradients**: clean, minimal aesthetic
- **Consistent spacing**: using Tailwind utilities with minimal gaps
- **Focus states**: red-500 focus rings for accessibility

### **Data Flow**:
```
Browser → React Hooks → API Routes → Prisma → SQLite
Tiptap Editor → Debounced Save → PUT /scenes/[id] → Database
Multi-level Views → Content Aggregation Service → Combined HTML
Grid View → Scene Cards → Click Handlers → Navigation
CRUD Operations → Direct State Updates → Real Server Data
```

### **State Management Architecture**:
```
ManuscriptPage (Parent)
├── selectedScene, selectedChapter, selectedAct (selection state)
├── viewMode (scene/chapter/act)
├── contentDisplayMode (document/grid)
├── CRUD handlers (add/delete/update for all levels)
└── ManuscriptEditor
    ├── Content Aggregation (useMemo with display mode)
    ├── Three-Panel Layout
    └── Event Handlers (bubbled up to parent)
```

## 💬 Context for Next Development

- **Full CRUD Operations** are complete and working smoothly across all levels
- **Inline editing** system is fully functional with real-time updates
- **Component architecture** is clean and maintainable with proper separation
- **Performance optimized** - no page refreshes, instant state updates for all operations
- **Ready for Enhanced Import** - Parser improvements and conflict resolution system
- **Foundation for Version Control** - Conflict detection infrastructure in place
- **All sidebar interactions** work perfectly (adding, deleting, editing, navigation)
- **Professional text editing** experience with Tiptap integration
- **Smart display mode persistence** - grid/document preference maintained
- **Auto content creation** - New acts/chapters automatically include initial structure
- **Simple State Management** - Direct React state updates with real server data
- Focus on **practical utility** over flashy features
- **Dark theme consistency** - match Claude interface aesthetic throughout

---

_Professional manuscript manager with complete CRUD operations and inline editing! Ready for enhanced document import system with conflict resolution and structure validation._