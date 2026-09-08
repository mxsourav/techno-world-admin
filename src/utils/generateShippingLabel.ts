import { TECHNO_WORLD_BLACK_LOGO_B64 } from './logoBase64';

export type ShippingLabelSize = '75x125' | '100x150' | '100x100' | 'A7' | 'A6' | 'A5' | 'A4';
export type ShippingLabelDesign = 'india-post' | 'modern-thermal' | 'compact-courier' | 'all-in-one';

export interface ShippingLabelOptions {
  size?: ShippingLabelSize;
  design?: ShippingLabelDesign;
  showLogo?: boolean;
  showSkus?: boolean;
  showOrderBarcode?: boolean;
  showPrice?: boolean; // Price showing optional button/toggle
  customWeight?: number;
  customSenderAddress?: string;
  customReturnAddress?: string; // "if not delivered" return address
  customArticleNumber?: string;
  customCarrier?: string;
  customNotes?: string;
}

// Code 128B patterns (107 patterns)
const CODE128_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

export function generateCode128Svg(text: string, height = 44, barWidth = 1.6): string {
  const clean = text.replace(/[^ -~]/g, '');
  if (!clean) return '';
  const START_B = 104;
  const STOP = 106;
  const codes = [START_B];
  let checkSum = START_B;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) - 32;
    codes.push(code);
    checkSum += code * (i + 1);
  }
  const checkDigit = checkSum % 103;
  codes.push(checkDigit);
  codes.push(STOP);

  let patternStr = "";
  for (const c of codes) {
    patternStr += CODE128_PATTERNS[c] || "212222";
  }

  let totalModules = 0;
  for (let i = 0; i < patternStr.length; i++) {
    totalModules += parseInt(patternStr[i], 10);
  }

  const svgWidth = totalModules * barWidth;
  let svgPaths = "";
  let currentX = 0;
  let isBar = true;

  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10) * barWidth;
    if (isBar) {
      svgPaths += `<rect x="${currentX}" y="0" width="${width}" height="${height}" fill="#000000" />`;
    }
    currentX += width;
    isBar = !isBar;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${height}" width="${svgWidth}" height="${height}" style="display:block;margin:0 auto;max-width:100%;">${svgPaths}</svg>`;
}

