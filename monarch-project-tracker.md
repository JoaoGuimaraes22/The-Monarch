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

## �️ Current Project Structure

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
│   │       ├── chapter-tree/      # ✅ COMPLETE: Hierarchical navigation
│   │       │   ├── types.ts                      # Shared interfaces
│   │       │   ├── utils.ts                      # Utility functions
│   │       │   ├── tree-item.tsx                 # Base tree component
│   │       │   ├── scene-item.tsx                # Scene tree items
│   │       │   ├── chapter-item.tsx              # Chapter tree items
│   │       │   ├── act-item.tsx                  # Act tree items
│   │       │   ├── chapter-tree.tsx              # Main tree component
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
│           │   ├── acts/[actId]/route.ts # DELETE /api/novels/[id]/acts/[actId]
│           │   ├── chapters/[chapterId]/route.ts # DELETE /api/novels/[id]/chapters/[chapterId]
│           │   └── scenes/[sceneId]/route.ts # PUT, DELETE /api/novels/[id]/scenes/[sceneId]
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
- **Components**: Button, Card, Input, Textarea, Badge, Alert, Logo
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
   - Automatic detection of Acts (H1), Chapters (H2), Scenes (\*\*\* or ---)
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
   - **ChapterTree**: Hierarchical navigation (5 focused sub-components)

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

   **Goal**: Add grid view toggle for chapter and act modes to show scene cards instead of stacked document

   **Implemented Features**:

   1. **View Toggle System**
      - Toggle between "Document View" and "Grid View"
      - Located in ManuscriptHeader next to Scene/Chapter/Act selector
      - Remembers preference per view mode (preserves grid/document choice when switching between chapter ↔ act)

   2. **Chapter Grid View**
      - Shows all scenes in chapter as clickable cards in grid layout
      - Each card displays: Scene number, word count, status icon, content preview
      - Click any scene card to jump directly to Scene view of that scene
      - Responsive grid (2-4 columns based on screen size)

   3. **Act Grid View**
      - Shows all scenes across all chapters in act as grid
      - Groups scenes by chapter with clear headers and chapter statistics
      - Same card format and click behavior as chapter grid
      - Proper act overview with total chapters, scenes, and word count

   4. **Scene Card Design**
      - Dark theme cards matching overall aesthetic
      - Status indicators: ✅ Complete, 📝 Review, 📄 Draft
      - Word count display with formatting (1.2k, 847, etc.)
      - Hover effects and click feedback
      - Content preview (first ~100 characters with smart truncation)

   5. **Smart Content Aggregation**
      - **Document View**: Uses combined content with chapter/scene separators
      - **Grid View**: Uses separate sections (one per chapter) for proper grouping
      - **Automatic Mode Selection**: Content aggregation service chooses strategy based on display mode

8. **✅ OPTIMIZED PERFORMANCE**
   - **No API call blinking**: Fixed unnecessary refetches when navigating
   - **Smooth navigation**: No page "blinks" when switching between scenes/chapters/acts
   - **Smart state management**: View mode and display mode state properly managed
   - **Efficient rendering**: Only refreshes on actual data changes (deletions, imports)

## ✅ COMPLETE: Manuscript Structure Sidebar Add/Delete Buttons

**Goal**: Add "Add Scene", "Add Chapter", and delete functionality to the sidebar for seamless content management

**Completed Features**:

1. **API Endpoints**
   - `POST /api/novels/[id]/chapters/[chapterId]/scenes` - Create new scene in chapter
   - `POST /api/novels/[id]/acts/[actId]/chapters` - Create new chapter in act
   - `DELETE /api/novels/[id]/scenes/[sceneId]` - Delete scene
   - `DELETE /api/novels/[id]/chapters/[chapterId]` - Delete chapter  
   - `DELETE /api/novels/[id]/acts/[actId]` - Delete act
   - Smart positioning support and proper error handling

2. **Service Methods**
   - `novelService.createScene(chapterId, insertAfterSceneId?)` - Database scene creation
   - `novelService.createChapter(actId, insertAfterChapterId?, title?)` - Database chapter creation
   - **Auto Scene Creation**: New chapters automatically include Scene 1 for immediate writing
   - Transaction safety and automatic reordering for all operations

3. **Enhanced Chapter Tree Components**
   - **ChapterItem**: Green "+" button on hover to add scenes, red delete button
   - **ActItem**: Blue "+" button on hover to add chapters, red delete button
   - **ChapterTree**: Direct state management handlers (no complex optimistic updates)
   - **Loading states**: Disabled buttons during operations
   - **Empty state buttons**: "Add first scene/chapter" for empty containers

4. **Simple State Management Architecture**
   - **Page-level handlers**: All CRUD operations managed in `page.tsx`
   - **Direct state updates**: Use `setNovel()` with real server data immediately
   - **No page refreshes**: All operations update React state instantly
   - **Smart selection clearing**: Auto-clear selection when items are deleted
   - **No temporary IDs**: Always use real database records

