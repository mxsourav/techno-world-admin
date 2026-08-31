import { useState, useEffect } from 'react';
import { X, Save, Copy, Eye, Settings2, Users, PackageOpen, AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { promotionService, categoryService } from '@/services/api';
import { toast } from 'sonner';

interface PromotionEditModalProps {
  promotion?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromotionEditModal({ promotion, onClose, onSuccess }: PromotionEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  
  // Accordions state
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    promotionType: 'UNIVERSAL',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    validFrom: '',
    validUntil: '',
    
    // JSON Rules state
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    usageLimitPerUser: 1,
    isFirstOrderOnly: false,
    requireLogin: false,
    allowedCategories: [] as string[],
    
    // Advanced
    priority: 0,
    allowCombination: false,
    autoApply: false,
    freeShipping: false
  });

  // Health Warnings
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (promotion) {
      let rules: any = {};
      try { rules = JSON.parse(promotion.rules || '{}'); } catch (e) {}
      
      setFormData({
        name: promotion.name || '',
        code: promotion.code || '',
        description: promotion.description || '',
        promotionType: promotion.promotionType || 'UNIVERSAL',
        discountType: promotion.discountType || 'PERCENTAGE',
        discountValue: promotion.discountValue || 0,
        validFrom: promotion.validFrom ? new Date(promotion.validFrom).toISOString().slice(0, 16) : '',
        validUntil: promotion.validUntil ? new Date(promotion.validUntil).toISOString().slice(0, 16) : '',
        
        minOrderAmount: rules.minOrderAmount || 0,
        maxDiscount: rules.maxDiscount || 0,
        usageLimit: promotion.usageLimit || 0,
        usageLimitPerUser: promotion.usageLimitPerUser || 1,
        isFirstOrderOnly: rules.isFirstOrderOnly || false,
        requireLogin: rules.requireLogin || false,
        allowedCategories: rules.allowedCategories || [],
        
        priority: promotion.priority || 0,
        allowCombination: promotion.allowCombination || false,
        autoApply: promotion.autoApply || false,
        freeShipping: rules.freeShipping || false
      });
    } else {
      // Default dates (optional)
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        validFrom: now.toISOString().slice(0, 16),
        validUntil: nextWeek.toISOString().slice(0, 16)
      }));
    }
  }, [promotion]);

  useEffect(() => {
    // Health checks
    const w = [];
    if (!formData.validUntil) w.push("No expiry date set. This promotion runs forever.");
    if (!formData.usageLimit) w.push("Unlimited total usage.");
    if (formData.promotionType === 'UNIVERSAL' && formData.discountType === 'PERCENTAGE' && formData.discountValue > 50) {
      w.push("Universal percentage discounts above 50% are automatically capped to a maximum of 50% on checkout.");
    }
    if (formData.promotionType === 'UNIVERSAL' && formData.discountType === 'FIXED' && formData.discountValue > 0 && (!formData.minOrderAmount || Number(formData.minOrderAmount) < Number(formData.discountValue) * 2)) {
      w.push(`50% Margin Protection: Universal Flat ₹${formData.discountValue} discount automatically requires a minimum cart subtotal of ₹${Number(formData.discountValue) * 2} (enforcing ≤50% cart discount limit).`);
    }
    if (formData.promotionType === 'PERSONAL') {
      w.push("Personal VIP Promotion: Exempt from the 50% cart discount limit. Requires customer assignment.");
    }
    setWarnings(w);
  }, [formData]);

  const handleSave = async (status: string, isTemplate = false) => {
    setLoading(true);
    try {
      const rules = {
        minOrderAmount: Number(formData.minOrderAmount) || undefined,
        maxDiscount: Number(formData.maxDiscount) || undefined,
        isFirstOrderOnly: formData.isFirstOrderOnly,
        requireLogin: formData.requireLogin,
        allowedCategories: formData.allowedCategories.length > 0 ? formData.allowedCategories : undefined,
        freeShipping: formData.freeShipping
      };

      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        promotionType: formData.promotionType,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        status,
        isTemplate,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
        priority: Number(formData.priority),
        allowCombination: formData.allowCombination,
        autoApply: formData.autoApply,
        usageLimit: Number(formData.usageLimit) || null,
        usageLimitPerUser: Number(formData.usageLimitPerUser) || 1,
        rules: JSON.stringify(rules)
      };

      if (promotion?.id && !isTemplate && !promotion.isTemplate) {
        await promotionService.update(promotion.id, payload);
        toast.success(`Promotion ${status.toLowerCase()} successfully`);
      } else {
        await promotionService.create(payload);
        toast.success(isTemplate ? 'Template saved successfully' : `Promotion ${status.toLowerCase()} successfully`);
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save promotion');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sec: string) => {
    setExpandedSection(prev => prev === sec ? null : sec);
  };

  const AccordionHeader = ({ id, icon: Icon, title, desc }: any) => (
    <button 
      type="button" 
      onClick={() => toggleSection(id)}
      className="flex w-full items-center justify-between p-4 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3 text-left">
        <div className={`p-2 rounded-lg ${expandedSection === id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
      </div>
      {expandedSection === id ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[1100px] rounded-2xl bg-white shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {promotion?.id ? (promotion.isTemplate ? 'Edit Template' : 'Edit Promotion') : 'Create Promotion'}
            </h2>
            <p className="text-sm text-slate-500">Configure promotion rules and targeting</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative bg-slate-50/50">
          
          {/* Mobile Tabs */}
          <div className="flex lg:hidden border-b border-slate-200 bg-white">
            <button onClick={() => setActiveTab('form')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'form' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}>Configuration</button>
            <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'preview' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500'}`}>Live Preview</button>
          </div>

          {/* Left Column: Form */}
          <div className={`flex-1 overflow-y-auto p-6 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Promotion Type */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Promotion Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, promotionType: 'UNIVERSAL'})}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${formData.promotionType === 'UNIVERSAL' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className="text-2xl">🌍</div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm mb-1">Universal</div>
                      <div className="text-xs text-slate-500 leading-relaxed">Available to anyone who enters the code or qualifies for the rule.</div>
                    </div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, promotionType: 'PERSONAL'})}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${formData.promotionType === 'PERSONAL' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className="text-2xl">👤</div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm mb-1">Personal</div>
                      <div className="text-xs text-slate-500 leading-relaxed">Gated to specific customers. Assigned via Customer Management later.</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Promotion Name <span className="text-red-500">*</span></label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm" placeholder="e.g. Summer Back to School Sale" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">Coupon Code (Optional)</label>
                    <input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-mono uppercase" placeholder="e.g. SUMMER20" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">Discount Type</label>
                    <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Flat Amount (₹)</option>
                      <option value="FREE_SHIPPING">Free Shipping</option>
                    </select>
                  </div>
                </div>

                {formData.discountType !== 'FREE_SHIPPING' && (
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">Discount Value <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        {formData.discountType === 'PERCENTAGE' ? '%' : '₹'}
                      </span>
                      <input required type="number" step="0.01" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold text-emerald-700" placeholder="0.00" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">Start Date</label>
                    <input type="datetime-local" value={formData.validFrom} onChange={e => setFormData({ ...formData, validFrom: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1">End Date</label>
                    <input type="datetime-local" value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm" />
                  </div>
                </div>
              </div>

              {/* Progressive Disclosure Sections (Accordions) */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                
                {/* Usage Rules */}
                <div>
                  <AccordionHeader id="usage" icon={Settings2} title="Usage Rules" desc="Minimums, maximums, and limits" />
                  {expandedSection === 'usage' && (
                    <div className="p-5 bg-slate-50/50 space-y-4 border-t border-slate-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                          <input type="number" value={formData.minOrderAmount} onChange={e => setFormData({...formData, minOrderAmount: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0 for none" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Max Discount (₹)</label>
                          <input type="number" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0 for none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Total Usage Limit</label>
                          <input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="0 for unlimited" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Usage Limit Per User</label>
                          <input type="number" value={formData.usageLimitPerUser} onChange={e => setFormData({...formData, usageLimitPerUser: Number(e.target.value)})} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" min="1" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Eligibility */}
                <div>
                  <AccordionHeader id="customer" icon={Users} title="Customer Eligibility" desc="Target specific user segments" />
                  {expandedSection === 'customer' && (
                    <div className="p-5 bg-slate-50/50 space-y-4 border-t border-slate-100">
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-500 transition-colors">
                        <input type="checkbox" checked={formData.isFirstOrderOnly} onChange={e => setFormData({...formData, isFirstOrderOnly: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">First Order Only</div>
                          <div className="text-xs text-slate-500">Only applies to customers with zero previous orders.</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-500 transition-colors">
                        <input type="checkbox" checked={formData.requireLogin} onChange={e => setFormData({...formData, requireLogin: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">Require Login</div>
                          <div className="text-xs text-slate-500">Guests cannot use this promotion.</div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Product Eligibility */}
                <div>
                  <AccordionHeader id="product" icon={PackageOpen} title="Product Eligibility" desc="Apply to entire store or categories" />
                  {expandedSection === 'product' && (
                    <div className="p-5 bg-slate-50/50 space-y-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Target Specific Categories</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, allowedCategories: [] })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              formData.allowedCategories.length === 0
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            All Categories (Entire Store)
                          </button>
                          {categories.map((cat) => {
                            const isSelected = formData.allowedCategories.includes(cat.id);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setFormData({
                                      ...formData,
                                      allowedCategories: formData.allowedCategories.filter(id => id !== cat.id)
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      allowedCategories: [...formData.allowedCategories, cat.id]
                                    });
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="h-3 w-3 text-emerald-600" />}
                                {cat.name}
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {formData.allowedCategories.length === 0
                            ? 'This promotion applies to all books across the store.'
                            : `Restricted to ${formData.allowedCategories.length} selected categor${formData.allowedCategories.length === 1 ? 'y' : 'ies'}. Cart must contain items from these categories.`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Restrictions */}
                <div>
                  <AccordionHeader id="advanced" icon={AlertCircle} title="Advanced Restrictions" desc="Stacking, priority, and free shipping" />
                  {expandedSection === 'advanced' && (
                    <div className="p-5 bg-slate-50/50 space-y-4 border-t border-slate-100">
                       <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-500 transition-colors">
                        <input type="checkbox" checked={formData.freeShipping} onChange={e => setFormData({...formData, freeShipping: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">Includes Free Shipping</div>
                          <div className="text-xs text-slate-500">Provides free delivery in addition to the discount.</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-emerald-500 transition-colors opacity-50">
                        <input disabled type="checkbox" checked={formData.allowCombination} onChange={e => setFormData({...formData, allowCombination: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-slate-300" />
                        <div>
                          <div className="text-sm font-bold text-slate-900">Allow Combination (Coming Soon)</div>
                          <div className="text-xs text-slate-500">Can be stacked with other active promotions.</div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

              </div>
              <div className="h-8"></div> {/* Spacer */}
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className={`w-full lg:w-[340px] bg-slate-100 border-l border-slate-200 p-6 flex-col overflow-y-auto ${activeTab === 'form' ? 'hidden lg:flex' : 'flex'}`}>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" /> Live Storefront Preview
            </h3>

            {/* Golden Ticket Visual */}
            <div className="relative mx-auto w-full max-w-[300px] select-none filter drop-shadow-md">
              {/* Outer Golden Ticket Frame with Warm Gold Border */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#fbbf24] via-[#f59e0b] to-[#d97706] p-1 border border-amber-300 shadow-xl shadow-amber-500/20">
                
                {/* Inner Golden Surface */}
                <div className="relative rounded-[14px] bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fbbf24] text-amber-950 p-5 overflow-hidden">
                  
                  {/* Subtle Background Pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:10px_10px] opacity-10 pointer-events-none" />
                  
                  {/* Left & Right Circular Perforation Cutout Notches */}
                  <div className="absolute -left-3.5 top-[65%] -translate-y-1/2 h-7 w-7 rounded-full bg-slate-100 border-r-2 border-amber-400 shadow-inner z-10" />
                  <div className="absolute -right-3.5 top-[65%] -translate-y-1/2 h-7 w-7 rounded-full bg-slate-100 border-l-2 border-amber-400 shadow-inner z-10" />

                  {/* Top Header: Date Stamp & Type Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3 relative z-0">
                    <div className="inline-flex items-center gap-1.5 bg-amber-950 text-amber-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                      <span className="text-amber-400">DATE</span>
                      <span className="text-white font-mono">{formData.validUntil ? new Date(formData.validUntil).toLocaleDateString('en-GB') : 'OPEN'}</span>
                    </div>
                    
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase bg-amber-900/15 text-amber-950 border border-amber-900/20">
                      {formData.promotionType}
                    </span>
                  </div>

                  {/* Main Ticket Banner Header */}
                  <div className="text-center my-2 relative z-0">
                    <div className="inline-block border-y-2 border-amber-900/30 py-0.5 px-3 mb-1">
                      <span className="text-[11px] font-black tracking-[0.2em] text-amber-950 uppercase">
                        ★ ADMIT ONE VOUCHER ★
                      </span>
                    </div>
                    
                    <h3 className="text-base font-black text-amber-950 leading-tight mt-1 line-clamp-1">
                      {formData.name || 'Techno World Pass'}
                    </h3>
                  </div>

                  {/* Big Gold Discount Badge */}
                  <div className="text-center my-3 relative z-0 bg-gradient-to-r from-amber-900/10 via-amber-900/15 to-amber-900/10 py-2.5 rounded-xl border border-amber-900/15">
                    <div className="text-3xl font-black text-amber-950 tracking-tight drop-shadow-sm">
                      {formData.discountType === 'PERCENTAGE' && `${formData.discountValue}% OFF`}
                      {formData.discountType === 'FIXED' && `₹${formData.discountValue} OFF`}
                      {formData.discountType === 'FREE_SHIPPING' && `FREE SHIPPING`}
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-widest block mt-0.5">
                      {formData.discountType === 'PERCENTAGE' ? 'On Total Cart' : 'Instant Store Credit'}
                    </span>
                  </div>

                  {/* Promo Code Box */}
                  {formData.code ? (
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2.5 border-2 border-dashed border-amber-600/80 flex items-center justify-between shadow-sm relative z-0 mb-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider">COUPON CODE</span>
                        <span className="font-mono font-black text-sm text-slate-950 tracking-widest">{formData.code}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          navigator.clipboard?.writeText(formData.code);
                          toast.success('Coupon code copied!');
                        }}
                        className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm"
                        title="Copy code"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-950 font-bold italic text-center py-2 bg-white/40 rounded-lg mb-3">
                      Auto-applied at checkout
                    </div>
                  )}

                  {/* Dashed Perforation Line */}
                  <div className="relative my-4 border-b-2 border-dashed border-amber-900/30" />

                  {/* Bottom Stub: Terms & Barcode Graphic */}
                  <div className="pt-0.5 flex items-end justify-between gap-2 relative z-0">
                    <div className="space-y-1 text-[10px] text-amber-950/80 font-bold leading-tight flex-1">
                      {formData.minOrderAmount > 0 ? (
                        <p>• Min Order: ₹{formData.minOrderAmount}</p>
                      ) : (
                        <p>• Min Order: Auto-guarded</p>
                      )}
                      {formData.isFirstOrderOnly && (
                        <p>• 1st order only</p>
                      )}
                      <p>
                        • {formData.validUntil ? `Exp: ${new Date(formData.validUntil).toLocaleDateString('en-GB')}` : 'No expiry'}
                      </p>
                    </div>

                    {/* Realistic Golden Barcode Graphic */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="flex items-center gap-[2px] h-8 bg-amber-950 px-2 py-1 rounded">
                        <div className="w-[1.5px] h-full bg-amber-300" />
                        <div className="w-[3px] h-full bg-amber-300" />
                        <div className="w-[1px] h-full bg-amber-300" />
                        <div className="w-[2px] h-full bg-amber-300" />
                        <div className="w-[4px] h-full bg-amber-300" />
                        <div className="w-[1px] h-full bg-amber-300" />
                        <div className="w-[2.5px] h-full bg-amber-300" />
                        <div className="w-[1px] h-full bg-amber-300" />
                        <div className="w-[3px] h-full bg-amber-300" />
                        <div className="w-[1.5px] h-full bg-amber-300" />
                      </div>
                      <span className="text-[8px] font-mono font-black tracking-widest text-amber-950 mt-0.5">
                        {formData.code || 'TW-GOLD'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Health Warnings */}
            {warnings.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Promotion Health
                </h4>
                <div className="space-y-2">
                  {warnings.map((w, i) => (
                    <div key={i} className="bg-amber-50 border border-amber-100 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
            Cancel
          </button>
          
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => handleSave('DRAFT', false)}
              disabled={loading || !formData.name}
              className="px-3.5 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> Save Draft
            </button>
            <button 
              type="button" 
              onClick={() => handleSave('PAUSED', false)}
              disabled={loading || !formData.name}
              className="px-3.5 py-2.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <AlertCircle className="h-4 w-4" /> Save as Paused
            </button>
            <button 
              type="button" 
              onClick={() => handleSave('DRAFT', true)}
              disabled={loading || !formData.name}
              className="px-3.5 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Copy className="h-4 w-4" /> Save Template
            </button>
            <button 
              type="button" 
              onClick={() => handleSave('ACTIVE', false)}
              disabled={loading || !formData.name || (formData.discountType !== 'FREE_SHIPPING' && !formData.discountValue)}
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" /> {promotion?.id ? 'Update & Activate' : 'Publish & Go Live'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
