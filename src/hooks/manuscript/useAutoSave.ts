// src/hooks/manuscript/useAutoSave.ts
// ✨ PHASE 1: Extract auto-save logic into dedicated hook

import { useState, useRef, useCallback, useEffect } from "react";

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  pendingChanges: boolean;
  enabled: boolean;
}

export interface AutoSaveActions {
  setEnabled: (enabled: boolean) => void;
  handleContentChange: (sceneId: string, content: string) => void;
  handleManualSave: () => Promise<boolean>;
}

export interface AutoSaveConfig {
  novelId: string;
  selectedScene: { id: string } | null;
  delay?: number; // Default 2000ms
}

export interface AutoSaveReturn {
  state: AutoSaveState;
  actions: AutoSaveActions;
}

export function useAutoSave(config: AutoSaveConfig): AutoSaveReturn {
  // ===== STATE =====
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [enabled, setEnabled] = useState(true); // Default ON

  // ===== REFS =====
  const pendingContentRef = useRef<{ sceneId: string; content: string } | null>(
    null
  );
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ===== CORE SAVE FUNCTION =====
  const saveSceneContent = useCallback(
    async (sceneId: string, content: string): Promise<boolean> => {
      if (!config.novelId) return false;

      try {
        setIsSaving(true);
        console.log("💾 Auto-save: Saving scene content...", sceneId);

        const response = await fetch(
          `/api/novels/${config.novelId}/scenes/${sceneId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          }
        );

        if (response.ok) {
          const updatedScene = await response.json();
          console.log("✅ Auto-save: Scene content saved successfully");

          setLastSaved(new Date());
          setPendingChanges(false);
          pendingContentRef.current = null;

          return true;
        } else {
          console.error("❌ Auto-save: Failed to save scene content");
          return false;
        }
      } catch (error) {
        console.error("❌ Auto-save: Error saving scene content:", error);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [config.novelId]
  );

  // ===== AUTO-SAVE: Debounced content saving =====
  const handleContentChange = useCallback(
    (sceneId: string, content: string) => {
      // Always update pending changes
      pendingContentRef.current = { sceneId, content };
      setPendingChanges(true);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Only auto-save if enabled
      if (enabled) {
        const delay = config.delay || 2000; // Default 2 seconds
        saveTimeoutRef.current = setTimeout(() => {
          if (pendingContentRef.current) {
            saveSceneContent(
              pendingContentRef.current.sceneId,
              pendingContentRef.current.content
            );
          }
        }, delay);
      }
    },
    [enabled, saveSceneContent, config.delay]
  );

  // ===== MANUAL SAVE =====
  const handleManualSave = useCallback(async (): Promise<boolean> => {
    if (!pendingContentRef.current) {
      console.log("📝 Auto-save: No pending changes to save");
      return false;
    }

    const { sceneId, content } = pendingContentRef.current;
    const success = await saveSceneContent(sceneId, content);

    if (success) {
      console.log("💾 Auto-save: Manual save completed");
    } else {
      console.error("❌ Auto-save: Manual save failed");
    }

    return success;
  }, [saveSceneContent]);

  // ===== CLEANUP EFFECTS =====

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Clear timeout when auto-save is disabled
  useEffect(() => {
    if (!enabled && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  }, [enabled]);

  // ===== RETURN INTERFACE =====
  return {
    state: {
      isSaving,
      lastSaved,
      pendingChanges,
      enabled,
    },
    actions: {
      setEnabled,
      handleContentChange,
      handleManualSave,
    },
  };
}
