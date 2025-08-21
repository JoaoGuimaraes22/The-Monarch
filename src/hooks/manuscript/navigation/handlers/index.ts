// src/hooks/manuscript/navigation/handlers/index.ts
// Barrel exports for navigation handlers

// Primary selection handlers
export * from "./selectionHandlers";

// Secondary scroll handlers
export * from "./scrollHandlers";

/*
===== NAVIGATION HANDLERS MODULE =====

✅ CLEAR SEPARATION:
- selectionHandlers.ts: Primary selection logic (changes view focus)
- scrollHandlers.ts: Secondary scroll logic (just scrolls within view)

✅ FOCUSED RESPONSIBILITIES:
- Selection handlers update manuscript state
- Scroll handlers only manipulate DOM scrolling
- Clean distinction between behaviors

✅ BACKWARD COMPATIBILITY:
- Primary handlers integrate with legacy selection system
- All existing functionality preserved
- Smooth transition from old to new architecture

✅ PERFORMANCE OPTIMIZED:
- Separate hooks for different concerns
- Minimal re-renders and dependencies
- Efficient DOM manipulation

Ready for Step 3: Builder modules!
*/
