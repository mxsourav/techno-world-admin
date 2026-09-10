import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cmsService, api } from '@/services/api';

interface CmsContextType {
  content: Record<string, string>;
  isEditMode: boolean;
  selectedKey: string | null;
  t: (key: string, defaultText: string) => string;
  selectElement: (key: string, label: string, defaultText: string) => void;
  updateDraftKey: (key: string, value: string) => void;
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
      // Fallback: use empty or cached
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
      } else if (data.type === 'TW_CMS_SELECT_KEY') {
        setSelectedKey(data.key || null);
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

  // When an element is clicked in edit mode, notify parent window and update selectedKey
  const selectElement = useCallback((key: string, label: string, defaultText: string) => {
    setSelectedKey(key);
    const currentValue = content[key] !== undefined ? content[key] : defaultText;

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'TW_CMS_ELEMENT_CLICKED',
          key,
          label,
          value: currentValue,
          defaultText,
        },
        '*'
      );
    }
  }, [content]);

  // Local draft update
  const updateDraftKey = useCallback((key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: value,
    }));
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
        selectElement,
        updateDraftKey,
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
    // Fallback safe context if called outside provider
    return {
      content: {},
      isEditMode: false,
      selectedKey: null,
      t: (_k, def) => def,
      selectElement: () => {},
      updateDraftKey: () => {},
      publishContent: async () => false,
      resetKeyToDefault: async () => false,
      refreshContent: async () => {},
    };
  }
  return context;
};
