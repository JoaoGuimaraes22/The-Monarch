// app/components/ui/index.ts
// Barrel export file for clean imports
// Usage: import { Button, Card, Input, ArrayField } from '@/components/ui'

export { Button } from "./button";
export { Card, CardHeader, CardContent } from "./card";
export { Input, Textarea } from "./input";
export { Badge } from "./badge";
export { Alert } from "./alert";
export { Logo } from "./logo";
export { EditableText } from "./editable-text";
export { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
export { CharacterAvatar } from "./character-avatar";

// New shared components
export { CollapsibleSidebar } from "./collapsible-sidebar";
export { StatusIndicator, STATUS_CONFIGS } from "./status-indicator";
export { WordCountDisplay } from "./word-count-display";
export { ToggleButton } from "./toggle-button";

// ✨ NEW: Enhanced ArrayField with continuous focus
export { ArrayField, AdvancedArrayField } from "./array-field";

// Re-export types
export type { StatusConfig } from "./status-indicator";
