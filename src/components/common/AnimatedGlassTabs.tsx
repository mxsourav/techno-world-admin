import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';

export interface AnimatedGlassTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface AnimatedGlassTabsProps<T extends string = string> {
  tabs: AnimatedGlassTabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  prefix?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pillClassName?: string;
  buttonClassName?: string;
}

export function AnimatedGlassTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  prefix,
  size = 'md',
  className = '',
  pillClassName = '',
  buttonClassName = '',
}: AnimatedGlassTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; height: number; top: number }>({
    left: 0,
    width: 0,
    height: 0,
    top: 4,
  });
  const [isReady, setIsReady] = useState(false);

  const updateIndicator = () => {
    if (!containerRef.current) return;
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
    if (activeIndex === -1) return;

    const buttons = containerRef.current.querySelectorAll<HTMLButtonElement>('button[data-tab-btn]');
    const activeButton = buttons[activeIndex];

    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
        height: buttonRect.height,
        top: buttonRect.top - containerRect.top,
      });
      setIsReady(true);
    }
  };

  useLayoutEffect(() => {
    updateIndicator();
  }, [activeTab, tabs]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    const timer = setTimeout(updateIndicator, 60);
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center rounded-xl border border-slate-200 dark:border-white/[0.12] bg-slate-100 dark:bg-white/[0.04] p-1 select-none ${className}`}
    >
      {prefix && (
        <span className="relative z-10 flex items-center gap-1 px-2.5 text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">
          {prefix}
        </span>
      )}

      {/* Animated Sliding Glass Pill with Specular Light Reflection */}
      {isReady && (
        <div
          className={`absolute glass-tab-active pointer-events-none transition-all duration-300 z-0 ${pillClassName}`}
          style={{
            transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
            width: `${indicatorStyle.width}px`,
            height: `${indicatorStyle.height}px`,
            left: 0,
            top: 0,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Tab Buttons */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs';
        return (
          <button
            key={tab.id}
            data-tab-btn
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative z-10 flex items-center gap-1.5 rounded-lg ${sizeClasses} font-bold transition-colors duration-200 cursor-pointer ${
              isActive
                ? 'text-slate-900 dark:text-white font-extrabold'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
            } ${buttonClassName}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge}
          </button>
        );
      })}
    </div>
  );
}
