// lib/characters/index.ts
// Updated barrel exports for characters with manuscript integration

// Existing exports...
export * from "./character-service";
export * from "./pov-service";
export * from "./pov-types";

// ✨ NEW: Character manuscript integration exports
export * from "./character-text-analyzer";
export * from "./character-manuscript-service";

// If you have relationship service exports, keep those too:
export * from "./relationship-service";
