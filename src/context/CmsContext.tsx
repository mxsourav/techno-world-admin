import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cmsService, api } from '@/services/api';

export interface CmsElementStyles {
  fontSize?: string;
  maxWidth?: string;
  textAlign?: string;
}

interface CmsContextType {
  content: Record<string, string>;
  isEditMode: boolean;
  selectedKey: string | null;
  t: (key: string, defaultText: string) => string;
  getStyle: (key: string) => React.CSSProperties;
  selectElement: (key: string, label: string, defaultText: string) => void;
  updateDraftKey: (key: string, value: string) => void;
  updateDraftStyle: (key: string, styles: CmsElementStyles) => void;
  publishContent: (updatedMap: Record<string, string>) => Promise<boolean>;
  resetKeyToDefault: (key: string) => Promise<boolean>;
  refreshContent: () => Promise<void>;
}

const CmsContext = createContext<CmsContextType | null>(null);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Check URL param or window message for edit mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const cmsEditParam = urlParams.get('cms_edit') === 'true';
      const isEmbedded = window.self !== window.top;
      if (cmsEditParam || isEmbedded) {
        setIsEditMode(true);
      }
    }
  }, []);

  // Fetch published CMS content from backend
  const refreshContent = useCallback(async () => {
    try {
      const res = await cmsService.getUiContent();
      if (res.success && res.data) {
        setContent(res.data);
      }
    } catch {
      try {
        const cached = localStorage.getItem('TW_CMS_CONTENT_CACHE');
        if (cached) {
          setContent(JSON.parse(cached));
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  // Listen for real-time live preview messages from parent editor
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'TW_CMS_PREVIEW_UPDATE' && data.key) {
        setContent((prev) => ({
          ...prev,
          [data.key]: data.value ?? '',
        }));
      } else if (data.type === 'TW_CMS_STYLE_UPDATE' && data.key) {
        setContent((prev) => {
          const next = { ...prev };
          if (data.fontSize !== undefined) next[`${data.key}__fontSize`] = data.fontSize;
          if (data.maxWidth !== undefined) next[`${data.key}__maxWidth`] = data.maxWidth;
          if (data.textAlign !== undefined) next[`${data.key}__textAlign`] = data.textAlign;
          return next;
        });
      } else if (data.type === 'TW_CMS_SELECT_KEY') {
        setSelectedKey(data.key || null);
        if (data.key) {
          setTimeout(() => {
            const el = document.querySelector(`[data-cms-key="${data.key}"]`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      } else if (data.type === 'TW_CMS_FORCE_EDIT_MODE') {
        setIsEditMode(Boolean(data.enabled));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Translation helper
  const t = useCallback((key: string, defaultText: string): string => {
    if (content[key] !== undefined && content[key] !== null && content[key] !== '') {
      return content[key];
    }
    return defaultText;
  }, [content]);

  // Style extractor helper
  const getStyle = useCallback((key: string): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    const fs = content[`${key}__fontSize`];
    if (fs) styles.fontSize = fs;
    const mw = content[`${key}__maxWidth`];
    if (mw) styles.maxWidth = mw;
    const ta = content[`${key}__textAlign`];
    if (ta) styles.textAlign = ta as any;
    return styles;
  }, [content]);

  // When an element is clicked in edit mode, notify parent window and update selectedKey
  const selectElement = useCallback((key: string, label: string, defaultText: string) => {
    setSelectedKey(key);
    const currentValue = content[key] !== undefined ? content[key] : defaultText;
    const currentFontSize = content[`${key}__fontSize`] || '';
    const currentMaxWidth = content[`${key}__maxWidth`] || '';
    const currentTextAlign = content[`${key}__textAlign`] || '';

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'TW_CMS_ELEMENT_CLICKED',
          key,
          label,
          value: currentValue,
          defaultText,
          fontSize: currentFontSize,
          maxWidth: currentMaxWidth,
          textAlign: currentTextAlign,
        },
        '*'
      );
    }
  }, [content]);

  // Local draft update for text
  const updateDraftKey = useCallback((key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Local draft update for styles (fontSize, maxWidth, textAlign)
  const updateDraftStyle = useCallback((key: string, styles: CmsElementStyles) => {
    setContent((prev) => {
      const next = { ...prev };
      if (styles.fontSize !== undefined) next[`${key}__fontSize`] = styles.fontSize;
      if (styles.maxWidth !== undefined) next[`${key}__maxWidth`] = styles.maxWidth;
      if (styles.textAlign !== undefined) next[`${key}__textAlign`] = styles.textAlign;
      return next;
    });

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'TW_CMS_STYLE_UPDATE',
          key,
          fontSize: styles.fontSize,
          maxWidth: styles.maxWidth,
          textAlign: styles.textAlign,
        },
        '*'
      );
    }
  }, []);

  // Save/Publish to server
  const publishContent = async (updatedMap: Record<string, string>): Promise<boolean> => {
    try {
      const res = await cmsService.publishUiContent(updatedMap);
      if (res.success && res.data) {
        setContent(res.data);
        try {
          localStorage.setItem('TW_CMS_CONTENT_CACHE', JSON.stringify(res.data));
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('[CMS] Publish failed:', err);
      return false;
    }
  };

  // Reset a key
  const resetKeyToDefault = async (key: string): Promise<boolean> => {
    try {
      const res = await api.delete<Record<string, string>>(`/cms/ui-content/${encodeURIComponent(key)}`);
      if (res.success && res.data) {
        setContent(res.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <CmsContext.Provider
      value={{
        content,
        isEditMode,
        selectedKey,
        t,
        getStyle,
        selectElement,
        updateDraftKey,
        updateDraftStyle,
        publishContent,
        resetKeyToDefault,
        refreshContent,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextType => {
  const context = useContext(CmsContext);
  if (!context) {
    return {
      content: {},
      isEditMode: false,
      selectedKey: null,
      t: (_k, def) => def,
      getStyle: () => ({}),
      selectElement: () => {},
      updateDraftKey: () => {},
      updateDraftStyle: () => {},
      publishContent: async () => false,
      resetKeyToDefault: async () => false,
      refreshContent: async () => {},
    };
  }
  return context;
};
