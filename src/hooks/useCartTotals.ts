import { useState, useEffect } from 'react';
import { useStore } from '@/store/StoreContext';
import { pricingService } from '@/services/api';

export function useCartTotals(pincode?: string, addressId?: string, address?: any, shippingMethod: string = 'NORMAL_POST', paymentMethod: string = 'upi') {
  const { cart, coupon, user } = useStore();
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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
          codFee: 0,
          isShippingCalculated: false,
          shippingMessage: 'Enter pincode at address step',
          couponDiscount: 0,
          totalAmount: 0,
          totalSavings: 0,
          couponCode: null,
          isValid: true,
          errors: []
        });
        setLoading(false);
        setIsUpdating(false);
        setError(null);
        return;
      }
      try {
        if (!pricing) {
          setLoading(true);
        } else {
          setIsUpdating(true);
        }
        setError(null);
        
        const validCart = cart.map(i => ({
          bookId: i.bookId || (i as any).id,
          quantity: i.qty || (i as any).quantity || 1
        })).filter(i => i.bookId);

        if (validCart?.length === 0) {
          setPricing({
            items: [], subtotal: 0, mrpTotal: 0, shippingCharge: 0, codFee: 0, isShippingCalculated: false, shippingMessage: 'Enter pincode at address step', couponDiscount: 0, totalAmount: 0, totalSavings: 0, couponCode: null, isValid: true, errors: []
          });
          setLoading(false);
          setIsUpdating(false);
          return;
        }

        const payload: any = {
          items: validCart,
          couponCode: coupon,
          userId: (user as any)?.id,
          pincode: pincode || undefined,
          addressId: addressId || undefined,
          address: address || undefined,
          shippingMethod: shippingMethod,
          paymentMethod: paymentMethod === 'cod' ? 'COD' : (paymentMethod || 'UPI'),
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
        if (active) {
          setLoading(false);
          setIsUpdating(false);
        }
      }
    }

    const timeout = setTimeout(loadPricing, 400);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [cart, coupon, user, pincode, addressId, JSON.stringify(address), shippingMethod, paymentMethod]);

  const rawPromoCode = pricing?.promotionCode || pricing?.couponCode || null;
  const promoError = pricing?.promotionError || pricing?.couponError || null;
  const discount = Number(pricing?.promotionDiscount ?? pricing?.couponDiscount ?? 0);

  return { 
    items: pricing?.items || [], 
    subtotal: pricing?.subtotal || 0, 
    mrpTotal: pricing?.mrpTotal || 0, 
    shipping: pricing?.shippingCharge || 0, 
    codFee: Number(pricing?.codFee ?? (paymentMethod === 'cod' ? 20 : 0)),
    isShippingCalculated: Boolean(pricing?.isShippingCalculated),
    isExpressEligible: Boolean(pricing?.isExpressEligible),
    deliveryOptions: pricing?.deliveryOptions || [],
    selectedShippingMethod: pricing?.selectedShippingMethod || shippingMethod,
    shippingZone: pricing?.shippingZone || 'Pending Address',
    shippingMessage: pricing?.shippingMessage || 'Calculated at address step',
    estimatedTransitDays: pricing?.estimatedTransitDays || '3–4 Business Days',
    isAddonBundle: Boolean(pricing?.isAddonBundle),
    bundledWithOrderNumber: pricing?.bundledWithOrderNumber || null,
    discount, 
    total: pricing?.totalAmount || 0, 
    coupon: rawPromoCode, 
    appliedCoupon: rawPromoCode,
    pendingCoupon: coupon,
    couponError: promoError,
    isValid: pricing?.isValid !== false,
    errors: pricing?.errors || [],
    loading,
    isUpdating,
    error 
  };
}
