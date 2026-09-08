import { TECHNO_WORLD_BLACK_LOGO_B64 } from './logoBase64';

export type ShippingLabelSize = 'A7' | 'A6' | 'A5';

export interface ShippingLabelOptions {
  size?: ShippingLabelSize;
  showLogo?: boolean;
  showSkus?: boolean;
  showOrderBarcode?: boolean;
  customWeight?: number;
  customSenderAddress?: string;
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

export function generateCode128Svg(text: string, height = 46, barWidth = 1.6): string {
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70" width="46" height="32" style="display:inline-block;vertical-align:middle;">
      <rect width="100" height="70" rx="6" fill="#b91c1c" />
      <!-- Stylized India Post Wing Emblem -->
      <path d="M12 52 L38 20 L58 38 L88 16 L76 52 Z" fill="#facc15" />
      <path d="M24 52 L42 28 L56 42 L80 24 L70 52 Z" fill="#b91c1c" />
      <circle cx="50" cy="46" r="3.5" fill="#ffffff" />
      <text x="50" y="64" font-family="Arial, sans-serif" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle">INDIA POST</text>
    </svg>
  `;
}

export function generateSingleStickerCardHtml(order: any, options: ShippingLabelOptions = {}): string {
  const size = options.size || 'A6';
  const showLogo = options.showLogo !== false;
  const showSkus = options.showSkus !== false;
  const showOrderBarcode = options.showOrderBarcode !== false;

  const orderNum = order.orderNumber || order.id?.slice(0, 8) || 'TW-ORD-000';
  const articleNo = options.customArticleNumber || order.trackingNumber || `EB${Math.floor(100000000 + Math.random() * 900000000)}IN`;
  const carrier = options.customCarrier || (order.shippingMethod === 'NORMAL_POST' ? 'BOOK POST (PARCEL)' : 'SPEED POST (DOMESTIC)');
  const isSpeedPost = carrier.includes('SPEED');

  const addr = order.address || {};
  const recipientName = addr.fullName || addr.name || order.user?.name || 'Customer';
  const recipientPhone = addr.phone || order.user?.phone || 'N/A';
  const recipientLine1 = addr.addressLine1 || addr.address || 'Address Line 1';
  const recipientLine2 = addr.addressLine2 || '';
  const recipientCity = addr.city || 'KOLKATA';
  const recipientState = addr.state || 'WEST BENGAL';
  const recipientPin = String(addr.pincode || '700006').trim();

  const senderName = 'Techno World Books Hub';
  const senderCompany = 'Techno World Publications';
  const senderAddress = options.customSenderAddress || 'College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006';
  const senderPhone = '033-2219-XXXX / 9830000000';
  const senderGst = '19AAACT0000A1Z5';

  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((acc: number, it: any) => acc + (it.quantity || it.qty || 1), 0) || 1;
  const totalWeight = options.customWeight || Math.max(350, totalQty * 420);
  const declaredValue = order.totalAmount || order.payableAmount || 499;
  const isCOD = (order.paymentMethod || '').toUpperCase() === 'COD';
  const bookingDate = new Date(order.placedAt || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const skusList = items.map((it: any) => {
    const bk = it.book || {};
    const sku = bk.sku || bk.isbn13 || bk.isbn10 || it.sku || 'SKU-TW';
    const title = bk.title || it.title || 'Book Title';
    const qty = it.quantity || it.qty || 1;
    return `<div style="font-size:10px;line-height:1.2;margin-bottom:2px;"><b>[${sku}]</b> ${title.slice(0, 32)} (Qty: ${qty})</div>`;
  }).join('');

  const articleBarcodeSvg = generateCode128Svg(articleNo, size === 'A7' ? 36 : 46, size === 'A7' ? 1.4 : 1.7);
  const orderBarcodeSvg = showOrderBarcode ? generateCode128Svg(orderNum, size === 'A7' ? 24 : 30, 1.2) : '';

  return `
    <div class="sticker-container size-${size}">
      <!-- Official Postal Header -->
      <div class="sticker-header ${isSpeedPost ? 'speed-post' : 'normal-post'}">
        <div class="header-left">
          ${generateIndiaPostEmblemSvg()}
          <div class="header-title">
            <div class="service-name">${carrier}</div>
            <div class="service-sub">DEPARTMENT OF POSTS - GOVT. OF INDIA</div>
          </div>
        </div>
        <div class="header-right">
          <div class="booking-office">BOOKED AT: KOLKATA GPO BNPL</div>
          <div class="booking-date">${bookingDate}</div>
        </div>
      </div>

      <!-- Primary Tracking Barcode Section -->
      <div class="barcode-box">
        <div class="article-barcode-svg">${articleBarcodeSvg}</div>
        <div class="article-number-text">ARTICLE NO: <b>${articleNo.replace(/(.{2})(.{3})(.{3})(.{3})(.{2})/, '$1 $2 $3 $4 $5')}</b></div>
      </div>

      <!-- Routing & PIN Banner -->
      <div class="routing-banner">
        <div class="dest-pin-box">
          <span class="pin-label">DELIVERY PIN:</span>
          <span class="pin-digits">${recipientPin}</span>
        </div>
        <div class="dest-hub-box">
          <span class="hub-label">SORTING HUB:</span>
          <span class="hub-name">${recipientCity.toUpperCase()} / ${recipientState.toUpperCase()}</span>
        </div>
      </div>

      <!-- Addresses Grid -->
      <div class="address-grid">
        <!-- Delivery Consignee (TO) -->
        <div class="to-box">
          <div class="box-title">DELIVER TO:</div>
          <div class="recipient-name">${recipientName}</div>
          <div class="recipient-address">
            ${recipientLine1}<br/>
            ${recipientLine2 ? recipientLine2 + '<br/>' : ''}
            <b>${recipientCity}</b>, ${recipientState} - <b style="font-size:13px;">${recipientPin}</b>
          </div>
          <div class="recipient-contact">MOB: <b>${recipientPhone}</b></div>
        </div>

        <!-- Shipper Return (FROM) -->
        <div class="from-box">
          ${showLogo ? `<img src="${TECHNO_WORLD_BLACK_LOGO_B64}" class="merchant-logo" alt="Techno World Logo" />` : ''}
          <div class="box-title" style="margin-top:2px;">FROM (SENDER):</div>
          <div class="sender-name">${senderName}</div>
          <div class="sender-sub">${senderCompany}</div>
          <div class="sender-address">${senderAddress}</div>
          <div class="sender-contact">Ph: ${senderPhone}</div>
          <div class="sender-gst">GSTIN: ${senderGst}</div>
        </div>
      </div>

      <!-- Package Manifest & Warehouse Scan -->
      <div class="manifest-box">
        <div class="manifest-left">
          <div class="metric-row">
            <span><b>WEIGHT:</b> ${totalWeight} g</span>
            <span><b>DIMENSIONS:</b> 20x15x3 cm</span>
            <span><b>PCS:</b> ${totalQty}</span>
          </div>
          <div class="payment-badge ${isCOD ? 'cod-badge' : 'prepaid-badge'}">
            ${isCOD ? `C.O.D. AMOUNT TO COLLECT: ₹${declaredValue}` : `PREPAID - ₹${declaredValue} (DO NOT COLLECT CASH)`}
          </div>
          ${showSkus && skusList ? `<div class="skus-manifest">${skusList}</div>` : ''}
          ${options.customNotes ? `<div class="custom-note"><b>NOTE:</b> ${options.customNotes}</div>` : ''}
        </div>

        <div class="manifest-right">
          <div class="order-id-label">ORDER ID: <b>${orderNum}</b></div>
          ${showOrderBarcode ? `<div class="order-barcode-svg">${orderBarcodeSvg}</div>` : ''}
        </div>
      </div>

      <!-- Postal Warning Footer -->
      <div class="sticker-footer">
        PROPERTY OF INDIA POST LOGISTICS NETWORK. HANDLE WITH CARE - CONTAINS ACADEMIC EDUCATIONAL BOOKS.
      </div>
    </div>
  `;
}

export function generatePrintDocumentHtml(stickersHtml: string, size: ShippingLabelSize = 'A6'): string {
  const sizeStyles: Record<ShippingLabelSize, { page: string; width: string; height: string; fontSize: string }> = {
    A7: {
      page: 'size: 74mm 105mm; margin: 2mm;',
      width: '70mm',
      height: '101mm',
      fontSize: '9px',
    },
    A6: {
      page: 'size: 105mm 148mm; margin: 3.5mm;',
      width: '98mm',
      height: '141mm',
      fontSize: '10px',
    },
    A5: {
      page: 'size: 148mm 210mm; margin: 5mm;',
      width: '138mm',
      height: '200mm',
      fontSize: '12px',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.A6;

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>India Post Official Shipping Stickers (${size})</title>
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
            body { padding: 0; margin: 0; }
            .sticker-page-break {
              page-break-after: always;
              break-after: page;
            }
          }
          @media screen {
            body {
              background: #f1f5f9;
              padding: 24px;
            }
            .preview-wrapper {
              max-width: 800px;
              margin: 0 auto;
            }
            .sticker-page-break {
              margin-bottom: 24px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.12);
              border-radius: 4px;
            }
          }

          .sticker-container {
            width: ${currentSize.width};
            min-height: ${currentSize.height};
            max-height: ${currentSize.height};
            background: #ffffff;
            border: 2px solid #0f172a;
            padding: 3.5mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            margin: 0 auto;
          }

          /* Header */
          .sticker-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 3px;
          }
          .header-left {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .service-name {
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.5px;
            color: #b91c1c;
            line-height: 1.1;
          }
          .normal-post .service-name {
            color: #1e3a8a;
          }
          .service-sub {
            font-size: 7.5px;
            font-weight: 700;
            color: #475569;
            letter-spacing: 0.3px;
          }
          .header-right {
            text-align: right;
            font-size: 8px;
            font-weight: 600;
            color: #334155;
            line-height: 1.2;
          }

          /* Barcode */
          .barcode-box {
            text-align: center;
            padding: 4px 0 2px 0;
            border-bottom: 1.5px solid #0f172a;
          }
          .article-barcode-svg svg {
            margin: 0 auto;
          }
          .article-number-text {
            font-size: 12px;
            letter-spacing: 1.5px;
            font-family: monospace;
            margin-top: 1px;
          }

          /* Routing Banner */
          .routing-banner {
            display: flex;
            background: #0f172a;
            color: #ffffff;
            border-bottom: 2px solid #0f172a;
            padding: 2px 4px;
            align-items: center;
            justify-content: space-between;
          }
          .dest-pin-box {
            display: flex;
            align-items: baseline;
            gap: 4px;
          }
          .pin-label {
            font-size: 8.5px;
            font-weight: 700;
            color: #cbd5e1;
          }
          .pin-digits {
            font-size: 17px;
            font-weight: 900;
            letter-spacing: 2px;
            color: #facc15;
            font-family: monospace;
          }
          .dest-hub-box {
            font-size: 8.5px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-align: right;
          }

          /* Address Grid */
          .address-grid {
            display: grid;
            grid-template-columns: 1.3fr 0.9fr;
            border-bottom: 1.5px solid #0f172a;
            min-height: 48mm;
          }
          .to-box {
            padding: 4px;
            border-right: 1.5px solid #0f172a;
          }
          .from-box {
            padding: 4px;
            background: #f8fafc;
          }
          .box-title {
            font-size: 8.5px;
            font-weight: 900;
            color: #0f172a;
            text-decoration: underline;
            margin-bottom: 2px;
          }
          .recipient-name {
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 2px;
          }
          .recipient-address {
            font-size: 9.5px;
            line-height: 1.25;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .recipient-contact {
            font-size: 10px;
            font-weight: 700;
            background: #e2e8f0;
            padding: 1px 4px;
            border-radius: 2px;
            display: inline-block;
          }
          .merchant-logo {
            max-width: 68px;
            max-height: 20px;
            object-fit: contain;
            display: block;
            margin-bottom: 2px;
          }
          .sender-name {
            font-size: 10px;
            font-weight: 800;
            color: #0f172a;
          }
          .sender-sub {
            font-size: 8px;
            font-weight: 600;
            color: #475569;
          }
          .sender-address {
            font-size: 8px;
            line-height: 1.2;
            color: #334155;
            margin: 2px 0;
          }
          .sender-contact, .sender-gst {
            font-size: 7.5px;
            color: #475569;
          }

          /* Manifest Box */
          .manifest-box {
            display: flex;
            justify-content: space-between;
            padding: 3px;
            border-bottom: 1.5px solid #0f172a;
            background: #ffffff;
            font-size: 9px;
            gap: 4px;
          }
          .manifest-left {
            flex: 1;
          }
          .metric-row {
            display: flex;
            gap: 8px;
            margin-bottom: 2px;
            font-size: 8.5px;
          }
          .payment-badge {
            display: inline-block;
            padding: 2px 5px;
            font-weight: 900;
            border-radius: 3px;
            font-size: 9px;
            letter-spacing: 0.3px;
            margin-bottom: 3px;
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
          .skus-manifest {
            border-top: 1px dashed #cbd5e1;
            padding-top: 2px;
            margin-top: 2px;
            max-height: 18mm;
            overflow: hidden;
          }
          .manifest-right {
            text-align: right;
            min-width: 32mm;
          }
          .order-id-label {
            font-size: 8.5px;
            font-weight: 700;
            margin-bottom: 1px;
          }

          /* Footer */
          .sticker-footer {
            font-size: 6.5px;
            font-weight: 700;
            text-align: center;
            letter-spacing: 0.3px;
            color: #64748b;
            padding-top: 2px;
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: white; padding: 10px 18px; border-radius: 8px;">
          <div>
            <b>India Post Consignment Stickers</b> — Ready for Thermal / Laser Print (${size})
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
    alert('Please allow popups to open the shipping sticker print window.');
    return;
  }

  const cardHtml = `<div class="sticker-page-break">${generateSingleStickerCardHtml(order, options)}</div>`;
  const docHtml = generatePrintDocumentHtml(cardHtml, options.size || 'A6');

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
    alert('No orders selected for printing shipping stickers.');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert('Please allow popups to open the shipping sticker print window.');
    return;
  }

  const cardsHtml = orders.map((o) => `<div class="sticker-page-break">${generateSingleStickerCardHtml(o, options)}</div>`).join('\n');
  const docHtml = generatePrintDocumentHtml(cardsHtml, options.size || 'A6');

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
