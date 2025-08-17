import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline, Type, Plus, Minus } from "lucide-react";

interface SceneTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void; // ✨ NEW
  onAddChapter?: (actId: string, afterChapterId?: string) => void; // ✨ NEW
  placeholder?: string;
  readOnly?: boolean;
}

export const SceneTextEditor: React.FC<SceneTextEditorProps> = ({
  content,
  onContentChange,
  onAddScene, // ✨ NEW
  onAddChapter, // ✨ NEW
  placeholder = "Start writing your scene...",
  readOnly = false,
}) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const editorRef = useRef<HTMLDivElement>(null);

  // Font size adjustment functions
  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24)); // Max 24px
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12)); // Min 12px
  };

  // ✨ NEW: Handle clicks on Add Scene/Chapter buttons
  const handleAddButtonClick = useCallback(
    async (event: Event) => {
      const target = event.target as HTMLElement;
      const addButton = target.closest(
        ".add-scene-button, .add-chapter-button"
      );

      if (!addButton) return;

      try {
        if (addButton.classList.contains("add-scene-button")) {
          const chapterId = addButton.getAttribute("data-chapter-id");
          const afterSceneId =
            addButton.getAttribute("data-after-scene-id") || undefined;

          if (chapterId && onAddScene) {
            await onAddScene(chapterId, afterSceneId);
          }
        } else if (addButton.classList.contains("add-chapter-button")) {
          const actId = addButton.getAttribute("data-act-id");
          const afterChapterId =
            addButton.getAttribute("data-after-chapter-id") || undefined;

          if (actId && onAddChapter) {
            await onAddChapter(actId, afterChapterId);
          }
        }
      } catch (error) {
        console.error("Error creating scene/chapter:", error);
      }
    },
    [onAddScene, onAddChapter]
  );

  // ✨ NEW: Setup click handlers for add buttons
  useEffect(() => {
    const editorContainer = editorRef.current;
    if (!editorContainer) return;

    editorContainer.addEventListener("click", handleAddButtonClick);

    return () => {
      editorContainer.removeEventListener("click", handleAddButtonClick);
    };
  }, [handleAddButtonClick]);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    (newContent: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        setIsSaving(true);
        onContentChange(newContent);
        setTimeout(() => setIsSaving(false), 500);
      }, 1000);
    },
    [onContentChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable paragraph merging and use custom behavior
        paragraph: {
          HTMLAttributes: {
            class: "editor-paragraph",
          },
        },
        // Disable default heading behavior since we don't need it
        heading: false,
        // Configure hard break for Shift+Enter
        hardBreak: {
          keepMarks: false,
          HTMLAttributes: {
            class: "editor-break",
          },
        },
      }),
    ],
    content: content,
    editable: !readOnly,
    immediatelyRender: false, // ✅ KEY FIX: Disable immediate rendering
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSave(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none h-full p-6 text-gray-200 leading-relaxed",
        style: `font-size: ${fontSize}px; line-height: 1.7; font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;`,
        "data-placeholder": placeholder,
      },
      handleKeyDown: (view, event) => {
        // Handle Enter behavior
        if (event.key === "Enter") {
          if (event.shiftKey) {
            // Shift + Enter: Single line break
            editor?.commands.setHardBreak();
            return true;
          } else {
            // Regular Enter: Create new paragraph (double spacing effect)
            editor?.commands.splitBlock();
            return true;
          }
        }
        return false;
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const stripHtmlToText = (html: string): string => {
    if (typeof document === "undefined") return ""; // ✅ SSR safety check
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const wordCount = editor
    ? stripHtmlToText(editor.getHTML())
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0;

  // ✅ Don't render editor until mounted (client-side only)
  if (!isMounted) {
    return (
      <div className="h-full flex flex-col bg-gray-700 rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading editor...</div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="h-full flex flex-col bg-gray-700 rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center space-x-2 p-3 border-b border-gray-600 bg-gray-800">
          {/* Formatting Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("bold")
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-600"
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("italic")
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-600"
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded transition-colors ${
                editor.isActive("strike")
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-600"
              }`}
              title="Strikethrough"
            >
              <Underline className="w-4 h-4" />
            </button>
          </div>

          {/* Font Size Controls */}
          <div className="flex items-center space-x-1 border-l border-gray-600 pl-3">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className={`p-2 rounded transition-colors ${
                fontSize <= 12
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-gray-600"
              }`}
              title="Decrease font size"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1 px-2">
              <Type className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 min-w-[24px] text-center">
                {fontSize}
              </span>
            </div>
            <button
              onClick={increaseFontSize}
              disabled={fontSize >= 24}
              className={`p-2 rounded transition-colors ${
                fontSize >= 24
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-gray-600"
              }`}
              title="Increase font size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1"></div>

          {/* Word Count & Save Status */}
          <div className="flex items-center space-x-3 text-xs">
            {isSaving && <span className="text-yellow-400">Saving...</span>}
            <span className="text-gray-400">
              {wordCount.toLocaleString()} words
            </span>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-auto" ref={editorRef}>
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .ProseMirror {
          height: 100%;
          outline: none;
        }

        .ProseMirror p.editor-paragraph {
          margin: 0 0 1rem 0;
          min-height: 1.2em;
        }

        .ProseMirror p.editor-paragraph:last-child {
          margin-bottom: 0;
        }

        .ProseMirror br.editor-break {
          display: block;
          content: "";
          margin: 0;
        }

        .ProseMirror.ProseMirror-focused {
          background-color: rgba(55, 65, 81, 0.3);
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror strong {
          font-weight: bold;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror s {
          text-decoration: line-through;
        }

        /* ✨ NEW: Styles for add buttons */
        .add-scene-button:hover,
        .add-chapter-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .add-scene-button:active,
        .add-chapter-button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};
