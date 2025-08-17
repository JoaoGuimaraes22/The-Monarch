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
│   │   └── manuscript/            # ✅ COMPLETE: Enhanced manuscript system
│   │       ├── manuscript-editor/ # Main editor with sub-components
│   │       │   ├── manuscript-header.tsx          # Header with view selector
│   │       │   ├── manuscript-structure-sidebar.tsx # Left sidebar
│   │       │   ├── manuscript-metadata-sidebar.tsx  # Right sidebar
│   │       │   ├── manuscript-content-area.tsx   # Editor area
│   │       │   ├── manuscript-editor.tsx         # Main coordinator
│   │       │   ├── scene-card.tsx                # Scene grid cards
│   │       │   ├── scene-grid.tsx                # Grid layout component
│   │       │   └── index.ts                      # Barrel exports
│   │       ├── chapter-tree/      # ✅ COMPLETE: Hierarchical navigation with CRUD
│   │       │   ├── types.ts                      # Shared interfaces
│   │       │   ├── utils.ts                      # Utility functions
│   │       │   ├── enhanced-act-item.tsx         # Act tree items with inline editing
│   │       │   ├── enhanced-chapter-item.tsx     # Chapter tree items with inline editing
│   │       │   ├── enhanced-scene-item.tsx       # Scene tree items with inline editing
│   │       │   ├── enhanced-chapter-tree.tsx     # Main tree component
│   │       │   ├── add-act-interface.tsx         # Add act UI component
│   │       │   └── index.ts                      # Barrel exports
│   │       ├── docx-uploader.tsx  # ✅ ENHANCED: Advanced import with auto-fix & preview
│   │       ├── structure-preview.tsx # ✅ NEW: Structure preview component
│   │       ├── delete-confirmation-dialog.tsx
│   │       ├── manuscript-empty-state.tsx
│   │       ├── scene-text-editor.tsx # Professional Tiptap editor
│   │       ├── view-mode-selector.tsx # Scene/Chapter/Act view toggle
│   │       └── content-aggregation-service.ts # Multi-level content logic
│   └── api/
│       └── novels/
│           ├── route.ts           # GET, POST /api/novels
│           ├── [id]/
│           │   ├── route.ts       # GET, PUT, DELETE /api/novels/[id]
│           │   ├── import/route.ts # Enhanced import with issue detection
│           │   ├── auto-fix/route.ts # ✅ NEW: Server-side auto-fix
│           │   ├── import-fixed/route.ts # ✅ NEW: Import fixed structure
│           │   ├── structure/route.ts # GET, DELETE /api/novels/[id]/structure
│           │   ├── acts/
│           │   │   ├── route.ts   # POST /api/novels/[id]/acts (create act)
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
│   └── doc-parse/                # ✅ COMPLETE: Refactored parser system
│       ├── enhanced-docx-parser.ts   # Main parser coordinator
│       ├── auto-fix-service.ts       # Auto-fix functionality
│       ├── structure-analyzer.ts     # Issue detection & validation
│       ├── detectors/
│       │   ├── act-detector.ts       # Act detection logic
│       │   ├── chapter-detector.ts   # Chapter detection logic
│       │   └── scene-detector.ts     # Scene detection logic
│       ├── utils/
│       │   └── html-converter.ts     # HTML conversion utilities
│       ├── types.ts                  # Centralized type definitions
│       └── index.ts                  # Clean barrel exports
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

## ✅ Recently Completed Features

### **✅ COMPLETE: Enhanced Document Import System with Server-Side Auto-Fix**

**Goal**: Build an intelligent import system with advanced issue detection, auto-fix, and manual confirmation workflow

**Completed Features**:

1. **✅ Refactored Parser Architecture**

   - Clean modular structure in `src/lib/doc-parse/`
   - Separate detectors for Acts, Chapters, Scenes
   - Centralized type definitions and barrel exports
   - Enhanced error handling and logging

2. **✅ Server-Side Auto-Fix System**

   - **AutoFixService**: Handles renumbering, combining, renaming
   - **API Routes**: `/auto-fix` and `/import-fixed` endpoints
   - **Browser Compatibility**: No more mammoth.js client-side errors
   - **Type Safety**: Complete TypeScript coverage, no `any` types

3. **✅ Advanced Issue Detection**

   - **20+ Issue Types**: Duplicate numbering, gaps, short scenes, etc.
   - **Structured Issues**: Each issue has type, severity, auto-fix metadata
   - **Auto-Fix Suggestions**: Clickable buttons with specific descriptions
   - **Smart Analysis**: Confidence scoring and transparency

4. **✅ Professional Auto-Fix Workflow**

   - **Issue Detection**: Server parses document and identifies problems
   - **Structure Preview**: Beautiful tree view showing fixed structure
   - **Manual Import**: User reviews changes before database commit
   - **Success Feedback**: Clear messaging and auto-redirect

5. **✅ Structure Preview Component**
   - **Tree Visualization**: `ACT 1 → CH1 [SC1+SC2] → CH2 [SC1+SC2]`
   - **Before/After Comparison**: Shows what was changed
   - **Word Count Display**: Scene and chapter level statistics
   - **Dark Theme Integration**: Matches Claude interface aesthetic

**Technical Implementation**:

