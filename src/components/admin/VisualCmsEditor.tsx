import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRight,
  Sun,
  Moon,
  Terminal,
  Globe,
  SlidersHorizontal
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
}

const REGISTERED_CMS_KEYS: EditableKeyInfo[] = [
  // Header
  { key: 'header.top_strip', label: 'Announcement Bar', section: 'Header & Navigation', defaultText: 'Delivering across India — 27,000+ pincodes' },
  { key: 'header.sub_tagline', label: 'Store Tagline', section: 'Header & Navigation', defaultText: 'India ka apna bookstore' },
  
  // Homepage Hero
  { key: 'home.hero_badge', label: 'Hero Sale Badge', section: 'Homepage Hero', defaultText: 'Grand Book Sale — Up to 60% off 10,000+ titles' },
  { key: 'home.hero_title_1', label: 'Hero Headline Line 1', section: 'Homepage Hero', defaultText: 'Every book India reads,' },
  { key: 'home.hero_title_2', label: 'Hero Headline Line 2', section: 'Homepage Hero', defaultText: 'one search away.' },
  { key: 'home.hero_desc', label: 'Hero Subtitle Description', section: 'Homepage Hero', defaultText: 'From academic textbooks to bestselling fiction, get genuine books delivered straight to your doorstep with guaranteed lowest prices.', multiline: true },

  // Homepage Offers
  { key: 'home.offer_1_title', label: 'Offer 1 Title', section: 'Homepage Highlights', defaultText: 'STUDENT15 — 15% off' },
  { key: 'home.offer_1_desc', label: 'Offer 1 Subtitle', section: 'Homepage Highlights', defaultText: 'For students on exam & academic books' },
  { key: 'home.offer_2_title', label: 'Offer 2 Title', section: 'Homepage Highlights', defaultText: 'Free Delivery', multiline: false },
  { key: 'home.offer_2_desc', label: 'Offer 2 Subtitle', section: 'Homepage Highlights', defaultText: 'On all orders above ₹999 across India' },
  { key: 'home.offer_3_title', label: 'Offer 3 Title', section: 'Homepage Highlights', defaultText: 'Techno Rewards' },
  { key: 'home.offer_3_desc', label: 'Offer 3 Subtitle', section: 'Homepage Highlights', defaultText: 'Earn 1 Techno Coin per ₹100 spent (excl. delivery)' },
  { key: 'home.exam_zone_title', label: 'Exam Zone Heading', section: 'Homepage Highlights', defaultText: 'NEET · JEE · UPSC · GATE · SSC — all prep books in one place' },
  { key: 'home.exam_zone_desc', label: 'Exam Zone Subtitle', section: 'Homepage Highlights', defaultText: "Previous year papers, toppers' booklists and combo packs at the best prices." },

  // About Page
  { key: 'about.title', label: 'About Page Title', section: 'About Us Page', defaultText: 'About Techno World Books' },
  { key: 'about.subtitle', label: 'About Page Subtitle', section: 'About Us Page', defaultText: 'Your Trusted Bookstore for Every Reader' },
  { key: 'about.quote', label: 'Inspiring Heritage Quote', section: 'About Us Page', defaultText: '"Connecting generations of readers with the rich literary and academic heritage of College Street."', multiline: true },
  { key: 'about.procurement_title', label: 'Procurement Heading', section: 'About Us Page', defaultText: "Can't Find a Book? Request It Here" },
  { key: 'about.procurement_desc', label: 'Procurement Subtitle', section: 'About Us Page', defaultText: "Don't worry if the book you're looking for isn't currently displayed on our website. With our deep connections across College Street, national publishers, and academic distributors, our team can source rare, out-of-print, and foreign editions for you.", multiline: true },

  // Contact & Footer
  { key: 'contact.title', label: 'Contact Title', section: 'Contact & Storefront', defaultText: 'Contact Techno World Books' },
  { key: 'contact.subtitle', label: 'Contact Subtitle', section: 'Contact & Storefront', defaultText: 'Visit our historic College Street bookshop or contact our digital customer service team' },
  { key: 'footer.address', label: 'Store Physical Address', section: 'Contact & Storefront', defaultText: '90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, West Bengal 700007', multiline: true },
  { key: 'footer.phone', label: 'Landline Phone Number', section: 'Contact & Storefront', defaultText: '033 2219 6115' },
];

