import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Save,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Search,
  Undo2,
  Sparkles,
  Layers,
  ChevronRight,
  Sliders,
  PanelRightClose,
  PanelRight,
  Globe,
  SlidersHorizontal,
  Type,
  Minus,
  Plus,
  MoveHorizontal
} from 'lucide-react';
import { cmsService } from '@/services/api';
import { toast } from 'sonner';

interface VisualCmsEditorProps {
  onClose?: () => void;
}

interface EditableKeyInfo {
  key: string;
  label: string;
  section: string;
  defaultText: string;
  multiline?: boolean;
  page?: string;
}

const REGISTERED_CMS_KEYS: EditableKeyInfo[] = [
  // Header (visible across all pages)
  { key: 'header.top_strip', label: 'Announcement Bar', section: 'Header & Navigation', defaultText: 'Delivering across India — 27,000+ pincodes' },
  { key: 'header.sub_tagline', label: 'Store Tagline', section: 'Header & Navigation', defaultText: 'India ka apna bookstore' },
  
  // Homepage Hero (page '/')
  { key: 'home.hero_badge', label: 'Hero Sale Badge', section: 'Homepage Hero', defaultText: 'Grand Book Sale — Up to 60% off 10,000+ titles', page: '/' },
  { key: 'home.hero_title_1', label: 'Hero Headline Line 1', section: 'Homepage Hero', defaultText: 'Every book India reads,', page: '/' },
  { key: 'home.hero_title_2', label: 'Hero Headline Line 2', section: 'Homepage Hero', defaultText: 'one search away.', page: '/' },
  { key: 'home.hero_desc', label: 'Hero Subtitle Description', section: 'Homepage Hero', defaultText: 'From academic textbooks to bestselling fiction, get genuine books delivered straight to your doorstep with guaranteed lowest prices.', multiline: true, page: '/' },

  // Homepage Offers (page '/')
  { key: 'home.offer_1_title', label: 'Offer 1 Title', section: 'Homepage Highlights', defaultText: 'STUDENT15 — 15% off', page: '/' },
  { key: 'home.offer_1_desc', label: 'Offer 1 Subtitle', section: 'Homepage Highlights', defaultText: 'For students on exam & academic books', page: '/' },
  { key: 'home.offer_2_title', label: 'Offer 2 Title', section: 'Homepage Highlights', defaultText: 'Free Delivery', multiline: false, page: '/' },
  { key: 'home.offer_2_desc', label: 'Offer 2 Subtitle', section: 'Homepage Highlights', defaultText: 'On all orders above ₹999 across India', page: '/' },
  { key: 'home.offer_3_title', label: 'Offer 3 Title', section: 'Homepage Highlights', defaultText: 'Techno Rewards', page: '/' },
  { key: 'home.offer_3_desc', label: 'Offer 3 Subtitle', section: 'Homepage Highlights', defaultText: 'Earn 1 Techno Coin per ₹100 spent (excl. delivery)', page: '/' },
  { key: 'home.exam_zone_title', label: 'Exam Zone Heading', section: 'Homepage Highlights', defaultText: 'NEET · JEE · UPSC · GATE · SSC — all prep books in one place', page: '/' },
  { key: 'home.exam_zone_desc', label: 'Exam Zone Subtitle', section: 'Homepage Highlights', defaultText: "Previous year papers, toppers' booklists and combo packs at the best prices.", page: '/' },

  // Special Offer Floating Popup (page '/')
  { key: 'popup.badge', label: 'Offer Popup Badge', section: 'Floating Special Offer', defaultText: 'Special offer', page: '/' },
  { key: 'popup.headline', label: 'Offer Popup Headline', section: 'Floating Special Offer', defaultText: 'Book sale · Up to 60% off', page: '/' },
  { key: 'popup.subtext', label: 'Offer Popup Subtext', section: 'Floating Special Offer', defaultText: 'Find your next favourite read.', multiline: true, page: '/' },

  // Homepage Book Sections (page '/')
  { key: 'home.section_recommended', label: 'Recommended Section Title', section: 'Homepage Book Sections', defaultText: 'Recommended For You', page: '/' },
  { key: 'home.section_competitive', label: 'Competitive Exam Section Title', section: 'Homepage Book Sections', defaultText: 'Competitive Exam Books', page: '/' },
  { key: 'home.section_non_fiction', label: 'Non-Fiction Section Title', section: 'Homepage Book Sections', defaultText: 'Non-Fiction Books', page: '/' },
  { key: 'home.section_medical', label: 'Medical Section Title', section: 'Homepage Book Sections', defaultText: 'Medical & Healthcare Books', page: '/' },
  { key: 'home.section_engineering', label: 'Engineering Section Title', section: 'Homepage Book Sections', defaultText: 'Engineering & Technology Books', page: '/' },
  { key: 'home.section_bengali', label: 'Bengali Story Section Title', section: 'Homepage Book Sections', defaultText: 'Bengali Story Books', page: '/' },
  { key: 'home.section_fiction', label: 'Fiction Section Title', section: 'Homepage Book Sections', defaultText: 'Fiction & Novels', page: '/' },
  { key: 'home.section_school', label: 'School Section Title', section: 'Homepage Book Sections', defaultText: 'School Books (NCERT / ICSE)', page: '/' },
  { key: 'home.section_university', label: 'University Section Title', section: 'Homepage Book Sections', defaultText: 'University & College Books', page: '/' },
  { key: 'home.section_bestsellers', label: 'Best Sellers Section Title', section: 'Homepage Book Sections', defaultText: 'Best Sellers', page: '/' },
  { key: 'home.section_trending', label: 'Trending Section Title', section: 'Homepage Book Sections', defaultText: 'Trending Now', page: '/' },
  { key: 'home.section_new_releases', label: 'New Releases Section Title', section: 'Homepage Book Sections', defaultText: 'New Releases', page: '/' },

  // About Page (page '/about')
  { key: 'about.title', label: 'About Page Title', section: 'About Us Page', defaultText: 'About Techno World Books', page: '/about' },
  { key: 'about.subtitle', label: 'About Page Subtitle', section: 'About Us Page', defaultText: 'Your Trusted Bookstore for Every Reader', page: '/about' },
  { key: 'about.quote', label: 'Inspiring Heritage Quote', section: 'About Us Page', defaultText: '"Connecting generations of readers with the rich literary and academic heritage of College Street."', multiline: true, page: '/about' },
  { key: 'about.procurement_title', label: 'Procurement Heading', section: 'About Us Page', defaultText: "Can't Find a Book? Request It Here", page: '/about' },
  { key: 'about.procurement_desc', label: 'Procurement Subtitle', section: 'About Us Page', defaultText: "Don't worry if the book you're looking for isn't currently displayed on our website. With our deep connections across College Street, national publishers, and academic distributors, our team can source rare, out-of-print, and foreign editions for you.", multiline: true, page: '/about' },

  // Contact Page (page '/contact')
  { key: 'contact.title', label: 'Contact Title', section: 'Contact & Storefront', defaultText: 'Contact Techno World Books', page: '/contact' },
  { key: 'contact.subtitle', label: 'Contact Subtitle', section: 'Contact & Storefront', defaultText: 'Visit our historic College Street bookshop or contact our digital customer service team', page: '/contact' },

  // Footer (visible across all pages, at bottom)
  { key: 'footer.address', label: 'Store Physical Address', section: 'Contact & Storefront', defaultText: '90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007', multiline: true },
  { key: 'footer.phone', label: 'Landline Phone Number', section: 'Contact & Storefront', defaultText: '033 2219 6115' },
];

