// lib/characters/index.ts
// Updated barrel exports for characters with separated services and titles support

// ===== CORE CHARACTER SERVICE =====
export * from "./character-service";

// ===== CHARACTER STATE SERVICE =====
export * from "./character-state-service";

// ===== POV SERVICE =====
export * from "./pov-service";
export * from "./pov-types";

// ===== CHARACTER MANUSCRIPT INTEGRATION =====
export * from "./character-text-analyzer";
export * from "./character-manuscript-service";

// ===== RELATIONSHIP SERVICE =====
export * from "./relationship-service";

// ===== RE-EXPORTS FOR BACKWARD COMPATIBILITY =====
// These ensure existing code continues to work while services are separated

export { characterService } from "./character-service";
export { characterStateService } from "./character-state-service";

// Note: If you have existing code that imported character state methods from characterService,
// you'll need to update those imports to use characterStateService instead.
//
// BEFORE:
// import { characterService } from "@/lib/characters";
// characterService.createCharacterState(...)
//
// AFTER:
// import { characterStateService } from "@/lib/characters";
// characterStateService.createCharacterState(...)
