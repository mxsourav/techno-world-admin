export const discountPct = (book: { mrp: number; price: number }) =>
  Math.round(((book.mrp - book.price) / book.mrp) * 100);

export const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

/**
 * Generates/formats SKU ID following Flipkart Seller Hub client standard
 * Example patterns:
 * - "TW Hater Muthoi Miscellaneous"
 * - "AKE-2025-QUANAPTISCHAND-02"
 * - "Lucent and Arihant GK Combo"
 * - "Cengage Contemporary Abstract Algebra"
 * - "Balaji Physical Chemistry NEET"
 * - "BDC Handbook of General Anatomy"
 * - "Let us C 01"
 * - "Community Health Nursing 2"
 */
export function formatClientSku(book: any): string {
  if (!book) return 'TW Standard Academic Book';

  // 1. If book already has a valid human-written custom SKU (not a demo dummy like B01000, SKU-xxx)
  if (book.sku && typeof book.sku === 'string' && book.sku.trim()) {
    const rawSku = book.sku.trim();
    if (
      !/^[B]\d{3,6}$/i.test(rawSku) &&
      !/^SKU-[\w-]+$/i.test(rawSku) &&
      !/^BOOK-\d+$/i.test(rawSku) &&
      !/^DEMO-\d+$/i.test(rawSku)
    ) {
      return rawSku;
    }
  }

  const title = (book.title || '').trim();
  const publisherName = book.publisher?.name || book.publisher || '';
  const authorName =
    Array.isArray(book.authors) && book.authors.length > 0
      ? typeof book.authors[0] === 'string'
        ? book.authors[0]
        : book.authors[0].name
      : book.author || '';

  // 2. Identify Brand / Publisher / Author Prefix
  let prefix = 'TW';
  const pubLower = publisherName.toLowerCase();
  const authorLower = authorName.toLowerCase();
  const titleLower = title.toLowerCase();

  if (pubLower.includes('cengage') || titleLower.includes('cengage')) {
    prefix = 'Cengage';
  } else if (pubLower.includes('disha') || titleLower.includes('disha')) {
    prefix = 'Disha';
  } else if (pubLower.includes('balaji') || titleLower.includes('balaji')) {
    prefix = 'Balaji';
  } else if (pubLower.includes('lucent') || titleLower.includes('lucent')) {
    prefix = 'Lucent';
  } else if (pubLower.includes('arihant') || titleLower.includes('arihant')) {
    prefix = 'Arihant';
  } else if (pubLower.includes('routledge') || titleLower.includes('routledge')) {
    prefix = 'Routledge';
  } else if (authorLower.includes('chaurasia') || titleLower.includes('chaurasia')) {
    prefix = 'BDC';
  } else if (authorLower.includes('aditya ranjan') || titleLower.includes('aditya ranjan')) {
    prefix = 'Aditya Ranjan';
  } else if (authorLower.includes('kanetkar') || titleLower.includes('let us c')) {
    prefix = 'Let us C';
  } else if (authorLower.includes('balasubramanian') || titleLower.includes('balasubramanian')) {
    prefix = 'Nurshing Education N Balasubramanian';
  } else if (publisherName && !pubLower.includes('techno world') && !pubLower.includes('publisher')) {
    prefix = publisherName.split(' ')[0];
  }

  // 3. Extract and sanitize Core Title
  let core = title
    .replace(/^(Textbook of|Handbook of|The|A|An|Problems in|Complete Maths New Updated Book \(RWA\) \| Special For)\s+/i, '')
    .replace(/\|\s*New Edition.*$/i, '')
    .replace(/\|\s*Special For.*$/i, '')
    .replace(/-\s*By\s+.*$/i, '')
    .replace(/-\s*\d+(st|nd|rd|th)?\s*Edition.*$/i, '')
    .replace(/\s*\d{4}-\d{4}.*$/i, '')
    .replace(/\s*Chapter-Wise.*$/i, '')
    .replace(/\s*Entrance Test.*$/i, '')
    .replace(/Demo Book\s*(\d+)/i, 'General Studies Guide $1')
    .trim();

  // Format Roman numbers and editions
  core = core
    .replace(/-II$/i, ' 2')
    .replace(/-III$/i, ' 3')
    .replace(/-IV$/i, ' 4')
    .replace(/-I$/i, ' 1')
    .replace(/Volume\s+I\s*&\s*II/i, 'Old Paper 1&2')
    .replace(/Volume\s+I/i, '01')
    .replace(/Volume\s+II/i, '02');

  const words = core.split(/\s+/).filter(Boolean);
  const cleanCore = words.length > 5 ? words.slice(0, 4).join(' ') : core;

  if (prefix === 'Nurshing Education N Balasubramanian') {
    return prefix;
  }

  if (cleanCore.toLowerCase().startsWith(prefix.toLowerCase())) {
    return cleanCore;
  }

  return `${prefix} ${cleanCore}`;
}

/**
 * Formats FSN according to Flipkart standards (Numeric 13-digit ISBN or 16-character alphanumeric RBK token)
 */
export function formatClientFsn(book: any): string {
  if (!book) return 'RBKHBH67KZS2NURE';
  if (book.isbn13 && /^\d{10,13}$/.test(book.isbn13.trim())) {
    return book.isbn13.trim();
  }
  if (book.isbn10 && /^\d{10}$/.test(book.isbn10.trim())) {
    return book.isbn10.trim();
  }
  const idStr = String(book.id || book.bookCode || book.title || '123456');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let fsnSuffix = '';
  let tempHash = Math.abs(hash);
  for (let i = 0; i < 13; i++) {
    fsnSuffix += chars.charAt((tempHash + i * 7) % chars.length);
  }
  return `RBK${fsnSuffix}`;
}