export const VisualCmsEditor: React.FC<VisualCmsEditorProps> = () => {
  // Theme state: Automatically synchronized with Global Admin Dark Mode
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('tw_admin_dark_mode') === 'true' || document.documentElement.classList.contains('dark');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Viewport Device Presets
  const [devicePreset, setDevicePreset] = useState<'desktop' | 'tablet' | 'mobile' | 'custom'>('desktop');
  const [customWidth, setCustomWidth] = useState<number>(1120);

  // Inspector Panel Sizing (Resizable splitter)
  const [inspectorWidth, setInspectorWidth] = useState<number>(400);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);
  const [isDraggingInspector, setIsDraggingInspector] = useState<boolean>(false);

  // Canvas Resizing Handle (Drag canvas edge)
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);

  // Fullscreen expansion
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Zoom Controls & Interactive Canvas Scaling
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // Ctrl + Mouse Wheel listener for zooming preview
  useEffect(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.05 : -0.05;
        setZoomLevel((prev) => Math.min(2.0, Math.max(0.4, +(prev + delta).toFixed(2))));
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Keyboard shortcut listener for Ctrl + / Ctrl - / Ctrl 0
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoomLevel((prev) => Math.min(2.0, +(prev + 0.1).toFixed(2)));
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          setZoomLevel((prev) => Math.max(0.4, +(prev - 0.1).toFixed(2)));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Content & Preview State
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [selectedKey, setSelectedKey] = useState<string | null>('home.hero_title_1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [content, setContent] = useState<Record<string, string>>({});
  const [initialContent, setInitialContent] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inspectorScrollRef = useRef<HTMLDivElement>(null);

  // Track actual dimensions of the preview canvas area
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const el = canvasWrapperRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width: Math.round(width), height: Math.round(height) });
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute exact frame dimensions and inner viewport transform
  const previewLayout = useMemo(() => {
    const availW = Math.max(320, (canvasSize.width || 1000) - 24);
    const availH = Math.max(320, (canvasSize.height || 700) - 24);

    if (devicePreset === 'mobile') {
      // Standard smartphone resolution: 390px x 693px (exact 9:16 aspect ratio)
      const baseW = 390;
      const baseH = 693;
      const fitScale = Math.min(1, availW / baseW, availH / baseH) * zoomLevel;
      const frameW = Math.round(baseW * fitScale);
      const frameH = Math.round(baseH * fitScale);

      return {
        frameWidth: `${frameW}px`,
        frameHeight: `${frameH}px`,
        aspectRatio: '9 / 16',
        innerStyle: {
          width: `${baseW}px`,
          height: `${baseH}px`,
          transform: `scale(${fitScale})`,
          transformOrigin: 'top left',
        } as React.CSSProperties,
        renderedWidth: baseW,
        isScaled: true,
      };
    }

    if (devicePreset === 'tablet') {
      // Tablet portrait: 768px wide, fills vertical canvas
      const baseW = 768;
      const fitScale = Math.min(1, availW / baseW) * zoomLevel;
      const frameW = Math.min(availW, Math.round(baseW * fitScale));
      const frameH = availH;
      const innerH = Math.round(frameH / fitScale);

      return {
        frameWidth: `${frameW}px`,
        frameHeight: `${frameH}px`,
        aspectRatio: undefined,
        innerStyle: {
          width: `${baseW}px`,
          height: `${innerH}px`,
          transform: `scale(${fitScale})`,
          transformOrigin: 'top left',
        } as React.CSSProperties,
        renderedWidth: baseW,
        isScaled: fitScale < 1 || zoomLevel !== 1,
      };
    }

    if (devicePreset === 'custom') {
      const baseW = customWidth;
      const fitScale = Math.min(1, availW / baseW) * zoomLevel;
      const frameW = Math.min(availW, Math.round(baseW * fitScale));
      const frameH = availH;
      const innerH = Math.round(frameH / fitScale);

      return {
        frameWidth: `${frameW}px`,
        frameHeight: `${frameH}px`,
        aspectRatio: undefined,
        innerStyle: {
          width: `${baseW}px`,
          height: `${innerH}px`,
          transform: `scale(${fitScale})`,
          transformOrigin: 'top left',
        } as React.CSSProperties,
        renderedWidth: baseW,
        isScaled: fitScale < 1 || zoomLevel !== 1,
      };
    }

    // Desktop: Standard desktop 1280px resolution scaled down if canvas < 1280px, fills vertical canvas with 0 empty gap
    const baseW = 1280;
    const fitScale = Math.min(1, availW / baseW) * zoomLevel;
    const frameW = Math.min(availW, Math.round(baseW * fitScale));
    const frameH = availH;
    const innerH = Math.round(frameH / fitScale);

    return {
      frameWidth: `${frameW}px`,
      frameHeight: `${frameH}px`,
      aspectRatio: undefined,
      innerStyle: {
        width: `${baseW}px`,
        height: `${innerH}px`,
        transform: `scale(${fitScale})`,
        transformOrigin: 'top left',
      } as React.CSSProperties,
      renderedWidth: baseW,
      isScaled: fitScale < 1 || zoomLevel !== 1,
    };
  }, [canvasSize, devicePreset, customWidth, zoomLevel]);

  // Fetch current published content from backend
  useEffect(() => {
    cmsService
      .getUiContent()
      .then((res: any) => {
        if (res?.success && res.data) {
          setContent(res.data);
          setInitialContent(res.data);
        }
      })
      .catch((err: any) => {
        console.error('[CMS Editor] Failed to fetch content', err);
      });
  }, []);

  // Listen to postMessage from the iframe when user clicks or drags an element
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'TW_CMS_IFRAME_READY') {
        // Handshake: live preview iframe is ready for synchronization
        handleIframeLoad();
      } else if (data.type === 'TW_CMS_ELEMENT_CLICKED' && data.key) {
        setSelectedKey(data.key);
        if (isInspectorCollapsed) {
          setIsInspectorCollapsed(false);
        }
        if (inspectorScrollRef.current) {
          inspectorScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setContent((prev) => {
          const next = { ...prev };
          if (next[data.key] === undefined) {
            next[data.key] = data.value || data.defaultText || '';
          }
          if (data.fontSize) next[`${data.key}__fontSize`] = data.fontSize;
          if (data.maxWidth) next[`${data.key}__maxWidth`] = data.maxWidth;
          return next;
        });
      } else if (data.type === 'TW_CMS_STYLE_UPDATE' && data.key) {
        setContent((prev) => {
          const next = { ...prev };
          if (data.fontSize !== undefined) next[`${data.key}__fontSize`] = data.fontSize;
          if (data.maxWidth !== undefined) next[`${data.key}__maxWidth`] = data.maxWidth;
          if (data.textAlign !== undefined) next[`${data.key}__textAlign`] = data.textAlign;
          return next;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isInspectorCollapsed]);

  // Track latest selected key in a ref for iframe load handshakes
  const selectedKeyRef = useRef(selectedKey);
  useEffect(() => {
    selectedKeyRef.current = selectedKey;
  }, [selectedKey]);

  // Determine storefront preview base URL (points to local storefront on port 3000 during dev, or live domain in production)
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
  const previewOrigin = isLocalHost
    ? `${window.location.protocol}//${window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost'}:3000`
    : 'https://technoworldbooks.in';
  const previewUrl = `${previewOrigin}${selectedPage}${selectedPage.includes('?') ? '&' : '?'}cms_edit=true&_preview=${iframeKey}`;

  // Broadcast current drafts and styles to iframe on load
  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc && !doc.getElementById('tw-macos-scrollbar-style')) {
        const style = doc.createElement('style');
        style.id = 'tw-macos-scrollbar-style';
        style.textContent = `
          * { scrollbar-width: thin; scrollbar-color: rgba(100, 116, 139, 0.3) transparent; }
          .dark * { scrollbar-color: rgba(255, 255, 255, 0.22) transparent; }
          ::-webkit-scrollbar { width: 8px; height: 8px; background-color: transparent; }
          ::-webkit-scrollbar-track, ::-webkit-scrollbar-track-piece { background-color: transparent; }
          ::-webkit-scrollbar-button { display: none !important; width: 0 !important; height: 0 !important; }
          ::-webkit-scrollbar-corner { background-color: transparent; }
          ::-webkit-scrollbar-thumb { background-color: rgba(0, 0, 0, 0.18); border-radius: 9999px; border: 2px solid transparent; background-clip: content-box; }
          ::-webkit-scrollbar-thumb:hover { background-color: rgba(0, 0, 0, 0.35); }
          .dark ::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.2); border-radius: 9999px; border: 2px solid transparent; background-clip: content-box; }
          .dark ::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.38); }
        `;
        doc.head?.appendChild(style);
      }
    } catch {
      // Cross-origin fallback handled by storefront app index.css
    }

    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'TW_CMS_FORCE_EDIT_MODE',
        enabled: true,
      },
      '*'
    );

    // Sync all existing draft keys & styles into preview
    Object.entries(content).forEach(([k, v]) => {
      if (k.endsWith('__fontSize')) {
        const baseKey = k.replace('__fontSize', '');
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'TW_CMS_STYLE_UPDATE',
            key: baseKey,
            fontSize: v,
          },
          '*'
        );
      } else if (k.endsWith('__maxWidth')) {
        const baseKey = k.replace('__maxWidth', '');
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'TW_CMS_STYLE_UPDATE',
            key: baseKey,
            maxWidth: v,
          },
          '*'
        );
      } else {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'TW_CMS_PREVIEW_UPDATE',
            key: k,
            value: v,
          },
          '*'
        );
      }
    });

    const targetKey = selectedKeyRef.current || selectedKey;
    if (targetKey) {
      const sendKey = () => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'TW_CMS_SELECT_KEY',
            key: targetKey,
          },
          '*'
        );
      };
      sendKey();
      setTimeout(sendKey, 150);
      setTimeout(sendKey, 400);
    }
  };

  // Selection from directory: auto-switches page if necessary and sends scroll & highlight command
  const handleSelectKeyFromDirectory = (item: EditableKeyInfo) => {
    setSelectedKey(item.key);
    selectedKeyRef.current = item.key;

    if (inspectorScrollRef.current) {
      inspectorScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (item.page && selectedPage !== item.page) {
      setSelectedPage(item.page);
      setIframeKey(Date.now());
    } else {
      const sendSelect = () => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'TW_CMS_SELECT_KEY',
            key: item.key,
          },
          '*'
        );
      };
      sendSelect();
      setTimeout(sendSelect, 80);
      setTimeout(sendSelect, 220);
      setTimeout(sendSelect, 500);
    }
  };

  // When value changes in inspector, update state & postMessage immediately to preview iframe
  const handleValueChange = (val: string) => {
    if (!selectedKey) return;

    setContent((prev) => ({
      ...prev,
      [selectedKey]: val,
    }));

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'TW_CMS_PREVIEW_UPDATE',
        key: selectedKey,
        value: val,
      },
      '*'
    );
  };

  // Font Size change handler
  const handleFontSizeChange = (sizePx: number) => {
    if (!selectedKey) return;
    const val = `${sizePx}px`;

    setContent((prev) => ({
      ...prev,
      [`${selectedKey}__fontSize`]: val,
    }));

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'TW_CMS_STYLE_UPDATE',
        key: selectedKey,
        fontSize: val,
        maxWidth: content[`${selectedKey}__maxWidth`],
      },
      '*'
    );
  };

  // Field Width (Max-Width) change handler
  const handleMaxWidthChange = (widthVal: number | 'auto') => {
    if (!selectedKey) return;
    const val = widthVal === 'auto' ? '' : `${widthVal}px`;

    setContent((prev) => ({
      ...prev,
      [`${selectedKey}__maxWidth`]: val,
    }));

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'TW_CMS_STYLE_UPDATE',
        key: selectedKey,
        maxWidth: val,
        fontSize: content[`${selectedKey}__fontSize`],
      },
      '*'
    );
  };

  // Reset a field to default
  const handleResetCurrentKey = () => {
    if (!selectedKey) return;
    const registered = REGISTERED_CMS_KEYS.find((k) => k.key === selectedKey);
    const def = registered ? registered.defaultText : '';

    handleValueChange(def);
    handleFontSizeChange(16);
    handleMaxWidthChange('auto');
    toast.info(`Reset "${selectedKey}" text & styles to default.`);
  };

  // Publish to Database
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res: any = await cmsService.publishUiContent(content);

      if (res?.success) {
        setInitialContent({ ...content });
        toast.success('Changes successfully published live to website.');
      } else {
        toast.error(res?.message || 'Failed to publish changes.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Publishing error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Count modified keys
  const modifiedCount = Object.keys(content).filter(
    (k) => content[k] !== initialContent[k]
  ).length;

  const currentKeyInfo = REGISTERED_CMS_KEYS.find((k) => k.key === selectedKey) || (
    selectedKey ? {
      key: selectedKey,
      label: selectedKey.split('.').pop()?.replace(/_/g, ' ') || selectedKey,
      section: 'Detected Element',
      defaultText: '',
      multiline: false,
    } : null
  );

  const filteredKeys = REGISTERED_CMS_KEYS.filter((k) => {
    const q = searchTerm.toLowerCase();
    return (
      k.label.toLowerCase().includes(q) ||
      k.key.toLowerCase().includes(q) ||
      k.section.toLowerCase().includes(q) ||
      (content[k.key] || k.defaultText).toLowerCase().includes(q)
    );
  });

  // Calculate actual pixel width of the preview canvas frame
  const getCanvasWidthPx = () => {
    if (devicePreset === 'mobile') return 390;
    if (devicePreset === 'tablet') return 768;
    if (devicePreset === 'custom') return customWidth;
    return 1280;
  };

  // Mouse drag handler for the Inspector Splitter (horizontal resizer)
  const handleInspectorMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingInspector(true);
  };

  // Mouse drag handler for the Canvas Frame edge (width resizer)
  const handleCanvasResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingCanvas(true);
    if (devicePreset !== 'custom') {
      setDevicePreset('custom');
      if (typeof getCanvasWidthPx() === 'number') {
        setCustomWidth(getCanvasWidthPx() as number);
      } else if (iframeRef.current) {
        setCustomWidth(iframeRef.current.clientWidth || 1000);
      }
    }
  };

  // Global mouse move and mouse up listeners for smooth resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingInspector && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        if (newWidth >= 280 && newWidth <= 760) {
          setInspectorWidth(newWidth);
        }
      }

      if (isDraggingCanvas && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newCanvasWidth = Math.max(320, Math.min(1600, (e.clientX - containerRect.left) * 1.05));
        setCustomWidth(Math.round(newCanvasWidth));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingInspector) setIsDraggingInspector(false);
      if (isDraggingCanvas) setIsDraggingCanvas(false);
    };

    if (isDraggingInspector || isDraggingCanvas) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDraggingInspector ? 'col-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingInspector, isDraggingCanvas]);

  // Current selected styles
  const activeFontSizeRaw = selectedKey ? (content[`${selectedKey}__fontSize`] || '') : '';
  const activeFontSizeNum = parseInt(activeFontSizeRaw, 10) || 16;
  const activeMaxWidthRaw = selectedKey ? (content[`${selectedKey}__maxWidth`] || '') : '';
  const activeMaxWidthNum = parseInt(activeMaxWidthRaw, 10) || 0;

  // Apple macOS Styling Tokens with Crisp High-Contrast Dark Mode
  const isIos = !isDark;

  const themeClasses = {
    root: isIos
      ? 'bg-white/70 text-slate-800 backdrop-blur-2xl border-slate-200/80 shadow-xl'
      : 'bg-[#0a0f1d]/75 text-white backdrop-blur-2xl border-white/[0.08] shadow-2xl',
    header: isIos
      ? 'bg-white/75 backdrop-blur-2xl border-b border-slate-200/80 text-slate-900 shadow-xs'
      : 'bg-[#0d1324]/80 backdrop-blur-2xl border-b border-white/[0.08] text-white shadow-md',
    canvasBg: isIos
      ? 'bg-slate-200/35 backdrop-blur-md'
      : 'bg-[#040814]/50 backdrop-blur-md',
    frameBorder: isIos
      ? 'border border-slate-300/80 shadow-xl'
      : 'border border-white/[0.12] shadow-2xl',
    inspector: isIos
      ? 'bg-white/80 backdrop-blur-2xl border-l border-slate-200/80 text-slate-900'
      : 'bg-[#0c1224]/85 backdrop-blur-2xl border-l border-white/[0.08] text-white',
    card: isIos
      ? 'bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-xs text-slate-900'
      : 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-md text-white',
    input: isIos
      ? 'bg-white/90 border border-slate-200/80 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs'
      : 'bg-white/[0.06] border border-white/15 text-white placeholder-neutral-400 focus:bg-white/[0.10] focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25',
    pillActive: isIos
      ? 'bg-white text-slate-900 shadow-sm border border-black/[0.04]'
      : 'bg-white/[0.15] text-white shadow-sm border border-white/20',
    pillInactive: isIos
      ? 'text-slate-500 hover:text-slate-900'
      : 'text-neutral-400 hover:text-white',
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col transition-all duration-200 rounded-none overflow-hidden border ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen rounded-none'
          : 'h-[calc(100vh-120px)] min-h-[560px] rounded-none'
      } ${themeClasses.root} ${themeClasses.frameBorder}`}
    >
      {/* Apple Titlebar & Toolbar */}
      <div className={`flex flex-nowrap items-center justify-between gap-2 px-3 py-1.5 ${themeClasses.header} select-none shrink-0 overflow-x-auto`}>
        {/* Left: macOS Traffic Light Dots & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (modifiedCount > 0 && !confirm('Discard unsaved CMS edits?')) return;
                setContent({ ...initialContent });
                toast.info('Reverted to initial published state.');
              }}
              title="Reset all drafts (macOS Close)"
              className="h-3.5 w-3.5 rounded-full bg-[#ff5f56] hover:brightness-90 transition-transform active:scale-90 border border-black/15 shadow-2xs flex items-center justify-center group"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/70">×</span>
            </button>
            <button
              onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
              title="Toggle Inspector Drawer (macOS Minimize)"
              className="h-3.5 w-3.5 rounded-full bg-[#ffbd2e] hover:brightness-90 transition-transform active:scale-90 border border-black/15 shadow-2xs flex items-center justify-center group"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/70">−</span>
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen Canvas (macOS Zoom)"
              className="h-3.5 w-3.5 rounded-full bg-[#27c93f] hover:brightness-90 transition-transform active:scale-90 border border-black/15 shadow-2xs flex items-center justify-center group"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold text-black/70">⤢</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white">Visual CMS</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Live Preview
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-zinc-300 flex items-center gap-1">
                Select element to auto-locate · Drag handles to resize
              </span>
            </div>
          </div>
        </div>

        {/* Center: Device Viewport Presets, Page Selector & Zoom */}
        <div className="flex items-center gap-2">
          {/* Apple Segmented Device Pill */}
          <div className="flex items-center p-1 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 backdrop-blur-md">
            <button
              onClick={() => setDevicePreset('desktop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                devicePreset === 'desktop' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevicePreset('tablet')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                devicePreset === 'tablet' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDevicePreset('mobile')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                devicePreset === 'mobile' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
            <button
              onClick={() => setDevicePreset('custom')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                devicePreset === 'custom' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
              title="Fluid drag canvas right edge"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span className="text-[11px] font-mono">{typeof getCanvasWidthPx() === 'number' ? `${getCanvasWidthPx()}px` : 'Fluid'}</span>
            </button>
          </div>

          {/* Zoom Controls Pill (Ctrl + / Ctrl - / Ctrl + Wheel) */}
          <div className="flex items-center p-0.5 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 backdrop-blur-md">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.4, +(prev - 0.1).toFixed(2)))}
              title="Zoom Out (Ctrl -)"
              className="p-1 rounded-md hover:bg-black/[0.06] dark:hover:bg-white/10 text-slate-600 dark:text-neutral-200 transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom to 100% (Ctrl 0)"
              className="px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-700 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(2.0, +(prev + 0.1).toFixed(2)))}
              title="Zoom In (Ctrl +)"
              className="p-1 rounded-md hover:bg-black/[0.06] dark:hover:bg-white/10 text-slate-600 dark:text-neutral-200 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Page Picker Capsule */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/10 backdrop-blur-md text-xs font-medium">
            <Globe className="h-3.5 w-3.5 text-slate-400 dark:text-neutral-300" />
            <select
              value={selectedPage}
              onChange={(e) => {
                setSelectedPage(e.target.value);
                setIframeKey(Date.now());
              }}
              className="bg-transparent border-0 text-xs font-semibold outline-none cursor-pointer pr-1 text-slate-700 dark:text-white"
            >
              <option value="/" className="text-slate-900 dark:bg-[#0d1324] dark:text-white">🏠 Homepage</option>
              <option value="/about" className="text-slate-900 dark:bg-[#0d1324] dark:text-white">📖 About Us</option>
              <option value="/contact" className="text-slate-900 dark:bg-[#0d1324] dark:text-white">📞 Contact</option>
              <option value="/terms" className="text-slate-900 dark:bg-[#0d1324] dark:text-white">⚖️ Terms</option>
            </select>
          </div>
        </div>

        {/* Right: Reload, Open External, Inspector Toggle, and Publish Live Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey(Date.now())}
            title="Reload live preview frame"
            className="p-2 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors text-slate-500 dark:text-neutral-200"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <a
            href={`${previewOrigin}${selectedPage}`}
            target="_blank"
            rel="noreferrer"
            title="Open storefront in new tab"
            className="p-2 rounded-lg bg-black/[0.05] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors text-slate-500 dark:text-neutral-200"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Inspector Panel Toggle Button */}
          <button
            onClick={() => setIsInspectorCollapsed((prev) => !prev)}
            title={isInspectorCollapsed ? "Open Inspector" : "Collapse Inspector"}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              !isInspectorCollapsed
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                : 'bg-black/[0.05] dark:bg-white/[0.06] text-slate-600 dark:text-neutral-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
            }`}
          >
            <PanelRight className="h-3.5 w-3.5" />
          </button>

          {/* Clean Publish Button */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
            {modifiedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-[10px] font-bold">
                {modifiedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workbench Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center / Left: Interactive Live Preview Canvas (Centered horizontally & vertically) */}
        <div
          ref={canvasWrapperRef}
          className={`flex-1 ${themeClasses.canvasBg} p-3 sm:p-5 flex overflow-auto relative select-none`}
          style={{ minWidth: 0 }}
        >
          {/* Responsive Preview Device Window Frame (Floating Display with Border & Shadow) */}
          <div
            className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-150 border-2 border-slate-300/80 dark:border-white/15 bg-white shadow-2xl shadow-slate-950/25 dark:shadow-black/70 m-auto shrink-0 select-none"
            style={{
              width: previewLayout.frameWidth,
              height: previewLayout.frameHeight,
              aspectRatio: previewLayout.aspectRatio,
              transition: isDraggingCanvas ? 'none' : 'width 0.15s ease-out, height 0.15s ease-out',
              isolation: 'isolate',
            }}
          >
            {/* Live Interactive Storefront Iframe Container (Full Page Scrollable) */}
            <div
              className="relative overflow-hidden bg-white"
              style={previewLayout.innerStyle}
            >
              <iframe
                ref={iframeRef}
                key={iframeKey}
                src={previewUrl}
                onLoad={handleIframeLoad}
                title="Live Storefront Preview"
                className="w-full h-full border-0 bg-white block"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            </div>

            {/* Canvas Right Edge Drag Handle for Custom Width Resizing */}
            {devicePreset === 'custom' && (
              <div
                onMouseDown={handleCanvasResizeMouseDown}
                title="Drag horizontally to resize preview width"
                className="absolute top-0 right-0 w-2.5 h-full cursor-ew-resize hover:bg-blue-500/40 active:bg-blue-600 transition-colors z-30 flex items-center justify-center group"
              >
                <div className="w-1 h-8 rounded-full bg-slate-400/60 dark:bg-white/30 group-hover:bg-blue-500 shadow" />
              </div>
            )}
          </div>
        </div>

        {/* Docked Inspector Expand Button when collapsed */}
        {isInspectorCollapsed && (
          <button
            onClick={() => setIsInspectorCollapsed(false)}
            title="Open Inspector"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-l-xl bg-white dark:bg-[#131b2e] border-l border-t border-b border-slate-200 dark:border-white/10 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-neutral-200 flex items-center justify-center group"
          >
            <PanelRight className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Draggable Splitter Handle between Preview and Inspector */}
        {!isInspectorCollapsed && (
          <div
            onMouseDown={handleInspectorMouseDown}
            title="Drag horizontally to adjust inspector drawer width"
            className={`w-2.5 hover:w-3 active:w-3 cursor-col-resize flex items-center justify-center transition-all z-20 select-none ${
              isDraggingInspector ? 'bg-blue-600 shadow-md' : 'hover:bg-blue-500/30 bg-transparent'
            }`}
          >
            <div className={`h-8 w-1 rounded-full transition-colors ${
              isDraggingInspector ? 'bg-white' : 'bg-slate-400/40 dark:bg-white/20'
            }`} />
          </div>
        )}

        {/* Right Side: Resizable Inspector Sidebar (Docked Clean Square Layout) */}
        {!isInspectorCollapsed && (
          <div
            style={{ width: `${inspectorWidth}px` }}
            className={`flex flex-col shrink-0 h-full overflow-hidden transition-[width] duration-75 rounded-none border-l ${themeClasses.inspector}`}
          >
            {/* Inspector Header */}
            <div className="px-4 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sliders className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Inspector & Editor
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedKey && (
                  <button
                    onClick={() => setSelectedKey(null)}
                    className="text-[10px] font-bold text-slate-400 dark:text-neutral-400 hover:text-blue-500 dark:hover:text-blue-400 underline"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsInspectorCollapsed(true)}
                  title="Collapse Inspector"
                  className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white"
                >
                  <PanelRightClose className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div ref={inspectorScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
              {/* Active Selected Element Editor */}
              {selectedKey ? (
                <div className={`rounded-xl p-4.5 border transition-all ${themeClasses.card} space-y-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {currentKeyInfo?.label || selectedKey}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-blue-400 block mt-0.5">
                        {selectedKey}
                      </span>
                    </div>

                    <button
                      onClick={handleResetCurrentKey}
                      title="Reset text & styles to default"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10"
                    >
                      <Undo2 className="h-3 w-3" />
                      <span>Default</span>
                    </button>
                  </div>

                  {/* Text Content Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-neutral-200 mb-1.5">
                      Content String (Live Preview)
                    </label>
                    {currentKeyInfo?.multiline ? (
                      <textarea
                        rows={4}
                        value={content[selectedKey] !== undefined ? content[selectedKey] : (currentKeyInfo?.defaultText || '')}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className={`w-full rounded-lg px-3.5 py-2.5 text-xs transition-all resize-y outline-none ${themeClasses.input}`}
                        placeholder="Enter text..."
                      />
                    ) : (
                      <input
                        type="text"
                        value={content[selectedKey] !== undefined ? content[selectedKey] : (currentKeyInfo?.defaultText || '')}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className={`w-full rounded-xl px-3.5 py-2 text-xs transition-all outline-none ${themeClasses.input}`}
                        placeholder="Enter text..."
                      />
                    )}
                  </div>

                  {/* Font Size & Precision Digital Roller Section */}
                  <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
                        <Type className="h-3.5 w-3.5 text-blue-500" />
                        <span>Font Size Adjuster</span>
                      </label>

                      {/* Font Size Direct Stepper Input */}
                      <div className="flex items-center gap-1 bg-black/[0.05] dark:bg-white/[0.06] rounded-lg p-0.5 border border-black/[0.05] dark:border-white/10">
                        <button
                          onClick={() => handleFontSizeChange(Math.max(12, activeFontSizeNum - 1))}
                          className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-white/[0.1] text-slate-600 dark:text-neutral-200 transition-colors"
                          title="Decrease 1px"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-mono font-bold px-1.5 min-w-[38px] text-center text-blue-600 dark:text-blue-400">
                          {activeFontSizeNum}px
                        </span>
                        <button
                          onClick={() => handleFontSizeChange(Math.min(80, activeFontSizeNum + 1))}
                          className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-white dark:hover:bg-white/[0.1] text-slate-600 dark:text-neutral-200 transition-colors"
                          title="Increase 1px"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Preset Font Size Chips */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: 'XS', size: 12 },
                        { label: 'SM', size: 14 },
                        { label: 'MD', size: 16 },
                        { label: 'LG', size: 20 },
                        { label: 'XL', size: 28 },
                        { label: '2XL', size: 36 },
                        { label: '3XL', size: 48 },
                        { label: 'Hero', size: 64 },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => handleFontSizeChange(chip.size)}
                          className={`px-2 py-0.8 rounded-md text-[10px] font-bold transition-all ${
                            activeFontSizeNum === chip.size
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-black/[0.04] dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300 hover:bg-blue-500/10 hover:text-blue-600 dark:border dark:border-white/10'
                          }`}
                        >
                          {chip.label} ({chip.size})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Text Field Size / Max-Width Section */}
                  <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-neutral-200 flex items-center gap-1.5">
                        <MoveHorizontal className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Field Width / Wrap Boundary</span>
                      </label>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {activeMaxWidthNum > 0 ? `${activeMaxWidthNum}px` : 'Auto (100%)'}
                      </span>
                    </div>

                    {/* Field Width Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-400">200</span>
                      <input
                        type="range"
                        min="200"
                        max="1200"
                        step="10"
                        value={activeMaxWidthNum > 0 ? activeMaxWidthNum : 1200}
                        onChange={(e) => handleMaxWidthChange(parseInt(e.target.value, 10))}
                        className="flex-1 accent-emerald-500 cursor-ew-resize h-1.5 bg-slate-200 dark:bg-white/[0.1] rounded-lg"
                      />
                      <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-400">1200</span>
                    </div>

                    {/* Quick Preset Width Chips */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: 'Auto (100%)', width: 'auto' as const },
                        { label: '360px', width: 360 },
                        { label: '520px', width: 520 },
                        { label: '720px', width: 720 },
                        { label: '960px', width: 960 },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleMaxWidthChange(item.width)}
                          className={`px-2 py-0.8 rounded-md text-[10px] font-bold transition-all ${
                            (item.width === 'auto' && activeMaxWidthNum === 0) ||
                            (typeof item.width === 'number' && activeMaxWidthNum === item.width)
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-black/[0.04] dark:bg-white/[0.05] text-slate-700 dark:text-neutral-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:border dark:border-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-neutral-300 flex items-center gap-1.5 pt-1 border-t border-black/[0.05] dark:border-white/[0.08]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Real-time instant preview with live drag & auto-scroll.</span>
                  </div>
                </div>
              ) : (
                <div className={`rounded-xl border-2 border-dashed p-6 text-center ${
                  isIos ? 'border-slate-300/80 bg-white/50' : 'border-white/10 bg-white/[0.02]'
                }`}>
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-2 shadow-inner">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">No element selected</p>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                    Click any element from the directory below to auto-highlight and scroll to it in the live preview.
                  </p>
                </div>
              )}

              {/* Editable Elements Directory */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-neutral-200 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> All Registered Elements
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-300 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10">
                    {filteredKeys.length} keys
                  </span>
                </div>

                {/* Filter / Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search elements by label, section, key..."
                    className={`w-full rounded-lg pl-9 pr-3.5 py-2 text-xs outline-none transition-all ${themeClasses.input}`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-neutral-400 dark:hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Elements List */}
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredKeys.map((item) => {
                    const isCurrent = selectedKey === item.key;
                    const currentVal = content[item.key] !== undefined ? content[item.key] : item.defaultText;
                    const isModified = content[item.key] !== undefined && content[item.key] !== initialContent[item.key];

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSelectKeyFromDirectory(item)}
                        className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-2.5 ${
                          isCurrent
                            ? 'bg-blue-500/15 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                            : isDark
                            ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'
                            : 'bg-white border-slate-200/80 hover:border-blue-400/60 shadow-2xs'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate text-slate-900 dark:text-white">
                              {item.label}
                            </span>
                            {isModified && (
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-400 block truncate font-mono">
                            {item.section} · {item.key}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-300 line-clamp-1 mt-0.5">
                            "{currentVal}"
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-400 shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualCmsEditor;
