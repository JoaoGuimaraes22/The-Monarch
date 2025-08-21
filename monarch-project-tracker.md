# The Monarch Story Platform - Updated Project Tracker

## 🎯 Project Overview

**Goal**: Build a story development platform tailored for _The Monarch_ epic fantasy series, focusing on practical utility over marketing fluff.

**User**: Aspiring fantasy writer building a complex narrative management system  
**Philosophy**: Build what's genuinely useful, component-first architecture, dark theme matching Claude interface

## Important notes

- **Do not use "any" types**

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
│   ├── (app)/
│   │   ├── layout.tsx             # App layout wrapper
│   │   └── novels/
│   │       ├── page.tsx           # Novel selection page
│   │       └── [novelId]/
│   │           ├── layout.tsx     # Workspace wrapper layout
│   │           ├── dashboard/page.tsx # Main workspace dashboard
│   │           ├── manuscript/page.tsx # ✅ COMPLETE: Clean with modular hooks + NEW NAVIGATION
│   │           └── characters/page.tsx # Placeholder
│   ├── (marketing)/
│   │   └── layout.tsx             # Marketing layout wrapper
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout
│   ├── globals.css               # Global styles
│   ├── favicon.ico
│   ├── layout/                   # Layout components
│   │   ├── header.tsx
│   │   ├── landing-header.tsx
│   │   └── sidebar.tsx
│   ├── components/
│   │   ├── ui/                    # ✅ ENHANCED: Reusable UI components with shared patterns
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── logo.tsx
│   │   │   ├── editable-text.tsx  # ✅ COMPLETE: Full lifecycle callbacks & flexible layout
│   │   │   ├── delete-confirmation-dialog.tsx  # ✅ MOVED: Generic reusable dialog
│   │   │   ├── status-indicator.tsx # ✅ NEW: Universal status indicators for scenes/chapters
│   │   │   ├── collapsible-sidebar.tsx # ✅ NEW: Reusable sidebar pattern
│   │   │   └── index.ts
│   │   ├── workspace/             # ✅ ENHANCED: Workspace components with context
│   │   │   ├── workspace-header.tsx       # ✅ COMPLETE: Breadcrumb navigation
│   │   │   ├── workspace-sidebar.tsx      # ✅ COMPLETE: Novel navigation
│   │   │   ├── sidebar-context.tsx        # ✅ NEW: Shared sidebar state
│   │   │   └── index.ts
│   │   ├── novel-selection-page/  # ✅ COMPLETE: Novel selection with enhanced features
│   │   │   ├── novel-card.tsx            # ✅ ENHANCED: Dropdown menu & delete functionality
│   │   │   ├── novel-grid.tsx
│   │   │   ├── create-novel-dialog.tsx   # ✅ ENHANCED: Better form handling
│   │   │   ├── delete-confirmation-dialog.tsx # ✅ MOVED to ui/
│   │   │   └── index.ts
│   │   ├── manuscript/
│   │   │   ├── import-system/     # ✅ COMPLETE: Enhanced document import
│   │   │   │   ├── manuscript-empty-state.tsx  # ✅ COMPLETE: Professional empty state
│   │   │   │   ├── docx-uploader.tsx           # ✅ ENHANCED: Progress tracking, auto-fix integration
│   │   │   │   ├── import-progress.tsx         # ✅ COMPLETE: Real-time progress tracking
│   │   │   │   ├── structure-preview.tsx       # ✅ COMPLETE: Interactive preview with auto-fix
│   │   │   │   └── index.ts
│   │   │   ├── contextual-import/ # ✅ COMPLETE: Working contextual import system!
│   │   │   │   ├── contextual-import-dialog.tsx # ✅ COMPLETE: Full flow implementation
│   │   │   │   ├── mode-selection.tsx          # ✅ COMPLETE: Target mode selection
│   │   │   │   ├── target-selection.tsx        # ✅ COMPLETE: Smart navigation flow
│   │   │   │   ├── file-upload.tsx             # ✅ COMPLETE: Drag & drop with context awareness
│   │   │   │   ├── import-preview.tsx          # ✅ COMPLETE: Preview with structure analysis
│   │   │   │   ├── types.ts                    # ✅ COMPLETE: Complete type definitions
│   │   │   │   └── index.ts
│   │   │   ├── manuscript-editor/ # ✅ COMPLETE: Full-featured editor organized by function
│   │   │   │   ├── layout/                    # Layout components
│   │   │   │   │   ├── manuscript-header.tsx              # ✅ UPDATED: NavigationComponent integration
│   │   │   │   │   ├── manuscript-navigation-bar.tsx      # ✅ NEW: Clean navigation with primary/secondary levels
│   │   │   │   │   ├── manuscript-structure-sidebar.tsx   # ✅ ENHANCED: Hover-only add buttons + collapsible tools + selected-act chapter controls
│   │   │   │   │   ├── manuscript-metadata-sidebar.tsx    # ✅ UPDATED: Uses shared components
│   │   │   │   │   ├── delete-all-button.tsx              # ✅ ENHANCED: Size prop & compact UI
│   │   │   │   │   ├── compact-auto-save-tools.tsx        # ✅ ENHANCED: Auto-save UI + import button + structure controls
│   │   │   │   │   └── index.ts
│   │   │   │   ├── content-views/             # Content display modes
│   │   │   │   │   ├── manuscript-content-area.tsx        # ✅ COMPLETE: Full rename functionality
│   │   │   │   │   ├── types.ts                           # Content view types
│   │   │   │   │   ├── grid-view/
│   │   │   │   │   │   ├── scene-card.tsx                # ✅ COMPLETE: Optimized inline editing
│   │   │   │   │   │   ├── scene-grid.tsx                # ✅ COMPLETE: Full rename support + Act renaming + Chapter focus
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── controls/                  # UI controls
│   │   │   │   │   ├── view-mode-selector.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── services/                  # Business logic
│   │   │   │   │   ├── content-aggregation-service.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── manuscript-editor.tsx      # ✅ COMPLETE: Main coordinator with navigation integration
│   │   │   │   ├── scene-text-editor.tsx      # ✅ ENHANCED: Floating toolbox + em dash + horizontal line + keyboard shortcuts
│   │   │   │   └── index.ts
│   │   │   └── chapter-tree/      # ✅ COMPLETE: Full-featured with view density + 3-line layout + hover-only buttons
│   │   │       ├── types.ts                      # Shared interfaces
│   │   │       ├── utils.ts                      # ✅ ENHANCED: Utility functions with shared status configs
│   │   │       ├── add-act-interface.tsx         # Add act UI component
│   │   │       ├── draggable-scene-item.tsx      # ✅ ENHANCED: 3-line layout + hover-only buttons + compact add buttons
│   │   │       ├── draggable-chapter-container.tsx # ✅ ENHANCED: 3-line layout + hover-only buttons + compact add buttons
│   │   │       ├── draggable-manuscript-tree.tsx # ✅ COMPLETE: 3-line layout + hover-only buttons + compact add buttons
│   │   │       └── index.ts                      # Barrel exports
│   └── api/                       # ✅ FULLY MODERNIZED: Complete API route standardization
│       └── novels/
│           ├── route.ts           # ✅ STANDARDIZED: GET, POST /api/novels
│           └── [id]/
│               ├── route.ts       # ✅ STANDARDIZED: GET, PUT, DELETE /api/novels/[id]
│               ├── structure/route.ts # ✅ STANDARDIZED: GET, DELETE /api/novels/[id]/structure
│               ├── contextual-import/route.ts # ✅ COMPLETE: Working ADD modes with FormData handling
│               ├── scenes/[sceneId]/
│               │   ├── route.ts   # ✅ MODERNIZED: Scene CRUD with parameter objects
│               │   └── reorder/route.ts # ✅ MODERNIZED: Scene reordering with cross-chapter support
│               ├── chapters/[chapterId]/
│               │   ├── route.ts   # ✅ MODERNIZED: Chapter CRUD with parameter objects
│               │   ├── reorder/route.ts # ✅ MODERNIZED: Chapter reordering with cross-act support
│               │   └── scenes/
│               │       └── route.ts # ✅ MODERNIZED: Scene creation with parameter objects
│               ├── acts/
│               │   ├── route.ts   # ✅ MODERNIZED: Act creation with parameter objects
│               │   └── [actId]/
│               │       ├── route.ts # ✅ MODERNIZED: Act CRUD with parameter objects
│               │       ├── reorder/route.ts # ✅ MODERNIZED: Act reordering with parameter objects
│               │       └── chapters/
│               │           └── route.ts # ✅ MODERNIZED: Chapter creation with parameter objects
│               ├── import/route.ts # ✅ FIXED: Corrected middleware order + context handling + ENHANCED RATE LIMITS
│               ├── auto-fix/route.ts # ✅ COMPLETE: New standardized auto-fix with proper middleware
│               └── import-fixed/route.ts # ✅ COMPLETE: Standardized import-fixed with typing
├── hooks/
│   ├── manuscript/               # ✅ COMPLETE: Modular hook architecture
│   │   ├── navigation/           # ✅ NEW: Clean navigation system
│   │   │   ├── useManuscriptNavigation.ts # ✅ NEW: Primary/secondary navigation logic
│   │   │   └── types.ts          # ✅ NEW: Navigation type definitions
│   │   ├── useManuscriptLogic.ts # ✅ REFACTORED: Main orchestrator hook with navigation
│   │   ├── useManuscriptState.ts # ✅ NEW: Dedicated state management
│   │   ├── useManuscriptCRUD.ts  # ✅ NEW: CRUD operations with local state updates
│   │   ├── useAutoSave.ts        # ✅ NEW: Dedicated auto-save functionality
│   │   ├── useContextualImport.ts # ✅ COMPLETE: Contextual import hook with error handling
│   │   └── index.ts              # ✅ COMPLETE: Barrel exports with navigation types
│   ├── novels/                   # Novel-related hooks directory
│   └── useNovels.ts              # Novel hooks
├── lib/
│   ├── prisma.ts                 # Database client
│   ├── api/                      # ✅ COMPLETE: API standardization system
│   │   ├── types.ts              # ✅ COMPLETE: All Zod schemas & TypeScript types
│   │   ├── logger.ts             # Logging system
│   │   ├── rate-limit.ts         # ✅ ENHANCED: Rate limiting with environment-based configs
│   │   ├── middleware.ts         # ✅ FIXED: Context preservation + proper file handling
│   │   └── index.ts              # Barrel exports
│   ├── novels/                   # ✅ MODERNIZED: Complete service layer with parameter objects
│   │   ├── index.ts              # ✅ MODERNIZED: Service aggregator with modern methods
│   │   ├── types.ts              # ✅ UPDATED: All TypeScript interfaces with novelId, actId, etc.
│   │   ├── query-service.ts      # ✅ MODERNIZED: Type-safe query methods with parameter objects
│   │   ├── novel-service.ts      # ✅ MODERNIZED: Novel operations with parameter objects
│   │   ├── structure-service.ts  # ✅ MODERNIZED: Structure operations with parameter objects
│   │   ├── scene-service.ts      # ✅ MODERNIZED: Scene operations with parameter objects
│   │   ├── chapter-service.ts    # ✅ MODERNIZED: Chapter operations with parameter objects
│   │   ├── act-service.ts        # ✅ MODERNIZED: Act operations with parameter objects
│   │   └── reorder-service.ts    # ✅ MODERNIZED: Reordering operations with parameter objects
│   ├── doc-parse/                # ✅ COMPLETE: Document parsing system
│   │   ├── index.ts              # ✅ COMPLETE: Main parser with auto-fix
│   │   ├── types.ts              # ✅ COMPLETE: Parser type definitions
│   │   ├── document-parser.ts    # ✅ COMPLETE: Core parsing logic with enhanced validation
│   │   ├── structure-validator.ts # ✅ COMPLETE: Smart validation with auto-fix suggestions
│   │   ├── auto-fix.ts           # ✅ COMPLETE: Automatic structure fixing
│   │   └── content-extractor.ts  # ✅ COMPLETE: Content extraction and cleaning
│   └── utils.ts                  # Utility functions
```

## 🎉 COMPLETED SYSTEMS

### **🎉 FINALIZED: Clean Navigation System - WORKING!**

**Achievement**: Built and shipped a completely new navigation system with clean architecture and perfect behavior

**Key Innovations**:

1. **✅ Clean Architecture Separation**

   - **Primary Navigation**: Changes view focus/selection (what you're editing)
   - **Secondary Navigation**: Scrolls within current view (navigation aid only)
   - **View-Specific Contexts**: Scene (primary only), Chapter (primary + secondary), Act (primary + secondary)

2. **✅ Perfect Behavior Matrix Implementation**

   ```
   VIEW MODE | PRIMARY LEVEL      | SECONDARY LEVEL    | BEHAVIOR
   ----------|-------------------|-------------------|----------
   Scene     | Scenes in Chapter | None              | Scene selection
   Chapter   | Chapters in Act   | Scenes in Chapter | Chapter selection + scene scrolling
   Act       | Acts              | Chapters in Act   | Act selection + chapter scrolling
   ```

3. **✅ Seamless Header Integration**

   - **Replaced title area**: Navigation component takes place of traditional title
   - **Preserved controls**: View mode selectors (Scene/Chapter/Act + Document/Grid) stay on right
   - **Clean separation**: Navigation handles navigation, header handles mode switching

4. **✅ Modern Component Architecture**

   - **Modular types**: Clean interfaces in `navigation/types.ts`
   - **Dedicated hook**: `useManuscriptNavigation` with primary/secondary separation
   - **Reusable component**: `ManuscriptNavigationBar` adapts to any context
   - **Flexible integration**: `navigationComponent` prop pattern for clean composition

**Implementation Status**: ✅ **SHIPPED AND WORKING**

### **🎉 FINALIZED: Enhanced Scene Text Editor with Floating Toolbox**

**Achievement**: Created a modern, distraction-free writing experience with professional text editing features

**Key Features**:

1. **✅ Floating Toolbox Design**

   - **Distraction-free writing** - No fixed toolbars taking up screen space
   - **Context-sensitive appearance** - Toolbox only shows when needed
   - **Smooth animations** - Professional slide-in/out with hover states
   - **Strategic positioning** - Bottom-right corner, away from writing area

2. **✅ Smart Auto-Replacement System**

   - **Em dash conversion** - Double hyphens (`--`) automatically become em dashes (`—`)
   - **Real-time processing** - Instant conversion as you type
   - **Undo support** - Ctrl+Z reverses auto-replacements
   - **Context-aware** - Only replaces in appropriate contexts

3. **✅ Professional Formatting Tools**

   - **Bold/Italic/Strikethrough** with active state highlighting
   - **Keyboard shortcuts** - Standard shortcuts (Ctrl+B, Ctrl+I, etc.)
   - **Horizontal rule** - Perfect for scene breaks and sections
   - **Typography focus** - Serif fonts and proper line height for reading

4. **✅ Clean Interface Design**
   - **No toolbar clutter** - Floating toolbox removes fixed header space
   - **Contextual tooltips** - All buttons show helpful shortcuts
   - **Status indicators** - Saving status and helper tips
   - **Dark theme consistency** - Matches overall platform design

**Implementation Status**: ✅ **SHIPPED AND WORKING**

### **🎉 FINALIZED: Enhanced Manuscript Tree with Hover-Only Buttons**

**Achievement**: Cleaned up the manuscript tree interface with better UX patterns

**Key Improvements**:

1. **✅ Hover-Only Add Buttons**

   - **Clean interface** - No visual clutter when browsing
   - **Contextual appearance** - Buttons only show when hovering over elements
   - **Smooth transitions** - Fade in/out animations for professional feel
   - **Color-coded buttons** - Blue for scenes, yellow for chapters

2. **✅ Improved 3-Line Layout System**

   - **Line 1: Full-width titles** - Maximum space for act/chapter/scene names
   - **Line 2: Action buttons** - Dedicated space for add/delete operations
   - **Line 3: Metadata** - Word counts, scene counts in detailed view only
   - **Better organization** - Clear visual hierarchy

3. **✅ Compact Button Design**

   - **Smaller buttons** - `+Scene` and `+Chapter` with compact padding
   - **Better colors** - Blue and yellow matching the reference design
   - **Simplified text** - Just "Scene" and "Chapter" instead of "Add Scene"

4. **✅ Smart Chapter Controls**
   - **Selected-act only** - Chapter expand/collapse works only on current act
   - **Context-aware status** - Shows which act's chapters are being controlled
   - **Disabled when appropriate** - Grayed out when no act selected

**Implementation Status**: ✅ **SHIPPED AND WORKING**

### **🎉 FINALIZED: Complete Contextual Import System - WORKING!**

**Achievement**: Built and shipped a fully functional contextual import system that perfectly matches the designed flow

**Key Innovations**:

1. **✅ Perfect UI Flow Implementation**

   - **Explicit Target Selection**: User chooses exactly where content goes (no ambiguity)
   - **Smart Positioning**: Beginning/End for speed, specific position for precision
   - **Seamless Navigation**: Context-aware step progression through the flow

2. **✅ Professional API Integration**

   - **FormData Handling**: Fixed middleware to properly parse file uploads with JSON data
   - **Type-Safe Validation**: Complete Zod schema validation for all target configurations
   - **Smart Positioning Logic**: Reverse-order reordering to avoid conflicts
   - **Professional Error Handling**: Comprehensive error management with user feedback

3. **✅ Complete ADD Mode Implementation**

   - **New Act**: Creates new act at specified position with imported structure
   - **New Chapter**: Creates new chapter within selected act at specified position
   - **New Scene**: Creates new scene within selected chapter at specified position
   - **Perfect Integration**: All modes work seamlessly with existing manuscript structure

4. **✅ Enhanced User Experience**
   - **Contextual UI**: Each step shows relevant options based on previous selections
   - **Progress Tracking**: Clear visual feedback during import process
   - **Error Recovery**: Graceful handling of validation errors and conflicts
   - **Manuscript Integration**: Import button integrated into editor sidebar
   - **Professional Error Handling**: User-friendly messages and recovery flows

### **✅ Complete Document Import System Excellence**:

- **Professional File Handling**: Enhanced rate limits, secure processing
- **Auto-Import Intelligence**: Perfect documents import automatically
- **Advanced Issue Detection**: Structure analysis with auto-fix suggestions
- **Server-Side Auto-Fix**: Professional structure fixing with detailed feedback
- **Type-Safe Validation**: Complete Zod schema coverage
- **Error Recovery**: Comprehensive error handling with user-friendly feedback

### **✅ Complete API Route Modernization Excellence**:

- **Type-Safe Parameter Objects**: All service methods use modern patterns
- **Professional Validation**: Complete Zod schema coverage
- **Cross-Entity Operations**: Full support for moving content between containers
- **Rate Limiting**: Configurable protection with environment-specific settings
- **Request Tracking**: Unique IDs for debugging and monitoring
- **Error Consistency**: Structured error responses with proper HTTP status codes

### **✅ Enhanced Service Layer Excellence**:

- **Modern Method Signatures**: Parameter objects for all operations
- **Complete CRUD Coverage**: Every entity has full operations with consistent patterns
- **Cross-Entity Support**: Content can move between any appropriate containers
- **Extensibility**: Easy to add new parameters without breaking existing code
- **Type Safety**: Complete TypeScript coverage with proper interface alignment

### **✅ Response Format Excellence**:

```json
{
  "success": true,
  "message": "Chapter created successfully",
  "data": {
    "chapter": { "id": "ch_xyz", "title": "New Chapter", "order": 3 },
    "structure": { "acts": 3, "chapters": 8, "scenes": 24 }
  }
}
```

**Next: Complete the system with Replace modes.** 🎉

---

_Complete story platform with enhanced scene text editor (floating toolbox with em dash auto-replacement, horizontal lines, and keyboard shortcuts), enhanced manuscript tree (hover-only buttons, 3-line layout, compact design), working contextual import system (ADD modes shipped!), document import system (including auto-fix), modernized API routes, parameter object service methods, enhanced type safety, professional middleware architecture, modular hook system, smart auto-save functionality, universal renaming capabilities, perfect Act document view with chapter boundaries, enhanced grid view with act renaming and chapter focus buttons, optimized layouts, professional component library, comprehensive content management, enhanced rate limiting system, complete contextual import system with working ADD modes, and clean navigation system with primary/secondary separation integrated into header. Ready for Replace modes implementation and enhanced text editor features._