export const VisualCmsEditor: React.FC<VisualCmsEditorProps> = () => {
  // Theme state: iOS 27 glassmorphism light (default), macOS dark, or terminal retro
  const [themeMode, setThemeMode] = useState<'ios-light' | 'macos-dark' | 'terminal'>('ios-light');

  // Viewport Device Presets
  const [devicePreset, setDevicePreset] = useState<'desktop' | 'tablet' | 'mobile' | 'custom'>('desktop');
  const [customWidth, setCustomWidth] = useState<number>(1120);

  // Inspector Panel Sizing (Resizable splitter)
  const [inspectorWidth, setInspectorWidth] = useState<number>(380);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);
  const [isDraggingInspector, setIsDraggingInspector] = useState<boolean>(false);

  // Canvas Resizing Handle (Drag canvas edge)
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);

  // Fullscreen expansion
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  // Listen to postMessage from the iframe when user clicks an element in preview
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'TW_CMS_ELEMENT_CLICKED' && data.key) {
        setSelectedKey(data.key);
        if (isInspectorCollapsed) {
          setIsInspectorCollapsed(false);
        }
        if (content[data.key] === undefined) {
          setContent((prev) => ({
            ...prev,
            [data.key]: data.value || data.defaultText || '',
          }));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [content, isInspectorCollapsed]);

  // Determine storefront preview base URL
  const previewOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const previewUrl = `${previewOrigin}${selectedPage}${selectedPage.includes('?') ? '&' : '?'}cms_edit=true&_preview=${iframeKey}`;

  // Broadcast current drafts to iframe on load
  const handleIframeLoad = () => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      {
        type: 'TW_CMS_FORCE_EDIT_MODE',
        enabled: true,
      },
      '*'
    );

    // Sync all existing draft keys into preview
    Object.entries(content).forEach(([k, v]) => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'TW_CMS_PREVIEW_UPDATE',
          key: k,
          value: v,
        },
        '*'
      );
    });

    if (selectedKey) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'TW_CMS_SELECT_KEY',
          key: selectedKey,
        },
        '*'
      );
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

  // Reset a field to default
  const handleResetCurrentKey = () => {
    if (!selectedKey) return;
    const registered = REGISTERED_CMS_KEYS.find((k) => k.key === selectedKey);
    const def = registered ? registered.defaultText : '';

    handleValueChange(def);
    toast.info(`Reset "${selectedKey}" to default value.`);
  };

  // Publish to Database
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res: any = await cmsService.publishUiContent(content);

      if (res?.success) {
        setInitialContent({ ...content });
        toast.success('🎉 Changes successfully published live to website!');
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
    if (devicePreset === 'mobile') return 390; // iPhone 16 Pro
    if (devicePreset === 'tablet') return 820; // iPad Air
    if (devicePreset === 'custom') return customWidth;
    return '100%';
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
        if (newWidth >= 260 && newWidth <= 720) {
          setInspectorWidth(newWidth);
        }
      }

      if (isDraggingCanvas && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        // Calculate width relative to canvas container center or left
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

  // Styling theme classes according to themeMode
  const isDark = themeMode === 'macos-dark';
  const isIos = themeMode === 'ios-light';

  const themeClasses = {
    root: isIos
      ? 'bg-[#F2F4F8] text-slate-800'
      : isDark
      ? 'bg-[#18181b] text-zinc-100'
      : 'bg-[#0a0f0d] text-emerald-300 font-mono',
    header: isIos
      ? 'bg-white/80 backdrop-blur-2xl border-b border-black/[0.08] shadow-xs'
      : isDark
      ? 'bg-[#222227]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-md'
      : 'bg-[#060c08] border-b border-emerald-500/30 text-emerald-400 font-mono shadow-md',
    canvasBg: isIos
      ? 'bg-[#E5E9F0]'
      : isDark
      ? 'bg-[#0f0f12]'
      : 'bg-[#020503]',
    frameBorder: isIos
      ? 'border border-black/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)]'
      : isDark
      ? 'border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]'
      : 'border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    inspector: isIos
      ? 'bg-white/90 backdrop-blur-xl border-l border-black/[0.08]'
      : isDark
      ? 'bg-[#1c1c20]/95 backdrop-blur-xl border-l border-white/[0.08]'
      : 'bg-[#08120b] border-l border-emerald-500/30 font-mono',
    card: isIos
      ? 'bg-white border border-slate-200/80 shadow-xs'
      : isDark
      ? 'bg-[#27272d] border border-white/[0.08] shadow-sm'
      : 'bg-[#0d1f13] border border-emerald-500/30 text-emerald-300',
    input: isIos
      ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
      : isDark
      ? 'bg-[#1e1e24] border border-white/10 text-white focus:bg-[#25252c] focus:border-blue-400 focus:ring-4 focus:ring-blue-400/15'
      : 'bg-black border border-emerald-500 text-emerald-300 focus:ring-2 focus:ring-emerald-400/30 font-mono',
    pillActive: isIos
      ? 'bg-white text-slate-900 shadow-sm border border-black/[0.04]'
      : isDark
      ? 'bg-zinc-700 text-white shadow-sm'
      : 'bg-emerald-500 text-black font-bold',
    pillInactive: isIos
      ? 'text-slate-500 hover:text-slate-900'
      : isDark
      ? 'text-zinc-400 hover:text-white'
      : 'text-emerald-600 hover:text-emerald-400 font-mono',
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col transition-all duration-200 rounded-3xl overflow-hidden border shadow-2xl ${
        isFullscreen
          ? 'fixed inset-3 z-50 h-[calc(100vh-24px)] rounded-3xl'
          : 'h-[calc(100vh-80px)] min-h-[660px]'
      } ${themeClasses.root} ${themeClasses.frameBorder}`}
    >
      {/* Apple macOS Ventura / iOS 27 Titlebar & Toolbar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 ${themeClasses.header} select-none shrink-0`}>
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
              title="Collapse / Expand Inspector (macOS Minimize)"
              className="h-3.5 w-3.5 rounded-full bg-[#ffbd2e] hover:brightness-90 transition-transform active:scale-90 border border-black/15 shadow-2xs flex items-center justify-center group"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-black/70">–</span>
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen (macOS Zoom)"
              className="h-3.5 w-3.5 rounded-full bg-[#27c93f] hover:brightness-90 transition-transform active:scale-90 border border-black/15 shadow-2xs flex items-center justify-center group"
            >
              <span className="opacity-0 group-hover:opacity-100 text-[7px] font-bold text-black/70">+</span>
            </button>
          </div>

          <div className="h-5 w-px bg-black/10 dark:bg-white/10 hidden sm:block" />

          {/* Title & Cupertino Dynamic Pill */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-tight">Visual Live Studio</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Device Selector, Page Chooser, and Canvas Size Display */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Page Picker */}
          <div className={`flex items-center gap-1.5 rounded-2xl px-2.5 py-1 text-xs font-semibold ${
            isIos ? 'bg-black/[0.05] border border-black/[0.06]' : 'bg-white/[0.06] border border-white/[0.08]'
          }`}>
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            <select
              value={selectedPage}
              onChange={(e) => {
                setSelectedPage(e.target.value);
                setIframeKey(Date.now());
              }}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer py-0.5"
            >
              <option value="/" className="bg-slate-900 text-white">Homepage (/)</option>
              <option value="/about" className="bg-slate-900 text-white">About Us (/about)</option>
              <option value="/contact" className="bg-slate-900 text-white">Contact (/contact)</option>
              <option value="/terms" className="bg-slate-900 text-white">Terms & Policy (/terms)</option>
            </select>
          </div>

          {/* Apple Segmented Viewport Switcher */}
          <div className={`flex items-center rounded-2xl p-1 text-xs font-semibold ${
            isIos ? 'bg-black/[0.05] border border-black/[0.06]' : 'bg-white/[0.06] border border-white/[0.08]'
          }`}>
            <button
              onClick={() => setDevicePreset('desktop')}
              title="Mac Desktop (100% Fluid)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                devicePreset === 'desktop' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevicePreset('tablet')}
              title="iPad Air / Tablet (820px)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                devicePreset === 'tablet' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDevicePreset('mobile')}
              title="iPhone 16 Pro (390px)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                devicePreset === 'mobile' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
            <button
              onClick={() => setDevicePreset('custom')}
              title="Resizable Canvas (Drag edges to resize)"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                devicePreset === 'custom' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Custom</span>
            </button>
          </div>

          {/* Current Canvas Dimensions Badge */}
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-black/[0.04] dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400">
            <span>{typeof getCanvasWidthPx() === 'number' ? `${getCanvasWidthPx()}px` : 'Fluid'}</span>
            <span>× Auto</span>
          </div>

          {/* Refresh Frame */}
          <button
            onClick={() => setIframeKey(Date.now())}
            title="Reload Preview Frame"
            className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Right: Theme Switcher & Publish Action */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher Segment */}
          <div className={`flex items-center rounded-xl p-0.5 text-xs ${
            isIos ? 'bg-black/[0.05]' : 'bg-white/[0.06]'
          }`}>
            <button
              onClick={() => setThemeMode('ios-light')}
              title="Apple iOS / macOS Light Glassmorphism"
              className={`p-1.5 rounded-lg transition-all ${themeMode === 'ios-light' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-800'}`}
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('macos-dark')}
              title="macOS Dark Titanium"
              className={`p-1.5 rounded-lg transition-all ${themeMode === 'macos-dark' ? 'bg-zinc-700 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setThemeMode('terminal')}
              title="Terminal Hacker Mode"
              className={`p-1.5 rounded-lg transition-all ${themeMode === 'terminal' ? 'bg-emerald-500 text-black shadow-xs font-bold' : 'text-slate-400 hover:text-emerald-400'}`}
            >
              <Terminal className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Toggle Inspector Drawer */}
          <button
            onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
            title={isInspectorCollapsed ? 'Open Inspector' : 'Hide Inspector'}
            className={`p-1.5 rounded-xl transition-colors ${
              isInspectorCollapsed
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
            }`}
          >
            {isInspectorCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-xl hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          {/* Unsaved Changes Counter */}
          {modifiedCount > 0 && (
            <span className="hidden sm:inline-block text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl">
              {modifiedCount} draft {modifiedCount === 1 ? 'edit' : 'edits'}
            </span>
          )}

          {/* Cupertino Primary Action: Publish Live */}
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:opacity-95 active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPublishing ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>🚀 Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Resizable Body: Preview Canvas + Draggable Splitter + Inspector Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center / Left: Interactive Live Preview Canvas */}
        <div className={`flex-1 ${themeClasses.canvasBg} p-4 sm:p-6 flex flex-col items-center justify-start overflow-auto relative select-none`}>
          {/* Instruction banner in iOS pill style */}
          <div className="mb-3 px-4 py-1.5 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 text-[11px] font-medium text-slate-600 dark:text-zinc-300 shadow-2xs flex items-center gap-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Hover over any dashed outline in the live view and click to edit, or resize by dragging handles.</span>
          </div>

          {/* Responsive Preview Device Window Frame (Resizable) */}
          <div
            className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-150 ${themeClasses.frameBorder} bg-white relative`}
            style={{
              width: getCanvasWidthPx(),
              maxWidth: '100%',
              height: 'calc(100% - 40px)',
              minHeight: '480px',
            }}
          >
            {/* Safari / macOS Mock Address Bar */}
            <div className="bg-slate-100/90 dark:bg-zinc-800/90 border-b border-slate-200/80 dark:border-zinc-700/80 px-3.5 py-2 flex items-center justify-between shrink-0 select-none backdrop-blur-md">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              {/* Safari Capsule Search Bar */}
              <div className="bg-white dark:bg-zinc-900 px-4 py-1 rounded-xl border border-slate-200 dark:border-zinc-700 text-[11px] font-mono text-slate-600 dark:text-zinc-300 truncate max-w-sm flex items-center gap-1.5 shadow-2xs">
                <span className="text-slate-400">🔒</span>
                <span>technoworldbooks.in{selectedPage}</span>
                <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-1 rounded">
                  ?cms_edit=true
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`${previewOrigin}${selectedPage}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open storefront in new tab"
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Live Interactive Storefront Iframe */}
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={previewUrl}
              onLoad={handleIframeLoad}
              title="Live Storefront Preview"
              className="w-full flex-1 border-0 bg-white"
            />

            {/* Canvas Right Edge Drag Handle for Custom Width Resizing */}
            <div
              onMouseDown={handleCanvasResizeMouseDown}
              title="Drag horizontally to resize preview width"
              className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-blue-500/40 active:bg-blue-600 transition-colors z-30 flex items-center justify-center group"
            >
              <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-zinc-600 group-hover:bg-blue-500" />
            </div>
          </div>
        </div>

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
              isDraggingInspector ? 'bg-white' : 'bg-slate-400/40 dark:bg-zinc-600'
            }`} />
          </div>
        )}

        {/* Right Side: Apple macOS / iOS 27 Inspector Drawer (Resizable Width) */}
        {!isInspectorCollapsed && (
          <div
            style={{ width: `${inspectorWidth}px` }}
            className={`flex flex-col shrink-0 h-full overflow-hidden transition-[width] duration-75 ${themeClasses.inspector}`}
          >
            {/* Inspector Header */}
            <div className="px-4 py-3.5 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Sliders className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Inspector & Editor
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {selectedKey && (
                  <button
                    onClick={() => setSelectedKey(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-blue-500 underline"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsInspectorCollapsed(true)}
                  title="Collapse Inspector"
                  className="p-1 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05] text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <PanelRightClose className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
              {/* Active Selected Element Editor */}
              {selectedKey ? (
                <div className={`rounded-2xl p-4 border transition-all ${
                  isIos
                    ? 'bg-blue-50/50 border-blue-200/80 shadow-xs'
                    : isDark
                    ? 'bg-[#24242b] border-blue-500/30 shadow-md'
                    : 'bg-[#0f2416] border-emerald-500/50'
                } space-y-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-black">
                          {currentKeyInfo?.label || selectedKey}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 block mt-0.5">
                        {selectedKey}
                      </span>
                    </div>

                    <button
                      onClick={handleResetCurrentKey}
                      title="Reset to default text"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors bg-black/[0.04] dark:bg-white/[0.06] px-2 py-1 rounded-lg"
                    >
                      <Undo2 className="h-3 w-3" />
                      <span>Default</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      Content String (Live Preview)
                    </label>
                    {currentKeyInfo?.multiline ? (
                      <textarea
                        rows={4}
                        value={content[selectedKey] !== undefined ? content[selectedKey] : (currentKeyInfo?.defaultText || '')}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs transition-all resize-y outline-none ${themeClasses.input}`}
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

                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 pt-1 border-t border-black/[0.05] dark:border-white/[0.05]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Real-time instant preview without reloading.</span>
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl border-2 border-dashed p-5 text-center ${
                  isIos ? 'border-slate-300 bg-white/50' : 'border-zinc-700 bg-zinc-900/40'
                }`}>
                  <div className="h-9 w-9 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center mb-2">
                    <Edit3 className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold">No element selected</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Click any highlighted dashed text in the preview to edit it, or select from the directory below.
                  </p>
                </div>
              )}

              {/* Editable Elements Directory */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> All Registered Elements
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md">
                    {filteredKeys.length} keys
                  </span>
                </div>

                {/* Filter / Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search elements by label, section, key..."
                    className={`w-full rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none transition-all ${themeClasses.input}`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
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
                        onClick={() => {
                          setSelectedKey(item.key);
                          iframeRef.current?.contentWindow?.postMessage(
                            {
                              type: 'TW_CMS_SELECT_KEY',
                              key: item.key,
                            },
                            '*'
                          );
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-2.5 ${
                          isCurrent
                            ? 'bg-blue-500/10 border-blue-500 shadow-xs'
                            : `${themeClasses.card} hover:border-blue-400/60`
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate">
                              {item.label}
                            </span>
                            {isModified && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" title="Modified" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 block truncate font-mono mt-0.5">
                            {item.section} · {item.key}
                          </span>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 line-clamp-1 italic">
                            "{currentVal}"
                          </p>
                        </div>

                        <ChevronRight className={`h-4 w-4 shrink-0 mt-1 ${isCurrent ? 'text-blue-500' : 'text-slate-400'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Drawer Publish Bar */}
            <div className="p-3.5 border-t border-black/[0.08] dark:border-white/[0.08] shrink-0 bg-white/50 dark:bg-black/20 backdrop-blur-md">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 active:scale-95 text-white text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Publishing Live...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Publish All Changes Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualCmsEditor;
