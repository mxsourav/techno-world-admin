import React, { useState, useRef, useEffect } from 'react';
import { useCms } from '@/context/CmsContext';
import { Edit3 } from 'lucide-react';

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
  const { t, getStyle, isEditMode, selectedKey, selectElement } = useCms();
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const displayText = t(contentKey, defaultText);
  const customStyles = getStyle(contentKey);
  const isSelected = selectedKey === contentKey;
  const friendlyLabel = label || contentKey.split('.').pop()?.replace(/_/g, ' ') || contentKey;

  const mergedStyle: React.CSSProperties = {
    ...customStyles,
    ...style,
  };

  useEffect(() => {
    if (isSelected && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [isSelected]);

  // When not in CMS edit mode, render normal element
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    selectElement(contentKey, friendlyLabel, defaultText);
  };

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
          ? 'outline-2 outline-emerald-500 outline-dashed bg-emerald-500/10 rounded px-1'
          : isHovered
          ? 'outline-2 outline-cyan-400 outline-dashed bg-cyan-400/10 rounded px-1'
          : 'hover:outline-1 hover:outline-cyan-400/70 hover:outline-dashed'
      }`}
      style={{
        ...mergedStyle,
        minHeight: '1em',
        boxSizing: 'border-box',
      }}
      title={`Click to edit: "${friendlyLabel}"`}
    >
      {/* Floating Tag Label Badge on Hover or Selection */}
      {(isHovered || isSelected) && (
        <span
          className={`absolute -top-6 left-0 z-50 px-2 py-0.5 text-[10px] font-bold rounded shadow-md pointer-events-none flex items-center gap-1 uppercase tracking-wider whitespace-nowrap ${
            isSelected
              ? 'bg-emerald-700 text-white'
              : 'bg-cyan-700 text-white'
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
