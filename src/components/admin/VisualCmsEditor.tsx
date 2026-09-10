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
  Sliders
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
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [selectedKey, setSelectedKey] = useState<string | null>('home.hero_title_1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [content, setContent] = useState<Record<string, string>>({});
  const [initialContent, setInitialContent] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        // If content doesn't have it yet, seed with initial or default
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
  }, [content]);

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

  const getContainerWidth = () => {
    if (device === 'mobile') return '385px';
    if (device === 'tablet') return '768px';
    return '100%';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[640px] bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Top Header & Device Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wide">Live Visual Website CMS</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Preview Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hover over and click any dashed element inside the preview to edit its text instantly.
            </p>
          </div>
        </div>

        {/* Center: Device & Page Controls */}
        <div className="flex items-center gap-3">
          {/* Page Picker */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <span className="text-[11px] font-bold text-slate-400">Page:</span>
            <select
              value={selectedPage}
              onChange={(e) => {
                setSelectedPage(e.target.value);
                setIframeKey(Date.now());
              }}
              className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer py-1"
            >
              <option value="/" className="bg-slate-900 text-white">Homepage (/)</option>
              <option value="/about" className="bg-slate-900 text-white">About Us (/about)</option>
              <option value="/contact" className="bg-slate-900 text-white">Contact (/contact)</option>
              <option value="/terms" className="bg-slate-900 text-white">Terms (/terms)</option>
            </select>
          </div>

          {/* Viewport Device Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              title="Desktop View (100%)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                device === 'desktop'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              title="Tablet View (768px)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                device === 'tablet'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              title="Mobile View (375px)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                device === 'mobile'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            onClick={() => setIframeKey(Date.now())}
            title="Reload Preview Frame"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Publish Action Button */}
        <div className="flex items-center gap-2">
          {modifiedCount > 0 && (
            <span className="text-xs font-extrabold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-lg">
              {modifiedCount} unsaved {modifiedCount === 1 ? 'change' : 'changes'}
            </span>
          )}

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPublishing ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>🚀 Publish Live to Website</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Preview Iframe + Inspector Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Area: Live Iframe Canvas */}
        <div className="flex-1 bg-slate-950/60 p-4 flex flex-col items-center justify-start overflow-auto relative">
          {/* Bezel / Device Frame Wrapper */}
          <div
            className="h-full max-h-full flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-slate-700/60 bg-white"
            style={{
              width: getContainerWidth(),
              maxWidth: '100%',
            }}
          >
            {/* Mock browser header */}
            <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="bg-white px-3 py-0.5 rounded-md border border-slate-200 text-[11px] font-mono text-slate-500 truncate max-w-xs flex items-center gap-1">
                <span>technoworldbooks.in{selectedPage}</span>
                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">?cms_edit=true</span>
              </div>
              <a
                href={`${previewOrigin}${selectedPage}`}
                target="_blank"
                rel="noreferrer"
                title="Open in new tab"
                className="text-slate-400 hover:text-slate-600"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Interactive Preview Iframe */}
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={previewUrl}
              onLoad={handleIframeLoad}
              title="Live Storefront Preview"
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>

        {/* Right Side: Visual Inspector & Text Directory */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 h-auto lg:h-full overflow-hidden">
          {/* Inspector Header */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Inspector & Editor
              </h3>
            </div>
            {selectedKey && (
              <button
                onClick={() => setSelectedKey(null)}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Active Selected Element Editor */}
            {selectedKey ? (
              <div className="rounded-xl bg-slate-950 p-4 border border-emerald-500/40 shadow-lg space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        {currentKeyInfo?.label || selectedKey}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {selectedKey}
                    </span>
                  </div>

                  <button
                    onClick={handleResetCurrentKey}
                    title="Reset to default text"
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors bg-slate-800/80 px-2 py-1 rounded-md"
                  >
                    <Undo2 className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Display Content (Live Preview)
                  </label>
                  {currentKeyInfo?.multiline ? (
                    <textarea
                      rows={4}
                      value={content[selectedKey] !== undefined ? content[selectedKey] : (currentKeyInfo?.defaultText || '')}
                      onChange={(e) => handleValueChange(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 resize-y"
                      placeholder="Type text here..."
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[selectedKey] !== undefined ? content[selectedKey] : (currentKeyInfo?.defaultText || '')}
                      onChange={(e) => handleValueChange(e.target.value)}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
                      placeholder="Type text here..."
                    />
                  )}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Updates immediately in the preview as you type.</span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700 p-4 text-center bg-slate-950/40">
                <Edit3 className="h-6 w-6 text-slate-500 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-300">No element selected</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click any dashed item in the preview or pick a key from the catalog below.
                </p>
              </div>
            )}

            {/* Editable Elements Directory */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-slate-400" /> All Editable Texts
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {filteredKeys.length} items
                </span>
              </div>

              {/* Filter / Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter texts or sections..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
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
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                        isCurrent
                          ? 'bg-emerald-950/60 border-emerald-500/80 shadow-sm'
                          : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {item.label}
                          </span>
                          {isModified && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Modified" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate font-mono">
                          {item.section} · {item.key}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic">
                          "{currentVal}"
                        </p>
                      </div>

                      <ChevronRight className={`h-4 w-4 shrink-0 mt-1 ${isCurrent ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Publish Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Publishing...</span>
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
      </div>
    </div>
  );
};

export default VisualCmsEditor;
