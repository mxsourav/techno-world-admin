import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Sparkles,
  BookOpen,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { heroService, getImageUrl } from '@/services/api';

export default function HeroBookCoverManager() {
  const [heroConfig, setHeroConfig] = useState<{
    id?: string;
    hero_book_cover_url: string | null;
    hero_book_cover_updated_at: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  void isLoading;
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Staged file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await heroService.getHeroConfig();
      if (res.success && res.data) {
        setHeroConfig(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load hero configuration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image file first');
      return;
    }

    setIsUploading(true);
    try {
      const res = await heroService.uploadCover(selectedFile);
      if (res.success) {
        toast.success('Hero 3D book cover uploaded and updated successfully!');
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        await fetchConfig();
      } else {
        toast.error(res.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading hero book cover');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset hero book cover back to the default blank physical book mockup?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await heroService.deleteCover();
      if (res.success) {
        toast.success('Hero book cover reset to default successfully!');
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        await fetchConfig();
      } else {
        toast.error(res.message || 'Failed to reset hero cover');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error resetting hero cover');
    } finally {
      setIsDeleting(false);
    }
  };

  const currentCoverUrl = previewUrl
    ? previewUrl
    : heroConfig?.hero_book_cover_url
    ? `${getImageUrl(heroConfig.hero_book_cover_url)}?v=${new Date(heroConfig.hero_book_cover_updated_at || Date.now()).getTime()}`
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Hero 3D Featured Book Cover</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                Pure CSS 3D
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a 2D flat cover to project onto the physical 3D book mockup on the homepage hero
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {heroConfig?.hero_book_cover_url && (
            <button
              onClick={handleResetToDefault}
              disabled={isDeleting || isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              Reset to Default Mockup
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload Dropzone & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Info notice */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Automatic Optimization & Aspect Ratio Mapping:</p>
                <p className="text-blue-700/90 leading-relaxed text-[11px]">
                  When you upload any JPEG, PNG, or WebP cover, our server graphics pipeline automatically crops it to standard book aspect ratio (~1:1.5), applies paperback texture with lighting passes, and compresses it to modern WebP format for fast loading.
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-slate-600 mb-3">
                <Upload className="h-6 w-6 text-emerald-700" />
              </div>

              <p className="text-sm font-extrabold text-slate-800">
                {selectedFile ? selectedFile.name : 'Click to upload or drag & drop cover image'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports JPG, PNG, WebP up to 5MB (Target: ~600x900px, 1:1.5 ratio)
              </p>

              {selectedFile && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready to upload: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              )}
            </div>

            {/* Action Bar */}
            {selectedFile && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel Selection
                </button>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Optimizing & Applying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Upload & Apply to Hero Book
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Dual Live Preview Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400">Live 3D Perspective Preview</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentCoverUrl ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                  {currentCoverUrl ? (selectedFile ? 'Unsaved Staged' : 'Active Live') : 'Default Blank Book'}
                </span>
              </div>

              {/* 3D Perspective Simulation Box */}
              <div className="relative h-64 w-full flex items-center justify-center overflow-hidden rounded-xl bg-[#02120b] p-4">
                {currentCoverUrl ? (
                  <div className="relative" style={{ perspective: '800px' }}>
                    <div
                      className="relative h-44 w-28 overflow-hidden rounded-r-[2px] rounded-l-[1px] shadow-2xl transition-transform duration-300 hover:scale-105"
                      style={{
                        transform: 'matrix3d(0.874545, -0.094545, 0, -0.000456, 0, 1, 0, 0, 0, 0, 1, 0, 0, 12, 0, 1)',
                        transformOrigin: '0% 0%',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Cover Image */}
                      <img
                        src={currentCoverUrl}
                        alt="3D Preview"
                        className="h-full w-full object-cover select-none"
                      />

                      {/* Paperback Texture Overlay (Fine Paper Grain Noise) */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.35'/%3E%3C/svg%3E")`,
                        }}
                      />

                      {/* Shading Layer 1: Spine Fold Shadow & Page Swell */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 5%, rgba(0,0,0,0.02) 12%, rgba(255,255,255,0.14) 35%, rgba(255,255,255,0.04) 55%, transparent 75%, rgba(0,0,0,0.25) 100%)',
                          mixBlendMode: 'multiply',
                        }}
                      />

                      {/* Shading Layer 2: Gloss & Specular Sheen */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.08) 45%, transparent 60%)',
                          mixBlendMode: 'screen',
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 text-slate-500">
                    <BookOpen className="h-10 w-10 mb-2 opacity-40 text-emerald-400" />
                    <p className="text-xs font-semibold text-slate-300">Default Blank Physical Book</p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                      The physical book in hero_mockup.png is currently displayed without a custom cover.
                    </p>
                  </div>
                )}
              </div>

              {heroConfig?.hero_book_cover_updated_at && (
                <div className="w-full mt-3 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Last Updated:</span>
                  <span className="font-mono text-slate-300">
                    {new Date(heroConfig.hero_book_cover_updated_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
