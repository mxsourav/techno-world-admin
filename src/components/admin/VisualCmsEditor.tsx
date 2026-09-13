import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
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
  PanelRightClose,
  PanelRight,
  Globe
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

  // Device Preset: strictly Phone or Tablet
  const [devicePreset, setDevicePreset] = useState<'phone' | 'tablet'>('phone');

  // Inspector Collapse State
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState<boolean>(false);

  // Content & Navigation State
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [selectedKey, setSelectedKey] = useState<string | null>('home.hero_title_1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [content, setContent] = useState<Record<string, string>>({});
  const [initialContent, setInitialContent] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inspectorScrollRef = useRef<HTMLDivElement>(null);

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

  // Listen to postMessage from the iframe when user clicks an element
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'TW_CMS_IFRAME_READY') {
        handleIframeLoad();
      } else if (data.type === 'TW_CMS_ELEMENT_CLICKED' && data.key) {
        setSelectedKey(data.key);
        setIsInspectorCollapsed(false);
        if (inspectorScrollRef.current) {
          inspectorScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setContent((prev) => {
          const next = { ...prev };
          if (next[data.key] === undefined) {
            next[data.key] = data.value || data.defaultText || '';
          }
          return next;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Track latest selected key in a ref for iframe load handshakes
  const selectedKeyRef = useRef(selectedKey);
  useEffect(() => {
    selectedKeyRef.current = selectedKey;
  }, [selectedKey]);

  // Determine storefront preview base URL
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0'
  );
  const previewOrigin = isLocalHost
    ? `${window.location.protocol}//${window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost'}:3000`
    : 'https://technoworldbooks.in';
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

    // Sync draft values
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
      setTimeout(sendKey, 200);
    }
  };

  // Selection from list: auto-switches page if necessary and scrolls to key
  const handleSelectKeyFromList = (item: EditableKeyInfo) => {
    setSelectedKey(item.key);
    selectedKeyRef.current = item.key;
    if (inspectorScrollRef.current) {
      inspectorScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (item.page && selectedPage !== item.page) {
      setSelectedPage(item.page);
      setIframeKey(Date.now());
    } else {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'TW_CMS_SELECT_KEY',
          key: item.key,
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

  // Reset selected key to default
  const handleResetCurrentKey = () => {
    if (!selectedKey) return;
    const defaultInfo = REGISTERED_CMS_KEYS.find((k) => k.key === selectedKey);
    const fallbackText = defaultInfo?.defaultText || '';

    setContent((prev) => ({
      ...prev,
      [selectedKey]: fallbackText,
    }));

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'TW_CMS_PREVIEW_UPDATE',
        key: selectedKey,
        value: fallbackText,
      },
      '*'
    );
    toast.success(`Reset "${defaultInfo?.label || selectedKey}" to default`);
  };

  // Publish changes to live storefront
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const res: any = await cmsService.publishUiContent(content);
      if (res?.success) {
        setInitialContent({ ...content });
        toast.success('Published! Live website content updated successfully.');
        setIframeKey(Date.now());
      } else {
        toast.error(res?.message || 'Failed to publish changes');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to publish live');
    } finally {
      setIsPublishing(false);
    }
  };

  // Count modified keys
  const modifiedCount = useMemo(() => {
    return Object.keys(content).filter(
      (k) => content[k] !== undefined && content[k] !== initialContent[k]
    ).length;
  }, [content, initialContent]);

  // Filtered keys
  const filteredKeys = useMemo(() => {
    if (!searchTerm.trim()) return REGISTERED_CMS_KEYS;
    const q = searchTerm.toLowerCase();
    return REGISTERED_CMS_KEYS.filter(
      (k) =>
        k.label.toLowerCase().includes(q) ||
        k.section.toLowerCase().includes(q) ||
        k.key.toLowerCase().includes(q) ||
        (content[k.key] || k.defaultText).toLowerCase().includes(q)
    );
  }, [searchTerm, content]);

  const currentKeyInfo = REGISTERED_CMS_KEYS.find((k) => k.key === selectedKey);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[560px] bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Single Clean Top Bar (No duplicate titlebars or faux browser headers) */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 select-none">
        {/* Left: Brand Badge & Page Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Visual CMS</span>
              <span className="ml-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Live
              </span>
            </div>
          </div>

          {/* Page Picker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedPage}
              onChange={(e) => {
                setSelectedPage(e.target.value);
                setIframeKey(Date.now());
              }}
              className="bg-transparent border-0 text-xs font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-200"
            >
              <option value="/" className="text-slate-900 dark:bg-slate-900 dark:text-white">Homepage</option>
              <option value="/about" className="text-slate-900 dark:bg-slate-900 dark:text-white">About Us</option>
              <option value="/contact" className="text-slate-900 dark:bg-slate-900 dark:text-white">Contact</option>
              <option value="/terms" className="text-slate-900 dark:bg-slate-900 dark:text-white">Terms</option>
            </select>
          </div>
        </div>

        {/* Center: Device Presets (Strictly Phone and Tablet only) */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setDevicePreset('phone')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              devicePreset === 'phone'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Phone</span>
          </button>
          <button
            onClick={() => setDevicePreset('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              devicePreset === 'tablet'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Tablet className="h-3.5 w-3.5" />
            <span>Tablet</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIframeKey(Date.now())}
            title="Reload live preview"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          >
            <RotateCw className="h-4 w-4" />
          </button>
          <a
            href={`${previewOrigin}${selectedPage}`}
            target="_blank"
            rel="noreferrer"
            title="Open live site in new tab"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
            title={isInspectorCollapsed ? "Show Editor" : "Hide Editor"}
            className={`p-1.5 rounded-lg transition-colors ${
              !isInspectorCollapsed
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <PanelRight className="h-4 w-4" />
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            {modifiedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px] font-extrabold">
                {modifiedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Area: Device Viewport Canvas + Minimal Editor Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Center Canvas */}
        <div className="flex-1 bg-slate-200/50 dark:bg-slate-900/50 p-3 sm:p-4 flex overflow-auto relative items-center justify-center">
          {/* Device Frame (Clean, without duplicate browser bar or fake notch) */}
          <div
            className="relative flex flex-col rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white shadow-xl m-auto transition-all"
            style={{
              width: devicePreset === 'phone' ? '390px' : '768px',
              maxWidth: '100%',
              height: '100%',
              maxHeight: devicePreset === 'phone' ? '800px' : undefined,
              aspectRatio: devicePreset === 'phone' ? '9 / 16' : undefined,
            }}
          >
            {/* Live Storefront Iframe */}
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={previewUrl}
              onLoad={handleIframeLoad}
              title="Storefront Preview"
              className="w-full h-full border-0 bg-white block"
            />
          </div>
        </div>

        {/* Minimal Inspector & Editor Sidebar */}
        {!isInspectorCollapsed && (
          <div className="w-80 sm:w-88 flex flex-col shrink-0 h-full overflow-hidden bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
            {/* Sidebar Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Editor
                </h3>
              </div>
              <button
                onClick={() => setIsInspectorCollapsed(true)}
                title="Collapse Editor"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div ref={inspectorScrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
              {/* Active Selected Element Editor */}
              {selectedKey ? (
                <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {currentKeyInfo?.label || selectedKey}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                        {currentKeyInfo?.section || 'Page Text'}
                      </span>
                    </div>

                    <button
                      onClick={handleResetCurrentKey}
                      title="Reset text to default"
                      className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600"
                    >
                      <Undo2 className="h-2.5 w-2.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  <div>
                    {currentKeyInfo?.multiline ? (
                      <textarea
                        rows={3}
                        value={content[selectedKey] !== undefined ? content[selectedKey] : (currentKeyInfo?.defaultText || '')}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className="w-full rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
                        placeholder="Enter text..."
                      />
                    ) : (
                      <input
                        type="text"
                        value={content[selectedKey] !== undefined ? content[selectedKey] : (currentKeyInfo?.defaultText || '')}
                        onChange={(e) => handleValueChange(e.target.value)}
                        className="w-full rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        placeholder="Enter text..."
                      />
                    )}
                  </div>

                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-200 dark:border-slate-700">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Updates live in preview as you type</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center">
                  <Edit3 className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click any text to edit</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Click an element on the screen or choose from the list below.
                  </p>
                </div>
              )}

              {/* Simple Searchable Elements Directory */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="h-3 w-3" /> Page Texts
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {filteredKeys.length} items
                  </span>
                </div>

                {/* Filter Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Filter texts..."
                    className="w-full rounded-md pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Elements List */}
                <div className="space-y-1 max-h-[340px] overflow-y-auto pr-0.5">
                  {filteredKeys.map((item) => {
                    const isCurrent = selectedKey === item.key;
                    const currentVal = content[item.key] !== undefined ? content[item.key] : item.defaultText;
                    const isModified = content[item.key] !== undefined && content[item.key] !== initialContent[item.key];

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSelectKeyFromList(item)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                          isCurrent
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100 shadow-xs'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                              {item.label}
                            </span>
                            {isModified && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate font-mono">
                            {item.section}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            "{currentVal}"
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Quick Publish Bar */}
            {modifiedCount > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Publish {modifiedCount} Unsaved {modifiedCount === 1 ? 'Change' : 'Changes'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualCmsEditor;
