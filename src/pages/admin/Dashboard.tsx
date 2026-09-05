import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  BookOpen, Plus, Search, ShoppingCart, Users, Download, IndianRupee, AlertCircle,
  Pause, Play, Trash2, Edit3, Truck, Printer, ShieldCheck, X, Loader2, Mail,
  CheckCircle2, XCircle, Send, ChevronDown, ChevronUp,
  Settings, ArrowRight, Bell, RotateCcw, Box, Star, ExternalLink,
  SlidersHorizontal, Clock, Package, Zap, Store, CalendarCheck,
  MessageSquare, HelpCircle, CornerDownRight
} from 'lucide-react';
import { formatINR, formatClientSku, formatClientFsn } from '@/utils/helpers';
import type { Book } from '@/types/index';
import { adminService, bookService, categoryService, orderService, mediaService, cmsService, promotionService, shippingService, reviewService, questionService } from '@/services/api';
import { toast } from 'sonner';
import PromotionEditModal from '@/components/admin/PromotionEditModal';
import ProductsWorkspace from '@/components/admin/catalog/ProductsWorkspace';
import SearchAnalyticsWorkspace from '@/components/admin/analytics/SearchAnalyticsWorkspace';
import PaymentsWorkspace from '@/components/admin/payments/PaymentsWorkspace';
export default function Dashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || 'dashboard';
  const navigate = useNavigate();


  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importAnalysis, setImportAnalysis] = useState<any>(null);
  


  const [stats, setStats] = useState({ 
    revenue: 0, totalOrders: 0, aov: 0, lowStock: 0, 
    totalBooks: 0, outOfStock: 0, totalUsers: 0 
  });
  const [categories, setCategories] = useState<any[]>([]);

  const [lowStockBooks, setLowStockBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [shippingLoading, setShippingLoading] = useState<string | null>(null); void shippingLoading;
  const [shippingModalLabel, setShippingModalLabel] = useState<any | null>(null);
  const [shippingTrackingModal, setShippingTrackingModal] = useState<any | null>(null);
  
  // Flipkart Seller Hub style Forward Orders State
  const [orderViewMode, setOrderViewMode] = useState<'smart_groups' | 'order_id'>('smart_groups');
  const urlStage = searchParams.get('stage') as any;
  const [forwardStage, setForwardStage] = useState<'to_accept' | 'to_pack' | 'to_dispatch' | 'in_transit' | 'pending_service' | 'completed' | 'upcoming' | 'returns' | 'cancellations'>(urlStage || 'to_accept');

  useEffect(() => {
    if (urlStage && ['to_accept', 'to_pack', 'to_dispatch', 'in_transit', 'pending_service', 'completed', 'upcoming', 'returns', 'cancellations'].includes(urlStage)) {
      setForwardStage(urlStage);
    }
  }, [urlStage]);

  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedLogisticsFilter, setSelectedLogisticsFilter] = useState('ALL');
  const [selectedGroupKeys, setSelectedGroupKeys] = useState<Set<string>>(new Set());
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<Set<string>>(new Set());
  const [isOtherActionsOpen, setIsOtherActionsOpen] = useState(false);
  const otherActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (otherActionsRef.current && !otherActionsRef.current.contains(e.target as Node)) {
        setIsOtherActionsOpen(false);
      }
    };
    if (isOtherActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOtherActionsOpen]);

  const [editingDimensionsBook, setEditingDimensionsBook] = useState<any | null>(null);
  const [dimensionsForm, setDimensionsForm] = useState({ length: '24', width: '22', height: '1', weight: '0.50' });
  const [isSavingDimensions, setIsSavingDimensions] = useState(false);
  const [isBatchAccepting, setIsBatchAccepting] = useState(false);

  // Book & Order Details Modals + Customers Tab State
  const [previewBook, setPreviewBook] = useState<any | null>(null);
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<any | null>(null);

  // Reviews & Q&A Moderation State
  const [reviewSubTab, setReviewSubTab] = useState<'reviews' | 'questions'>('reviews');
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [adminQuestions, setAdminQuestions] = useState<any[]>([]);
  const [loadingReviewsData, setLoadingReviewsData] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('ALL');
  const [questionStatusFilter, setQuestionStatusFilter] = useState<string>('ALL');
  const [replyingQuestionId, setReplyingQuestionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySignature, setReplySignature] = useState('Techno World Direct · Verified Seller');
  const [showClear24hModal, setShowClear24hModal] = useState(false);
  const [clearing24h, setClearing24h] = useState(false);


  const [emailModalOrder, setEmailModalOrder] = useState<any | null>(null);
  const [emailTemplate, setEmailTemplate] = useState<string>('DELAY_NOTICE');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [emailSending, setEmailSending] = useState(false);

  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Book currently out of print / unavailable from publisher');
  const [rejectCustomReason, setRejectCustomReason] = useState<string>('');
  const [rejecting, setRejecting] = useState(false);

  const [expressModalOrder, setExpressModalOrder] = useState<string | null>(null);
  const [expressPartner, setExpressPartner] = useState('');
  const [expressAgentPhone, setExpressAgentPhone] = useState('');

  const [pickupSlotsModalOrder, setPickupSlotsModalOrder] = useState<any | null>(null);
  const [pickupSlotInputs, setPickupSlotInputs] = useState<string[]>([
    'Today, 3:30 PM – 5:30 PM',
    'Tomorrow, 11:30 AM – 1:30 PM',
    'Tomorrow, 4:00 PM – 6:30 PM',
    'Day after Tomorrow, 12:00 PM – 3:00 PM',
  ]);
  const [isSavingPickupSlots, setIsSavingPickupSlots] = useState(false);
  const [isCollectingOrder, setIsCollectingOrder] = useState<string | null>(null);

  const handleSetPickupSlotsSubmit = async () => {
    if (!pickupSlotsModalOrder) return;
    const filtered = pickupSlotInputs.map(s => s.trim()).filter(Boolean);
    if (filtered.length < 2) {
      return toast.error('Please provide at least 2 or 3 pickup time slot options for the customer.');
    }

    setIsSavingPickupSlots(true);
    try {
      const res = await orderService.setPickupSlots(pickupSlotsModalOrder.id, filtered);
      if (res.success) {
        toast.success(`${filtered.length} pickup time slots offered to customer!`);
        setPickupSlotsModalOrder(null);
        fetchOrders();
      } else {
        toast.error(res.message || 'Failed to save pickup slots');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to set pickup slots');
    } finally {
      setIsSavingPickupSlots(false);
    }
  };

  const handleMarkOrderCollected = async (orderId: string) => {
    if (!confirm('Confirm order handover? Ensure customer has presented their official invoice at the College Street dispatch desk.')) {
      return;
    }
    setIsCollectingOrder(orderId);
    try {
      const res = await orderService.markOrderCollected(orderId);
      if (res.success) {
        toast.success('Order completed & handed over to customer!');
        fetchOrders();
      } else {
        toast.error(res.message || 'Failed to mark order as collected');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark order collected');
    } finally {
      setIsCollectingOrder(null);
    }
  };


  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [cmsSections, setCmsSections] = useState<any[]>([]);
  const [cmsEditing, setCmsEditing] = useState<Record<string, any>>({});  const [isUploading, setIsUploading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importStrategy, setImportStrategy] = useState<'UPDATE' | 'ADD_STOCK' | 'SKIP' | 'REPLACE'>('UPDATE');



  useEffect(() => {
    if (tab === 'dashboard') {
      adminService.getStats().then(res => setStats(res.data)).catch(console.error);
      categoryService.getCategories().then(res => setCategories(res.data)).catch(console.error);
      bookService.getBooks({ limit: 6 }).then(res => setLowStockBooks(res.data)).catch(console.error);
      orderService.getNotifications().then((res: any) => {
        if (res.success) setPendingOrdersSummary(res.pendingOrders || []);
      }).catch(() => {});
    }
    if (tab === 'settings') {
      fetchAdminSettings();
    }
    if (tab === 'customers') {
      fetchCustomers();
    }
    if (tab === 'reviews') {
      fetchReviewsAndQuestions();
    }
  }, [tab]);

  const fetchReviewsAndQuestions = async () => {
    setLoadingReviewsData(true);
    try {
      const [revRes, qRes] = await Promise.all([
        reviewService.getAdminReviews(),
        questionService.getAdminQuestions(),
      ]);
      if (revRes.success && Array.isArray(revRes.data)) {
        setAdminReviews(revRes.data);
      }
      if (qRes.success && Array.isArray(qRes.data)) {
        setAdminQuestions(qRes.data);
      }
    } catch (err) {
      console.error('Failed to load reviews or questions', err);
    } finally {
      setLoadingReviewsData(false);
    }
  };

  const handleToggleApproveReview = async (id: string, currentStatus: boolean) => {
    try {
      const res = await reviewService.updateReviewStatus(id, !currentStatus);
      if (res.success) {
        toast.success(res.message || 'Review status updated');
        setAdminReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: !currentStatus } : r));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update review status');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await reviewService.deleteReview(id);
      if (res.success) {
        toast.success('Review deleted successfully');
        setAdminReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete review');
    }
  };

  const handlePublishAnswer = async (id: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter an answer to publish');
      return;
    }
    try {
      const res = await questionService.answerQuestion(id, {
        answer: replyText.trim(),
        answeredBy: replySignature,
      });
      if (res.success) {
        toast.success('Answer published live to book page');
        setAdminQuestions(prev => prev.map(q => q.id === id ? {
          ...q,
          answer: replyText.trim(),
          answeredBy: replySignature,
          answeredAt: new Date().toISOString(),
          status: 'ANSWERED'
        } : q));
        setReplyingQuestionId(null);
        setReplyText('');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish answer');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer question?')) return;
    try {
      const res = await questionService.deleteQuestion(id);
      if (res.success) {
        toast.success('Question deleted successfully');
        setAdminQuestions(prev => prev.filter(q => q.id !== id));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete question');
    }
  };

  const handleClear24hLogs = async () => {
    setClearing24h(true);
    try {
      const [revClear, qClear] = await Promise.all([
        reviewService.clearOldReviews(24),
        questionService.clearOldQuestions(24),
      ]);
      const totalRemoved =
        ((revClear as any)?.count || (revClear as any)?.data?.count || 0) +
        ((qClear as any)?.count || (qClear as any)?.data?.count || 0);
      toast.success(`Cleared records older than 24 hours (${totalRemoved} items cleaned)`);
      setShowClear24hModal(false);
      fetchReviewsAndQuestions();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to clear old logs');
    } finally {
      setClearing24h(false);
    }
  };

  const fetchCustomers = (search?: string) => {
    setIsLoadingCustomers(true);
    adminService.getCustomers({ search: search || customerSearchQuery })
      .then((res: any) => {
        if (res.success && res.data) {
          setCustomersList(res.data.customers || []);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingCustomers(false));
  };

  const navigateToCustomer = (customerIdentifier: string) => {
    setPreviewOrder(null);
    setCustomerSearchQuery(customerIdentifier);
    navigate('/admin/dashboard?tab=customers');
    fetchCustomers(customerIdentifier);
  };

  const fetchOrders = () => {
    orderService.getAllOrders().then(res => setOrders(res.data || [])).catch(console.error);
  };

  // Live polling on Orders tab so newly placed orders pop up immediately
  useEffect(() => {
    if (tab === 'orders') {
      fetchOrders();
      const interval = setInterval(fetchOrders, 4000);
      return () => clearInterval(interval);
    }
  }, [tab]);

  // Auto-generate clean, readable human SKU ID following Flipkart client standards
  const getDisplaySku = (book: any) => formatClientSku(book);
  const getDisplayFsn = (book: any) => formatClientFsn(book);

  // Helper to compute 2 PM dispatch batch key (e.g. 2026-09-04_14:00)
  const getOrderBatchKey = (dateStr: string) => {
    const d = new Date(dateStr);
    const cutoff = new Date(d);
    cutoff.setHours(14, 0, 0, 0);
    if (d.getTime() >= cutoff.getTime()) {
      cutoff.setDate(cutoff.getDate() + 1);
    }
    return `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}_14:00`;
  };

  // Smart Groups: Bundles all orders and books placed by the same customer in the same 2 PM dispatch batch to the same address
  const getSmartGroups = (filteredOrdersList: any[]) => {
    const groupMap: { [key: string]: any } = {};

    filteredOrdersList.forEach((ord: any) => {
      const isSelfPickup = ord.shippingMethod === 'SELF_PICKUP' || ord.shippingCarrier === 'STORE_TAKEAWAY';
      const phone = (ord.pickupPhone || ord.address?.phone || ord.user?.phone || ord.userId || 'guest').trim();
      const pin = (ord.address?.pincode || '700001').trim();
      const line1 = (ord.address?.addressLine1 || ord.address?.line1 || '').trim().toLowerCase();
      const batchKey = getOrderBatchKey(ord.createdAt);

      // Store Pickup orders get distinct keys so they don't combine with courier dispatch
      const groupKey = isSelfPickup ? `pickup_${ord.id}` : `${phone}_${pin}_${line1}_${batchKey}`;

      const items = Array.isArray(ord.items) && ord.items.length > 0 ? ord.items : [];

      if (!groupMap[groupKey]) {
        groupMap[groupKey] = {
          key: groupKey,
          isSelfPickup,
          orders: [ord],
          order: ord, // primary order for single actions
          orderNumbers: [ord.orderNumber],
          orderNumber: ord.orderNumber,
          createdAt: ord.createdAt,
          customerName: ord.pickupName || ord.address?.fullName || ord.address?.name || ord.user?.name || 'Valued Customer',
          customerPhone: ord.pickupPhone || ord.address?.phone || ord.user?.phone || 'N/A',
          customerEmail: ord.pickupEmail || ord.customerEmail || ord.address?.email || ord.user?.email || 'N/A',
          postOffice: isSelfPickup ? 'College Street Takeaway Desk' : (ord.address?.postOffice || 'Local Post Office'),
          landmark: isSelfPickup ? 'Opp. Grace Cinema, Calcutta University' : (ord.address?.landmark || ''),
          city: ord.address?.city || 'Kolkata',
          state: ord.address?.state || 'West Bengal',
          pincode: isSelfPickup ? '700007' : (ord.address?.pincode || '700001'),
          items: [...items],
          totalAmount: ord.totalAmount,
          pickupSlots: ord.pickupSlots,
          selectedPickupSlot: ord.selectedPickupSlot,
          pickupStatus: ord.pickupStatus || 'NONE',
        };
      } else {
        // Customer placed multiple orders in the same 2 PM batch to the same delivery address!
        groupMap[groupKey].orders.push(ord);
        groupMap[groupKey].orderNumbers.push(ord.orderNumber);
        groupMap[groupKey].items.push(...items);
        groupMap[groupKey].totalAmount += ord.totalAmount;
      }
    });

    return Object.values(groupMap).map((grp: any) => {
      const totalBookCount = grp.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      const totalWeightKg = (totalBookCount * 0.45).toFixed(2);
      const dimensions = `${Math.min(24 + (totalBookCount - 1) * 2, 40)}-22-${Math.min(2 + totalBookCount, 15)}cm`;
      const isMultiOrder = grp.orders.length > 1;

      return {
        ...grp,
        totalBookCount,
        isMultiOrder,
        orderCount: grp.orders.length,
        dimensions,
        weight: `${totalWeightKg}kg`,
        packaging: totalBookCount > 1 ? `Consignment Box (${totalBookCount} Books in ${grp.orders.length} Orders)` : 'Standard Book Sleeve',
        priceDisplay: `₹${grp.totalAmount}`,
      };
    });
  };

  const handleBatchAcceptSelected = async () => {
    let orderIdsToAccept: string[] = [];
    if (orderViewMode === 'smart_groups') {
      const activeStageOrders = orders.filter((o: any) => {
        if (forwardStage === 'to_accept') return o.status === 'PENDING';
        if (forwardStage === 'to_pack') return o.status === 'CONFIRMED';
        if (forwardStage === 'to_dispatch') return o.status === 'PROCESSING';
        if (forwardStage === 'in_transit') return o.status === 'SHIPPED';
        if (forwardStage === 'completed') return o.status === 'DELIVERED';
        return true;
      });
      const activeGroups = getSmartGroups(activeStageOrders);
      selectedGroupKeys.forEach((k: string) => {
        const found = activeGroups.find((g: any) => g.key === k);
        if (found && (found as any).order) {
          orderIdsToAccept.push((found as any).order.id);
        }
      });
    } else {
      orderIdsToAccept = Array.from(selectedOrderIds);
    }

    orderIdsToAccept = Array.from(new Set(orderIdsToAccept));
    if (orderIdsToAccept.length === 0) {
      return toast.error('Please select at least one group or order to accept');
    }

    setIsBatchAccepting(true);
    try {
      const res = await orderService.batchUpdateStatus({
        orderIds: orderIdsToAccept,
        status: 'CONFIRMED',
        notes: `Batch accepted from Forward Orders dashboard`,
      });
      if (res.success) {
        toast.success(`Accepted ${orderIdsToAccept.length} order(s) successfully!`);
        setSelectedGroupKeys(new Set());
        setSelectedOrderIds(new Set());
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to batch accept orders');
    } finally {
      setIsBatchAccepting(false);
    }
  };

  const handleSaveBookDimensions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDimensionsBook) return;
    setIsSavingDimensions(true);
    try {
      const dimsStr = `${dimensionsForm.length}-${dimensionsForm.width}-${dimensionsForm.height}cm`;
      const wtNum = parseFloat(dimensionsForm.weight) || 0.5;
      const res = await orderService.updateBookDimensions(editingDimensionsBook.id, {
        dimensions: dimsStr,
        weight: wtNum,
      });
      if (res.success) {
        toast.success('Packaging dimensions and weight updated successfully!');
        setEditingDimensionsBook(null);
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update book dimensions');
    } finally {
      setIsSavingDimensions(false);
    }
  };




  useEffect(() => {
    if (tab === 'media') {
      mediaService.list().then(res => setMediaItems(res.data)).catch(console.error);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'cms') {
      cmsService.getSections().then(res => {
        setCmsSections(res.data);
        const editing: Record<string, any> = {};
        for (const s of res.data) editing[s.sectionKey] = s.configData;
        setCmsEditing(editing);
      }).catch(console.error);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'coupons') {
      promotionService.getAll().then(res => setPromotions(res.data)).catch(console.error);
    }
  }, [tab]);

  const saveCmsSection = async (key: string) => {
    try {
      await cmsService.updateSection(key, { configData: cmsEditing[key] });
      toast.success(`"${key}" saved!`);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const toggleCmsSection = async (key: string) => {
    try {
      const res = await cmsService.toggleSection(key);
      setCmsSections(s => s.map(sec => sec.sectionKey === key ? { ...sec, isEnabled: res.data.isEnabled } : sec));
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err.message || 'Toggle failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const res = await adminService.analyzeImport(file);
      setImportAnalysis({ ...res.data, file, filename: file.name });
      setIsImportModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExecuteImport = async () => {
    if (!importAnalysis) return;
    setIsImporting(true);
    try {
      const res = await adminService.executeImport({
        filename: importAnalysis.filename,
        toAdd: importAnalysis.toAdd,
        toUpdate: importAnalysis.toUpdate,
        newCategories: importAnalysis.newCategories,
        newAuthors: importAnalysis.newAuthors,
        newPublishers: importAnalysis.newPublishers,
        warnings: importAnalysis.warnings,
        strategy: importStrategy,
      });
      toast.success(`Import success! Added: ${(res as any).recordsAdded}, Updated: ${(res as any).recordsUpdated}, Skipped: ${(res as any).recordsSkipped}`);
      setImportResult(res);
      setImportAnalysis(null);
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const getStock = (_id: string, def: number) => def;

  const downloadErrorsCsv = () => {
    if (!importResult?.errors?.length) return;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Row,Error Message\n" 
        + importResult.errors.map((e: any) => `${e.row},"${e.message.replace(/"/g, '""')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "import_errors.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Quick Template Helper for Admin Customer Emails
  const applyEmailTemplate = (templateKey: string, order: any) => {
    setEmailTemplate(templateKey);
    const customerName = order.address?.name || order.user?.name || 'Valued Customer';
    const firstBookTitle = order.items?.[0]?.book?.title || 'the ordered title(s)';

    if (templateKey === 'DELAY_NOTICE') {
      setEmailSubject(`Important Update: Order #${order.orderNumber} Dispatch Notice - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

Thank you for placing order #${order.orderNumber} with Techno World Books.

We would like to inform you that "${firstBookTitle}" is currently being arranged from our publisher warehouse. As a result, there will be a slight delay of 2–3 business days in dispatching your package.

Rest assured, your order is confirmed and prioritized. As soon as it is packed, we will dispatch it via India Post Speed Post and email your live tracking barcode immediately.

Thank you for your patience and understanding.

Warm regards,
Techno World Orders Team
admin@technoworld.com | https://techno-world-books.vercel.app`
      );
    } else if (templateKey === 'ADDRESS_CLARIFICATION') {
      setEmailSubject(`Address Clarification Required: Order #${order.orderNumber} - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

We are getting your order #${order.orderNumber} ready for dispatch via India Post Speed Post.

To ensure seamless delivery by the postal carrier, could you please confirm your complete street address, nearby landmark, and 6-digit postal PIN code?

Recipient Address on File:
${order.address?.line1 || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}

Thank you for your quick confirmation.

Warm regards,
Techno World Dispatch Team
admin@technoworld.com`
      );
    } else if (templateKey === 'ORDER_CONFIRMATION') {
      setEmailSubject(`Order Confirmed: #${order.orderNumber} is Being Prepared - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

Great news! Your order #${order.orderNumber} for "${firstBookTitle}" has been reviewed and accepted by our fulfillment team.

We are currently packing your books with protective bubble wrap. You will receive an India Post Speed Post tracking number once the consignment is dispatched.

Thank you for choosing Techno World Books!

Warm regards,
Techno World Books Team`
      );
    } else {
      setEmailSubject(`Update regarding your Order #${order.orderNumber} - Techno World Books`);
      setEmailMessage(
`Dear ${customerName},

We are writing to you regarding your order #${order.orderNumber}.



Warm regards,
Techno World Orders Team
admin@technoworld.com`
      );
    }
  };

  const openEmailModal = (order: any, initialTemplate = 'DELAY_NOTICE') => {
    setEmailModalOrder(order);
    const targetEmail = order.customerEmail || order.address?.email || order.user?.email || '';
    setEmailRecipient(targetEmail);
    applyEmailTemplate(initialTemplate, order);
  };

  const handleSendCustomEmail = async () => {
    if (!emailModalOrder || !emailSubject.trim() || !emailMessage.trim()) {
      return toast.error('Please enter a subject and message');
    }

    setEmailSending(true);
    try {
      const res = await orderService.sendCustomEmail(emailModalOrder.id, {
        subject: emailSubject,
        message: emailMessage,
        templateType: emailTemplate as any,
        recipientEmail: emailRecipient,
        recipientName: emailModalOrder.address?.name || emailModalOrder.user?.name,
      });

      if (res.success) {
        toast.success(`Email sent from admin@technoworld.com to ${emailRecipient}`);
        setEmailModalOrder(null);
        // Refresh orders to reflect updated communication notes
        orderService.getAllOrders().then(r => r.data && setOrders(r.data));
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email');
    } finally {
      setEmailSending(false);
    }
  };

  const handleAcceptOrder = async (order: any) => {
    try {
      await orderService.updateStatus(order.id, 'PROCESSING', 'Order accepted by Admin for fulfillment');
      toast.success(`Order #${order.orderNumber} accepted! Status changed to PROCESSING.`);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'PROCESSING' } : o));
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept order');
    }
  };

  const handleRejectOrderSubmit = async () => {
    if (!rejectModalOrder) return;
    const finalReason = rejectReason === 'Other' ? rejectCustomReason : rejectReason;
    if (!finalReason.trim()) {
      return toast.error('Please specify a rejection reason');
    }

    setRejecting(true);
    try {
      await orderService.updateStatus(rejectModalOrder.id, 'CANCELLED', undefined, finalReason);
      toast.success(`Order #${rejectModalOrder.orderNumber} cancelled. Notification email sent to customer.`);
      setOrders(prev => prev.map(o => o.id === rejectModalOrder.id ? { ...o, status: 'CANCELLED' } : o));
      setRejectModalOrder(null);
      setRejectCustomReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject order');
    } finally {
      setRejecting(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await orderService.updateStatus(id, status);
      toast.success(`Order ${id} updated to ${status}`);
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const bookIndiaPostShipment = async (orderId: string, deliveryPartner?: string, agentPhone?: string) => {
    setShippingLoading(orderId);
    try {
      const payload: any = {};
      if (deliveryPartner) payload.deliveryPartner = deliveryPartner;
      if (agentPhone) payload.agentPhone = agentPhone;
      
      const res = await shippingService.bookShipment(orderId, payload);
      if (res.success && res.data) {
        if (res.data.method === 'EXPRESS_LOCAL') {
          toast.success(`Dispatched via ${res.data.carrier}!`);
        } else {
          toast.success(`Consignment booked via ${res.data.carrier || 'India Post'}! Barcode: ${res.data.barcode || 'N/A'}`);
        }
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId || o.orderNumber === orderId
              ? {
                  ...o,
                  trackingNumber: res.data.barcode || o.trackingNumber,
                  shippingCarrier: res.data.carrier,
                  status: res.data.method === 'EXPRESS_LOCAL' ? 'SHIPPED' : (o.status === 'PENDING' ? 'PROCESSING' : o.status),
                }
              : o
          )
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to book consignment with India Post');
    } finally {
      setShippingLoading(null);
    }
  };

  const openShippingLabel = async (orderId: string) => {
    try {
      const res = await shippingService.getShippingLabel(orderId);
      if (res.success && res.data) {
        setShippingModalLabel(res.data.printableData);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load shipping label');
    }
  };

  const openTrackingModal = async (identifier: string) => {
    try {
      const res = await shippingService.trackShipment(identifier);
      if (res.success && res.data) {
        setShippingTrackingModal(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load live tracking data');
    }
  };



  // Settings & SMTP State
  const [adminProfile, setAdminProfile] = useState<any>({ name: '', email: '', phone: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [smtpForm, setSmtpForm] = useState({
    senderEmail: 'admin@technoworld.com',
    senderName: 'Techno World Books',
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    pass: '',
    secure: false,
  });
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);

  const [testEmailTo, setTestEmailTo] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isTestEmailModalOpen, setIsTestEmailModalOpen] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<any>(null);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [selectedEmailPreview, setSelectedEmailPreview] = useState<any>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  const [pendingOrdersSummary, setPendingOrdersSummary] = useState<any[]>([]);

  const fetchEmailLogs = () => {
    setIsLoadingEmails(true);
    adminService.getEmailLogs({ limit: 50 })
      .then((res: any) => {
        if (res.success && Array.isArray(res.data)) {
          setEmailLogs(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingEmails(false));
  };

  const fetchAdminSettings = () => {
    adminService.getSettings()
      .then((res: any) => {
        if (res.success && res.data) {
          if (res.data.admin) {
            setAdminProfile({
              name: res.data.admin.name || '',
              email: res.data.admin.email || '',
              phone: res.data.admin.phone || '',
            });
          }
          if (res.data.smtp) {
            setSmtpForm((prev: any) => ({
              ...prev,
              ...res.data.smtp,
            }));
          }
        }
      })
      .catch(() => {});
    fetchEmailLogs();
  };

  const handleSaveAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile.name || !adminProfile.email) {
      return toast.error('Name and email are required');
    }
    if (adminPassword && adminPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (adminPassword && adminPassword !== adminConfirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsSavingProfile(true);
    try {
      const res = await adminService.updateProfile({
        name: adminProfile.name,
        email: adminProfile.email,
        phone: adminProfile.phone || null,
        password: adminPassword || undefined,
      });
      if (res.success) {
        toast.success('Admin profile credentials updated successfully!');
        setAdminPassword('');
        setAdminConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update admin profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpForm.senderEmail || !smtpForm.host || !smtpForm.port) {
      return toast.error('Sender email, SMTP Host, and Port are required');
    }

    setIsSavingSmtp(true);
    try {
      const res = await adminService.updateSmtp(smtpForm);
      if (res.success) {
        toast.success('Outbound email & SMTP settings saved successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save SMTP settings');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo) return toast.error('Please enter a recipient email address');

    setIsTestingSmtp(true);
    try {
      const res = await adminService.testSmtp({
        toEmail: testEmailTo,
        host: smtpForm.host,
        port: Number(smtpForm.port),
        user: smtpForm.user,
        pass: smtpForm.pass,
        senderEmail: smtpForm.senderEmail,
        senderName: smtpForm.senderName,
      });
      if (res.success) {
        toast.success(res.message || 'Test email dispatched successfully!');
        setIsTestEmailModalOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'SMTP Test failed. Check credentials.');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 capitalize">{tab.replace('-', ' ')}</h1>
        {['dashboard', 'products', 'inventory'].includes(tab) && (
          <>
            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors">
              <Plus className="h-3.5 w-3.5" /> Bulk CSV Import
            </button>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Urgent Pending Orders Approval Banner */}
            {pendingOrdersSummary.length > 0 && (
              <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 p-6 shadow-md animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md animate-bounce">
                      <Bell className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                        <span>Action Required: {pendingOrdersSummary.length} New Order(s) Awaiting Decision</span>
                        <span className="rounded-full bg-rose-600 text-white text-[10px] font-black px-2 py-0.5">Urgent</span>
                      </h2>
                      <p className="text-xs text-amber-900/80 mt-0.5">
                        Customer orders placed on the bookstore require your review to accept, cancel, or notify regarding publisher stock delay.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/admin/dashboard?tab=orders')}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all"
                  >
                    Review Pending Orders <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { icon: IndianRupee, t: 'Revenue (30d)', v: formatINR(stats.revenue), s: '+18.2% vs last month', c: 'emerald' },
                { icon: ShoppingCart, t: 'Orders (30d)', v: (stats.totalOrders || 0).toLocaleString('en-IN'), s: '+12.4% vs last month', c: 'blue' },
                { icon: BookOpen, t: 'Total Books', v: stats.totalBooks || 0, s: `${stats.outOfStock} out of stock`, c: 'amber' },
                { icon: Users, t: 'Total Users', v: stats.totalUsers || 0, s: 'Active base', c: 'violet' },
              ].map((k) => (
                <div key={k.t} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <k.icon className="h-5 w-5 text-emerald-700" />
                  <p className="mt-3 text-2xl font-extrabold text-slate-900">{k.v}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{k.t}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">{k.s}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-bold text-slate-800">Recent Orders</p>
                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
                  </div>
                  <div className="space-y-4">
                    {((stats as any).recentOrders || []).map((o: any) => (
                      <div key={o.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{o.orderNumber}</p>
                          <p className="text-xs text-slate-500 mt-1">{o.user?.name || 'Guest'} · {o.items?.length || 0} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">{formatINR(o.totalAmount)}</p>
                          <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${o.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {!(stats as any).recentOrders?.length && <p className="text-sm text-slate-500">No recent orders found.</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-sm font-bold text-slate-800">Top Categories</p>
                    {categories.slice(0, 5).map((c, i) => {
                      const pct = [92, 78, 64, 55, 41][i] || Math.floor(Math.random() * 50) + 10;
                      return (
                        <div key={c.slug} className="mb-3.5 last:mb-0">
                          <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-slate-700">{c.name}</span><span className="text-slate-500 font-medium">{pct}%</span></div>
                          <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <p className="mb-4 text-sm font-bold text-slate-800">Coupon Usage & Marketing</p>
                    <div className="flex flex-col h-full justify-center text-center text-sm text-slate-500 p-4 border-2 border-dashed border-slate-100 rounded-lg">
                      <p className="font-medium text-slate-600 mb-1">Coupon System Pending</p>
                      <p className="text-xs">Analytics will appear here once the coupon module is fully implemented.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-rose-800 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Low Stock Alerts</p>
                    <span className="bg-rose-200 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">{stats.lowStock || 0}</span>
                  </div>
                  <div className="space-y-3">
                    {lowStockBooks.map((b) => (
                      <div key={b.id} className="flex flex-col border-b border-rose-200/50 pb-3 text-sm last:border-0 last:pb-0">
                        <span className="line-clamp-2 font-medium text-rose-900 leading-tight">{b.title}</span>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="font-mono text-xs text-rose-700">{b.isbn || 'No ISBN'}</span>
                          <span className="shrink-0 rounded bg-white px-2 py-0.5 text-xs font-bold text-rose-700 shadow-sm">
                            {getStock(b.id, b.stock)} left
                          </span>
                        </div>
                      </div>
                    ))}
                    {lowStockBooks.length === 0 && <p className="text-xs text-rose-600">All stock levels are healthy.</p>}
                  </div>
                  <button className="w-full mt-4 bg-white border border-rose-200 text-rose-700 text-xs font-bold py-2 rounded-lg hover:bg-rose-100 transition-colors">
                    Manage Inventory
                  </button>
                </div>
                
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="mb-4 text-sm font-bold text-slate-800">Latest Reviews</p>
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-800">Great Quality</span>
                        <span className="text-amber-500 text-xs tracking-wider">★★★★★</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">"The book arrived in perfect condition and the content is exactly what I needed for my exams."</p>
                    </div>
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-800">Fast Delivery</span>
                        <span className="text-amber-500 text-xs tracking-wider">★★★★☆</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">"Delivered within 2 days. The packaging could be slightly better but overall good."</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'products' && <ProductsWorkspace />}
        {tab === 'orders' && (() => {
          // Filter orders according to Flipkart fulfillment stages
          const getStageOrders = (stg: string) => {
            return orders.filter(o => {
              if (stg === 'to_accept') return o.status === 'PENDING';
              if (stg === 'to_pack') return o.status === 'CONFIRMED';
              if (stg === 'to_dispatch') return o.status === 'PROCESSING';
              if (stg === 'in_transit') return o.status === 'SHIPPED';
              if (stg === 'pending_service') return Boolean(o.notes && o.status === 'PENDING');
              if (stg === 'completed') return o.status === 'DELIVERED';
              if (stg === 'upcoming') return false;
              return true;
            });
          };

          const toAcceptCount = getStageOrders('to_accept').length;
          const toPackCount = getStageOrders('to_pack').length;
          const toDispatchCount = getStageOrders('to_dispatch').length;
          const inTransitCount = getStageOrders('in_transit').length;
          const pendingServiceCount = getStageOrders('pending_service').length;
          const returnsCount = getStageOrders('returns').length;
          const cancellationsCount = getStageOrders('cancellations').length;
          const completedCount = getStageOrders('completed').length;

          const activeStageOrders = getStageOrders(forwardStage).filter(o => {
            if (!orderSearchQuery.trim()) return true;
            const q = orderSearchQuery.toLowerCase().trim();
            const ordNum = (o.orderNumber || '').toLowerCase();
            const custName = (o.address?.fullName || o.address?.name || o.user?.name || '').toLowerCase();
            const custEmail = (o.user?.email || '').toLowerCase();
            const phone = (o.address?.phone || o.user?.phone || '').toLowerCase();
            const city = (o.address?.city || '').toLowerCase();
            const pincode = (o.address?.pincode || '').toLowerCase();
            const tracking = (o.trackingNumber || '').toLowerCase();

            const hasItem = Array.isArray(o.items) && o.items.some((i: any) => {
              const b = i.book || {};
              const title = (b.title || '').toLowerCase();
              const rawSku = (b.sku || '').toLowerCase();
              const formattedSku = formatClientSku(b).toLowerCase();
              const rawIsbn = (b.isbn13 || b.isbn10 || b.isbn || '').toLowerCase();
              const formattedFsn = formatClientFsn(b).toLowerCase();
              const publisher = (b.publisher?.name || b.publisher || '').toLowerCase();
              const author = (b.author || '').toLowerCase();

              return (
                title.includes(q) ||
                rawSku.includes(q) ||
                formattedSku.includes(q) ||
                rawIsbn.includes(q) ||
                formattedFsn.includes(q) ||
                publisher.includes(q) ||
                author.includes(q)
              );
            });

            return (
              ordNum.includes(q) ||
              custName.includes(q) ||
              custEmail.includes(q) ||
              phone.includes(q) ||
              city.includes(q) ||
              pincode.includes(q) ||
              tracking.includes(q) ||
              hasItem
            );
          });

          // Smart groups: combined user packages
          const smartGroups = getSmartGroups(activeStageOrders);

          // Flattened order items for normal separate book rows view (grouped consistently with smart consignments)
          const flattenedBookItems = smartGroups.flatMap((grp: any) => {
            if (!Array.isArray(grp.items) || grp.items.length === 0) {
              return [{
                rowId: `${grp.order.id}_default`,
                order: grp.order,
                item: null,
                book: { title: 'Book Order', sku: 'TW-ORDER', isbn13: grp.order.orderNumber },
                quantity: 1,
                price: grp.order.totalAmount,
                isBundled: grp.isMultiOrder,
              }];
            }
            return grp.items.map((it: any, idx: number) => {
              const itemOrder = grp.orders.find((o: any) => 
                Array.isArray(o.items) && o.items.some((subIt: any) => subIt.id === it.id || (subIt.bookId && subIt.bookId === it.bookId))
              ) || grp.order;

              return {
                rowId: `${itemOrder.id}_${it.id || idx}`,
                order: itemOrder,
                item: it,
                book: it.book || {},
                quantity: it.quantity || 1,
                price: it.priceAtPurchase || (it.quantity ? itemOrder.totalAmount / it.quantity : itemOrder.totalAmount),
                isBundled: grp.isMultiOrder,
              };
            });
          });
          const totalOrdersInActiveStage = activeStageOrders.length;

          return (
            <div className="space-y-4">
              {/* Flipkart Seller Hub Header */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black tracking-tight text-slate-900">Forward Orders</h2>
                  </div>

                  {/* Search bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search by Order ID (TW-...), SKU, ISBN-13, Book Name, Customer, Phone..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                    />
                    {orderSearchQuery && (
                      <button
                        onClick={() => setOrderSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Flow Stage Pipeline Cards */}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8 border-t border-slate-100 pt-4">
                  {[
                    { id: 'to_accept', count: toAcceptCount, label: 'To Accept' },
                    { id: 'to_pack', count: toPackCount, label: 'To Pack' },
                    { id: 'to_dispatch', count: toDispatchCount, label: 'To Dispatch' },
                    { id: 'in_transit', count: inTransitCount, label: 'In Transit' },
                    { id: 'pending_service', count: pendingServiceCount, label: 'Pending Service' },
                    { id: 'returns', count: returnsCount, label: 'Returns' },
                    { id: 'cancellations', count: cancellationsCount, label: 'Cancellations' },
                    { id: 'completed', count: completedCount, label: 'Completed' },
                  ].map((stg) => {
                    const isActive = forwardStage === stg.id;
                    return (
                      <button
                        key={stg.id}
                        onClick={() => {
                          setForwardStage(stg.id as any);
                          setSelectedGroupKeys(new Set());
                          setSelectedOrderIds(new Set());
                        }}
                        className={`flex flex-col items-start justify-between rounded-xl p-3 text-left transition-all border ${
                          isActive
                            ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xl font-black tracking-tight text-slate-900">{stg.count}</span>
                        <span className={`mt-1 text-xs font-bold ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
                          {stg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* SLA 2:00 PM Cutoff Dispatch Notification Banner */}
                {toAcceptCount > 0 && forwardStage === 'to_accept' && (() => {
                  const currentHour = new Date().getHours();
                  const isBefore2PM = currentHour < 14;
                  return (
                    <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-xs border shadow-sm transition-all ${
                      isBefore2PM
                        ? 'bg-blue-50/90 border-blue-300 text-blue-950'
                        : 'bg-amber-50/90 border-amber-300 text-amber-950'
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        <Clock className={`h-4 w-4 ${isBefore2PM ? 'text-blue-600' : 'text-amber-700'}`} />
                        {isBefore2PM ? (
                          <span>
                            ✓ <b>Same Day Dispatch Batch</b>: Orders placed before 2:00 PM ({toAcceptCount} pending approval for today's pickup)
                          </span>
                        ) : (
                          <span>
                            ✓ <b>Next Day Dispatch Batch</b>: Orders placed after 2:00 PM ({toAcceptCount} scheduled for tomorrow's pickup)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-sm ${
                          isBefore2PM
                            ? 'bg-white text-blue-700 border-blue-200'
                            : 'bg-white text-amber-800 border-amber-200'
                        }`}>
                          {isBefore2PM ? '⚡ Same Day Dispatch' : '🕒 Next Day Dispatch'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
                          India Post Speed Post
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Toolbar & Filters */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left Filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mr-1">
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
                    </div>

                    <select
                      value={selectedLogisticsFilter}
                      onChange={(e) => setSelectedLogisticsFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="ALL">Logistics Partner: India Post</option>
                      <option value="INDIA_POST">Speed Post (National)</option>
                      <option value="LOCAL">Kolkata Local Courier</option>
                    </select>

                    <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-black text-slate-700">
                      # Total {orderViewMode === 'smart_groups' ? `${smartGroups.length} groups (${totalOrdersInActiveStage} orders)` : `${totalOrdersInActiveStage} orders`}
                    </span>
                  </div>

                  {/* Right View Switcher & Actions */}
                  <div className="flex items-center gap-3">
                    {/* View Switcher: Smart Groups vs Order ID */}
                    <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                      <button
                        onClick={() => setOrderViewMode('smart_groups')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                          orderViewMode === 'smart_groups'
                            ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${orderViewMode === 'smart_groups' ? 'fill-blue-600 text-blue-600' : 'text-slate-400'}`} />
                        <span>Smart Groups</span>
                      </button>

                      <button
                        onClick={() => setOrderViewMode('order_id')}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                          orderViewMode === 'order_id'
                            ? 'bg-white text-blue-700 shadow-sm font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Box className="h-3.5 w-3.5 text-slate-500" />
                        <span>Order ID</span>
                      </button>
                    </div>

                    {/* Other Actions Dropdown */}
                    <div className="relative" ref={otherActionsRef}>
                      <button
                        onClick={() => setIsOtherActionsOpen(!isOtherActionsOpen)}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                      >
                        <span>Other Actions</span>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      </button>

                      {isOtherActionsOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-xl z-30 py-1 text-xs font-semibold text-slate-700">
                          <button
                            onClick={() => {
                              const csvRows = ['OrderNumber,Customer,Phone,TotalAmount,Status,Date'];
                              activeStageOrders.forEach(o => {
                                csvRows.push(`${o.orderNumber},"${o.address?.name || o.user?.name || ''}",${o.address?.phone || ''},${o.totalAmount},${o.status},"${new Date(o.createdAt).toISOString()}"`);
                              });
                              const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `orders_${forwardStage}_${Date.now()}.csv`;
                              a.click();
                              setIsOtherActionsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Download className="h-3.5 w-3.5 text-slate-500" /> Download Order List (.csv)
                          </button>
                          <button
                            onClick={() => {
                              setIsOtherActionsOpen(false);
                              handleBatchAcceptSelected();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-700 font-bold"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept All Selected
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Accept Orders Primary Action */}
                    {forwardStage === 'to_accept' && (
                      <button
                        onClick={handleBatchAcceptSelected}
                        disabled={isBatchAccepting || (selectedGroupKeys.size === 0 && selectedOrderIds.size === 0)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-blue-700 shadow transition-all disabled:opacity-50"
                      >
                        {isBatchAccepting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Accept Orders
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content: Smart Groups View */}
              {/* Main Content: Smart Groups View (Consolidates all books ordered by one user at same time) */}
              {orderViewMode === 'smart_groups' && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[480px] pb-44 overflow-visible">
                  {smartGroups.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                      <Box className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <h4 className="text-base font-bold text-slate-800">No orders in "{forwardStage.replace('_', ' ').toUpperCase()}" stage</h4>
                      <p className="text-xs text-slate-500 mt-1">Orders placed by customers will automatically populate in User Smart Groups here.</p>
                    </div>
                  ) : (
                    <div className="overflow-visible">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="w-10 px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedGroupKeys.size === smartGroups.length && smartGroups.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedGroupKeys(new Set(smartGroups.map(g => g.key)));
                                  } else {
                                    setSelectedGroupKeys(new Set());
                                  }
                                }}
                                className="rounded border-slate-300"
                              />
                            </th>
                            <th className="px-4 py-3 min-w-[140px]">Customer & Order</th>
                            <th className="px-4 py-3 min-w-[360px]">All Books in this User's Consignment</th>
                            <th className="px-4 py-3 min-w-[200px]">Postal Destination & SLA</th>
                            <th className="px-4 py-3 text-right min-w-[160px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {smartGroups.map((grp: any) => {
                            const isSelected = selectedGroupKeys.has(grp.key);
                            const isExpanded = expandedGroupKeys.has(grp.key);
                            const ord = grp.order;

                            // Calculate 2:00 PM Dispatch SLA
                            const orderHour = ord?.createdAt ? new Date(ord.createdAt).getHours() : 12;
                            const isSameDay = orderHour < 14;

                            return (
                              <React.Fragment key={grp.key}>
                                <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                                  {/* Checkbox */}
                                  <td className="px-4 py-4 text-center align-top">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        const next = new Set(selectedGroupKeys);
                                        if (e.target.checked) next.add(grp.key);
                                        else next.delete(grp.key);
                                        setSelectedGroupKeys(next);
                                      }}
                                      className="rounded border-slate-300 mt-1"
                                    />
                                  </td>

                                  {/* Customer & Order ID */}
                                  <td className="px-4 py-4 align-top space-y-1">
                                    <div className="flex flex-wrap items-center gap-1">
                                      {grp.orderNumbers.map((num: string, nIdx: number) => {
                                        const thisOrd = grp.orders[nIdx] || ord;
                                        return (
                                          <button
                                            key={num}
                                            onClick={() => setPreviewOrder(thisOrd)}
                                            className="font-extrabold text-blue-600 hover:underline hover:text-blue-800 cursor-pointer text-left font-mono inline-block text-xs"
                                            title="Click to view full consignment details"
                                          >
                                            #{num}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 font-mono">
                                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                      {new Date(grp.createdAt || ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, {new Date(grp.createdAt || ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                    {grp.isMultiOrder && (
                                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                                        📦 {grp.orderCount} Orders Bundled
                                      </span>
                                    )}
                                    <span
                                      onClick={() => {
                                        setCustomerSearchQuery(grp.customerName);
                                        navigate('/admin/dashboard?tab=customers');
                                      }}
                                      className="font-bold text-slate-900 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1 text-xs"
                                      title="Click to view customer profile"
                                    >
                                      {grp.customerName}
                                      <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                                    </span>
                                    <span className="text-[10px] text-slate-400 block font-mono">
                                      📞 {grp.customerPhone}
                                    </span>
                                  </td>

                                  {/* Books Ordered by this user at same time */}
                                  <td className="px-4 py-4 align-top">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-extrabold text-blue-700 shadow-sm">
                                          <Box className="h-3 w-3" />
                                          {grp.totalBookCount} {grp.totalBookCount === 1 ? 'Book in Package' : 'Books Combined in Package'}
                                        </span>
                                        <button
                                          onClick={() => {
                                            const next = new Set(expandedGroupKeys);
                                            if (isExpanded) next.delete(grp.key);
                                            else next.add(grp.key);
                                            setExpandedGroupKeys(next);
                                          }}
                                          className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-0.5"
                                        >
                                          {isExpanded ? 'Hide breakdown' : 'View all items'}
                                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </button>
                                      </div>

                                      {/* Primary / Collage Books Display */}
                                      <div className="grid gap-1.5">
                                        {grp.items.slice(0, 2).map((it: any, iIdx: number) => {
                                          const bk = it.book || {};
                                          return (
                                            <div key={iIdx} className="flex items-start gap-2.5 bg-slate-50/80 rounded-lg p-1.5 border border-slate-100">
                                              <span className="flex h-5 w-5 items-center justify-center rounded bg-white border border-slate-200 text-[10px] font-extrabold text-slate-700 shrink-0">
                                                {it.quantity || 1}×
                                              </span>
                                              <div className="h-8 w-6 rounded bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                {bk.coverUrl ? (
                                                  <img src={bk.coverUrl} alt={bk.title} className="h-full w-full object-cover" />
                                                ) : (
                                                  <span className="text-[10px]">📖</span>
                                                )}
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                <h5
                                                  onClick={() => setPreviewBook(bk)}
                                                  className="font-bold text-slate-800 line-clamp-1 hover:text-blue-600 cursor-pointer hover:underline text-xs"
                                                >
                                                  {bk.title || 'Academic Book'}
                                                </h5>
                                                <p className="text-[10px] font-mono text-slate-500">
                                                  SKU: {getDisplaySku(bk)} · FSN: {getDisplayFsn(bk)}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                        {grp.items.length > 2 && (
                                          <p className="text-[10px] font-bold text-slate-500 pl-1">
                                            +{grp.items.length - 2} more books in this user's shipment
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Postal Destination & India Post Route / Store Takeaway Desk */}
                                  <td className="px-4 py-4 align-top space-y-1">
                                    {grp.isSelfPickup || ord.shippingMethod === 'SELF_PICKUP' ? (
                                      <>
                                        <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                                          <Store className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                          <b>College Street Desk</b>
                                        </p>
                                        <p className="text-[10px] text-slate-600 leading-tight">
                                          90/6A, MG Rd, opp. Grace Cinema
                                        </p>
                                        <p className="text-[10px] text-slate-700">
                                          Collector: <b>{grp.customerName}</b> ({grp.customerPhone})
                                        </p>
                                        <div className="pt-1">
                                          {ord.selectedPickupSlot ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200">
                                              📅 {ord.selectedPickupSlot}
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-800 border-amber-200">
                                              ⏳ {ord.pickupStatus === 'SLOTS_OFFERED' ? 'Slots Offered (Awaiting User)' : 'Slots Needed'}
                                            </span>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-[11px] text-slate-800 font-semibold">
                                          🏤 <b>{grp.postOffice}</b>
                                        </p>
                                        <p className="text-[11px] text-slate-600">
                                          {grp.city}, {grp.state} — <b>{grp.pincode}</b>
                                        </p>
                                        {grp.landmark && (
                                          <p className="text-[10px] text-slate-500">
                                            📍 Landmark: {grp.landmark}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-1.5 pt-1">
                                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            isSameDay
                                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                                              : 'bg-amber-50 text-amber-800 border-amber-200'
                                          }`}>
                                            {isSameDay ? '⚡ Same Day 2PM' : '🕒 Next Day 2PM'}
                                          </span>
                                          <span className="text-[11px] font-mono font-bold text-slate-900">
                                            {grp.priceDisplay}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </td>

                                  {/* Action Buttons */}
                                  <td className="px-4 py-4 text-right align-top">
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      {ord.status === 'PENDING' && (
                                        <button
                                          onClick={async () => {
                                            for (const o of grp.orders) {
                                              await handleAcceptOrder(o);
                                            }
                                          }}
                                          className="h-7 px-2.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                        >
                                          <CheckCircle2 className="h-3 w-3" /> Accept {grp.isMultiOrder ? `All (${grp.orderCount})` : ''}
                                        </button>
                                      )}
                                      {ord.status === 'CONFIRMED' && (
                                        <button
                                          onClick={async () => {
                                            for (const o of grp.orders) {
                                              await updateOrderStatus(o.id, 'PROCESSING');
                                            }
                                          }}
                                          className="h-7 px-2.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                        >
                                          <Package className="h-3 w-3" /> Pack Parcel
                                        </button>
                                      )}
                                      {/* STORE PICKUP ACTIONS DISABLED PER CLIENT REQUEST - RETAINED FOR FUTURE RE-ENABLING */}
                                      {false && ord.shippingMethod === 'SELF_PICKUP' ? (
                                        <>
                                          {ord.pickupStatus === 'PENDING_SLOTS' || !ord.pickupSlots || ord.pickupStatus === 'NONE' ? (
                                            <button
                                              onClick={() => {
                                                setPickupSlotsModalOrder(ord);
                                                try {
                                                  if (ord.pickupSlots) {
                                                    const parsed = JSON.parse(ord.pickupSlots);
                                                    if (Array.isArray(parsed) && parsed.length > 0) setPickupSlotInputs(parsed);
                                                  }
                                                } catch (_e) {}
                                              }}
                                              className="h-7 px-2.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all whitespace-nowrap"
                                            >
                                              <CalendarCheck className="h-3 w-3" /> Set Pickup Slots
                                            </button>
                                          ) : ord.pickupStatus === 'SLOTS_OFFERED' ? (
                                            <div className="flex items-center gap-1">
                                              <span className="rounded bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-extrabold">
                                                ⏱️ Slots Offered
                                              </span>
                                              <button
                                                onClick={() => {
                                                  setPickupSlotsModalOrder(ord);
                                                  try {
                                                    if (ord.pickupSlots) {
                                                      const parsed = JSON.parse(ord.pickupSlots);
                                                      if (Array.isArray(parsed) && parsed.length > 0) setPickupSlotInputs(parsed);
                                                    }
                                                  } catch (_e) {}
                                                }}
                                                className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-bold"
                                              >
                                                Edit
                                              </button>
                                            </div>
                                          ) : ord.pickupStatus === 'SLOT_CONFIRMED' ? (
                                            <button
                                              disabled={isCollectingOrder === ord.id}
                                              onClick={() => handleMarkOrderCollected(ord.id)}
                                              className="h-7 px-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-extrabold inline-flex items-center justify-center gap-1 shadow-sm transition-all whitespace-nowrap"
                                            >
                                              {isCollectingOrder === ord.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Store className="h-3 w-3" />}
                                              Hand Over Book
                                            </button>
                                          ) : (
                                    <span className="rounded bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                                              ✅ Collected
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        ord.status === 'PROCESSING' && !ord.trackingNumber && (
                                          ord.shippingMethod === 'SPEED_POST' ? (
                                            <button
                                              onClick={() => bookIndiaPostShipment(ord.id)}
                                              className="relative h-7 px-2.5 rounded-lg text-white text-xs font-bold inline-flex items-center justify-center gap-1 overflow-hidden shadow-sm"
                                            >
                                              <span
                                                className="absolute -inset-[150%] m-auto aspect-square pointer-events-none animate-spin"
                                                style={{
                                                  background: 'conic-gradient(from 0deg, transparent 0deg, transparent 340deg, #fb923c 360deg)',
                                                }}
                                              />
                                              <span
                                                className="absolute inset-[1.5px] rounded-[6.5px] bg-[#ea580c]"
                                              />
                                              <span className="relative z-10 flex items-center gap-1"><Truck className="h-3 w-3" /> Speed Post</span>
                                            </button>
                                          ) : ord.shippingMethod === 'EXPRESS_LOCAL' ? (
                                            <button
                                              onClick={() => {
                                                setExpressPartner('');
                                                setExpressAgentPhone('');
                                                setExpressModalOrder(ord.id);
                                              }}
                                              className="h-7 px-2.5 rounded-lg text-white hover:brightness-110 text-xs font-bold inline-flex items-center gap-1 shadow-sm transition-all"
                                              style={{ background: 'linear-gradient(135deg, #3b0764, #581c87)' }}
                                            >
                                              <Zap className="h-3 w-3" /> Express
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => bookIndiaPostShipment(ord.id)}
                                              className="h-7 px-2.5 rounded-lg bg-red-700 text-white hover:bg-red-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all whitespace-nowrap"
                                            >
                                              <Package className="h-3 w-3" /> Book Post
                                            </button>
                                          )
                                        )
                                      )}
                                      {ord.trackingNumber && (
                                        <>
                                          <button
                                            onClick={() => openShippingLabel(ord.id)}
                                            className="h-7 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                          >
                                            <Printer className="h-3 w-3" /> Label
                                          </button>
                                          <button
                                            onClick={() => openTrackingModal(ord.trackingNumber || ord.orderNumber)}
                                            className="h-7 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                          >
                                            <Truck className="h-3 w-3" /> Track
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => openEmailModal(ord, 'DELAY_NOTICE')}
                                        className="h-7 px-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold inline-flex items-center justify-center gap-1 transition-all"
                                      >
                                        <Mail className="h-3 w-3" /> Delay
                                      </button>
                                      <button
                                        onClick={() => setRejectModalOrder(ord)}
                                        className="h-7 px-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold inline-flex items-center justify-center gap-1 transition-all"
                                      >
                                        <XCircle className="h-3 w-3" /> Reject
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Expanded Full Item Breakdown */}
                                {isExpanded && (
                                  <tr className="bg-slate-50/70 border-y border-slate-200/80">
                                    <td colSpan={5} className="px-6 py-4">
                                      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                        <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                                          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                                            All {grp.items.length} Books in Consignment #{grp.orderNumber}
                                          </span>
                                          <span className="text-xs font-bold text-slate-600">
                                            Package Weight: {grp.weight} · Box: {grp.dimensions}
                                          </span>
                                        </div>
                                        <table className="w-full text-left text-xs">
                                          <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                                            <tr>
                                              <th className="px-4 py-2">Book Title & Details</th>
                                              <th className="px-4 py-2">SKU ID</th>
                                              <th className="px-4 py-2">ISBN / FSN</th>
                                              <th className="px-4 py-2 text-center">Quantity</th>
                                              <th className="px-4 py-2 text-right">Price</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {grp.items.map((it: any, sIdx: number) => {
                                              const bk = it.book || {};
                                              return (
                                                <tr key={sIdx} className="hover:bg-slate-50">
                                                  <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2.5">
                                                      <div className="h-10 w-8 rounded border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                        {bk.coverUrl ? (
                                                          <img src={bk.coverUrl} alt={bk.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                          <span className="text-xs">📖</span>
                                                        )}
                                                      </div>
                                                      <div>
                                                        <h6
                                                          onClick={() => setPreviewBook(bk)}
                                                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer"
                                                        >
                                                          {bk.title || 'Book Title'}
                                                        </h6>
                                                        <span className="text-[10px] text-slate-400">
                                                          {bk.author || (Array.isArray(bk.authors) ? bk.authors.map((a: any) => a.name).join(', ') : '')}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-4 py-2.5 font-mono text-slate-700 font-semibold">
                                                    {getDisplaySku(bk)}
                                                  </td>
                                                  <td className="px-4 py-2.5 font-mono text-slate-700">
                                                    {getDisplayFsn(bk)}
                                                  </td>
                                                  <td className="px-4 py-2.5 text-center font-extrabold text-slate-900">
                                                    {it.quantity || 1}
                                                  </td>
                                                  <td className="px-4 py-2.5 text-right font-extrabold text-slate-900">
                                                    ₹{it.priceAtPurchase || (it.quantity ? ord.totalAmount / it.quantity : ord.totalAmount)}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {orderViewMode === 'order_id' && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[420px] pb-32">
                  {flattenedBookItems.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                      <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <h4 className="text-base font-bold text-slate-800">No books found in this stage</h4>
                    </div>
                  ) : (
                    <div className="overflow-visible">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="w-10 px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedOrderIds.size === activeStageOrders.length && activeStageOrders.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedOrderIds(new Set(activeStageOrders.map(o => o.id)));
                                  else setSelectedOrderIds(new Set());
                                }}
                                className="rounded border-slate-300"
                              />
                            </th>
                            <th className="px-4 py-3 min-w-[130px]">Order ID</th>
                            <th className="px-4 py-3 min-w-[320px]">Individual Book Details</th>
                            <th className="px-4 py-3 min-w-[120px] text-center">Quantity & Price</th>
                            <th className="px-4 py-3 min-w-[200px]">Recipient & Post Office</th>
                            <th className="px-4 py-3 text-right min-w-[160px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {flattenedBookItems.map((entry: any) => {
                            const ord = entry.order;
                            const book = entry.book || {};
                            const isSelected = selectedOrderIds.has(ord.id);

                            return (
                              <tr key={entry.rowId} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                                <td className="px-4 py-4 text-center align-top">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const next = new Set(selectedOrderIds);
                                      if (e.target.checked) next.add(ord.id);
                                      else next.delete(ord.id);
                                      setSelectedOrderIds(next);
                                    }}
                                    className="rounded border-slate-300 mt-1"
                                  />
                                </td>

                                <td className="px-4 py-4 align-top space-y-0.5">
                                  <button
                                    onClick={() => setPreviewOrder(ord)}
                                    className="font-extrabold text-blue-600 block hover:underline hover:text-blue-800 cursor-pointer text-left font-mono"
                                    title="Click to view delivery address and order details"
                                  >
                                    {ord.orderNumber}
                                  </button>
                                  {entry.isBundled && (
                                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                                      📦 Bundled Package
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 block font-mono">
                                    {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-top">
                                  <div className="flex items-start gap-3">
                                    <div className="h-12 w-9 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                                      {book.coverUrl ? (
                                        <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                                      ) : (
                                        <span className="text-xs">📖</span>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-0.5">
                                      <h4
                                        onClick={() => setPreviewBook(book)}
                                        className="font-bold text-slate-900 line-clamp-1 hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                                        title="Click to view book details"
                                      >
                                        <span>{book.title || 'Academic Book'}</span>
                                        <ExternalLink className="h-3 w-3 text-slate-400 shrink-0" />
                                      </h4>
                                      <p className="text-[11px] font-mono text-slate-600">
                                        <span className="font-bold text-slate-800">SKU:</span> {getDisplaySku(book)} <span className="text-slate-300">|</span> <span className="font-bold text-slate-800">FSN:</span> {getDisplayFsn(book)}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-4 align-top text-center space-y-0.5">
                                  <span className="inline-block rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-extrabold text-slate-800">
                                    Qty: {entry.quantity}
                                  </span>
                                  <p className="text-xs font-extrabold text-slate-900">
                                    ₹{entry.price}
                                  </p>
                                </td>

                                <td className="px-4 py-4 align-top space-y-0.5">
                                  {ord.shippingMethod === 'SELF_PICKUP' ? (
                                    <>
                                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 text-[10px] font-extrabold mb-1">
                                        🏪 Store Takeaway
                                      </span>
                                      <p className="font-bold text-slate-900 flex items-center gap-1">
                                        {ord.pickupName || ord.user?.name || 'Customer Collector'}
                                      </p>
                                      <p className="text-[11px] text-slate-700 font-semibold">
                                        📞 {ord.pickupPhone || ord.user?.phone || 'No phone'}
                                      </p>
                                      <p className="text-[10px] text-emerald-800 font-medium">
                                        📍 College Street Takeaway Desk
                                      </p>
                                      {ord.selectedPickupSlot && (
                                        <p className="text-[10px] text-purple-700 font-bold bg-purple-50 rounded px-1 py-0.5 mt-0.5">
                                          ⏰ {ord.selectedPickupSlot}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <p
                                        onClick={() => {
                                          const custName = ord.address?.name || ord.address?.fullName || ord.user?.name || 'Customer';
                                          setCustomerSearchQuery(custName);
                                          navigate('/admin/dashboard?tab=customers');
                                        }}
                                        className="font-bold text-slate-900 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                                        title="Click to view customer details"
                                      >
                                        {ord.address?.name || ord.address?.fullName || ord.user?.name || 'Customer'}
                                        <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                                      </p>
                                      <p className="text-[11px] text-slate-700 font-semibold">
                                        🏤 {ord.address?.postOffice || 'Local Post Office'}
                                      </p>
                                      <p className="text-[10px] text-slate-500">
                                        {ord.address?.city || 'City'}, {ord.address?.state || 'State'} — <b>{ord.address?.pincode}</b>
                                      </p>
                                    </>
                                  )}
                                </td>

                                <td className="px-4 py-4 text-right align-top">
                                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                    {ord.status === 'PENDING' && (
                                      <button
                                        onClick={() => handleAcceptOrder(ord)}
                                        className="h-7 px-2.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                      >
                                        <CheckCircle2 className="h-3 w-3" /> Accept
                                      </button>
                                    )}
                                    {ord.status === 'CONFIRMED' && (
                                      <button
                                        onClick={() => updateOrderStatus(ord.id, 'PROCESSING')}
                                        className="h-7 px-2.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                      >
                                        <Package className="h-3 w-3" /> Pack Order
                                      </button>
                                    )}
                                    {false && ord.shippingMethod === 'SELF_PICKUP' ? (
                                      <>
                                        {ord.pickupStatus === 'PENDING_SLOTS' || !ord.pickupSlots || ord.pickupStatus === 'NONE' ? (
                                          <button
                                            onClick={() => {
                                              setPickupSlotsModalOrder(ord);
                                              try {
                                                if (ord.pickupSlots) {
                                                  const parsed = JSON.parse(ord.pickupSlots);
                                                  if (Array.isArray(parsed) && parsed.length > 0) setPickupSlotInputs(parsed);
                                                }
                                              } catch (_e) {}
                                            }}
                                            className="h-7 px-2.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all whitespace-nowrap"
                                          >
                                            <CalendarCheck className="h-3 w-3" /> Set Pickup Slots
                                          </button>
                                        ) : ord.pickupStatus === 'SLOTS_OFFERED' ? (
                                          <div className="flex items-center gap-1">
                                            <span className="rounded bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-extrabold">
                                              ⏱️ Slots Offered
                                            </span>
                                            <button
                                              onClick={() => {
                                                setPickupSlotsModalOrder(ord);
                                                try {
                                                  if (ord.pickupSlots) {
                                                    const parsed = JSON.parse(ord.pickupSlots);
                                                    if (Array.isArray(parsed) && parsed.length > 0) setPickupSlotInputs(parsed);
                                                  }
                                                } catch (_e) {}
                                              }}
                                              className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[11px] font-bold"
                                            >
                                              Edit
                                            </button>
                                          </div>
                                        ) : ord.pickupStatus === 'SLOT_CONFIRMED' ? (
                                          <button
                                            disabled={isCollectingOrder === ord.id}
                                            onClick={() => handleMarkOrderCollected(ord.id)}
                                            className="h-7 px-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-extrabold inline-flex items-center justify-center gap-1 shadow-sm transition-all whitespace-nowrap"
                                          >
                                            {isCollectingOrder === ord.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Store className="h-3 w-3" />}
                                            Hand Over Book
                                          </button>
                                        ) : (
                                          <span className="rounded bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-bold">
                                            ✅ Collected
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {ord.status === 'PROCESSING' && !ord.trackingNumber && (
                                          ord.shippingMethod === 'SPEED_POST' ? (
                                            <button
                                              onClick={() => bookIndiaPostShipment(ord.id)}
                                              className="relative h-7 px-2.5 rounded-lg text-white text-xs font-bold inline-flex items-center gap-1 overflow-hidden"
                                              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                                            >
                                              <span className="absolute inset-0 rounded-lg" style={{
                                                background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,200,100,0.8) 10%, transparent 20%)',
                                                animation: 'spin 2s linear infinite',
                                              }} />
                                              <span className="absolute inset-[2px] rounded-md" style={{
                                                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                              }} />
                                              <span className="relative z-10 flex items-center gap-1"><Truck className="h-3 w-3" /> Speed Post</span>
                                            </button>
                                          ) : ord.shippingMethod === 'EXPRESS_LOCAL' ? (
                                            <button
                                              onClick={() => {
                                                setExpressPartner('');
                                                setExpressAgentPhone('');
                                                setExpressModalOrder(ord.id);
                                              }}
                                              className="h-7 px-2.5 rounded-lg text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                                              style={{ background: 'linear-gradient(135deg, #581c87, #7e22ce)' }}
                                            >
                                              <Zap className="h-3 w-3" /> Express
                                            </button>
                                          ) : (
                                            <button
                                              onClick={() => bookIndiaPostShipment(ord.id)}
                                              className="h-7 px-2.5 rounded-lg bg-red-700 text-white hover:bg-red-800 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all whitespace-nowrap"
                                            >
                                              <Package className="h-3 w-3" /> Book Post
                                            </button>
                                          )
                                        )}
                                        {ord.trackingNumber && (
                                          <>
                                            <button
                                              onClick={() => openShippingLabel(ord.id)}
                                              className="h-7 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                            >
                                              <Printer className="h-3 w-3" /> Label
                                            </button>
                                            <button
                                              onClick={() => openTrackingModal(ord.trackingNumber || ord.orderNumber)}
                                              className="h-7 px-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold inline-flex items-center justify-center gap-1 shadow-sm transition-all"
                                            >
                                              <Truck className="h-3 w-3" /> Track
                                            </button>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Package Dimensions Modal */}
              {editingDimensionsBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                  <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <Box className="h-4 w-4 text-blue-600" /> Edit Packaging Dimensions & Weight
                      </h3>
                      <button onClick={() => setEditingDimensionsBook(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                    </div>

                    <form onSubmit={handleSaveBookDimensions} className="p-6 space-y-4">
                      <p className="text-xs text-slate-500 font-semibold truncate">
                        Book: <b>{editingDimensionsBook.title}</b>
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Length (cm)</label>
                          <input
                            type="number"
                            value={dimensionsForm.length}
                            onChange={(e) => setDimensionsForm({ ...dimensionsForm, length: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Width (cm)</label>
                          <input
                            type="number"
                            value={dimensionsForm.width}
                            onChange={(e) => setDimensionsForm({ ...dimensionsForm, width: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Height (cm)</label>
                          <input
                            type="number"
                            value={dimensionsForm.height}
                            onChange={(e) => setDimensionsForm({ ...dimensionsForm, height: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Dead Weight (kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={dimensionsForm.weight}
                          onChange={(e) => setDimensionsForm({ ...dimensionsForm, weight: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                          required
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Used by India Post CEPT for automatic Speed Post rate calculation.</span>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingDimensionsBook(null)}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingDimensions}
                          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow disabled:opacity-50"
                        >
                          {isSavingDimensions ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          Save Dimensions
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Book Details Preview Modal */}
              {previewBook && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                  <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <h3 className="font-extrabold text-slate-900 text-sm">Product & Catalog Specifications</h3>
                      </div>
                      <button onClick={() => setPreviewBook(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        <div className="h-44 w-32 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                          {previewBook.coverUrl ? (
                            <img src={previewBook.coverUrl} alt={previewBook.title} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-3xl">📖</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <h2 className="text-base font-extrabold text-slate-900 leading-snug">{previewBook.title}</h2>
                          
                          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                            <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-blue-800 font-bold">
                              SKU: {formatClientSku(previewBook)}
                            </span>
                            <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-700 font-bold">
                              FSN / ISBN: {formatClientFsn(previewBook)}
                            </span>
                          </div>

                          <div className="pt-2 flex items-baseline gap-3">
                            <span className="text-lg font-black text-emerald-700">{formatINR(previewBook.price || 0)}</span>
                            {previewBook.mrp > previewBook.price && (
                              <span className="text-xs text-slate-400 line-through">{formatINR(previewBook.mrp)}</span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              (previewBook.stock || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {(previewBook.stock || 0) > 0 ? `In Stock (${previewBook.stock} available)` : 'Out of Stock'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Specifications Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-b border-slate-100 py-4 text-slate-600">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Publisher</span>
                          <span className="font-bold text-slate-900">{previewBook.publisher?.name || previewBook.publisher || 'Techno World'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Category</span>
                          <span className="font-bold text-slate-900">{previewBook.category?.name || previewBook.category || 'Academic & Exams'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Dimensions</span>
                          <span className="font-mono font-bold text-slate-900">{previewBook.dimensions || '24-22-1cm'}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Weight</span>
                          <span className="font-mono font-bold text-slate-900">{previewBook.weight ? `${previewBook.weight}kg` : '0.50kg'}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {previewBook.description && (
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">Book Overview & Summary:</h4>
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                            {previewBook.description}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-3.5 bg-slate-50">
                      <button
                        onClick={() => setPreviewBook(null)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Details & Destination Modal */}
              {previewOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                  <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">Order Dispatch Breakdown: #{previewOrder.orderNumber}</h3>
                          <span className="text-[11px] text-slate-500">
                            Placed on {new Date(previewOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setPreviewOrder(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                      {/* Destination Address Card */}
                      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                            📍 Delivery Destination & Consignee:
                          </span>
                          <span className="text-[11px] font-bold text-blue-800 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 shadow-sm">
                            India Post Speed Post Route
                          </span>
                        </div>

                        <div className="text-slate-800 space-y-0.5 text-xs font-medium">
                          <p className="text-sm font-extrabold text-slate-950">
                            {previewOrder.address?.fullName || previewOrder.user?.name || 'Customer Name'}
                          </p>
                          <p><b>Phone:</b> {previewOrder.address?.phone || previewOrder.user?.phone || 'N/A'}</p>
                          <p><b>Recipient Email:</b> <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{previewOrder.customerEmail || previewOrder.address?.email || previewOrder.user?.email || 'N/A'}</span></p>
                          <p><b>Post Office:</b> 🏤 {previewOrder.address?.postOffice || 'Local Post Office'}</p>
                          <p><b>Address:</b> {previewOrder.address?.addressLine1 || previewOrder.address?.line1 || 'Street Address'}, {previewOrder.address?.landmark ? `${previewOrder.address.landmark}, ` : ''}{previewOrder.address?.city || 'Kolkata'}, {previewOrder.address?.state || 'West Bengal'} — <b>{previewOrder.address?.pincode || '700001'}</b></p>
                        </div>

                        {/* Customer Profile Link */}
                        <div className="pt-2 border-t border-blue-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500">Customer Account: <b>{previewOrder.user?.email || 'Guest User'}</b></span>
                          <button
                            onClick={() => navigateToCustomer(previewOrder.address?.fullName || previewOrder.user?.name || previewOrder.user?.email || '')}
                            className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700 shadow-sm transition-all"
                          >
                            <Users className="h-3.5 w-3.5" /> View Customer Profile &rarr;
                          </button>
                        </div>
                      </div>

                      {/* Items in Order */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-900 flex items-center justify-between">
                          <span>Items in Package ({previewOrder.items?.length || 0} books):</span>
                          <span className="text-slate-500 font-normal">Payment: <b>{previewOrder.paymentMethod}</b> ({previewOrder.paymentStatus})</span>
                        </h4>

                        <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                          {Array.isArray(previewOrder.items) && previewOrder.items.map((item: any, idx: number) => {
                            const b = item.book || {};
                            return (
                              <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                                <div className="flex items-center gap-3">
                                  <div className="h-12 w-9 rounded border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                                    {b.coverUrl ? <img src={b.coverUrl} alt={b.title} className="h-full w-full object-cover" /> : <span>📖</span>}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-slate-900 line-clamp-1">{b.title || 'Book Title'}</h5>
                                    <p className="text-[11px] font-mono text-slate-500">
                                      SKU: {formatClientSku(b)} | FSN: {formatClientFsn(b)}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-bold text-slate-900 block">{formatINR(item.priceAtPurchase || b.price || 0)} &times; {item.quantity || 1}</span>
                                  <span className="text-[10px] font-semibold text-slate-400">Total: {formatINR((item.priceAtPurchase || b.price || 0) * (item.quantity || 1))}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Total Calculation */}
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-700 block">
                            {previewOrder.paymentMethod === 'COD' ? 'Total COD Amount to Collect:' : 'Total Order Amount Paid:'}
                          </span>
                          {previewOrder.paymentMethod === 'COD' && (
                            <span className="text-[11px] font-medium text-amber-700">Includes ₹20 Cash on Delivery handling fee</span>
                          )}
                        </div>
                        <span className="text-lg font-black text-emerald-700">{formatINR(previewOrder.totalAmount || 0)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50">
                      <div className="flex items-center gap-2">
                        {previewOrder.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              handleAcceptOrder(previewOrder);
                              setPreviewOrder(null);
                            }}
                            className="flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Accept Order
                          </button>
                        )}
                        <button
                          onClick={() => {
                            openEmailModal(previewOrder, 'DELAY_NOTICE');
                            setPreviewOrder(null);
                          }}
                          className="flex items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                        >
                          <Mail className="h-3.5 w-3.5" /> Slight Delay Notice
                        </button>
                      </div>

                      <button
                        onClick={() => setPreviewOrder(null)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {tab === 'payments' && (
          <PaymentsWorkspace onPreviewOrder={(order) => setPreviewOrder(order)} />
        )}

        {tab === 'customers' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Customer Accounts & Order History</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Search customer accounts, inspect shipping addresses, lifetime book spend, and TechnoPoints balances.
                  </p>
                </div>

                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      fetchCustomers(e.target.value);
                    }}
                    placeholder="Search by customer name, email, phone..."
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                  />
                  {customerSearchQuery && (
                    <button
                      onClick={() => {
                        setCustomerSearchQuery('');
                        fetchCustomers('');
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Customers Table */}
              {isLoadingCustomers ? (
                <div className="py-16 text-center text-slate-400">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-2" />
                  <p className="text-xs font-semibold">Loading customer accounts...</p>
                </div>
              ) : customersList.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h4 className="text-base font-bold text-slate-800">No customers found</h4>
                  <p className="text-xs text-slate-500 mt-1">Customers who register or place orders on the bookstore will appear here.</p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Total Orders</th>
                        <th className="px-4 py-3">Lifetime Spend</th>
                        <th className="px-4 py-3">TechnoPoints</th>
                        <th className="px-4 py-3">Primary Address</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customersList.map((c: any) => {
                        const defaultAddr = c.addresses?.[0] || {};
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm border border-blue-200">
                                  {(c.name || 'C').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">{c.name || 'Anonymous User'}</span>
                                  <span className="text-[11px] text-slate-400 block font-mono">{c.email}</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3.5 font-semibold text-slate-700">
                              {c.phone || defaultAddr.phone || 'No phone'}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 font-extrabold text-blue-800 text-xs">
                                {c.totalOrders} {c.totalOrders === 1 ? 'Order' : 'Orders'}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 font-black text-slate-900 text-sm">
                              {formatINR(c.totalSpent || 0)}
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 font-bold text-amber-800 text-xs">
                                ⭐ {c.technoPoints || 0} pts
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-[11px] text-slate-500 max-w-xs truncate">
                              {defaultAddr.city ? (
                                <span>📍 {defaultAddr.addressLine1 || defaultAddr.line1}, {defaultAddr.city} ({defaultAddr.pincode})</span>
                              ) : (
                                <span className="text-slate-400">No saved address</span>
                              )}
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => setSelectedCustomerDetail(c)}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                              >
                                View History
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Customer History Detail Modal */}
            {selectedCustomerDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{selectedCustomerDetail.name || 'Customer Profile'}</h3>
                        <span className="text-[11px] text-slate-500">{selectedCustomerDetail.email}</span>
                      </div>
                    </div>
                    <button onClick={() => setSelectedCustomerDetail(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-4 text-xs">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
                        <span className="text-base font-black text-slate-900">{selectedCustomerDetail.totalOrders}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">Total Spend</span>
                        <span className="text-base font-black text-emerald-700">{formatINR(selectedCustomerDetail.totalSpent || 0)}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">TechnoPoints</span>
                        <span className="text-base font-black text-amber-700">⭐ {selectedCustomerDetail.technoPoints || 0}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Recent Orders:</h4>
                      {selectedCustomerDetail.orders?.length === 0 ? (
                        <p className="text-slate-400 text-xs italic">No orders placed yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedCustomerDetail.orders.map((o: any) => (
                            <div key={o.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                              <div>
                                <span className="font-extrabold text-slate-900">#{o.orderNumber}</span>
                                <span className="block text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-900">{formatINR(o.totalAmount)}</span>
                                <span className="block text-[10px] font-bold text-blue-700">{o.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-slate-200 px-6 py-3 bg-slate-50">
                    <button
                      onClick={() => setSelectedCustomerDetail(null)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {tab === 'reviews' && (
          <div className="space-y-6">
            {/* Review & Q&A Header */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                    Customer Reviews & Q&A Moderation
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Moderate customer ratings and review comments, and reply to book questions asked on the product pages.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Clear Logs Older Than 24h Button */}
                  <button
                    type="button"
                    onClick={() => setShowClear24hModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-sm"
                    title="Auto-delete or clear review/Q&A logs older than 24 hours"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    Clear Logs (Older than 24h)
                  </button>

                  <button
                    type="button"
                    onClick={fetchReviewsAndQuestions}
                    disabled={loadingReviewsData}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <RotateCcw className={`h-3.5 w-3.5 ${loadingReviewsData ? 'animate-spin text-emerald-600' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Sub-Tab Navigation: Reviews vs Questions */}
              <div className="mt-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <button
                  type="button"
                  onClick={() => setReviewSubTab('reviews')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    reviewSubTab === 'reviews'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>Customer Reviews</span>
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black ${
                    reviewSubTab === 'reviews' ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                  }`}>
                    {adminReviews.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setReviewSubTab('questions')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    reviewSubTab === 'questions'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Questions & Answers (Q&A)</span>
                  {adminQuestions.filter(q => q.status === 'PENDING').length > 0 && (
                    <span className="ml-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-slate-950">
                      {adminQuestions.filter(q => q.status === 'PENDING').length} Pending
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Toolbar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={reviewSearchQuery}
                    onChange={(e) => setReviewSearchQuery(e.target.value)}
                    placeholder={reviewSubTab === 'reviews' ? 'Search by book title, reviewer name, or comment...' : 'Search by question, book, or answer...'}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-medium outline-none focus:border-emerald-500"
                  />
                </div>

                {reviewSubTab === 'reviews' ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={reviewRatingFilter}
                      onChange={(e) => setReviewRatingFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="ALL">All Ratings (1–5 Stars)</option>
                      <option value="5">5 Stars ★★★★★</option>
                      <option value="4">4 Stars ★★★★☆</option>
                      <option value="3">3 Stars ★★★☆☆</option>
                      <option value="2">2 Stars ★★☆☆☆</option>
                      <option value="1">1 Star ★☆☆☆☆</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={questionStatusFilter}
                      onChange={(e) => setQuestionStatusFilter(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="ALL">All Questions</option>
                      <option value="PENDING">Pending Reply</option>
                      <option value="ANSWERED">Answered & Published</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SUB-TAB 1: CUSTOMER REVIEWS */}
            {reviewSubTab === 'reviews' && (
              <div className="space-y-4">
                {adminReviews
                  .filter((r: any) => {
                    if (reviewRatingFilter !== 'ALL' && r.rating !== Number(reviewRatingFilter)) return false;
                    if (reviewSearchQuery.trim()) {
                      const q = reviewSearchQuery.toLowerCase();
                      const matchBook = (r.bookTitle || '').toLowerCase().includes(q);
                      const matchUser = (r.userName || '').toLowerCase().includes(q);
                      const matchText = (r.content || r.title || '').toLowerCase().includes(q);
                      return matchBook || matchUser || matchText;
                    }
                    return true;
                  })
                  .map((r: any) => (
                    <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          {/* Book Thumbnail */}
                          <div className="h-14 w-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                            {r.bookCover ? (
                              <img src={r.bookCover} alt={r.bookTitle} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">📖</div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-black text-amber-700">
                                {r.rating} ★
                              </span>
                              {r.title && <h4 className="text-sm font-extrabold text-slate-900">{r.title}</h4>}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                r.isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {r.isApproved ? 'Published on Store' : 'Hidden'}
                              </span>
                            </div>

                            {/* Book Title */}
                            <p className="text-xs text-slate-500 font-medium">
                              on book: <span className="font-bold text-slate-800">{r.bookTitle}</span>
                            </p>

                            {/* Review Body */}
                            <p className="text-xs text-slate-700 leading-relaxed pt-1 bg-slate-50/80 rounded-xl p-3 border border-slate-100 font-normal">
                              "{r.content}"
                            </p>

                            {/* Reviewer Info */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                👤 {r.userName}
                              </span>
                              {r.userEmail && <span>✉️ {r.userEmail}</span>}
                              <span>•</span>
                              <span>🕒 {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                          <button
                            type="button"
                            onClick={() => handleToggleApproveReview(r.id, r.isApproved)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors shadow-sm ${
                              r.isApproved
                                ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {r.isApproved ? 'Hide Review' : 'Approve Review'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(r.id)}
                            className="rounded-xl border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {adminReviews.length === 0 && !loadingReviewsData && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    <Star className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No customer reviews found</p>
                    <p className="text-xs text-slate-400 mt-1">Customer reviews submitted on book pages will show up here for moderation.</p>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: QUESTIONS & ANSWERS (Q&A) */}
            {reviewSubTab === 'questions' && (
              <div className="space-y-4">
                {adminQuestions
                  .filter((q: any) => {
                    if (questionStatusFilter !== 'ALL' && q.status !== questionStatusFilter) return false;
                    if (reviewSearchQuery.trim()) {
                      const query = reviewSearchQuery.toLowerCase();
                      const matchBook = (q.bookTitle || '').toLowerCase().includes(query);
                      const matchUser = (q.userName || '').toLowerCase().includes(query);
                      const matchQ = (q.question || '').toLowerCase().includes(query);
                      const matchA = (q.answer || '').toLowerCase().includes(query);
                      return matchBook || matchUser || matchQ || matchA;
                    }
                    return true;
                  })
                  .map((q: any) => (
                    <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Book Thumbnail */}
                          <div className="h-14 w-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                            {q.bookCover ? (
                              <img src={q.bookCover} alt={q.bookTitle} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-300">📖</div>
                            )}
                          </div>

                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-extrabold ${
                                q.status === 'ANSWERED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                {q.status === 'ANSWERED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                {q.status === 'ANSWERED' ? 'Answered & Published' : 'Pending Response'}
                              </span>
                              <span className="text-xs text-slate-400">•</span>
                              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                                Book: <span className="font-bold text-slate-800">{q.bookTitle}</span>
                              </p>
                            </div>

                            {/* Customer Question */}
                            <div className="rounded-xl bg-purple-50/50 p-3 border border-purple-100">
                              <p className="text-xs font-bold text-purple-950">
                                Q: {q.question}
                              </p>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-purple-700 font-medium">
                                <span>Asked by: <b>{q.userName}</b> ({q.userEmail || 'Guest'})</span>
                                <span>•</span>
                                <span>{new Date(q.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>

                            {/* Existing Answer if present */}
                            {q.answer && (
                              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 mb-1">
                                  <CornerDownRight className="h-3.5 w-3.5" /> Published Answer:
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                  {q.answer}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block font-medium">
                                  Signed as: <b>{q.answeredBy}</b> {q.answeredAt && `(${new Date(q.answeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })})`}
                                </span>
                              </div>
                            )}

                            {/* Inline Reply Form */}
                            {replyingQuestionId === q.id && (
                              <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-md space-y-3 mt-2">
                                <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                                  <Send className="h-3.5 w-3.5 text-purple-600" /> Write Answer for Product Page
                                </h4>
                                <textarea
                                  rows={3}
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Type verified answer here (e.g. Yes, this is the official 2026 revised syllabus edition with 2025 solved papers)..."
                                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-purple-600 font-medium"
                                />
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-slate-600">Answer Signature:</label>
                                    <select
                                      value={replySignature}
                                      onChange={(e) => setReplySignature(e.target.value)}
                                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
                                    >
                                      <option value="Techno World Direct · Verified Seller">Techno World Direct · Verified Seller</option>
                                      <option value="Staff Academic Reviewer">Staff Academic Reviewer</option>
                                      <option value="Senior Subject Editor">Senior Subject Editor</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setReplyingQuestionId(null);
                                        setReplyText('');
                                      }}
                                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePublishAnswer(q.id)}
                                      className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-sm"
                                    >
                                      Publish Answer
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Question Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingQuestionId(q.id);
                              setReplyText(q.answer || '');
                            }}
                            className="rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors shadow-sm"
                          >
                            {q.status === 'ANSWERED' ? 'Edit Answer' : 'Reply & Publish'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="rounded-xl border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {adminQuestions.length === 0 && !loadingReviewsData && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
                    <HelpCircle className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No customer questions submitted</p>
                    <p className="text-xs text-slate-400 mt-1">Questions asked by visitors on any book page will appear here for you to reply.</p>
                  </div>
                )}
              </div>
            )}

            {/* Clear Logs Older Than 24h Modal */}
            {showClear24hModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                  <div className="flex items-center gap-3 text-rose-600 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Clear Logs Older Than 24h</h3>
                      <p className="text-xs text-slate-500">Auto-clean review and question records</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4">
                    This will clean up and purge question & review entries created more than <b>24 hours ago</b> from the system log.
                  </p>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={clearing24h}
                      onClick={() => setShowClear24hModal(false)}
                      className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={clearing24h}
                      onClick={handleClear24hLogs}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {clearing24h ? 'Clearing Records...' : 'Confirm Clear (Older than 24h)'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === 'media' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-800">Media Library</p>
              <label className={`flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white cursor-pointer hover:bg-emerald-800 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Plus className="h-4 w-4" />
                <input type="file" multiple className="hidden" onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  setIsUploading(true);
                  try {
                    for (const file of files) {
                      await mediaService.upload(file, 'general');
                    }
                    toast.success(`${files.length} files uploaded`);
                    const res = await mediaService.list();
                    setMediaItems(res.data);
                  } catch(err) {
                    toast.error('Upload failed');
                  } finally {
                    setIsUploading(false);
                  }
                }} />
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </label>
            </div>
            {mediaItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No media files found. Upload some!</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {mediaItems.map(m => (
                  <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {m.type === 'image' ? (
                      <img src={m.url} alt={m.altText || m.filename} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <BookOpen className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium break-all line-clamp-2">{m.filename}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                      <button onClick={() => window.open(m.url, '_blank')} className="rounded bg-white/20 p-2 text-white hover:bg-white/40"><Search className="h-4 w-4" /></button>
                      <button onClick={async () => {
                        if(confirm('Delete this file?')) {
                          try {
                            await mediaService.delete(m.id);
                            setMediaItems(items => items.filter(i => i.id !== m.id));
                            toast.success('Deleted');
                          } catch(err) { toast.error('Failed to delete'); }
                        }
                      }} className="rounded bg-rose-500/80 p-2 text-white hover:bg-rose-500"><AlertCircle className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'cms' && (
          <div className="space-y-5">
            <p className="text-sm text-slate-500">Edit homepage sections without touching code. Toggle sections on/off, update text, and save.</p>
            {cmsSections.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No CMS sections found. Run the seed script first.</div>
            ) : (
              cmsSections.map(section => {
                const cfg = cmsEditing[section.sectionKey] || {};
                const updateField = (field: string, value: any) => {
                  setCmsEditing(prev => ({
                    ...prev,
                    [section.sectionKey]: { ...prev[section.sectionKey], [field]: value },
                  }));
                };
                return (
                  <div key={section.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${section.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <h3 className="text-sm font-bold text-slate-800">{section.title || section.sectionKey}</h3>
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{section.sectionKey}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleCmsSection(section.sectionKey)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${section.isEnabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {section.isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button onClick={() => saveCmsSection(section.sectionKey)} className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition-colors">
                          Save
                        </button>
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      {section.sectionKey === 'hero_banner' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Subtext</label>
                            <textarea value={cfg.subtext || ''} onChange={e => updateField('subtext', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Text</label>
                              <input value={cfg.ctaText || ''} onChange={e => updateField('ctaText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Link</label>
                              <input value={cfg.ctaLink || ''} onChange={e => updateField('ctaLink', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'flash_sale' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Subtext</label>
                            <input value={cfg.subtext || ''} onChange={e => updateField('subtext', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">End Date</label>
                              <input type="datetime-local" value={cfg.endDate ? new Date(cfg.endDate).toISOString().slice(0, 16) : ''} onChange={e => updateField('endDate', new Date(e.target.value).toISOString())} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Badge Text</label>
                              <input value={cfg.badgeText || ''} onChange={e => updateField('badgeText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'featured_books' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Section Title</label>
                            <input value={cfg.sectionTitle || ''} onChange={e => updateField('sectionTitle', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Max Books to Display</label>
                            <input type="number" value={cfg.maxDisplay || 10} onChange={e => updateField('maxDisplay', parseInt(e.target.value) || 10)} className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <p className="text-xs text-slate-400">Featured books are auto-selected from the catalog based on bestseller and trending flags.</p>
                        </>
                      )}
                      {section.sectionKey === 'testimonials' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Section Title</label>
                            <input value={cfg.sectionTitle || ''} onChange={e => updateField('sectionTitle', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="space-y-3">
                            {(cfg.items || []).map((item: any, idx: number) => (
                              <div key={idx} className="rounded-lg border border-slate-200 p-3 space-y-2">
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={item.name} onChange={e => {
                                    const items = [...(cfg.items || [])];
                                    items[idx] = { ...items[idx], name: e.target.value };
                                    updateField('items', items);
                                  }} placeholder="Name" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  <input type="number" min={1} max={5} value={item.rating} onChange={e => {
                                    const items = [...(cfg.items || [])];
                                    items[idx] = { ...items[idx], rating: parseInt(e.target.value) || 5 };
                                    updateField('items', items);
                                  }} placeholder="Rating" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none w-20" />
                                </div>
                                <textarea value={item.text} onChange={e => {
                                  const items = [...(cfg.items || [])];
                                  items[idx] = { ...items[idx], text: e.target.value };
                                  updateField('items', items);
                                }} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none resize-none" />
                                <button onClick={() => {
                                  const items = (cfg.items || []).filter((_: any, i: number) => i !== idx);
                                  updateField('items', items);
                                }} className="text-xs font-bold text-rose-600 hover:text-rose-700">Remove</button>
                              </div>
                            ))}
                            <button onClick={() => {
                              const items = [...(cfg.items || []), { name: '', text: '', rating: 5 }];
                              updateField('items', items);
                            }} className="rounded-lg border-2 border-dashed border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-700 transition-colors w-full">
                              + Add Testimonial
                            </button>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'sale_banner' && (
                        <>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Headline</label>
                            <input value={cfg.headline || ''} onChange={e => updateField('headline', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Text</label>
                              <input value={cfg.ctaText || ''} onChange={e => updateField('ctaText', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">CTA Link</label>
                              <input value={cfg.ctaLink || ''} onChange={e => updateField('ctaLink', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1">Background Color</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={cfg.bgColor || '#065f46'} onChange={e => updateField('bgColor', e.target.value)} className="h-9 w-9 rounded cursor-pointer" />
                                <input value={cfg.bgColor || '#065f46'} onChange={e => updateField('bgColor', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500/20" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {section.sectionKey === 'promo-banners' && (
                        <>
                          <div className="space-y-4">
                            <p className="text-xs text-slate-500 mb-2">Manage your promotional banners here. They will appear on the homepage below the hero section.</p>
                            {(cfg.banners || []).map((banner: any, idx: number) => (
                              <div key={idx} className="rounded-lg border border-slate-200 p-4 space-y-3 bg-slate-50 relative">
                                <div className="absolute top-3 right-3 flex gap-2">
                                  <button onClick={() => {
                                    const banners = [...(cfg.banners || [])];
                                    banners[idx] = { ...banners[idx], isActive: !banners[idx].isActive };
                                    updateField('banners', banners);
                                  }} className={`text-xs font-bold px-2 py-1 rounded ${banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                  </button>
                                  <button onClick={() => {
                                    const banners = (cfg.banners || []).filter((_: any, i: number) => i !== idx);
                                    updateField('banners', banners);
                                  }} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-100 px-2 py-1 rounded">Remove</button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-6">
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Image URL</label>
                                    <input value={banner.imageUrl || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], imageUrl: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="/banners/example.jpg" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Link URL</label>
                                    <input value={banner.linkUrl || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], linkUrl: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="/category/engineering" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-1">Alt Text</label>
                                    <input value={banner.altText || ''} onChange={e => {
                                      const banners = [...(cfg.banners || [])];
                                      banners[idx] = { ...banners[idx], altText: e.target.value };
                                      updateField('banners', banners);
                                    }} placeholder="Engineering Books Offer" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-1">Start Date (Optional)</label>
                                      <input type="datetime-local" value={banner.startDate ? new Date(banner.startDate).toISOString().slice(0, 16) : ''} onChange={e => {
                                        const banners = [...(cfg.banners || [])];
                                        banners[idx] = { ...banners[idx], startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined };
                                        updateField('banners', banners);
                                      }} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none" />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-600 mb-1">End Date (Optional)</label>
                                      <input type="datetime-local" value={banner.endDate ? new Date(banner.endDate).toISOString().slice(0, 16) : ''} onChange={e => {
                                        const banners = [...(cfg.banners || [])];
                                        banners[idx] = { ...banners[idx], endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined };
                                        updateField('banners', banners);
                                      }} className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => {
                              const banners = [...(cfg.banners || []), { id: Date.now().toString(), imageUrl: '', linkUrl: '', altText: '', isActive: true }];
                              updateField('banners', banners);
                            }} className="rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 text-xs font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-700 transition-colors w-full">
                              + Add Banner
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Promotions & Campaigns</h2>
                <p className="text-sm text-slate-500">Create and manage your promotional rules and discount codes</p>
              </div>
              <button onClick={() => setEditingPromotion({})} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> New Promotion
              </button>
            </div>
            
            <div className="rounded-2xl border border-slate-100 bg-white p-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Name / Code</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Limit</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promotions.map((promo) => {
                      const isActive = promo.status === 'ACTIVE';
                      const isPaused = promo.status === 'PAUSED';
                      return (
                        <tr key={promo.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{promo.name}</div>
                            {promo.code && <div className="font-mono text-xs text-slate-500 mt-1 font-semibold">{promo.code}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {promo.promotionType || 'UNIVERSAL'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {promo.discountType === 'FIXED' ? formatINR(promo.discountValue) : promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}%` : 'Free Shipping'}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                            {promo.usageLimit ? `${promo.usedCount || 0} / ${promo.usageLimit}` : 'Unlimited'}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                isActive 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : isPaused 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isPaused ? 'bg-amber-500' : 'bg-slate-400'}`} />
                              {isActive ? 'Live' : isPaused ? 'Paused' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isActive ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await promotionService.toggleActive(promo.id, 'PAUSED');
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success(`Coupon "${promo.name}" paused / snoozed`);
                                    } catch (e) {
                                      toast.error('Failed to pause promotion');
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                                  title="Pause / Snooze this code"
                                >
                                  <Pause className="h-3 w-3" /> Snooze
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await promotionService.toggleActive(promo.id, 'ACTIVE');
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success(`Coupon "${promo.name}" is now live!`);
                                    } catch (e) {
                                      toast.error('Failed to activate promotion');
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                  title="Activate and make code live"
                                >
                                  <Play className="h-3 w-3" /> Go Live
                                </button>
                              )}
                              
                              <button 
                                onClick={() => setEditingPromotion(promo)} 
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                                title="Edit promotion details"
                              >
                                <Edit3 className="h-3 w-3" /> Edit
                              </button>

                              <button 
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete "${promo.name}"?`)) {
                                    try {
                                      await promotionService.remove(promo.id);
                                      const res = await promotionService.getAll();
                                      setPromotions(res.data);
                                      toast.success('Promotion deleted successfully');
                                    } catch (e) {
                                      toast.error('Failed to delete promotion');
                                    }
                                  }
                                }} 
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete coupon"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {promotions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No promotions found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

{/* Settings & Outbound Email Workspace */}
        {tab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald-700" /> Admin Details & Outbound Email System
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Change your admin login credentials and configure the sender email ID (Gmail SMTP / Custom SMTP) for customer delay notices and order updates.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Admin Account Credentials */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-700" /> Admin Account Credentials
                </h3>
                <p className="text-xs text-slate-500 mb-5">Manage your display name, login email, and login password.</p>

                <form onSubmit={handleSaveAdminProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Admin Display Name</label>
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Admin Login Email</label>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={adminProfile.phone}
                      onChange={(e) => setAdminProfile({ ...adminProfile, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <p className="text-xs font-bold text-slate-700">Change Admin Password (leave blank to keep current)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">New Password</label>
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={adminConfirmPassword}
                          onChange={(e) => setAdminConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-all disabled:opacity-50 mt-2"
                  >
                    {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Update Admin Profile
                  </button>
                </form>
              </div>

              {/* Card 2: Outbound Email & Gmail SMTP Configuration */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-700" /> Outbound Sender Email & SMTP
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setTestEmailTo(adminProfile.email || 'customer@example.com');
                      setIsTestEmailModalOpen(true);
                    }}
                    className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-sm"
                  >
                    🚀 Test SMTP
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Configure your email address so delay notifications and cancellation updates send from your real address.
                </p>

                <form onSubmit={handleSaveSmtp} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Sender Display Name</label>
                      <input
                        type="text"
                        value={smtpForm.senderName}
                        onChange={(e) => setSmtpForm({ ...smtpForm, senderName: e.target.value })}
                        placeholder="Techno World Books"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Sender From Email</label>
                      <input
                        type="email"
                        value={smtpForm.senderEmail}
                        onChange={(e) => setSmtpForm({ ...smtpForm, senderEmail: e.target.value })}
                        placeholder="admin@technoworld.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SMTP Host (e.g. Gmail)</label>
                      <input
                        type="text"
                        value={smtpForm.host}
                        onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Port</label>
                      <input
                        type="number"
                        value={smtpForm.port}
                        onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
                        placeholder="587"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SMTP Username / Email</label>
                      <input
                        type="text"
                        value={smtpForm.user}
                        onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">SMTP App Password</label>
                      <input
                        type="password"
                        value={smtpForm.pass}
                        onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                        placeholder="16-character App Password"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Gmail Help Accordion / Box */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 space-y-1.5">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>💡 How to connect Gmail to send official emails:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                      <li>Open your <b>Google Account</b> &rarr; <b>Security</b> &rarr; enable <b>2-Step Verification</b>.</li>
                      <li>Search for <b>&quot;App Passwords&quot;</b> in Google Account settings.</li>
                      <li>Create an app password named <i>&quot;Techno World Bookstore&quot;</i> and copy the 16-character code.</li>
                      <li>Paste it into the <b>SMTP App Password</b> field above and click <b>Save SMTP Settings</b>!</li>
                    </ol>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSmtp}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow transition-all disabled:opacity-50"
                  >
                    {isSavingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Outbound SMTP Settings
                  </button>
                </form>
              </div>
            </div>

            {/* Test Email Modal */}
            {isTestEmailModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-emerald-700" /> Send Live SMTP Test Email
                    </h3>
                    <button onClick={() => { setIsTestEmailModalOpen(false); setTestEmailResult(null); }} className="text-slate-400 hover:text-slate-600 text-lg font-bold">&times;</button>
                  </div>

                  <form onSubmit={handleSendTestEmail} className="p-6 space-y-4">
                    <p className="text-xs text-slate-500">
                      Enter any recipient email to test if your SMTP host ({smtpForm.host}) is delivering messages.
                    </p>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Recipient Email Address</label>
                      <input
                        type="email"
                        value={testEmailTo}
                        onChange={(e) => setTestEmailTo(e.target.value)}
                        placeholder="your_personal_email@gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    {testEmailResult && (
                      <div className={`rounded-xl p-3.5 text-xs border ${testEmailResult.isDelivered ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
                        <p className="font-bold flex items-center gap-1.5">
                          {testEmailResult.isDelivered ? '✅ SMTP Delivered Successfully!' : '📦 Dispatched to Admin Outbox'}
                        </p>
                        <p className="mt-1 text-[11px] opacity-90">{testEmailResult.note || testEmailResult.message}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => { setIsTestEmailModalOpen(false); setTestEmailResult(null); }}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={isTestingSmtp}
                        className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow transition-all disabled:opacity-50"
                      >
                        {isTestingSmtp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        Send Test Email
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Outbound Sent Emails & Live Mailbox Center */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-black">
                    📬
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Sent Emails & Outbox Center</h3>
                    <p className="text-xs text-slate-500">Live stream of all outgoing customer emails, order notifications, delay notices, and system alerts.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                    {emailLogs.length} Total
                  </span>
                  <button
                    type="button"
                    onClick={fetchEmailLogs}
                    disabled={isLoadingEmails}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {isLoadingEmails ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                    Refresh
                  </button>
                </div>
              </div>

              {emailLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Mail className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  No sent emails logged yet. Click &quot;🚀 Test SMTP&quot; above or update an order to dispatch an email.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Recipient</th>
                        <th className="px-4 py-3">Subject & Order</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Channel</th>
                        <th className="px-4 py-3">Sent Time</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {emailLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-900 block">{log.toEmail}</span>
                            <span className="text-[10px] text-slate-400">From: {log.senderEmail}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-800 block line-clamp-1">{log.subject}</span>
                            {log.orderNumber && (
                              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                                #{log.orderNumber}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              log.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${log.status === 'DELIVERED' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                              {log.status === 'DELIVERED' ? 'Delivered' : 'Outbox'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                            {log.provider || 'SMTP'}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedEmailPreview(log)}
                              className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors inline-flex items-center gap-1"
                            >
                              👁️ View HTML
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Email HTML Preview Modal */}
            {selectedEmailPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        <span>✉️ Email Preview</span>
                        <span className="text-xs font-normal text-slate-500">({selectedEmailPreview.toEmail})</span>
                      </h3>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedEmailPreview.subject}</p>
                    </div>
                    <button onClick={() => setSelectedEmailPreview(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 bg-slate-100">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                      {selectedEmailPreview.htmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedEmailPreview.htmlContent }} />
                      ) : (
                        <div className="whitespace-pre-wrap font-sans text-sm text-slate-800">
                          {selectedEmailPreview.message}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                    <span>Sent: {new Date(selectedEmailPreview.createdAt).toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => setSelectedEmailPreview(null)}
                      className="rounded-lg bg-slate-900 px-4 py-1.5 font-bold text-white text-xs hover:bg-slate-800"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(tab === 'analytics' || tab === 'reports') && (
          <SearchAnalyticsWorkspace />
        )}
      </div>

      {editingPromotion && (
        <PromotionEditModal
          promotion={editingPromotion}
          onClose={() => setEditingPromotion(null)}
          onSuccess={() => {
            setEditingPromotion(null);
            promotionService.getAll().then(res => setPromotions(res.data));
          }}
        />
      )}

      {isImportModalOpen && importAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Import Analysis</h2>
            <p className="text-sm text-slate-500 mb-6">Review the file <span className="font-mono">{importAnalysis.filename}</span> before executing.</p>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">New Books to Add</p>
                <p className="text-2xl font-extrabold text-emerald-900">{importAnalysis.toAdd.length}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Existing / Duplicate</p>
                <p className="text-2xl font-extrabold text-blue-900">{importAnalysis.toUpdate.length}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4 border border-rose-100">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Row Errors</p>
                <p className="text-2xl font-extrabold text-rose-900">{importAnalysis.errors.length}</p>
              </div>
            </div>

            {/* Existing Books / Repetition Confirmation & Strategy Picker */}
            {importAnalysis.toUpdate.length > 0 && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 space-y-3">
                <div className="flex items-center gap-2 font-bold text-blue-950 text-xs">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Found {importAnalysis.toUpdate.length} book(s) already in your catalog. How should repetitions be handled?</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    importStrategy === 'UPDATE'
                      ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="importStrategy"
                        value="UPDATE"
                        checked={importStrategy === 'UPDATE'}
                        onChange={() => setImportStrategy('UPDATE')}
                        className="text-blue-600"
                      />
                      <span className="font-extrabold text-slate-900 text-xs">Update Stock</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Overwrites stock count with Excel quantity and updates prices.
                    </span>
                  </label>

                  <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    importStrategy === 'ADD_STOCK'
                      ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="importStrategy"
                        value="ADD_STOCK"
                        checked={importStrategy === 'ADD_STOCK'}
                        onChange={() => setImportStrategy('ADD_STOCK')}
                        className="text-emerald-600"
                      />
                      <span className="font-extrabold text-slate-900 text-xs">Add to Stock</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Adds Excel quantity to existing stock (e.g. 10 + 20 = 30).
                    </span>
                  </label>

                  <label className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    importStrategy === 'SKIP'
                      ? 'bg-white border-slate-400 ring-2 ring-slate-400/20 shadow-sm'
                      : 'bg-white/60 border-slate-200 hover:bg-white'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="importStrategy"
                        value="SKIP"
                        checked={importStrategy === 'SKIP'}
                        onChange={() => setImportStrategy('SKIP')}
                        className="text-slate-600"
                      />
                      <span className="font-extrabold text-slate-900 text-xs">Skip Existing</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Leaves existing books unchanged; only adds new books.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {importAnalysis.errors.length > 0 && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-white">
                <div className="border-b border-rose-100 bg-rose-50/50 px-4 py-3 font-semibold text-rose-800">Errors found</div>
                <div className="max-h-40 overflow-y-auto p-2">
                  {importAnalysis.errors.map((e: any, i: number) => (
                    <div key={i} className="px-2 py-1.5 text-sm text-slate-700 border-b border-slate-50 last:border-0"><span className="font-mono text-xs mr-2 text-rose-600">Row {e.row}</span>{e.message}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button disabled={isImporting} onClick={() => setIsImportModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button disabled={isImporting || (importAnalysis.toAdd.length === 0 && importAnalysis.toUpdate.length === 0)} onClick={handleExecuteImport} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
                {isImporting ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          </div>
        </div>
      )}
      {isImportModalOpen && importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <AlertCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Import Complete</h2>
            <p className="mb-6 text-sm text-slate-500">The catalog has been successfully updated.</p>

            <div className="mb-6 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsAdded}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Added</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsUpdated}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Updated</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-2xl font-extrabold text-slate-800">{importResult.recordsSkipped}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Skipped</p>
              </div>
            </div>

            {importResult.errors?.length > 0 && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-bold text-rose-800 mb-2">{importResult.errors.length} Errors encountered</p>
                <button onClick={downloadErrorsCsv} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
                  <Download className="h-4 w-4" /> Download Error Report
                </button>
              </div>
            )}

            <button onClick={() => { setIsImportModalOpen(false); setImportResult(null); }} className="w-full rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm">
              Done
            </button>
          </div>
        </div>
      )}

      {/* India Post Printable Shipping Label Modal */}
      {shippingModalLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-slate-900">India Post Shipping Label</h3>
              </div>
              <button onClick={() => setShippingModalLabel(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Label Visual Canvas */}
            <div className="rounded-xl border-2 border-dashed border-slate-300 p-5 bg-white space-y-4 text-xs text-slate-800 font-sans">
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <p className="font-extrabold text-sm tracking-wider uppercase text-red-700">INDIA POST</p>
                  <p className="font-bold text-[11px]">{shippingModalLabel.service_type || 'SPEED POST (DOMESTIC)'}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block border border-slate-400 px-2 py-0.5 font-bold text-[10px]">POSTAGE PREPAID / BNPL</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Booking Hub: {shippingModalLabel.booking_office_name}</p>
                </div>
              </div>

              {/* Barcode Mock */}
              <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded">
                <div className="h-8 flex items-center justify-center gap-1">
                  {[4, 2, 6, 1, 5, 2, 4, 3, 6, 2, 5, 1, 4, 2, 6, 3, 5, 1, 4, 2, 6, 3].map((h, i) => (
                    <span key={i} className="bg-black inline-block" style={{ width: `${(i % 3) + 1}px`, height: `${h * 4 + 10}px` }} />
                  ))}
                </div>
                <p className="mt-1 font-mono font-bold text-sm tracking-widest">{shippingModalLabel.barcode_no}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">To (Consignee):</p>
                  <p className="font-bold text-sm text-slate-900">{shippingModalLabel.recipient_name}</p>
                  <p className="text-slate-600">{shippingModalLabel.recipient_address}</p>
                  <p className="text-slate-600">{shippingModalLabel.recipient_city}, {shippingModalLabel.recipient_state}</p>
                  <p className="font-extrabold text-sm text-slate-900 mt-1">PIN: {shippingModalLabel.recipient_pin}</p>
                  <p className="text-slate-600">Mob: {shippingModalLabel.recipient_mobile}</p>
                </div>
                <div className="border-l pl-4">
                  <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">From (Sender):</p>
                  <p className="font-bold text-slate-900">{shippingModalLabel.sender_name}</p>
                  <p className="text-slate-600">{shippingModalLabel.sender_address}</p>
                  <p className="text-slate-600">{shippingModalLabel.sender_city} — {shippingModalLabel.sender_pin}</p>
                  <p className="text-slate-600">Mob: {shippingModalLabel.sender_mobile}</p>
                  <p className="mt-2 text-[10px] text-slate-500">Weight: {shippingModalLabel.weight || 450}g</p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center">Generated on {shippingModalLabel.booking_datetime}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white hover:bg-emerald-800 shadow-sm"
              >
                <Printer className="h-4 w-4" /> Print Label
              </button>
              <button
                onClick={() => setShippingModalLabel(null)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* India Post Live Tracking Modal */}
      {shippingTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Consignment Live Status</h3>
              </div>
              <button onClick={() => setShippingTrackingModal(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-sm text-slate-900">
                AWB: {shippingTrackingModal.tracking?.article_number || 'N/A'}
              </p>
              <p className="mt-1 text-slate-500">
                Status: <b className="text-emerald-700 uppercase">{shippingTrackingModal.tracking?.del_status?.del_status || 'IN TRANSIT'}</b>
              </p>
            </div>

            <div className="space-y-4">
              {shippingTrackingModal.tracking?.tracking_details?.map((evt: any, i: number) => (
                <div key={i} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    {i < shippingTrackingModal.tracking.tracking_details.length - 1 && (
                      <span className="h-8 w-0.5 bg-slate-200 mt-1" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{evt.event}</p>
                    <p className="text-slate-600">{evt.office} · {evt.date} {evt.time}</p>
                    {evt.description && <p className="text-slate-400 text-[11px]">{evt.description}</p>}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShippingTrackingModal(null)}
              className="mt-6 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Admin Custom Email & Delay Notice Modal */}
      {emailModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Send Direct Customer Email</h3>
                  <p className="text-xs text-slate-500">From official admin email: <span className="font-semibold text-slate-700">admin@technoworld.com</span></p>
                </div>
              </div>
              <button onClick={() => setEmailModalOrder(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Order Info Strip */}
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 flex justify-between items-center">
                <span>Order <b>#{emailModalOrder.orderNumber}</b> · Total: <b>{formatINR(emailModalOrder.totalAmount)}</b></span>
                <span>Customer: <b>{emailModalOrder.address?.name || emailModalOrder.user?.name}</b></span>
              </div>

              {/* Template Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Quick Email Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'DELAY_NOTICE', label: '⏳ Slight Delay (Procurement)' },
                    { id: 'ADDRESS_CLARIFICATION', label: '📍 Address / PIN Clarification' },
                    { id: 'ORDER_CONFIRMATION', label: '✅ Order Accepted & Confirmed' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyEmailTemplate(t.id, emailModalOrder)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border text-left transition-all ${
                        emailTemplate === t.id
                          ? 'border-blue-500 bg-blue-50 text-blue-800 ring-2 ring-blue-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={8}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Write your email message to the customer..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs font-normal outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setEmailModalOrder(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={emailSending}
                onClick={handleSendCustomEmail}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow"
              >
                {emailSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Send Email to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-rose-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow">
                  <XCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-rose-950 text-base">Reject Order #{rejectModalOrder.orderNumber}</h3>
                  <p className="text-xs text-rose-700">Will cancel order and notify customer with refund details</p>
                </div>
              </div>
              <button onClick={() => setRejectModalOrder(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Cancellation Reason</p>
              <div className="space-y-2">
                {[
                  'Book currently out of print / unavailable from publisher',
                  'Delivery pincode is currently unserviceable by India Post',
                  'Customer requested cancellation before fulfillment',
                  'Suspected duplicate or invalid order details',
                  'Other',
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-2.5 text-xs font-medium cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="rejectReason"
                      checked={rejectReason === reason}
                      onChange={() => setRejectReason(reason)}
                      className="text-rose-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {rejectReason === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specify Custom Reason</label>
                  <textarea
                    rows={3}
                    value={rejectCustomReason}
                    onChange={(e) => setRejectCustomReason(e.target.value)}
                    placeholder="Enter reason to be sent to customer..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setRejectModalOrder(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={rejecting}
                onClick={handleRejectOrderSubmit}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors shadow"
              >
                {rejecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Confirm Rejection & Notify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Express Dispatch Modal */}
      {expressModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Express Local Dispatch</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Delivery Partner *</label>
                <input
                  type="text"
                  value={expressPartner}
                  onChange={(e) => setExpressPartner(e.target.value)}
                  placeholder="e.g. Porter, Rapido, Borzo"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Agent Phone (Optional)</label>
                <input
                  type="text"
                  value={expressAgentPhone}
                  onChange={(e) => setExpressAgentPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setExpressModalOrder(null)}
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!expressPartner.trim()) return toast.error('Delivery Partner is required');
                  bookIndiaPostShipment(expressModalOrder, expressPartner, expressAgentPhone);
                  setExpressModalOrder(null);
                }}
                className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-bold text-white hover:bg-purple-800"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Store Pickup Multi-Slot Scheduling Modal */}
      {pickupSlotsModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-50/80 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <span>Schedule Store Self-Pickup</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      #{pickupSlotsModalOrder.orderNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Propose 3 or 4 time slots. Customer will select 1 to confirm their appointment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPickupSlotsModalOrder(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer & Location Details Banner */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Collector: {pickupSlotsModalOrder.pickupName || pickupSlotsModalOrder.user?.name || 'Customer'}</span>
                  <span>📞 {pickupSlotsModalOrder.pickupPhone || pickupSlotsModalOrder.user?.phone || 'N/A'}</span>
                </div>
                <div className="text-slate-500 flex items-start gap-1">
                  <span className="shrink-0">📍</span>
                  <span><b>Takeaway Desk:</b> Techno World Books, 90/6A MG Rd, opp. Grace Cinema, College Street, Kolkata 700007</span>
                </div>
                {pickupSlotsModalOrder.selectedPickupSlot && (
                  <div className="mt-1 pt-1.5 border-t border-slate-200 text-emerald-800 font-bold flex items-center gap-1">
                    <span>✅ Customer Currently Selected:</span>
                    <span className="bg-emerald-100 px-2 py-0.5 rounded font-mono text-emerald-900">
                      {pickupSlotsModalOrder.selectedPickupSlot}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Proposed Pickup Time Slots (3–4 Options)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPickupSlotInputs([
                      'Today, 3:30 PM – 5:30 PM',
                      'Tomorrow, 11:30 AM – 1:30 PM',
                      'Tomorrow, 4:00 PM – 6:30 PM',
                      'Day after Tomorrow, 12:00 PM – 3:00 PM',
                    ])}
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    Reset to Default Slots
                  </button>
                </div>
                <div className="space-y-2.5">
                  {pickupSlotInputs.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={slot}
                        onChange={(e) => {
                          const updated = [...pickupSlotInputs];
                          updated[idx] = e.target.value;
                          setPickupSlotInputs(updated);
                        }}
                        placeholder={`Slot ${idx + 1} (e.g. Tomorrow, 2:00 PM – 4:00 PM)`}
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                      {pickupSlotInputs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = pickupSlotInputs.filter((_, i) => i !== idx);
                            setPickupSlotInputs(updated);
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove slot"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {pickupSlotInputs.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPickupSlotInputs([...pickupSlotInputs, ''])}
                    className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    + Add Another Slot Option
                  </button>
                )}
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-900 leading-relaxed">
                💡 Offering slots sends an immediate notification to the customer with an interactive button to pick their preferred time. Once confirmed, their official tax invoice displays their appointment.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setPickupSlotsModalOrder(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingPickupSlots}
                onClick={handleSetPickupSlotsSubmit}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors shadow"
              >
                {isSavingPickupSlots ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Offer Slots to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
