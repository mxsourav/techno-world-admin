import React, { useEffect, useRef, useState } from 'react';
import { Bold, Highlighter, Italic, List, ListOrdered, Heading, RemoveFormatting } from 'lucide-react';

interface VisualRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  accentColor?: 'emerald' | 'blue';
}

/**
 * Converts legacy markdown (**, ==, *, \n, lists) to standard visual HTML
 */
function markdownToHtml(md: string): string {
  if (!md || !md.trim()) return '';
  // If already contains HTML markup, return as is
  if (/<(p|b|strong|i|em|mark|ul|ol|li|h[1-6]|br)[^>]*>/i.test(md)) {
    return md;
  }

  const lines = md.split('\n');
  let result = '';
  let inUl = false;
  let inOl = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for unordered list (• or -)
    if (/^[•\-*]\s+/.test(trimmed)) {
      if (inOl) {
        result += '</ol>';
        inOl = false;
      }
      if (!inUl) {
        result += '<ul style="list-style-type: disc; margin-left: 20px; margin-bottom: 8px;">';
        inUl = true;
      }
      const content = trimmed.replace(/^[•\-*]\s+/, '');
      result += `<li>${formatInline(content)}</li>`;
      continue;
    }

    // Check for ordered list (1. 2. etc)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      if (inUl) {
        result += '</ul>';
        inUl = false;
      }
      if (!inOl) {
        result += '<ol style="list-style-type: decimal; margin-left: 20px; margin-bottom: 8px;">';
        inOl = true;
      }
      result += `<li>${formatInline(numMatch[2])}</li>`;
      continue;
    }

    // Close any open lists if ordinary line
    if (inUl) {
      result += '</ul>';
      inUl = false;
    }
    if (inOl) {
      result += '</ol>';
      inOl = false;
    }

    if (!trimmed) {
      result += '<p><br></p>';
      continue;
    }

    if (trimmed.startsWith('### ')) {
      result += `<h3 style="font-weight: 800; margin-top: 10px; margin-bottom: 4px;">${formatInline(trimmed.slice(4))}</h3>`;
      continue;
    }

    result += `<p style="margin-bottom: 6px;">${formatInline(trimmed)}</p>`;
  }

  if (inUl) result += '</ul>';
  if (inOl) result += '</ol>';

  return result;
}

function formatInline(str: string): string {
  return str
    .replace(/==([^=]+?)==/g, '<mark style="background-color: #fef08a; color: #78350f; font-weight: bold; padding: 1px 4px; border-radius: 3px;">$1</mark>')
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>');
}

export const VisualRichEditor: React.FC<VisualRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write book details here directly in live formatted text...',
  minHeight = '140px',
  accentColor = 'emerald',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const [characterCount, setCharacterCount] = useState(0);

  // Sync external value to contentEditable on initial mount or when external change occurs
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const currentHtml = editorRef.current.innerHTML;
    const formattedHtml = markdownToHtml(value || '');

    // Prevent cursor jumping if html hasn't changed meaningfully
    if (currentHtml !== formattedHtml && (value || '') !== (editorRef.current.innerText || '')) {
      editorRef.current.innerHTML = formattedHtml;
      setCharacterCount((editorRef.current.innerText || '').length);
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isInternalUpdate.current = true;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';
    setCharacterCount(text.length);

    // If empty or only blank break, emit empty string
    if (!text.trim() && (!html || html === '<br>' || html === '<p><br></p>')) {
      onChange('');
    } else {
      onChange(html);
    }
  };

  const exec = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    if (command === 'highlight') {
      // Hilite color command with smooth yellow
      document.execCommand('hiliteColor', false, '#fef08a');
    } else if (command === 'formatBlock') {
      document.execCommand('formatBlock', false, arg || 'p');
    } else {
      document.execCommand(command, false, arg);
    }
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      exec('bold');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      exec('highlight');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      exec('italic');
    }
  };

  const activeFocusRing =
    accentColor === 'blue'
      ? 'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'
      : 'focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500';

  return (
    <div className={`w-full rounded-lg border border-slate-300 bg-white shadow-2xs transition-all ${activeFocusRing}`}>
      {/* Visual WYSIWYG Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-200 bg-slate-50/90 px-3 py-1.5 rounded-t-lg">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => exec('bold')}
            title="Bold selection (Ctrl+B)"
            className="flex h-7 px-2.5 items-center gap-1 rounded bg-white text-xs font-black text-slate-800 shadow-2xs border border-slate-200 hover:bg-slate-100 hover:text-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <Bold className="h-3.5 w-3.5 stroke-[3]" />
            <span>Bold</span>
          </button>

          <button
            type="button"
            onClick={() => exec('highlight')}
            title="Highlight selection in yellow (Ctrl+H)"
            className="flex h-7 px-2.5 items-center gap-1 rounded bg-yellow-100 text-xs font-bold text-amber-950 shadow-2xs border border-yellow-300 hover:bg-yellow-200 active:scale-95 transition-all cursor-pointer"
          >
            <Highlighter className="h-3.5 w-3.5 text-amber-700 stroke-[2.5]" />
            <span>Highlight</span>
          </button>

          <button
            type="button"
            onClick={() => exec('italic')}
            title="Italic selection (Ctrl+I)"
            className="flex h-7 px-2 items-center gap-1 rounded bg-white text-xs italic font-bold text-slate-800 shadow-2xs border border-slate-200 hover:bg-slate-100 hover:text-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <Italic className="h-3.5 w-3.5" />
            <span>Italic</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="1. Numbered List (Auto-increments next number on Enter)"
            className="flex h-7 px-2 items-center gap-1 rounded bg-white text-xs font-bold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-100 hover:text-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <ListOrdered className="h-3.5 w-3.5 text-blue-600" />
            <span>1. Number List</span>
          </button>

          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="• Bullet List"
            className="flex h-7 px-2 items-center gap-1 rounded bg-white text-xs font-bold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-100 hover:text-blue-700 active:scale-95 transition-all cursor-pointer"
          >
            <List className="h-3.5 w-3.5 text-slate-600" />
            <span>• Bullet List</span>
          </button>

          <button
            type="button"
            onClick={() => exec('formatBlock', '<h3>')}
            title="Section Heading (H3)"
            className="flex h-7 px-2 items-center gap-1 rounded bg-white text-xs font-bold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-100 hover:text-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <Heading className="h-3.5 w-3.5 text-slate-600" />
            <span>Heading</span>
          </button>

          <button
            type="button"
            onClick={() => exec('removeFormat')}
            title="Clear formatting"
            className="flex h-7 px-1.5 items-center gap-1 rounded bg-white text-xs text-slate-500 shadow-2xs border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
          >
            <RemoveFormatting className="h-3 w-3" />
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
          Live Visual WYSIWYG · Ctrl+B (Bold) · Ctrl+H (Highlight)
        </span>
      </div>

      {/* Direct ContentEditable Canvas */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="w-full p-3.5 text-xs text-slate-900 leading-relaxed outline-none font-sans select-text overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-1.5 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1.5 [&_mark]:bg-yellow-200/90 [&_mark]:text-amber-950 [&_mark]:font-bold [&_mark]:px-1 [&_mark]:rounded-xs [&_h3]:text-sm [&_h3]:font-black [&_h3]:text-slate-900 [&_h3]:my-2"
      />

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-1.5 bg-slate-50/50 text-[10px] text-slate-400 rounded-b-lg">
        <span>Edit directly in place. Formatting displays live in real time.</span>
        <span>{characterCount} characters</span>
      </div>
    </div>
  );
};
