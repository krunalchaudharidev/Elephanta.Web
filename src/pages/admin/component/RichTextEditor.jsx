import React, {
  useEffect,
  useRef,
  useState,
} from "react";

export default function RichTextEditor({
  value = "",
  onChange = () => {},
  maxLength = 5000,
  minHeight = 300,
  placeholder = "Write your content...",
  className = "",
}) {
  const editorRef = useRef(null);
  const selectionRangeRef = useRef(null);

  const [mode, setMode] = useState("editor");
  const [html, setHtml] = useState(value);

  // Keep internal HTML in sync with parent value.
  useEffect(() => {
    setHtml(value || "");

    if (
      editorRef.current &&
      editorRef.current.innerHTML !== (value || "")
    ) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  /**
   * Update HTML value.
   */
  const updateValue = (newHtml) => {
    setHtml(newHtml);
    onChange(newHtml);
  };

  /**
   * Get current selection.
   */
  const getSelection = () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return null;
    }

    return selection;
  };

  /**
   * Execute browser formatting command.
   */
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    document.execCommand(command, false, value);

    const newHtml = editorRef.current.innerHTML;

    updateValue(newHtml);
  };

  /**
   * Handle editor input.
   */
  const handleInput = () => {
    if (!editorRef.current) return;

    updateValue(editorRef.current.innerHTML);
  };

  /**
   * Prevent toolbar button from stealing
   * the current text selection.
   */
  const preventSelectionLoss = (event) => {
    event.preventDefault();
  };

  // Link option removed per request

  /**
   * Remove formatting.
   */
  const handleClearFormatting = () => {
    execCommand("removeFormat");
  };

  /**
   * Handle HTML code editing.
   */
  const handleCodeChange = (event) => {
    const newHtml = event.target.value;

    setHtml(newHtml);
    onChange(newHtml);
  };

  /**
   * Switch between modes.
   */
  const changeMode = (newMode) => {
    if (newMode === mode) return;

    setMode(newMode);
  };

  // When switching back to visual editor, ensure contentEditable shows latest HTML.
  useEffect(() => {
    if (mode !== "editor") return;
    if (!editorRef.current) return;

    const current = editorRef.current.innerHTML || "";
    const target = html || "";
    if (current !== target) {
      editorRef.current.innerHTML = target;
    }
  }, [mode]);

  /**
   * Get plain text length.
   */
  const getTextLength = () => {
    const tempElement = document.createElement("div");

    tempElement.innerHTML = html;

    return (tempElement.textContent || "").length;
  };

  const textLength = getTextLength();

  return (
    <div className={`w-full ${className}`}>
      {/* Main container */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {/* Header / Mode switch */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
          {/* Toolbar */}
          {mode === "editor" && (
            <div className="flex flex-wrap items-center gap-1">
              {/* Bold */}
              <button
                type="button"
                onMouseDown={preventSelectionLoss}
                onClick={() => execCommand("bold")}
                title="Bold"
                className="rounded px-2.5 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                B
              </button>

              {/* Italic */}
              <button
                type="button"
                onMouseDown={preventSelectionLoss}
                onClick={() => execCommand("italic")}
                title="Italic"
                className="rounded px-2.5 py-1.5 text-sm italic text-slate-700 hover:bg-slate-200"
              >
                I
              </button>

              {/* Underline */}
              <button
                type="button"
                onMouseDown={preventSelectionLoss}
                onClick={() => execCommand("underline")}
                title="Underline"
                className="rounded px-2.5 py-1.5 text-sm text-slate-700 underline hover:bg-slate-200"
              >
                U
              </button>

              <div className="mx-1 h-5 w-px bg-slate-300" />

              {/* Heading */}
              <select
                defaultValue=""
                onMouseDown={() => {
                  // save selection so we can restore it after choosing a format
                  const sel = window.getSelection();
                  if (sel && sel.rangeCount) {
                    selectionRangeRef.current = sel.getRangeAt(0).cloneRange();
                  }
                }}
                onChange={(event) => {
                  const val = event.target.value;
                  if (val) {
                    // restore saved selection before applying format
                    const saved = selectionRangeRef.current;
                    if (saved) {
                      const sel = window.getSelection();
                      sel.removeAllRanges();
                      sel.addRange(saved);
                    }
                    // use a tag value like '<h2>' which works more reliably
                    const tag = `<${val}>`;
                    execCommand("formatBlock", tag);
                    selectionRangeRef.current = null;
                  }

                  event.target.value = "";
                }}
                className="rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="">Format</option>
                <option value="p">Paragraph</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
              </select>

              <div className="mx-1 h-5 w-px bg-slate-300" />

              {/* Bullet list */}
              <button
                type="button"
                onMouseDown={preventSelectionLoss}
                onClick={() => execCommand("insertUnorderedList")}
                title="Bullet List"
                className="rounded px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="6" cy="6" r="1.5" />
                  <path d="M10 6h8" />
                  <circle cx="6" cy="12" r="1.5" />
                  <path d="M10 12h8" />
                  <circle cx="6" cy="18" r="1.5" />
                  <path d="M10 18h8" />
                </svg>
              </button>

              {/* Ordered list */}
              <button
                type="button"
                onMouseDown={preventSelectionLoss}
                onClick={() => execCommand("insertOrderedList")}
                title="Numbered List"
                className="rounded px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <text x="4" y="7" fontSize="7" fill="currentColor" fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" textAnchor="middle">1</text>
                  <path d="M10 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="4" y="13" fontSize="7" fill="currentColor" fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" textAnchor="middle">2</text>
                  <path d="M10 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="4" y="19" fontSize="7" fill="currentColor" fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" textAnchor="middle">3</text>
                  <path d="M10 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="mx-1 h-5 w-px bg-slate-300" />

              {/* Link removed */}

              {/* Remove formatting */}
              <button
                type="button"
                onMouseDown={preventSelectionLoss}
                onClick={handleClearFormatting}
                title="Remove Formatting"
                className="rounded px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
              >
                Clear
              </button>
            </div>
          )}

          {/* Mode buttons */}
          <div className="ml-auto flex items-center rounded-md border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => changeMode("editor")}
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                mode === "editor"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Editor
            </button>

            <button
              type="button"
              onClick={() => changeMode("code")}
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                mode === "code"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Code
            </button>

            <button
              type="button"
              onClick={() => changeMode("preview")}
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                mode === "preview"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Editor */}
        {mode === "editor" && (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            data-placeholder={placeholder}
            className="prose prose-sm max-w-none overflow-y-auto px-4 py-3 text-sm text-slate-700 outline-none"
            style={{
              minHeight: `${minHeight}px`,
            }}
          />
        )}

        {/* Code View */}
        {mode === "code" && (
          <textarea
            value={html}
            onChange={handleCodeChange}
            spellCheck={false}
            className="block w-full resize-y border-0 bg-slate-950 px-4 py-4 font-mono text-sm leading-6 text-slate-100 outline-none"
            style={{
              minHeight: `${minHeight}px`,
            }}
            placeholder="<p>Enter HTML...</p>"
          />
        )}

        {/* Preview */}
        {mode === "preview" && (
          <div
            className="prose prose-sm max-w-none overflow-y-auto px-4 py-3 text-slate-700"
            style={{
              minHeight: `${minHeight}px`,
            }}
          >
            {/* Ensure lists render markers in preview */}
            <style>{`ol { list-style: decimal outside; margin-left: 1.25rem; } ul { list-style: disc outside; margin-left: 1.25rem; }`}</style>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
        <span>
          {mode === "editor" && "Visual editor"}
          {mode === "code" && "HTML source"}
          {mode === "preview" && "Preview"}
        </span>

        <span>
          {textLength} / {maxLength}
        </span>
      </div>
    </div>
  );
}