import { useState, useEffect } from 'react';
import { useStore } from '@/store/StoreContext';
import { pricingService } from '@/services/api';

export function useCartTotals() {
  const { cart, coupon, user } = useStore();
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{status: number, message: string} | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPricing() {
      if (cart?.length === 0) {
        setPricing({
          items: [],
          subtotal: 0,
          mrpTotal: 0,
          shippingCharge: 0,
          couponDiscount: 0,
          totalAmount: 0,
          totalSavings: 0,
          couponCode: null,
          isValid: true,
          errors: []
        });
        setLoading(false);
        setError(null);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        
        const validCart = cart.map(i => ({
          bookId: i.bookId || (i as any).id,
          quantity: i.qty || (i as any).quantity || 1
        })).filter(i => i.bookId);

        if (validCart?.length === 0) {
          setPricing({
            items: [], subtotal: 0, mrpTotal: 0, shippingCharge: 0, couponDiscount: 0, totalAmount: 0, totalSavings: 0, couponCode: null, isValid: true, errors: []
          });
          setLoading(false);
          return;
        }

        const payload = {
          items: validCart,
          couponCode: coupon,
          userId: (user as any)?.id
        };

        const res = await pricingService.calculate(payload);
        
        if (active) {
          setPricing(res.data);
        }
      } catch (err: any) {
        if (active) {
          console.error("Pricing Error:", err);
          setError({
            status: err?.status || 500,
            message: err?.message || 'Failed to calculate pricing.'
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    // Basic debounce to avoid spamming the endpoint when clicking quantity rapidly
    const timeout = setTimeout(loadPricing, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [cart, coupon, user]);

  const rawPromoCode = pricing?.promotionCode || pricing?.couponCode || null;
  const promoError = pricing?.promotionError || pricing?.couponError || null;
  const discount = Number(pricing?.promotionDiscount ?? pricing?.couponDiscount ?? 0);

  return { 
    items: pricing?.items || [], 
    subtotal: pricing?.subtotal || 0, 
    mrpTotal: pricing?.mrpTotal || 0, 
    shipping: pricing?.shippingCharge || 0, 
    discount, 
    total: pricing?.totalAmount || 0, 
    coupon: rawPromoCode, 
    appliedCoupon: rawPromoCode,
    pendingCoupon: coupon,
    couponError: promoError,
    isValid: pricing?.isValid !== false,
    errors: pricing?.errors || [],
    loading, 
    error 
  };
}
