// src/hooks/manuscript/navigation/utils/index.ts
// Barrel exports for navigation utilities

// Basic navigation utilities
export * from "./navigationUtils";

// Enhanced boundary detection
export * from "./boundaryDetection";

/*
===== NAVIGATION UTILS MODULE =====

✅ CLEAN SEPARATION:
- navigationUtils.ts: Basic utilities, item builders, list navigation
- boundaryDetection.ts: Enhanced cross-boundary navigation logic

✅ FOCUSED RESPONSIBILITIES:
- Each function has single purpose
- Clear naming and organization
- Easy to test and maintain

✅ REUSABLE COMPONENTS:
- Utilities can be used across different navigation contexts
- Boundary detection logic isolated for testing
- Pure functions with no side effects

✅ TYPE SAFETY:
- All functions properly typed
- Clear interfaces and return types
- Generic utilities for list operations

Ready for Step 2: Handler modules!
*/
