// src/app/components/manuscript/manuscript-editor/scene-text-editor.tsx
// ✨ ENHANCED: Added help popup to existing toolbox structure

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  Type,
  Plus,
  Minus,
  Minus as HorizontalRule,
  HelpCircle,
  X,
} from "lucide-react";

interface SceneTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onAddScene?: (chapterId: string, afterSceneId?: string) => void;
  onAddChapter?: (actId: string, afterChapterId?: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const SceneTextEditor: React.FC<SceneTextEditorProps> = ({
  content,
  onContentChange,
  onAddScene,
  onAddChapter,
  placeholder = "Start writing your scene...",
  readOnly = false,
}) => {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false); // ✨ NEW: Help popup state
  const editorRef = useRef<HTMLDivElement>(null);

  // Font size adjustment functions
  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24)); // Max 24px
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12)); // Min 12px
  };

  // ✨ NEW: Close help when toolbox closes
  useEffect(() => {
    if (!isToolboxOpen) {
      setIsHelpOpen(false);
    }
  }, [isToolboxOpen]);

  // Handle clicks on Add Scene/Chapter buttons
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

  // Setup click handlers for add buttons
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
        // Enable horizontal rule
        horizontalRule: {
          HTMLAttributes: {
            class: "editor-hr",
          },
        },
      }),
    ],
    content: content,
    editable: !readOnly,
    immediatelyRender: false, // KEY FIX: Disable immediate rendering
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

        // ✨ Handle delete line shortcut (Ctrl+Shift+K)
        if (event.key === "K" && event.ctrlKey && event.shiftKey) {
          event.preventDefault();

          const { selection } = view.state;
          const { $from, $to } = selection;

          // If we have a selection, delete the entire lines that contain the selection
          if (!selection.empty) {
            // Find the start and end positions of the lines containing the selection
            const startLinePos = $from.start($from.depth);
            const endLinePos = $to.end($to.depth);

            // Delete the entire line range
            const tr = view.state.tr;
            tr.delete(startLinePos, endLinePos);

            // If there's content after the deleted lines, we might need to adjust
            if (endLinePos < view.state.doc.content.size) {
              // Check if we need to merge with the next paragraph
              const nextChar = view.state.doc.textBetween(
                endLinePos,
                endLinePos + 1
              );
              if (nextChar && nextChar !== "\n") {
                // Insert a paragraph break to maintain structure
                tr.insert(
                  startLinePos,
                  view.state.schema.nodes.paragraph.create()
                );
              }
            }

            view.dispatch(tr);
            return true;
          }

          // For cursor position (no selection), delete the current line
          else {
            // Get the current paragraph node
            const currentNode = $from.parent;
            const currentPos = $from.pos;

            // Calculate the start and end of the current paragraph
            const nodeStart = currentPos - $from.parentOffset;
            const nodeEnd = nodeStart + currentNode.nodeSize;

            const tr = view.state.tr;

            // If this is the only paragraph or the last paragraph, replace with empty paragraph
            if (
              view.state.doc.childCount === 1 ||
              nodeEnd >= view.state.doc.content.size
            ) {
              tr.replaceWith(
                nodeStart,
                nodeEnd,
                view.state.schema.nodes.paragraph.create()
              );
            } else {
              // Delete the entire paragraph node
              tr.delete(nodeStart, nodeEnd);
            }

            view.dispatch(tr);
            return true;
          }
        }

        // ✨ Handle horizontal line shortcut (Ctrl+Shift+-)
        if (event.key === "_" && event.ctrlKey && event.shiftKey) {
          event.preventDefault();
          editor?.commands.setHorizontalRule();
          return true;
        }

        // Handle em dash replacement
        if (event.key === "-") {
          const { selection } = view.state;
          const { $from } = selection;

          // Get text before cursor
          const textBefore = $from.parent.textBetween(
            Math.max(0, $from.parentOffset - 1),
            $from.parentOffset
          );

          // If there's already a dash, replace both with em dash
          if (textBefore === "-") {
            event.preventDefault();
            const tr = view.state.tr;
            tr.delete(selection.from - 1, selection.to);
            tr.insertText("—");
            view.dispatch(tr);
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
    if (typeof document === "undefined") return ""; // SSR safety check
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const wordCount = editor
    ? stripHtmlToText(editor.getHTML())
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0;

  // Don't render editor until mounted (client-side only)
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
    <div className="h-full flex flex-col bg-gray-700 rounded-lg overflow-hidden relative">
      {/* Editor Content - Full height */}
      <div ref={editorRef} className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* ✨ ENHANCED: Floating Toolbox with Help Popup */}
      {!readOnly && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* ✨ NEW: Help Popup - Appears above toolbox */}
          {isHelpOpen && (
            <div className="mb-3 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 animate-in slide-in-from-bottom-2 duration-200 w-64">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-600 pb-2">
                  <h3 className="text-sm font-medium text-white">
                    Keyboard Shortcuts
                  </h3>
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    className="text-gray-400 hover:text-white p-1"
                    title="Close help"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Shortcuts List */}
                <div className="space-y-2 text-xs">
                  {/* Formatting Shortcuts */}
                  <div>
                    <div className="text-gray-300 font-medium mb-1">
                      Formatting
                    </div>
                    <div className="space-y-1 text-gray-400">
                      <div className="flex justify-between">
                        <span>Bold</span>
                        <code className="bg-gray-700 px-1 rounded">Ctrl+B</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Italic</span>
                        <code className="bg-gray-700 px-1 rounded">Ctrl+I</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Strikethrough</span>
                        <code className="bg-gray-700 px-1 rounded">
                          Ctrl+Shift+S
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Line Operations */}
                  <div>
                    <div className="text-gray-300 font-medium mb-1">
                      Line Operations
                    </div>
                    <div className="space-y-1 text-gray-400">
                      <div className="flex justify-between">
                        <span>Delete Line</span>
                        <code className="bg-gray-700 px-1 rounded">
                          Ctrl+Shift+K
                        </code>
                      </div>
                      <div className="flex justify-between">
                        <span>Line Break</span>
                        <code className="bg-gray-700 px-1 rounded">
                          Shift+Enter
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Text Shortcuts */}
                  <div>
                    <div className="text-gray-300 font-medium mb-1">
                      Text Shortcuts
                    </div>
                    <div className="space-y-1 text-gray-400">
                      <div className="flex justify-between">
                        <span>Em Dash (—)</span>
                        <code className="bg-gray-700 px-1 rounded">--</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Horizontal Rule</span>
                        <code className="bg-gray-700 px-1 rounded">
                          Ctrl+Shift+-
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <div className="text-gray-300 font-medium mb-1">
                      Font Size
                    </div>
                    <div className="space-y-1 text-gray-400">
                      <div className="flex justify-between">
                        <span>Increase</span>
                        <code className="bg-gray-700 px-1 rounded">Ctrl++</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Decrease</span>
                        <code className="bg-gray-700 px-1 rounded">Ctrl+-</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expanded Toolbox */}
          {isToolboxOpen && (
            <div className="mb-3 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-3 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex flex-col space-y-3">
                {/* Formatting Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded transition-colors ${
                      editor.isActive("bold")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded transition-colors ${
                      editor.isActive("italic")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 rounded transition-colors ${
                      editor.isActive("strike")
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-600 hover:text-white"
                    }`}
                    title="Strikethrough (Ctrl+Shift+S)"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      editor.chain().focus().setHorizontalRule().run()
                    }
                    className="p-2 rounded transition-colors text-gray-300 hover:bg-gray-600 hover:text-white"
                    title="Insert Horizontal Line (Ctrl+Shift+-)"
                  >
                    <HorizontalRule className="w-4 h-4" />
                  </button>
                </div>

                {/* Font Size Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={decreaseFontSize}
                      className="p-1 rounded transition-colors text-gray-300 hover:bg-gray-600 hover:text-white"
                      title="Decrease Font Size (Ctrl+-)"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs text-gray-300 px-2 min-w-[2.5rem] text-center">
                      {fontSize}px
                    </span>
                    <button
                      onClick={increaseFontSize}
                      className="p-1 rounded transition-colors text-gray-300 hover:bg-gray-600 hover:text-white"
                      title="Increase Font Size (Ctrl++)"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* ✨ ENHANCED: Stats and Help Button */}
                <div className="border-t border-gray-600 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      {wordCount.toLocaleString()} words
                    </div>
                    {/* ✨ NEW: Help Button */}
                    <button
                      onClick={() => setIsHelpOpen(!isHelpOpen)}
                      className={`p-1 rounded transition-colors ${
                        isHelpOpen
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:bg-gray-600 hover:text-white"
                      }`}
                      title="Show keyboard shortcuts"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status */}
                  {isSaving && (
                    <div className="text-xs text-blue-400 text-center">
                      Saving...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            key="toolbox-toggle" // React key to ensure single instance
            onClick={() => setIsToolboxOpen(!isToolboxOpen)}
            className={`
              w-12 h-12 rounded-full ring-2 
              transition-all duration-300 ease-in-out
              flex items-center justify-center
              hover:scale-110 hover:shadow-2xl
              ${
                isToolboxOpen
                  ? "bg-blue-700 text-white ring-blue-500/30 transform rotate-45 hover:bg-blue-600"
                  : "bg-gray-700 text-gray-200 ring-gray-500/50 transform rotate-0 hover:bg-gray-600 hover:text-white hover:ring-gray-400/60"
              }
            `}
            style={{
              // Force position to prevent any duplication
              position: "relative",
              zIndex: 1000,
            }}
            title={isToolboxOpen ? "Close toolbox" : "Open formatting tools"}
          >
            <Type className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Styles */}
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

        /* Horizontal rule styling */
        .editor-hr {
          border: none;
          border-top: 2px solid #4b5563;
          margin: 2rem 0;
          width: 100%;
        }

        /* Animation for floating toolbox */
        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: slide-in-from-bottom 0.2s ease-out;
        }

        /* Styles for add buttons */
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
