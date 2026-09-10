import React, { useState } from 'react';
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
  const { t, isEditMode, selectedKey, selectElement } = useCms();
  const [isHovered, setIsHovered] = useState(false);

  const displayText = t(contentKey, defaultText);
  const isSelected = selectedKey === contentKey;
  const friendlyLabel = label || contentKey.split('.').pop()?.replace(/_/g, ' ') || contentKey;

  if (!isEditMode) {
    return (
      <Component className={className} style={style}>
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
      data-cms-key={contentKey}
      data-cms-label={friendlyLabel}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block transition-all duration-150 cursor-pointer ${className} ${
        isSelected
          ? 'outline-2 outline-emerald-500 outline-dashed bg-emerald-50/40 rounded px-0.5'
          : isHovered
          ? 'outline-2 outline-cyan-500 outline-dashed bg-cyan-50/30 rounded px-0.5'
          : 'hover:outline-1 hover:outline-cyan-400 hover:outline-dashed'
      }`}
      style={{
        ...style,
        minHeight: '1em',
      }}
      title={`Click to edit: "${friendlyLabel}"`}
    >
      {/* Floating Indicator Badge on Hover or Selection */}
      {(isHovered || isSelected) && (
        <span
          className={`absolute -top-6 left-0 z-50 px-1.5 py-0.5 text-[10px] font-bold rounded shadow-md pointer-events-none flex items-center gap-1 uppercase tracking-wider whitespace-nowrap ${
            isSelected
              ? 'bg-emerald-700 text-white'
              : 'bg-cyan-700 text-white'
          }`}
        >
          <Edit3 className="h-2.5 w-2.5" />
          <span>{friendlyLabel}</span>
        </span>
      )}

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