5. **UX Features**
   - **Instant feedback**: All operations appear/disappear immediately in UI
   - **Visual feedback**: Color-coded buttons (green for scenes, blue for chapters, red for delete)
   - **Auto-refresh on errors**: Falls back to refresh only on API failures
   - **Confirmation dialogs**: Built into existing delete buttons with warnings
   - **Error handling**: User-friendly error messages for failed operations

**Implementation Details**:
- All buttons appear on hover with smooth transitions
- Operations use direct React state updates with `setNovel(prevNovel => {...})`
- No complex optimistic update logic - just simple array operations
- Maintains consistent dark theme with red/green/blue color scheme
- Auto-clear selected scene/chapter/act when deleted items were selected

**Performance**: Buttery smooth interactions with zero page refreshes for all CRUD operations

## 🚧 IN PROGRESS: Document View Add Buttons System

**Goal**: Add visual splits and "Add Scene"/"Add Chapter" buttons in document view for seamless content expansion during writing

**Current State**: Planning and design phase

**Planned Features**:

1. **Chapter Document View Enhancement**
   - Visual scene separators with "Add Scene" buttons between scenes
   - Clickable buttons to insert new scenes at specific positions
   - Maintains writing flow while allowing structure expansion

2. **Act Document View Enhancement**
   - "Add Scene" buttons between scenes within chapters
   - "Add Chapter" buttons between chapters
   - Clear visual hierarchy with chapter headers and section dividers

3. **Implementation Requirements**:
   - **API Endpoints**: 
     - `POST /api/novels/[id]/chapters/[chapterId]/scenes` (create scene)
     - `POST /api/novels/[id]/acts/[actId]/chapters` (create chapter)
   - **Service Methods**: Add `createScene` and `createChapter` to `novelService`
   - **Content Aggregation**: Enhanced to include interactive buttons in document HTML
   - **Event Handling**: Click detection and API calls from within document view

4. **Expected UI Flow**:
   ```
   Chapter Document View:
   Scene 1 content...
   *** Add Scene *** [clickable]
   Scene 2 content...
   *** Add Scene *** [clickable]

   Act Document View:
   Chapter 1
   Scene 1 content...
   *** Add Scene *** [clickable]
   Scene 2 content...
   *** Add Scene *** [clickable]
   +++ Add Chapter +++ [clickable]
   Chapter 2...
   ```

**Next Steps**: 
1. ✅ Create API endpoints for scene/chapter creation
2. ✅ Add service methods to `novelService` 
3. ✅ Enhance sidebar with add buttons and event handlers
4. 🔄 **Optional**: Enhance content aggregation service with interactive buttons in document view
5. 🔄 **Optional**: Update SceneTextEditor to handle document button clicks
6. 🔄 **Optional**: Wire up document view event handlers and data refresh

## 🎯 Future Enhancements

1. **Enhanced metadata editing** - Make right panel interactive (edit POV, status, notes)
2. **Scene navigation dropdown** - Jump to specific scenes within combined views
3. **Export functionality** - Clean HTML/Word document export
4. **Search across content** - Find text across scenes/chapters/acts
5. **Character tracking integration** - Link scenes to character arcs
6. **Writing goals/targets** - Daily word count goals, scene completion tracking

## 🔧 Technical Notes

### **Dependencies Added**:

- `@tiptap/react` - React integration for Tiptap editor
- `@tiptap/starter-kit` - Essential Tiptap extensions

### **Import Patterns**:

- UI components: `import { Button, Card } from '@/app/components/ui'`
- Feature components: `import { ManuscriptEditor } from '@/app/components/manuscript/manuscript-editor/'`
- Chapter tree: `import { ChapterTree } from '@/app/components/manuscript/chapter-tree'`
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
```

### **State Management Architecture**:

```
ManuscriptPage (Parent)
├── selectedScene, selectedChapter, selectedAct (selection state)
├── viewMode (scene/chapter/act)
├── contentDisplayMode (document/grid)
└── ManuscriptEditor
    ├── Content Aggregation (useMemo with display mode)
    ├── Three-Panel Layout
    └── Event Handlers (bubbled up to parent)
```

## 💬 Context for Next Development

- **Scene Grid View System** is fully complete and working smoothly
- **Manuscript Structure Sidebar CRUD Operations** are fully complete and functional
- **Component architecture** is clean and maintainable with proper separation
- **Performance optimized** - no page refreshes, instant state updates for all operations
- **Ready for Advanced Features** - Character tracking, plot threads, export, search, etc.
- **All sidebar interactions** work perfectly (adding, deleting, navigation, view switching)
- **Professional text editing** experience with Tiptap integration
- **Smart display mode persistence** - grid/document preference stays when switching views
- **Auto Scene Creation** - New chapters automatically include Scene 1 for immediate writing
- **Simple State Management** - Direct React state updates with real server data
- Focus on **practical utility** over flashy features
- **Dark theme consistency** - match Claude interface aesthetic throughout

---

_Professional manuscript manager with scene grid view and complete sidebar CRUD operations! Ready for advanced features like character tracking, plot management, and export functionality._