export function generateIndiaPostEmblemSvg(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70" width="44" height="30" style="display:inline-block;vertical-align:middle;">
      <rect width="100" height="70" rx="6" fill="#b91c1c" />
      <path d="M12 52 L38 20 L58 38 L88 16 L76 52 Z" fill="#facc15" />
      <path d="M24 52 L42 28 L56 42 L80 24 L70 52 Z" fill="#b91c1c" />
      <circle cx="50" cy="46" r="3.5" fill="#ffffff" />
      <text x="50" y="64" font-family="Arial, sans-serif" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle">INDIA POST</text>
    </svg>
  `;
}

export function generateSingleStickerCardHtml(order: any, options: ShippingLabelOptions = {}): string {
  const size = options.size || '75x125';
  const design = options.design || 'india-post';
  const showLogo = options.showLogo !== false;
  const showSkus = options.showSkus !== false;
  const showOrderBarcode = options.showOrderBarcode !== false;
  const showPrice = options.showPrice !== false; // Default: show price

  const orderNum = order.orderNumber || order.id?.slice(0, 8) || 'TW-ORD-000';
  const articleNo = options.customArticleNumber || order.trackingNumber || `EB${Math.floor(100000000 + Math.random() * 900000000)}IN`;
  const carrier = options.customCarrier || (order.shippingMethod === 'NORMAL_POST' ? 'BOOK POST (PARCEL)' : 'SPEED POST (DOMESTIC)');
  const isSpeedPost = carrier.includes('SPEED');

  const addr = order.address || {};
  const recipientName = addr.fullName || addr.name || order.user?.name || 'Valued Customer';
  const recipientPhone = addr.phone || order.user?.phone || 'N/A';
  const recipientLine1 = addr.addressLine1 || addr.address || 'Address Line 1';
  const recipientLine2 = addr.addressLine2 || '';
  const recipientCity = addr.city || 'KOLKATA';
  const recipientState = addr.state || 'WEST BENGAL';
  const recipientPin = String(addr.pincode || '700006').trim();

  const senderName = 'Techno World Books Hub';
  const senderCompany = 'Techno World Publications';
  const senderAddress = options.customSenderAddress || 'College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006';
  const returnAddress = options.customReturnAddress || 'Techno World Books Hub, 90/6A Mahatma Gandhi Road, College Street, Kolkata - 700007, WB. Phone: 033-2219-XXXX / 9830000000';
  const senderPhone = '033-2219-XXXX / 9830000000';
  const senderGst = '19AAACT0000A1Z5';

  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((acc: number, it: any) => acc + (it.quantity || it.qty || 1), 0) || 1;
  const totalWeight = options.customWeight || Math.max(350, totalQty * 420);
  const declaredValue = order.totalAmount || order.payableAmount || 0;
  const isCOD = (order.paymentMethod || '').toUpperCase() === 'COD';
  const bookingDate = new Date(order.placedAt || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Ordered items breakdown
  const itemsRowsHtml = items.map((it: any) => {
    const bk = it.book || {};
    const sku = bk.sku || bk.isbn13 || bk.isbn10 || it.sku || 'SKU-TW';
    const title = bk.title || it.title || 'Academic Book';
    const qty = it.quantity || it.qty || 1;
    return `
      <div class="item-row">
        <div class="item-left">
          <span class="item-sku">[${sku}]</span>
          <span class="item-name">${title}</span>
        </div>
        <div class="item-right">
          <span class="item-qty-badge">Qty: <b>${qty}</b></span>
        </div>
      </div>
    `;
  }).join('');

  const isCompact = size === 'A7' || size === '75x125' || size === '100x100';
  const articleBarcodeSvg = generateCode128Svg(
    articleNo, 
    size === 'A7' ? 34 : size === '75x125' ? 38 : 42, 
    isCompact ? 1.4 : 1.65
  );
  const orderBarcodeSvg = showOrderBarcode ? generateCode128Svg(
    orderNum, 
    size === 'A7' ? 22 : size === '75x125' ? 24 : 28, 
    1.1
  ) : '';

  // Payment Badge Text (respects showPrice option)
  let paymentBadgeHtml = '';
  if (isCOD) {
    paymentBadgeHtml = `
      <div class="payment-badge cod-badge">
        ${showPrice ? `C.O.D. COLLECT CASH: <b>₹${declaredValue}</b>` : `C.O.D. SHIPMENT — REFER INVOICE`}
      </div>
    `;
  } else {
    paymentBadgeHtml = `
      <div class="payment-badge prepaid-badge">
        ${showPrice ? `PREPAID: ₹${declaredValue} (DO NOT COLLECT)` : `PREPAID SHIPMENT (DO NOT COLLECT CASH)`}
      </div>
    `;
  }

  // --- DESIGN 1: OFFICIAL INDIA POST (CEPT STANDARD) ---
  if (design === 'india-post') {
    return `
      <div class="sticker-container design-india-post size-${size}">
        <!-- Header -->
        <div class="header-band ${isSpeedPost ? 'speed-post' : 'normal-post'}">
          <div class="header-left">
            ${generateIndiaPostEmblemSvg()}
            <div>
              <div class="service-name">${carrier}</div>
              <div class="service-sub">DEPARTMENT OF POSTS - GOVT. OF INDIA</div>
            </div>
          </div>
          <div class="header-right">
            <div>BOOKED AT: KOLKATA GPO BNPL</div>
            <div class="booking-date">${bookingDate}</div>
          </div>
        </div>

        <!-- Primary Consignment Tracking Barcode -->
        <div class="barcode-band">
          <div class="barcode-svg">${articleBarcodeSvg}</div>
          <div class="article-no-text">ARTICLE NO: <b>${articleNo.replace(/(.{2})(.{3})(.{3})(.{3})(.{2})/, '$1 $2 $3 $4 $5')}</b></div>
        </div>

        <!-- Routing & Delivery PIN Banner -->
        <div class="routing-band">
          <div class="pin-block">
            <span class="pin-title">DELIVERY PIN:</span>
            <span class="pin-number">${recipientPin}</span>
          </div>
          <div class="hub-block">
            <span class="hub-title">SORTING HUB:</span>
            <span class="hub-name">${recipientCity.toUpperCase()} / ${recipientState.toUpperCase()}</span>
          </div>
        </div>

        <!-- Addresses Grid -->
        <div class="address-band">
          <div class="to-cell">
            <div class="cell-label">DELIVER TO:</div>
            <div class="recipient-name">${recipientName}</div>
            <div class="recipient-address">
              ${recipientLine1}<br/>
              ${recipientLine2 ? recipientLine2 + '<br/>' : ''}
              <b>${recipientCity}</b>, ${recipientState} - <b class="pin-accent">${recipientPin}</b>
            </div>
            <div class="recipient-phone">MOB: <b>${recipientPhone}</b></div>
          </div>

          <div class="from-cell">
            ${showLogo ? `<img src="${TECHNO_WORLD_BLACK_LOGO_B64}" class="merchant-logo" alt="Techno World Logo" />` : ''}
            <div class="cell-label">FROM (SENDER):</div>
            <div class="sender-name">${senderName}</div>
            <div class="sender-sub">${senderCompany}</div>
            <div class="sender-address">${senderAddress}</div>
            <div class="sender-contact">Ph: ${senderPhone}</div>
            <div class="sender-gst">GSTIN: ${senderGst}</div>
          </div>
        </div>

        <!-- Package Manifest, Payment & Barcode -->
        <div class="metrics-band">
          <div class="metrics-left">
            <div class="metrics-line">
              <span><b>WT:</b> ${totalWeight}g</span>
              <span><b>DIMS:</b> 20x15x3 cm</span>
              <span><b>PCS:</b> ${totalQty}</span>
            </div>
            ${paymentBadgeHtml}
          </div>
          <div class="metrics-right">
            <div class="order-id-tag">ORDER: <b>${orderNum}</b></div>
            ${showOrderBarcode ? `<div class="order-barcode-wrapper">${orderBarcodeSvg}</div>` : ''}
          </div>
        </div>

        <!-- Ordered Items Section (Clean padding & word-wrap) -->
        ${showSkus && itemsRowsHtml ? `
          <div class="ordered-items-band">
            <div class="items-header">
              <span>ORDERED ITEMS (${items.length} Book${items.length > 1 ? 's' : ''}, Total Qty: ${totalQty})</span>
            </div>
            <div class="items-list-container">
              ${itemsRowsHtml}
            </div>
          </div>
        ` : ''}

        <!-- If Not Delivered Return Notice -->
        <div class="return-band">
          <b>IF UNDELIVERED, RETURN TO:</b> ${returnAddress}
        </div>

        <!-- Postal Warning Footer -->
        <div class="footer-band">
          PROPERTY OF INDIA POST NETWORK • HANDLE WITH CARE - CONTAINS ACADEMIC EDUCATIONAL BOOKS
        </div>
      </div>
    `;
  }

  // --- DESIGN 2: MODERN E-COMMERCE THERMAL (FLIPKART / AMAZON / DELHIVERY STYLE) ---
  if (design === 'modern-thermal') {
    return `
      <div class="sticker-container design-modern-thermal size-${size}">
        <!-- Top Bar with Carrier & Date -->
        <div class="thermal-header">
          <div class="thermal-brand">
            <span class="carrier-badge">${carrier}</span>
            <span class="ship-date">${bookingDate}</span>
          </div>
          <div class="thermal-order-ref">
            <b>ORDER #${orderNum}</b>
          </div>
        </div>

        <!-- Tracking Barcode -->
        <div class="thermal-barcode-box">
          <div class="barcode-svg">${articleBarcodeSvg}</div>
          <div class="tracking-caption">AWB / TRACKING: <b>${articleNo}</b></div>
        </div>

        <!-- High-Contrast Destination Box -->
        <div class="thermal-dest-box">
          <div class="dest-pin-large">PIN: <b>${recipientPin}</b></div>
          <div class="dest-hub-text">${recipientCity.toUpperCase()} (${recipientState.toUpperCase()})</div>
        </div>

        <!-- Consignee Information -->
        <div class="thermal-consignee-box">
          <div class="consignee-tag">SHIP TO (BUYER):</div>
          <div class="consignee-name">${recipientName}</div>
          <div class="consignee-addr">${recipientLine1}, ${recipientLine2 ? recipientLine2 + ', ' : ''}${recipientCity}, ${recipientState} - <b>${recipientPin}</b></div>
          <div class="consignee-mob">CONTACT: <b>${recipientPhone}</b></div>
        </div>

        <!-- Payment & Metrics -->
        <div class="thermal-middle-row">
          <div class="thermal-pay-col">
            ${paymentBadgeHtml}
          </div>
          <div class="thermal-metric-col">
            <span>WT: <b>${totalWeight}g</b></span>
            <span>ITEMS: <b>${totalQty}</b></span>
          </div>
        </div>

        <!-- Ordered Items Summary -->
        ${showSkus && itemsRowsHtml ? `
          <div class="thermal-items-box">
            <div class="thermal-items-title">MANIFEST: ${items.length} TITLE(S) | TOTAL QTY: ${totalQty}</div>
            <div class="items-list-container">
              ${itemsRowsHtml}
            </div>
          </div>
        ` : ''}

        <!-- Return / Shipper Block -->
        <div class="thermal-return-box">
          <div class="return-title">RETURN IF UNDELIVERED TO:</div>
          <div class="return-body">${senderName}, ${senderAddress} | Helpline: ${senderPhone}</div>
        </div>
      </div>
    `;
  }

  // --- DESIGN 3: COMPACT COURIER (3" OR 4" THERMAL ROLL) ---
  if (design === 'compact-courier') {
    return `
      <div class="sticker-container design-compact-courier size-${size}">
        <div class="compact-header">
          <b>${carrier}</b>
          <span>${bookingDate}</span>
        </div>

        <div class="compact-barcode">
          ${articleBarcodeSvg}
          <div class="compact-art-no">${articleNo}</div>
        </div>

        <div class="compact-routing">
          <span>DELIVERY PIN: <b>${recipientPin}</b></span>
          <span>${recipientCity.toUpperCase()}</span>
        </div>

        <div class="compact-to">
          <div class="compact-to-name"><b>TO:</b> ${recipientName} (Ph: ${recipientPhone})</div>
          <div class="compact-to-addr">${recipientLine1}, ${recipientCity} - ${recipientPin}</div>
        </div>

        <div class="compact-payment-row">
          ${paymentBadgeHtml}
          <span class="compact-ord">ORD: ${orderNum}</span>
        </div>

        ${showSkus && itemsRowsHtml ? `
          <div class="compact-items">
            ${itemsRowsHtml}
          </div>
        ` : ''}

        <div class="compact-return">
          <b>RTO:</b> ${senderName}, Kolkata 700006. Ph: ${senderPhone}
        </div>
      </div>
    `;
  }

  // --- DESIGN 4: ALL-IN-ONE DISPATCH & PACKING SLIP ---
  return `
    <div class="sticker-container design-all-in-one size-${size}">
      <!-- Top Half: Shipping Label -->
      <div class="all-in-one-top">
        <div class="header-band ${isSpeedPost ? 'speed-post' : 'normal-post'}">
          <div class="header-left">
            ${generateIndiaPostEmblemSvg()}
            <div>
              <div class="service-name">${carrier}</div>
              <div class="service-sub">INDIA POST PARCEL CONSIGNMENT</div>
            </div>
          </div>
          <div class="header-right">
            <div>${bookingDate}</div>
            <div class="booking-office">KOLKATA GPO</div>
          </div>
        </div>

        <div class="barcode-band">
          <div class="barcode-svg">${articleBarcodeSvg}</div>
          <div class="article-no-text">ARTICLE NO: <b>${articleNo}</b></div>
        </div>

        <div class="routing-band">
          <div class="pin-block">PIN: <b>${recipientPin}</b></div>
          <div class="hub-block">${recipientCity.toUpperCase()} HUB</div>
        </div>

        <div class="address-band">
          <div class="to-cell">
            <div class="cell-label">SHIP TO:</div>
            <div class="recipient-name">${recipientName}</div>
            <div class="recipient-address">${recipientLine1}, ${recipientCity} - <b>${recipientPin}</b></div>
            <div class="recipient-phone">Ph: <b>${recipientPhone}</b></div>
          </div>
          <div class="from-cell">
            <div class="cell-label">RETURN TO:</div>
            <div class="sender-name">${senderName}</div>
            <div class="sender-address">${senderAddress}</div>
            <div class="sender-contact">Ph: ${senderPhone}</div>
          </div>
        </div>

        <div class="metrics-band">
          <div class="metrics-left">
            ${paymentBadgeHtml}
          </div>
          <div class="metrics-right">
            <span>ORDER: <b>${orderNum}</b></span>
            <span>WT: <b>${totalWeight}g</b></span>
          </div>
        </div>
      </div>

      <!-- Tear Line -->
      <div class="tear-divider">
        <span>✂ FOLD / TEAR HERE FOR PACKING SLIP ✂</span>
      </div>

      <!-- Bottom Half: Itemized Packing Manifest -->
      <div class="all-in-one-bottom">
        <div class="packing-slip-title">DISPATCH PACKING MANIFEST — ORDER #${orderNum}</div>
        <div class="packing-items-table">
          <div class="table-head">
            <span class="col-sku">SKU</span>
            <span class="col-title">Book Description</span>
            <span class="col-qty">Quantity</span>
            ${showPrice ? `<span class="col-price">Price</span>` : ''}
          </div>
          ${items.map((it: any) => {
            const bk = it.book || {};
            const sku = bk.sku || bk.isbn13 || it.sku || 'SKU';
            const title = bk.title || it.title || 'Book Title';
            const qty = it.quantity || it.qty || 1;
            const price = it.price || bk.price || '';
            return `
              <div class="table-row">
                <span class="col-sku">${sku}</span>
                <span class="col-title">${title}</span>
                <span class="col-qty"><b>${qty}</b></span>
                ${showPrice ? `<span class="col-price">₹${price}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div class="packing-footer-row">
          <span><b>Packed By:</b> Techno World Dispatch</span>
          <span><b>Verified Count:</b> ${totalQty} Book(s)</span>
          <span><b>Support:</b> mail@technoworldbooks.in</span>
        </div>
      </div>
    </div>
  `;
}

export function generatePrintDocumentHtml(stickersHtml: string, size: ShippingLabelSize = '75x125'): string {
  const sizeStyles: Record<ShippingLabelSize, { page: string; width: string; height: string; fontSize: string }> = {
    '75x125': {
      page: 'size: 75mm 125mm; margin: 0;',
      width: '73mm',
      height: '123mm',
      fontSize: '9px',
    },
    '100x150': {
      page: 'size: 100mm 150mm; margin: 0;',
      width: '97mm',
      height: '147mm',
      fontSize: '10px',
    },
    '100x100': {
      page: 'size: 100mm 100mm; margin: 0;',
      width: '97mm',
      height: '97mm',
      fontSize: '8.5px',
    },
    A7: {
      page: 'size: 74mm 105mm; margin: 0;',
      width: '72mm',
      height: '103mm',
      fontSize: '8px',
    },
    A6: {
      page: 'size: 105mm 148mm; margin: 0;',
      width: '101mm',
      height: '144mm',
      fontSize: '10px',
    },
    A5: {
      page: 'size: 148mm 210mm; margin: 0;',
      width: '142mm',
      height: '204mm',
      fontSize: '11.5px',
    },
    A4: {
      page: 'size: 210mm 297mm; margin: 0;',
      width: '200mm',
      height: '287mm',
      fontSize: '12.5px',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles['75x125'];

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Techno World Shipping Labels (${size})</title>
        <style>
          @page {
            ${currentSize.page}
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: ${currentSize.fontSize};
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; margin: 0; background: #ffffff; }
            .sticker-page-break {
              page-break-after: always;
              break-after: page;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
          @media screen {
            body {
              background: #f1f5f9;
              padding: 20px;
            }
            .preview-wrapper {
              max-width: 800px;
              margin: 0 auto;
            }
            .sticker-page-break {
              margin-bottom: 24px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.12);
              border-radius: 4px;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 10px;
            }
          }

          /* --- MAIN STICKER CONTAINER (Fixed padding & generous breathing room) --- */
          .sticker-container {
            width: ${currentSize.width};
            min-height: ${currentSize.height};
            max-height: ${currentSize.height};
            background: #ffffff;
            border: 2px solid #0f172a;
            padding: 3mm 3.5mm;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 2.5px;
            overflow: hidden;
            box-sizing: border-box;
          }

          /* --- DESIGN 1: OFFICIAL INDIA POST --- */
          .header-band {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #0f172a;
            padding-bottom: 2px;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .service-name {
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #b91c1c;
            line-height: 1.1;
          }
          .normal-post .service-name {
            color: #1e3a8a;
          }
          .service-sub {
            font-size: 7px;
            font-weight: 700;
            color: #475569;
            letter-spacing: 0.2px;
          }
          .header-right {
            text-align: right;
            font-size: 7.5px;
            font-weight: 600;
            color: #334155;
            line-height: 1.2;
          }

          /* Barcode */
          .barcode-band {
            text-align: center;
            padding: 2px 0 1px 0;
            border-bottom: 1.5px solid #0f172a;
          }
          .barcode-svg svg {
            margin: 0 auto;
            max-height: 38px;
          }
          .article-no-text {
            font-size: 11px;
            letter-spacing: 1.2px;
            font-family: monospace;
            margin-top: 1px;
          }

          /* Routing Banner */
          .routing-band {
            display: flex;
            background: #0f172a;
            color: #ffffff;
            border-bottom: 1.5px solid #0f172a;
            padding: 2px 4px;
            align-items: center;
            justify-content: space-between;
          }
          .pin-block {
            display: flex;
            align-items: baseline;
            gap: 3px;
          }
          .pin-title {
            font-size: 8px;
            font-weight: 700;
            color: #cbd5e1;
          }
          .pin-number {
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 1.5px;
            color: #facc15;
            font-family: monospace;
          }
          .hub-block {
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.4px;
            text-align: right;
          }

          /* Address Band */
          .address-band {
            display: grid;
            grid-template-columns: 1.35fr 0.9fr;
            border-bottom: 1.5px solid #0f172a;
            padding: 2px 0;
            gap: 3px;
          }
          .to-cell {
            padding: 2px 4px 2px 0;
            border-right: 1.5px solid #0f172a;
          }
          .from-cell {
            padding: 2px 0 2px 3px;
            background: #f8fafc;
          }
          .cell-label {
            font-size: 8px;
            font-weight: 900;
            color: #0f172a;
            text-decoration: underline;
            margin-bottom: 1px;
          }
          .recipient-name {
            font-size: 11px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 1px;
            line-height: 1.15;
          }
          .recipient-address {
            font-size: 8.5px;
            line-height: 1.2;
            color: #1e293b;
            margin-bottom: 2px;
          }
          .pin-accent {
            font-size: 10.5px;
            font-weight: 900;
          }
          .recipient-phone {
            font-size: 9px;
            font-weight: 700;
            background: #e2e8f0;
            padding: 1px 3px;
            border-radius: 2px;
            display: inline-block;
          }
          .merchant-logo {
            max-width: 60px;
            max-height: 16px;
            object-fit: contain;
            display: block;
            margin-bottom: 1px;
          }
          .sender-name {
            font-size: 9px;
            font-weight: 800;
            color: #0f172a;
          }
          .sender-sub {
            font-size: 7.5px;
            font-weight: 600;
            color: #475569;
          }
          .sender-address {
            font-size: 7.5px;
            line-height: 1.15;
            color: #334155;
            margin: 1px 0;
          }
          .sender-contact, .sender-gst {
            font-size: 7px;
            color: #475569;
          }

          /* Metrics & Payment */
          .metrics-band {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 0;
            border-bottom: 1px solid #cbd5e1;
            gap: 4px;
          }
          .metrics-line {
            display: flex;
            gap: 6px;
            font-size: 8px;
            margin-bottom: 2px;
          }
          .payment-badge {
            display: inline-block;
            padding: 1.5px 5px;
            font-weight: 800;
            border-radius: 3px;
            font-size: 8.5px;
            letter-spacing: 0.3px;
          }
          .prepaid-badge {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #86efac;
          }
          .cod-badge {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
          }
          .metrics-right {
            text-align: right;
            font-size: 8px;
          }
          .order-id-tag {
            font-size: 8px;
            font-weight: 700;
          }
          .order-barcode-wrapper svg {
            max-height: 20px;
            margin-left: auto;
          }

          /* Ordered Items List (Padding and line-height fixed!) */
          .ordered-items-band {
            border: 1px solid #cbd5e1;
            border-radius: 3px;
            background: #f8fafc;
            padding: 3px 4px;
            margin-top: 1px;
          }
          .items-header {
            font-size: 7.5px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 1px;
            margin-bottom: 2px;
          }
          .items-list-container {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 8.5px;
            line-height: 1.25;
          }
          .item-left {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            padding-right: 4px;
          }
          .item-sku {
            font-weight: 800;
            color: #0f172a;
            margin-right: 2px;
          }
          .item-name {
            color: #1e293b;
            font-weight: 500;
          }
          .item-right {
            white-space: nowrap;
          }
          .item-qty-badge {
            background: #e2e8f0;
            color: #0f172a;
            padding: 0.5px 3px;
            border-radius: 2px;
            font-size: 8px;
          }

          /* Return Notice */
          .return-band {
            font-size: 7px;
            color: #334155;
            line-height: 1.15;
            background: #f1f5f9;
            border: 1px dashed #94a3b8;
            border-radius: 2px;
            padding: 2px 3px;
            margin-top: 1px;
          }

          /* Postal Warning Footer */
          .footer-band {
            font-size: 6px;
            font-weight: 700;
            text-align: center;
            letter-spacing: 0.2px;
            color: #64748b;
            margin-top: auto;
            padding-top: 1px;
          }

          /* --- DESIGN 2: MODERN THERMAL STYLES --- */
          .design-modern-thermal .thermal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000000;
            padding-bottom: 3px;
          }
          .carrier-badge {
            font-weight: 900;
            font-size: 11px;
            background: #000000;
            color: #ffffff;
            padding: 1px 5px;
            border-radius: 2px;
          }
          .ship-date {
            font-size: 8px;
            margin-left: 4px;
            color: #475569;
          }
          .thermal-order-ref {
            font-size: 9px;
            font-family: monospace;
          }
          .thermal-barcode-box {
            text-align: center;
            border-bottom: 2px solid #000000;
            padding: 4px 0 2px 0;
          }
          .tracking-caption {
            font-size: 11px;
            font-family: monospace;
            letter-spacing: 1px;
            margin-top: 2px;
          }
          .thermal-dest-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #000000;
            color: #ffffff;
            padding: 3px 6px;
          }
          .dest-pin-large {
            font-size: 17px;
            font-weight: 900;
            font-family: monospace;
            letter-spacing: 1.5px;
          }
          .dest-hub-text {
            font-size: 9px;
            font-weight: 800;
          }
          .thermal-consignee-box {
            border: 1.5px solid #000000;
            padding: 4px;
            margin: 2px 0;
          }
          .consignee-tag {
            font-size: 7.5px;
            font-weight: 800;
            text-decoration: underline;
          }
          .consignee-name {
            font-size: 12px;
            font-weight: 900;
          }
          .consignee-addr {
            font-size: 9px;
            line-height: 1.25;
            margin: 2px 0;
          }
          .consignee-mob {
            font-size: 9.5px;
            font-weight: 800;
          }
          .thermal-middle-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 0;
            border-bottom: 1px solid #000000;
          }
          .thermal-items-box {
            border: 1px solid #cbd5e1;
            padding: 3px;
            border-radius: 2px;
          }
          .thermal-items-title {
            font-size: 7.5px;
            font-weight: 800;
            margin-bottom: 2px;
          }
          .thermal-return-box {
            font-size: 7px;
            line-height: 1.15;
            border-top: 1px dashed #64748b;
            padding-top: 2px;
            margin-top: auto;
          }
          .return-title {
            font-weight: 800;
          }

          /* --- DESIGN 3: COMPACT COURIER STYLES --- */
          .design-compact-courier .compact-header {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            border-bottom: 1.5px solid #000;
            padding-bottom: 1px;
          }
          .compact-barcode {
            text-align: center;
            border-bottom: 1.5px solid #000;
            padding: 2px 0;
          }
          .compact-art-no {
            font-size: 10px;
            font-weight: 800;
            font-family: monospace;
          }
          .compact-routing {
            display: flex;
            justify-content: space-between;
            background: #000;
            color: #fff;
            padding: 1px 4px;
            font-size: 10px;
          }
          .compact-to {
            border: 1px solid #000;
            padding: 2px 3px;
            font-size: 8px;
            margin: 1px 0;
          }
          .compact-payment-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8px;
            margin: 1px 0;
          }
          .compact-items {
            font-size: 7.5px;
            border-top: 1px dashed #94a3b8;
            padding-top: 1px;
          }
          .compact-return {
            font-size: 6.5px;
            margin-top: auto;
            border-top: 1px solid #000;
            padding-top: 1px;
          }

          /* --- DESIGN 4: ALL-IN-ONE DISPATCH & PACKING SLIP --- */
          .design-all-in-one {
            height: auto;
            max-height: none;
            min-height: auto;
          }
          .tear-divider {
            border-top: 2px dashed #0f172a;
            margin: 6px 0;
            text-align: center;
            font-size: 7.5px;
            font-weight: 800;
            color: #64748b;
            padding-top: 3px;
          }
          .packing-slip-title {
            font-size: 10px;
            font-weight: 900;
            text-align: center;
            margin-bottom: 4px;
            text-transform: uppercase;
          }
          .packing-items-table {
            border: 1px solid #0f172a;
            font-size: 8.5px;
          }
          .table-head {
            display: flex;
            background: #f1f5f9;
            font-weight: 800;
            padding: 2px 4px;
            border-bottom: 1px solid #0f172a;
          }
          .table-row {
            display: flex;
            padding: 2px 4px;
            border-bottom: 1px solid #e2e8f0;
          }
          .table-row:last-child {
            border-bottom: none;
          }
          .col-sku { width: 22%; font-family: monospace; font-weight: 700; }
          .col-title { flex: 1; padding-right: 4px; }
          .col-qty { width: 14%; text-align: center; }
          .col-price { width: 14%; text-align: right; }
          .packing-footer-row {
            display: flex;
            justify-content: space-between;
            font-size: 7.5px;
            margin-top: 4px;
            padding-top: 2px;
            border-top: 1px solid #cbd5e1;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: white; padding: 10px 18px; border-radius: 8px;">
          <div>
            <b>Techno World Official Shipping Labels</b> — Ready for Thermal / Laser Print (${size})
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" style="background: #047857; color: white; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px;">
              🖨️ Direct Print Now
            </button>
            <button onclick="window.close()" style="background: #475569; color: white; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;">
              Close
            </button>
          </div>
        </div>

        <div class="preview-wrapper">
          ${stickersHtml}
        </div>
      </body>
    </html>
  `;
}

export function printSingleShippingSticker(order: any, options: ShippingLabelOptions = {}): void {
  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert('Please allow popups to open the shipping label print window.');
    return;
  }

  const cardHtml = `<div class="sticker-page-break">${generateSingleStickerCardHtml(order, options)}</div>`;
  const docHtml = generatePrintDocumentHtml(cardHtml, options.size || '75x125');

  printWindow.document.open();
  printWindow.document.write(docHtml);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

export function printBatchShippingStickers(orders: any[], options: ShippingLabelOptions = {}): void {
  if (!orders || orders.length === 0) {
    alert('No orders selected for printing shipping labels.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert('Please allow popups to open the shipping label print window.');
    return;
  }

  const cardsHtml = orders.map((o) => `<div class="sticker-page-break">${generateSingleStickerCardHtml(o, options)}</div>`).join('\n');
  const docHtml = generatePrintDocumentHtml(cardsHtml, options.size || '75x125');

  printWindow.document.open();
  printWindow.document.write(docHtml);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };
}
