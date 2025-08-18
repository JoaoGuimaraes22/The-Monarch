// src/app/components/manuscript/manuscript-editor/services/index.ts
// Business logic and data processing services for manuscript editing

export { contentAggregationService } from "./content-aggregation-service";

// Re-export types if the service exports any
export type {
  ContentSection,
  AggregatedContent,
} from "./content-aggregation-service";
