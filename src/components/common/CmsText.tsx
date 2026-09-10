import React, { useState, useRef, useEffect } from 'react';
import { useCms } from '@/context/CmsContext';
import { Edit3, GripVertical } from 'lucide-react';

interface CmsTextProps {
  contentKey: string;
  defaultText: string;
  label?: string;
  as?: any;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
}

export const CmsText: React.FC<CmsTextProps> = ({
  contentKey,
  defaultText,
  label,
  as: Component = 'span',
  className = '',
  style,
  multiline = false,
}) => {
  const { t, getStyle, isEditMode, selectedKey, selectElement, updateDraftStyle } = useCms();
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  // Live dimensions state during drag
  const [liveWidth, setLiveWidth] = useState<number | null>(null);
  const [liveFontSize, setLiveFontSize] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const displayText = t(contentKey, defaultText);
  const customStyles = getStyle(contentKey);
  const isSelected = selectedKey === contentKey;
  const friendlyLabel = label || contentKey.split('.').pop()?.replace(/_/g, ' ') || contentKey;

  // Merged computed styles
  const mergedStyle: React.CSSProperties = {
    ...customStyles,
    ...style,
    ...(liveWidth !== null ? { maxWidth: `${liveWidth}px`, width: '100%' } : {}),
    ...(liveFontSize !== null ? { fontSize: `${liveFontSize}px` } : {}),
    ...(isDragging ? { userSelect: 'none' } : {}),
  };

  // Click handler to select element in CMS editor
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    selectElement(contentKey, friendlyLabel, defaultText);
  };

  // Right Edge Drag Handler (Resizes field width)
  const handleRightGripMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || !isSelected) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const initialRect = containerRef.current?.getBoundingClientRect();
    const startWidth = initialRect ? initialRect.width : 300;
    setIsDragging(true);

    let latestWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(120, Math.min(1400, Math.round(startWidth + deltaX)));
      latestWidth = newWidth;
      setLiveWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Persist new width to CMS state
      updateDraftStyle(contentKey, { maxWidth: `${latestWidth}px` });
    };

    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Corner Drag Handler (Proportionally resizes width & font-size)
  const handleCornerMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || !isSelected) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const initialRect = containerRef.current?.getBoundingClientRect();
    const startWidth = initialRect ? initialRect.width : 300;

    // Get current computed font size
    let startFontSize = 16;
    if (containerRef.current) {
      const comp = window.getComputedStyle(containerRef.current);
      startFontSize = parseFloat(comp.fontSize) || 16;
    }
    if (customStyles.fontSize) {
      startFontSize = parseFloat(String(customStyles.fontSize)) || startFontSize;
    }

    setIsDragging(true);
    let latestWidth = startWidth;
    let latestFontSize = startFontSize;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(120, Math.min(1400, Math.round(startWidth + deltaX)));
      const ratio = newWidth / (startWidth || 1);
      const newFontSize = Math.max(11, Math.min(84, Math.round(startFontSize * ratio)));

      latestWidth = newWidth;
      latestFontSize = newFontSize;
      setLiveWidth(newWidth);
      setLiveFontSize(newFontSize);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Persist new styles to CMS state
      updateDraftStyle(contentKey, {
        maxWidth: `${latestWidth}px`,
        fontSize: `${latestFontSize}px`,
      });
    };

    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Clean up live preview overrides when unselected
  useEffect(() => {
    if (!isSelected) {
      setLiveWidth(null);
      setLiveFontSize(null);
    } else if (containerRef.current) {
      // Smoothly scroll into view when selected
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [isSelected]);

  // When not in edit mode, render normal element with custom CMS styles applied
  if (!isEditMode) {
    return (
      <Component
        ref={containerRef}
        className={className}
        style={{
          ...mergedStyle,
          ...(customStyles.maxWidth ? { display: 'inline-block' } : {}),
        }}
      >
        {multiline ? displayText.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < displayText.split('\n').length - 1 && <br />}
          </React.Fragment>
        )) : displayText}
      </Component>
    );
  }

  // Active / computed dimensions for badge display
  const displayBadgeWidth = liveWidth !== null
    ? liveWidth
    : (containerRef.current ? Math.round(containerRef.current.getBoundingClientRect().width) : 'Auto');
  const displayBadgeFont = liveFontSize !== null
    ? `${liveFontSize}px`
    : (customStyles.fontSize || 'Default');

  return (
    <Component
      ref={containerRef}
      data-cms-key={contentKey}
      data-cms-label={friendlyLabel}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block transition-all duration-150 cursor-pointer ${className} ${
        isSelected
          ? 'z-40 ring-2 ring-emerald-400 ring-offset-2 ring-offset-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.35)] rounded-md'
          : isHovered
          ? 'z-30 ring-2 ring-cyan-400 ring-dashed ring-offset-1 rounded-md bg-cyan-400/10'
          : 'hover:ring-1 hover:ring-cyan-400/70 hover:ring-dashed'
      }`}
      style={{
        ...mergedStyle,
        minHeight: '1em',
        boxSizing: 'border-box',
      }}
      title={`Click to edit: "${friendlyLabel}"`}
    >
      {/* Outer Marks Box (Bounding Marks & Drag Handles) when Selected */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Spotlight Expanding Radar Wave Ping for immediate visual spotting */}
          <div className="absolute -inset-4 rounded-xl border-2 border-emerald-400 animate-ping opacity-60 pointer-events-none" />

          {/* Animated Neon Liquid Glass Border with Specular Halo */}
          <div className="absolute -inset-1.5 border-2 border-emerald-400 rounded-lg pointer-events-none shadow-[0_0_25px_rgba(16,185,129,0.5),inset_0_0_12px_rgba(16,185,129,0.2)] ring-2 ring-white/50" />

          {/* 4 Outer Corner Marks (Apple Squircle Nodes) */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-xs bg-white border-2 border-emerald-500 shadow-md pointer-events-none" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-xs bg-white border-2 border-emerald-500 shadow-md pointer-events-none" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-xs bg-white border-2 border-emerald-500 shadow-md pointer-events-none" />

          {/* Bottom-Right Corner Mark (Interactive Scale Handle) */}
          <div
            onMouseDown={handleCornerMouseDown}
            title="Drag corner to scale font size & field width proportionally"
            className="absolute -bottom-2 -right-2 w-4 h-4 rounded-sm bg-gradient-to-br from-white to-emerald-100 border-2 border-emerald-600 shadow-lg pointer-events-auto cursor-se-resize hover:scale-125 transition-transform flex items-center justify-center group"
          >
            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-2xs group-hover:bg-emerald-700" />
          </div>

          {/* Right Edge Outer Mark Handle (Field Width Resizer Pill) */}
          <div
            onMouseDown={handleRightGripMouseDown}
            title="Drag horizontally to resize text field width"
            className="absolute top-1/2 -translate-y-1/2 -right-3.5 h-8 w-3 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 border border-white/90 shadow-xl pointer-events-auto cursor-ew-resize hover:scale-125 active:scale-110 transition-transform flex items-center justify-center z-50"
          >
            <GripVertical className="h-3 w-3 text-white stroke-[2.5]" />
          </div>

          {/* Live Dimension Measurement Pill */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-white text-[9px] font-mono font-bold tracking-tight shadow-lg backdrop-blur-md border border-white/20 pointer-events-none whitespace-nowrap flex items-center gap-1.5">
            <span className="text-emerald-400">↔ {displayBadgeWidth}px</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">Aa {displayBadgeFont}</span>
          </div>
        </div>
      )}

      {/* Floating Tag Label Badge on Hover or Selection */}
      {(isHovered || isSelected) && (
        <span
          className={`absolute -top-6 left-0 z-50 px-2 py-0.5 text-[10px] font-black rounded-md shadow-lg pointer-events-none flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap border ${
            isSelected
              ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white border-emerald-400/50'
              : 'bg-gradient-to-r from-cyan-700 to-cyan-900 text-white border-cyan-400/50'
          }`}
        >
          <Edit3 className="h-2.5 w-2.5" />
          <span>{friendlyLabel}</span>
        </span>
      )}

      {/* Actual Content Render */}
      {multiline ? (
        displayText.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < displayText.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))
      ) : (
        displayText
      )}
    </Component>
  );
};