```typescript
// Auto-fix workflow
Upload .docx → Server Parse → Issue Detection → Auto-Fix Applied → Structure Preview → Manual Import → Database Updated

// Example structure preview
📚 ACT 1: The Island
  📖 CH1: Chapter 1: A Taste of Lightning [SC1 + SC2] (767 words)
  📖 CH2: Chapter 2: A Curious Mind [SC1 + SC2] (593 words)
  📖 CH3: Chapter 3: The Edge of Knowing [SC1] (1,274 words) ✅ FIXED!
```

**User Experience**:

- Upload messy documents with duplicate/missing chapter numbers
- Get intelligent analysis with specific issues identified
- Preview exactly what will be fixed with visual tree view
- Import with confidence knowing changes are transparent
- Continue to editor with properly structured manuscript

## 🚀 Next Priority Feature

### **🎯 NEXT: Drag-and-Drop Ordering System**

**Goal**: Allow users to reorder acts, chapters, and scenes using intuitive drag-and-drop mechanics

**Requirements**:

1. **Visual Drag Indicators**: Clear drop zones and drag previews
2. **Nested Reordering**: Drag chapters between acts, scenes between chapters
3. **Live Updates**: Real-time order changes with optimistic UI
4. **Database Sync**: Automatic `order` field updates with proper sequencing
5. **Undo Support**: Ability to revert accidental moves

**Implementation Plan**:

```typescript
// Technology stack
- React DnD or @dnd-kit/core for drag functionality
- Optimistic updates for smooth UX
- Database transactions for order updates
- Visual feedback during drag operations

// API endpoints to create
PUT /api/novels/[id]/reorder-acts
PUT /api/novels/[id]/reorder-chapters
PUT /api/novels/[id]/reorder-scenes

// Component updates needed
- Enhanced chapter tree with drag handles
- Drop zone indicators
- Drag preview components
- Undo/redo functionality
```

**User Stories**:

- As a writer, I want to drag Chapter 3 to become Chapter 1
- As a writer, I want to move a scene from one chapter to another
- As a writer, I want to reorder entire acts in my manuscript
- As a writer, I want visual feedback showing where items will be dropped
- As a writer, I want to undo accidental reordering

## 📋 Future Enhancement Backlog

### **Medium-Term Features**

1. **📁 Selective Document Import** - Import additional acts/chapters to existing manuscripts
2. **👥 Character Management System** - Track characters, relationships, scene appearances
3. **🔍 Global Search** - Find text across scenes/chapters/acts with filtering
4. **📊 Writing Analytics** - Progress tracking, writing goals, productivity insights
5. **📤 Enhanced Export** - Clean HTML/Word document export with formatting options

### **Long-Term Features**

1. **🌲 Version Control** - Branch manuscripts, track changes, collaborative editing
2. **👥 Collaborative Features** - Multi-author support with conflict resolution
3. **🤖 AI Writing Assistant** - Context-aware suggestions and continuity checking
4. **📚 Advanced Export** - Professional typesetting and formatting options

## 🔧 Technical Notes

### **Recent Technical Achievements**:

- **Complete Type Safety**: Eliminated all `any` types across parser system
- **Modular Architecture**: Clean separation of concerns with barrel exports
- **Server-Side Processing**: Resolved browser compatibility issues with mammoth.js
- **Professional UX**: Structure preview with manual import confirmation
- **Error Resilience**: Comprehensive error handling and user feedback

### **Component Architecture Standards**:

- **Pages** are simple coordinators - import and compose components
- **Feature components** in dedicated folders with single responsibilities
- **Sub-components** organized in folders (manuscript-editor/, chapter-tree/)
- **UI components** are reusable and themed consistently
- **Layouts** handle common structure (sidebar, headers, etc.)

### **Import Patterns**:

- UI components: `import { Button, Card } from '@/app/components/ui'`
- Feature components: `import { ManuscriptEditor } from '@/app/components/manuscript/manuscript-editor/'`
- Parser system: `import { AutoFixService, StructureAnalyzer } from '@/lib/doc-parse'`
- All paths use `@/app/` alias for clean imports

### **Data Flow Architecture**:

```
Enhanced Import Flow:
File Upload → Enhanced DocxParser → Issue Detection → Auto-Fix Suggestions
→ User Review → Manual Import → Database Update → Success

Current Manuscript Flow:
Browser → React Hooks → API Routes → Prisma → SQLite
Tiptap Editor → Debounced Save → PUT /scenes/[id] → Database
Multi-level Views → Content Aggregation Service → Combined HTML
Grid View → Scene Cards → Click Handlers → Navigation
CRUD Operations → Direct State Updates → Real Server Data
```

## 💬 Current Development Context

### **Just Completed**

- **Server-side auto-fix system** with structure preview and manual import
- **Complete type safety refactoring** of document parser system
- **Professional user workflow** for document import with transparency
- **Issue detection and correction** for common manuscript problems

### **Ready to Start**

- **Drag-and-drop ordering system** for acts, chapters, and scenes
- **Visual reordering interface** with smooth animations and feedback
- **Database order management** with automatic sequencing
- **Optimistic UI updates** for responsive user experience

### **Technical Foundation**

- **Clean component architecture** ready for drag-and-drop enhancement
- **Robust API structure** ready for reordering endpoints
- **Type-safe interfaces** throughout the application
- **Professional dark theme** consistently applied

---

_Enhanced manuscript import system with server-side auto-fix, structure preview, and manual confirmation workflow completed! Ready to implement drag-and-drop ordering for the ultimate manuscript management experience._
