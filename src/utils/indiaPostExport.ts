/**
 * India Post Bulk Booking Batch Exporter Utility
 * Generates official Customer Self-Service Portal (Click n Book) compatible batch files
 * for automated consignment booking, label generation, and dispatch handover.
 */

export interface IndiaPostConsignment {
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  itemsCount: number;
  weightGrams?: number;
  declaredValue: number;
  paymentMode: 'PREPAID' | 'COD';
  serviceType?: 'SPEED_POST' | 'BOOK_POST' | 'BUSINESS_PARCEL';
  barcode?: string;
}

const DEFAULT_SENDER = {
  name: 'Techno World Books Hub',
  company: 'Techno World Publications',
  address: 'College Street (Bidhan Sarani), Near Presidency',
  city: 'Kolkata',
  state: 'West Bengal',
  pincode: '700006',
  mobile: '9830000000',
};

/**
 * Sanitizes address strings for India Post CEPT compliance (strips illegal symbols and limits length)
 */
function sanitizePostalText(text?: string, maxLength = 80): string {
  if (!text) return '';
  return String(text)
    .replace(/[^\w\s,.-]/g, ' ') // Remove special chars that fail government validation
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Maps application order objects to India Post Bulk Consignment specification
 */
export function mapOrdersToIndiaPost(orders: any[]): IndiaPostConsignment[] {
  return orders.map((order, idx) => {
    const addr = order.address || {};
    const recipientName = addr.fullName || order.user?.name || `Customer #${order.orderNumber || idx + 1}`;
    const cleanPhone = (addr.phone || order.user?.phone || '9830000000').replace(/\D/g, '').slice(-10);
    const cleanPin = (addr.pincode || '').replace(/\D/g, '').slice(0, 6);
    
    // Estimate weight: 350g per book + 100g packaging, minimum 250g
    const itemCount = Array.isArray(order.items) ? order.items.length : 1;
    const estWeight = Math.max(250, itemCount * 350);

    const isCod = String(order.paymentMethod || '').toUpperCase() === 'COD';
    const isBookPost = String(order.shippingMethod || order.shippingCarrier || '').toUpperCase().includes('BOOK');

    return {
      orderNumber: order.orderNumber || order.id || `ORD-${idx + 1}`,
      customerName: sanitizePostalText(recipientName, 50),
      phone: cleanPhone.length === 10 ? cleanPhone : '9830000000',
      email: addr.email || order.user?.email || '',
      addressLine1: sanitizePostalText(addr.addressLine1 || 'College Street Area', 80),
      addressLine2: sanitizePostalText(addr.addressLine2 || '', 80),
      city: sanitizePostalText(addr.city || 'Kolkata', 40),
      state: sanitizePostalText(addr.state || 'West Bengal', 40),
      pincode: cleanPin.length === 6 ? cleanPin : '700001',
      itemsCount: itemCount,
      weightGrams: Number(order.weightGrams) || estWeight,
      declaredValue: Number(order.totalAmount) || 500,
      paymentMode: isCod ? 'COD' : 'PREPAID',
      serviceType: isBookPost ? 'BOOK_POST' : 'SPEED_POST',
      barcode: order.trackingNumber || '',
    };
  });
}

/**
 * Generates an India Post compliant CSV file string with UTF-8 BOM
 */
export function generateIndiaPostCsvContent(consignments: IndiaPostConsignment[]): string {
  const headers = [
    'Sl No',
    'Article Type',
    'Customer Reference (Order ID)',
    'Addressee Name',
    'Address Line 1',
    'Address Line 2',
    'Destination City',
    'Destination State',
    'Destination PIN Code',
    'Addressee Mobile',
    'Addressee Email',
    'Weight (in grams)',
    'Length (cm)',
    'Breadth (cm)',
    'Height (cm)',
    'Declared Value (INR)',
    'Payment Mode',
    'COD Amount',
    'Sender Name',
    'Sender Address',
    'Sender City',
    'Sender State',
    'Sender PIN Code',
    'Sender Mobile',
  ];

  const rows = consignments.map((c, index) => {
    const articleType = c.serviceType === 'BOOK_POST' ? 'Book Post' : 'Speed Post (Domestic)';
    const codVal = c.paymentMode === 'COD' ? c.declaredValue : 0;

    return [
      index + 1,
      `"${articleType}"`,
      `"${c.orderNumber}"`,
      `"${c.customerName}"`,
      `"${c.addressLine1}"`,
      `"${c.addressLine2 || ''}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      `"${c.pincode}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      c.weightGrams || 450,
      20, // Length cm
      15, // Breadth cm
      3,  // Height cm
      c.declaredValue,
      `"${c.paymentMode}"`,
      codVal,
      `"${DEFAULT_SENDER.name}"`,
      `"${DEFAULT_SENDER.address}"`,
      `"${DEFAULT_SENDER.city}"`,
      `"${DEFAULT_SENDER.state}"`,
      `"${DEFAULT_SENDER.pincode}"`,
      `"${DEFAULT_SENDER.mobile}"`,
    ].join(',');
  });

  // Prepend UTF-8 BOM so Excel on Windows properly displays characters
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a 1-click browser download of the India Post Bulk Booking Excel/CSV file
 */
export function downloadIndiaPostBulkFile(orders: any[], batchDate = new Date()): { count: number; filename: string } {
  const consignments = mapOrdersToIndiaPost(orders);
  const csvContent = generateIndiaPostCsvContent(consignments);

  const dateStr = batchDate.toISOString().slice(0, 10);
  const filename = `IndiaPost_BulkBooking_Batch_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return {
    count: consignments.length,
    filename,
  };
}
