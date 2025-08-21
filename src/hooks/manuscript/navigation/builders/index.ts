// src/hooks/manuscript/navigation/builders/index.ts
// Barrel exports for navigation builders

// Primary navigation builders
export * from "./primaryNavigation";

// Secondary navigation builders
export * from "./secondaryNavigation";

/*
===== NAVIGATION BUILDERS MODULE =====

✅ CLEAR SEPARATION:
- primaryNavigation.ts: Builds navigation for main view focus
- secondaryNavigation.ts: Builds navigation for scrolling within views

✅ VIEW-SPECIFIC BUILDERS:
- Primary: scene/chapter/act builders for changing view focus
- Secondary: scene/chapter builders for scrolling within views
- Clean mapping to view modes and navigation needs

✅ FOCUSED RESPONSIBILITIES:
- Primary builders create selection-based navigation
- Secondary builders create scroll-based navigation
- Clear distinction in behavior and usage

✅ COMPLETE NAVIGATION DATA:
- Current item tracking
- Full item lists for UI components
- Next/previous availability
- Proper handler assignments

✅ TYPE-SAFE INTERFACES:
- Consistent configuration patterns
- Clear return types for all builders
- Proper integration with handler modules

Ready for Step 4: Refactor main hook!
*/
