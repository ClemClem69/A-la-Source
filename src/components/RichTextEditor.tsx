import { useEffect, useRef } from 'react';
import { Bold, Underline } from 'lucide-react';
import { sanitizeArticleContent } from '../lib/articleContent';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ initialValue, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (editorRef.current && !initializedRef.current) {
      editorRef.current.innerHTML = sanitizeArticleContent(initialValue);
      initializedRef.current = true;
    }
  }, [initialValue]);

  function applyCommand(command: string, value?: string) {
    editorRef.current?.focus();
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedRangeRef.current);
    }
    document.execCommand(command, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    savedRangeRef.current = null;
  }

  function saveSelection() {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }

  return (
    <div className="mt-1 overflow-hidden rounded-lg border border-stone-300 bg-white focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-200">
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 bg-stone-50 p-2">
        <button
          type="button"
          onMouseDown={saveSelection}
          onClick={() => applyCommand('bold')}
          className="rounded border border-stone-300 bg-white p-2 text-stone-700 hover:bg-stone-100"
          aria-label="Mettre en gras"
          title="Gras"
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onMouseDown={saveSelection}
          onClick={() => applyCommand('underline')}
          className="rounded border border-stone-300 bg-white p-2 text-stone-700 hover:bg-stone-100"
          aria-label="Souligner"
          title="Souligner"
        >
          <Underline className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="article-editor input min-h-56 resize-y overflow-y-auto rounded-none border-0 focus:border-0 focus:ring-0"
        role="textbox"
        aria-label="Contenu de l’article"
        aria-multiline="true"
        aria-required="true"
        data-placeholder="Rédigez le contenu de votre article..."
      />
      <p className="border-t border-stone-100 px-3 py-2 text-xs text-stone-500">
        Les paragraphes et les mises en forme de base seront conservés à la publication.
      </p>
    </div>
  );
}
