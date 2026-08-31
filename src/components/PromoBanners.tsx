import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { cmsService } from '@/services/api';
import { Loader2 } from 'lucide-react';

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export default function PromoBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    cmsService.getSections().then((res) => {
      if (!active) return;
      if (res.success && res.data) {
        const promoSection = res.data.find((s: any) => s.sectionKey === 'promo-banners');
        if (promoSection && promoSection.isEnabled) {
          const configBanners: Banner[] = promoSection.configData?.banners || [];
          
          // Filter by active status and date schedule
          const now = new Date();
          const activeBanners = configBanners.filter(b => {
            if (!b.isActive) return false;
            if (b.startDate && new Date(b.startDate) > now) return false;
            if (b.endDate && new Date(b.endDate) < now) return false;
            return true;
          });
          
          setBanners(activeBanners);
        } else {
          setBanners([]);
        }
      }
    }).catch(console.error)
    .finally(() => {
      if (active) setLoading(false);
    });
    
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 pb-12 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map(banner => (
          <Link key={banner.id} to={banner.linkUrl} className="group overflow-hidden rounded-2xl shadow-sm transition hover:shadow-md border border-slate-100 block aspect-[21/9] sm:aspect-[16/9] md:aspect-[3/2] lg:aspect-[16/9] relative bg-slate-100">
            {banner.imageUrl ? (
              <img 
                src={banner.imageUrl} 
                alt={banner.altText} 
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105" 
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm text-slate-500">
                {banner.altText}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
