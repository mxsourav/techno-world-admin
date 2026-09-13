import { TECHNO_WORLD_BLACK_LOGO_B64 } from './logoBase64';

export type ShippingLabelSize = '75x125' | '100x150' | '100x100' | 'A7' | 'A6' | 'A5' | 'A4';
export type ShippingLabelDesign = 'techno-speed-post' | 'india-post' | 'modern-thermal' | 'compact-courier' | 'all-in-one';

export interface ShippingLabelOptions {
  size?: ShippingLabelSize;
  design?: ShippingLabelDesign;
  showLogo?: boolean;
  showSkus?: boolean;
  showOrderBarcode?: boolean;
  showPrice?: boolean; // Price showing optional button/toggle

  // Fully Editable / Remappable Fields:
  customCarrier?: string;       // e.g. "SPEED POST" or "BOOK POST"
  customArticleNumber?: string; // e.g. "EE987654321IN"

  // Recipient (Ship To) Remappable Fields:
  customRecipientName?: string;
  customRecipientAddress?: string;
  customRecipientCity?: string;
  customRecipientState?: string;
  customRecipientPin?: string;
  customRecipientPhone?: string;

  // Order Items Remappable Fields:
  customOrderItemsHeader?: string;
  customOrderItemsText?: string;

  // Return Address (Sender) Remappable Fields:
  customSenderName?: string;
  customSenderCompany?: string;
  customSenderAddress?: string;
  customSenderPhone?: string;
  customSenderGst?: string;

  // Footer Remappable Field:
  customFooterText?: string;

  customWeight?: number;
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
  const size = options.size || '100x150';
  const design = options.design || 'techno-speed-post'; // Default to user's exact uploaded design
  const showLogo = options.showLogo !== false;
  const showSkus = options.showSkus !== false;
  const showOrderBarcode = options.showOrderBarcode !== false;
  const showPrice = options.showPrice !== false;

  const orderNum = order.orderNumber || order.id?.slice(0, 8) || 'TW-ORD-000';
  const articleNo = options.customArticleNumber || order.trackingNumber || `EE${Math.floor(100000000 + Math.random() * 900000000)}IN`;
  const carrier = options.customCarrier || (order.shippingMethod === 'NORMAL_POST' ? 'BOOK POST' : 'SPEED POST');
  const isSpeedPost = carrier.toUpperCase().includes('SPEED');

  // Recipient (Ship To) fields (Remappable)
  const addr = order.address || {};
  const recipientName = options.customRecipientName ?? (addr.fullName || addr.name || order.user?.name || 'Washim');
  const recipientLine1 = options.customRecipientAddress ?? (addr.addressLine1 || addr.address || '90/6 A M.G Road, College Street');
  const recipientCity = options.customRecipientCity ?? (addr.city || 'Kolkata');
  const recipientState = options.customRecipientState ?? (addr.state || 'West Bengal');
  const recipientPin = String(options.customRecipientPin ?? (addr.pincode || '700007')).trim();
  const recipientPhone = options.customRecipientPhone ?? (addr.phone || order.user?.phone || '7479135626');

  // Sender & Return Address fields (Remappable)
  const senderName = options.customSenderName || 'Techno World Books Hub';
  const senderCompany = options.customSenderCompany || 'Techno World Publications';
  const senderAddress = options.customSenderAddress || 'College Street (Bidhan Sarani), Near Presidency, Kolkata - 700006';
  const senderPhone = options.customSenderPhone || '033-2219-XXXX / 9830000000';
  const senderGst = options.customSenderGst || '19AAACT0000A1Z5';

  // Order Items fields (Remappable)
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((acc: number, it: any) => acc + (it.quantity || it.qty || 1), 0) || 1;
  const booksCount = items.length || 1;

  const defaultItemsHeader = `ORDER ITEMS (${booksCount} BOOK${booksCount > 1 ? 'S' : ''}, TOTAL QTY: ${totalQty})`;
  const orderItemsHeader = options.customOrderItemsHeader || defaultItemsHeader;

  let defaultItemsText = items.map((it: any) => {
    const bk = it.book || {};
    const sku = bk.sku || bk.isbn13 || bk.isbn10 || it.sku || 'SKU-TW';
    const title = bk.title || it.title || 'Textbook of Educational Technology Nursing Education - Vol 1';
    const qty = it.quantity || it.qty || 1;
    return `[${sku}] ${title} ... Qty: ${qty}`;
  }).join('\n');

  if (!defaultItemsText) {
    defaultItemsText = `[SKU-TW] Textbook of Educational Technology Nursing Education - Vol ... Qty: 1`;
  }
  const orderItemsText = options.customOrderItemsText || (showSkus ? defaultItemsText : `Total Books: ${booksCount} (Qty: ${totalQty})`);

  // Footer text (Remappable)
  const footerText = options.customFooterText || 'POSTAGE APPROVED FOR SHIPPING';

  const totalWeight = options.customWeight || Math.max(350, totalQty * 420);
  const declaredValue = order.totalAmount || order.payableAmount || 452;
  const isCOD = (order.paymentMethod || '').toUpperCase() === 'COD';
  const bookingDate = new Date(order.placedAt || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Barcodes
  const mainBarcodeSvg = generateCode128Svg(articleNo, 48, 1.7);
  const headerBarcodeSvg = generateCode128Svg(articleNo, 26, 1.15);
  const orderBarcodeSvg = showOrderBarcode ? generateCode128Svg(orderNum, 24, 1.1) : '';

  // Optional Price display badge/note
  let priceNoteHtml = '';
  if (showPrice) {
    priceNoteHtml = isCOD 
      ? `<div class="speedpost-price-badge cod-pill">C.O.D. AMOUNT: ₹${declaredValue}</div>`
      : `<div class="speedpost-price-badge prepaid-pill">PREPAID: ₹${declaredValue}</div>`;
  }

  // --- DESIGN: TECHNO SPEED POST (EXACT MATCH TO UPLOADED IMAGE) ---
  if (design === 'techno-speed-post') {
    return `
      <div class="sticker-container design-techno-speed-post size-${size}">
        <!-- 1. Top 3-Column Header (Rectangular Logo on Left) -->
        <div class="speedpost-header-grid">
          <!-- Left: Techno World Rectangular Logo -->
          <div class="speedpost-header-col speedpost-logo-col">
            ${showLogo ? `
              <img src="${TECHNO_WORLD_BLACK_LOGO_B64}" class="speedpost-tw-logo" alt="Techno World Logo" />
            ` : `
              <div class="speedpost-text-logo">
                <div class="brand-title">TECHNO WORLD</div>
                <div class="brand-sub">Publisher &amp; Distributors</div>
              </div>
            `}
          </div>

          <!-- Middle: India Post Logo -->
          <div class="speedpost-header-col speedpost-post-col">
            <div class="speedpost-post-title">India Post</div>
            <div class="speedpost-post-emblem">
              <svg viewBox="0 0 65 38" width="50" height="28" style="display:block;margin:0 auto;">
                <rect x="5" y="4" width="48" height="28" fill="#c0262d" rx="2" />
                <path d="M 0 14 Q 28 5 62 10" stroke="#facc15" stroke-width="2.2" fill="none" />
                <path d="M 8 25 L 28 13 L 48 22" stroke="#facc15" stroke-width="2.2" fill="none" stroke-linecap="round" />
              </svg>
            </div>
            <div class="speedpost-post-sub">India Post</div>
          </div>

          <!-- Right: AWB Barcode & No -->
          <div class="speedpost-header-col speedpost-awb-col">
            <div class="speedpost-mini-barcode">${headerBarcodeSvg}</div>
            <div class="speedpost-mini-awb-no">AWB NO: ${articleNo}</div>
          </div>
        </div>

        <!-- 2. SPEED POST Carrier Banner -->
        <div class="speedpost-service-banner">
          ${carrier}
        </div>

        <!-- 3. SHIP TO (Consignee Address) -->
        <div class="speedpost-section-box speedpost-ship-to-box">
          <div class="speedpost-section-title">SHIP TO:</div>
          <div class="speedpost-recipient-name">${recipientName}</div>
          <div class="speedpost-address-line">
            ${recipientLine1}<br/>
            ${recipientCity}, ${recipientState} - ${recipientPin}
          </div>
          <div class="speedpost-mob-line">MOB: <b>${recipientPhone}</b></div>
        </div>

        <!-- 4. ORDER ITEMS Manifest -->
        <div class="speedpost-section-box speedpost-items-box">
          <div class="speedpost-section-title">${orderItemsHeader}</div>
          <div class="speedpost-items-content">
            ${orderItemsText.replace(/\n/g, '<br/>')}
          </div>
        </div>

        <!-- 5. RETURN ADDRESS -->
        <div class="speedpost-section-box speedpost-return-box">
          <div class="speedpost-section-title">RETURN ADDRESS:</div>
          <div class="speedpost-return-name">${senderName}</div>
          <div class="speedpost-return-sub">${senderCompany}</div>
          <div class="speedpost-return-addr">${senderAddress}</div>
          <div class="speedpost-return-contact">Ph: ${senderPhone}</div>
          <div class="speedpost-return-gst">GSTIN: ${senderGst}</div>
        </div>

        <!-- 6. AWB Tracking Barcode Section -->
        <div class="speedpost-section-box speedpost-awb-box">
          <div class="speedpost-awb-title">AWB Tracking #</div>
          <div class="speedpost-main-barcode">${mainBarcodeSvg}</div>
          <div class="speedpost-awb-number">#${articleNo}</div>
        </div>

        <!-- 7. Bottom Postage Approved Footer -->
        <div class="speedpost-footer-text">
          <span>${footerText}</span>
          ${priceNoteHtml}
        </div>
      </div>
    `;
  }

  // --- DESIGN: OFFICIAL INDIA POST (CEPT STANDARD) ---
  if (design === 'india-post') {
    return `
      <div class="sticker-container design-india-post size-${size}">
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

        <div class="barcode-band">
          <div class="barcode-svg">${mainBarcodeSvg}</div>
          <div class="article-no-text">ARTICLE NO: <b>${articleNo.replace(/(.{2})(.{3})(.{3})(.{3})(.{2})/, '$1 $2 $3 $4 $5')}</b></div>
        </div>

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

        <div class="address-band">
          <div class="to-cell">
            <div class="cell-label">DELIVER TO:</div>
            <div class="recipient-name">${recipientName}</div>
            <div class="recipient-address">
              ${recipientLine1}<br/>
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

        <div class="metrics-band">
          <div class="metrics-left">
            <div class="metrics-line">
              <span><b>WT:</b> ${totalWeight}g</span>
              <span><b>PCS:</b> ${totalQty}</span>
            </div>
            ${priceNoteHtml}
          </div>
          <div class="metrics-right">
            <div class="order-id-tag">ORDER: <b>${orderNum}</b></div>
            ${showOrderBarcode ? `<div class="order-barcode-wrapper">${orderBarcodeSvg}</div>` : ''}
          </div>
        </div>

        <div class="ordered-items-band">
          <div class="items-header">${orderItemsHeader}</div>
          <div class="items-content-text">${orderItemsText.replace(/\n/g, '<br/>')}</div>
        </div>

        <div class="return-band">
          <b>IF UNDELIVERED, RETURN TO:</b> ${senderName}, ${senderAddress}. Ph: ${senderPhone}
        </div>

        <div class="footer-band">
          ${footerText} • CONTAINS ACADEMIC EDUCATIONAL BOOKS
        </div>
      </div>
    `;
  }

  // --- DESIGN: MODERN E-COMMERCE THERMAL ---
  return `
    <div class="sticker-container design-modern-thermal size-${size}">
      <div class="thermal-header">
        <div class="thermal-brand">
          <span class="carrier-badge">${carrier}</span>
          <span class="ship-date">${bookingDate}</span>
        </div>
        <div class="thermal-order-ref"><b>ORDER #${orderNum}</b></div>
      </div>

      <div class="thermal-barcode-box">
        <div class="barcode-svg">${mainBarcodeSvg}</div>
        <div class="tracking-caption">AWB / TRACKING: <b>${articleNo}</b></div>
      </div>

      <div class="thermal-dest-box">
        <div class="dest-pin-large">PIN: <b>${recipientPin}</b></div>
        <div class="dest-hub-text">${recipientCity.toUpperCase()} (${recipientState.toUpperCase()})</div>
      </div>

      <div class="thermal-consignee-box">
        <div class="consignee-tag">SHIP TO:</div>
        <div class="consignee-name">${recipientName}</div>
        <div class="consignee-addr">${recipientLine1}, ${recipientCity}, ${recipientState} - <b>${recipientPin}</b></div>
        <div class="consignee-mob">MOB: <b>${recipientPhone}</b></div>
      </div>

      <div class="thermal-items-box">
        <div class="thermal-items-title">${orderItemsHeader}</div>
        <div class="items-content-text">${orderItemsText.replace(/\n/g, '<br/>')}</div>
      </div>

      <div class="thermal-middle-row">
        ${priceNoteHtml}
        <div class="thermal-metric-col">
          <span>WT: <b>${totalWeight}g</b></span>
          <span>ITEMS: <b>${totalQty}</b></span>
        </div>
      </div>

      <div class="thermal-return-box">
        <div class="return-title">RETURN IF UNDELIVERED TO:</div>
        <div class="return-body">${senderName}, ${senderAddress} | Ph: ${senderPhone}</div>
      </div>

      <div class="thermal-footer-note">${footerText}</div>
    </div>
  `;
}

export function generatePrintDocumentHtml(stickersHtml: string, size: ShippingLabelSize = '100x150'): string {
  const sizeStyles: Record<ShippingLabelSize, { page: string; width: string; height: string; fontSize: string }> = {
    '100x150': {
      page: 'size: 100mm 150mm; margin: 0;',
      width: '96mm',
      height: '146mm',
      fontSize: '10px',
    },
    '75x125': {
      page: 'size: 75mm 125mm; margin: 0;',
      width: '72mm',
      height: '122mm',
      fontSize: '8.5px',
    },
    '100x100': {
      page: 'size: 100mm 100mm; margin: 0;',
      width: '96mm',
      height: '96mm',
      fontSize: '8px',
    },
    A7: {
      page: 'size: 72mm 120mm; margin: 0;',
      width: '69mm',
      height: '117mm',
      fontSize: '8px',
    },
    A6: {
      page: 'size: 105mm 148mm; margin: 0;',
      width: '100mm',
      height: '143mm',
      fontSize: '9.5px',
    },
    A5: {
      page: 'size: 148mm 210mm; margin: 0;',
      width: '141mm',
      height: '202mm',
      fontSize: '11.5px',
    },
    A4: {
      page: 'size: 210mm 297mm; margin: 0;',
      width: '198mm',
      height: '285mm',
      fontSize: '12.5px',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles['100x150'];

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
            font-family: Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #000000;
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
              background: #e2e8f0;
              padding: 0;
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: 100vh;
            }
            .preview-wrapper {
              width: 100%;
              max-width: 480px;
              margin: 0 auto;
              padding: 10px 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .sticker-page-break {
              margin-bottom: 16px;
              box-shadow: 0 4px 14px rgba(0,0,0,0.15);
              border-radius: 4px;
              background: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
              overflow: hidden;
            }
          }

          /* --- CONTAINER FOR EXACT UPLOADED FORMAT (SPEED POST) --- */
          .sticker-container.design-techno-speed-post {
            box-sizing: border-box;
            width: ${currentSize.width};
            min-height: ${currentSize.height};
            max-height: ${currentSize.height};
            padding: 2mm 3mm;
            background: #ffffff;
            border: 2px solid #000000;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            font-family: Arial, -apple-system, BlinkMacSystemFont, sans-serif;
          }

          /* 1. Header Grid */
          .speedpost-header-grid {
            display: grid;
            grid-template-columns: 1.35fr 0.9fr 1.15fr;
            border-bottom: 2px solid #000000;
            align-items: center;
            text-align: center;
            min-height: 42px;
          }
          .speedpost-header-col {
            padding: 2px 3px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            box-sizing: border-box;
          }
          .speedpost-header-col:not(:last-child) {
            border-right: 1.5px solid #000000;
          }
          .speedpost-tw-logo {
            max-width: 96%;
            max-height: 38px;
            width: auto;
            height: auto;
            object-fit: contain;
            display: block;
            margin: 0 auto;
          }
          .speedpost-text-logo {
            font-size: 10px;
            line-height: 1.15;
            text-align: center;
          }
          .speedpost-text-logo .brand-title {
            font-size: 11px;
            font-weight: 900;
            color: #000000;
            letter-spacing: 0.5px;
          }
          .speedpost-text-logo .brand-sub {
            font-size: 7px;
            font-weight: 700;
            color: #333333;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-top: 1px;
          }
          .speedpost-post-title {
            font-family: Arial, sans-serif;
            font-size: 12px;
            font-weight: 900;
            color: #000000;
            line-height: 1;
            margin-bottom: 1px;
          }
          .speedpost-post-sub {
            font-size: 6.5px;
            font-weight: 700;
            color: #b91c1c;
            margin-top: 1px;
          }
          .speedpost-mini-barcode svg {
            max-height: 22px;
            margin: 0 auto;
          }
          .speedpost-mini-awb-no {
            font-size: 7.5px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin-top: 1px;
          }

          /* 2. Banner */
          .speedpost-service-banner {
            text-align: center;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            padding: 2px 0;
            border-bottom: 2px solid #000000;
            line-height: 1.1;
          }

          /* Section Boxes */
          .speedpost-section-box {
            padding: 2.5px 3px;
            border-bottom: 2px solid #000000;
          }
          .speedpost-section-title {
            font-size: 9.5px;
            font-weight: 900;
            letter-spacing: 0.4px;
            text-transform: uppercase;
            margin-bottom: 1px;
          }

          /* Ship To */
          .speedpost-recipient-name {
            font-size: 13.5px;
            font-weight: 900;
            color: #000000;
            line-height: 1.15;
            margin-bottom: 1px;
          }
          .speedpost-address-line {
            font-size: 9.5px;
            line-height: 1.2;
            margin-bottom: 2px;
          }
          .speedpost-mob-line {
            font-size: 10.5px;
            font-weight: 800;
          }

          /* Items */
          .speedpost-items-content {
            font-size: 9px;
            line-height: 1.25;
            color: #000000;
            max-height: 28mm;
            overflow: hidden;
          }

          /* Return */
          .speedpost-return-name {
            font-size: 10.5px;
            font-weight: 900;
          }
          .speedpost-return-sub {
            font-size: 9px;
            font-weight: 600;
          }
          .speedpost-return-addr {
            font-size: 8.5px;
            line-height: 1.15;
            margin: 1px 0;
          }
          .speedpost-return-contact, .speedpost-return-gst {
            font-size: 8px;
            line-height: 1.15;
          }

          /* AWB Barcode Box */
          .speedpost-awb-box {
            text-align: center;
            padding: 2.5px 2px 1.5px 2px;
          }
          .speedpost-awb-title {
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 0.5px;
            margin-bottom: 1px;
          }
          .speedpost-main-barcode svg {
            margin: 0 auto;
            max-height: 40px;
          }
          .speedpost-awb-number {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 1px;
            font-family: Arial, monospace;
            margin-top: 1px;
          }

          /* Footer */
          .speedpost-footer-text {
            text-align: center;
            font-size: 8.5px;
            font-weight: 900;
            letter-spacing: 0.5px;
            padding-top: 2px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .speedpost-price-badge {
            font-size: 8.5px;
            font-weight: 900;
            padding: 1px 4px;
            border-radius: 2px;
          }
          .cod-pill {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #f87171;
          }
          .prepaid-pill {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #4ade80;
          }

          /* --- SUPPORT STYLES FOR OTHER DESIGNS --- */
          .sticker-container.design-india-post {
            box-sizing: border-box;
            width: ${currentSize.width};
            min-height: ${currentSize.height};
            max-height: ${currentSize.height};
            padding: 3mm 3.5mm;
            background: #ffffff;
            border: 2px solid #0f172a;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
          }
          .header-band {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #0f172a;
            padding-bottom: 2px;
          }
          .header-left { display: flex; align-items: center; gap: 5px; }
          .service-name { font-size: 12px; font-weight: 900; color: #b91c1c; }
          .normal-post .service-name { color: #1e3a8a; }
          .service-sub { font-size: 7px; font-weight: 700; color: #475569; }
          .header-right { text-align: right; font-size: 7.5px; font-weight: 600; color: #334155; }
          .barcode-band { text-align: center; padding: 2px 0; border-bottom: 1.5px solid #0f172a; }
          .article-no-text { font-size: 11px; letter-spacing: 1.2px; font-family: monospace; }
          .routing-band { display: flex; background: #0f172a; color: #fff; padding: 2px 4px; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #0f172a; }
          .pin-title { font-size: 8px; color: #cbd5e1; }
          .pin-number { font-size: 15px; font-weight: 900; color: #facc15; font-family: monospace; letter-spacing: 1.5px; }
          .hub-block { font-size: 8px; font-weight: 800; }
          .address-band { display: grid; grid-template-columns: 1.3fr 0.9fr; border-bottom: 1.5px solid #0f172a; padding: 2px 0; gap: 3px; }
          .to-cell { padding-right: 3px; border-right: 1.5px solid #0f172a; }
          .from-cell { padding-left: 3px; background: #f8fafc; }
          .cell-label { font-size: 8px; font-weight: 900; text-decoration: underline; margin-bottom: 1px; }
          .recipient-name { font-size: 11px; font-weight: 800; margin-bottom: 1px; }
          .recipient-address { font-size: 8.5px; line-height: 1.2; margin-bottom: 2px; }
          .pin-accent { font-size: 10px; font-weight: 900; }
          .recipient-phone { font-size: 9px; font-weight: 700; background: #e2e8f0; padding: 1px 3px; border-radius: 2px; display: inline-block; }
          .merchant-logo { max-width: 60px; max-height: 16px; object-fit: contain; display: block; margin-bottom: 1px; }
          .sender-name { font-size: 9px; font-weight: 800; }
          .sender-sub { font-size: 7.5px; font-weight: 600; color: #475569; }
          .sender-address { font-size: 7.5px; line-height: 1.15; color: #334155; margin: 1px 0; }
          .sender-contact, .sender-gst { font-size: 7px; color: #475569; }
          .metrics-band { display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 1px solid #cbd5e1; font-size: 8px; }
          .ordered-items-band { border: 1px solid #cbd5e1; border-radius: 3px; background: #f8fafc; padding: 3px 4px; font-size: 8.5px; }
          .items-header { font-size: 7.5px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1px dashed #cbd5e1; padding-bottom: 1px; margin-bottom: 2px; }
          .items-content-text { font-size: 8.5px; line-height: 1.25; }
          .return-band { font-size: 7px; color: #334155; line-height: 1.15; background: #f1f5f9; border: 1px dashed #94a3b8; padding: 2px 3px; }
          .footer-band { font-size: 6.5px; font-weight: 700; text-align: center; color: #64748b; padding-top: 1px; }

          /* Modern Thermal */
          .sticker-container.design-modern-thermal {
            box-sizing: border-box;
            width: ${currentSize.width};
            min-height: ${currentSize.height};
            max-height: ${currentSize.height};
            padding: 3.5mm;
            border: 2px solid #000;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .thermal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 2px; }
          .carrier-badge { font-weight: 900; font-size: 11px; background: #000; color: #fff; padding: 1px 4px; border-radius: 2px; }
          .ship-date { font-size: 8px; margin-left: 4px; }
          .thermal-order-ref { font-size: 9px; font-family: monospace; }
          .thermal-barcode-box { text-align: center; border-bottom: 2px solid #000; padding: 3px 0 1px 0; }
          .tracking-caption { font-size: 10px; font-family: monospace; margin-top: 1px; font-weight: bold; }
          .thermal-dest-box { display: flex; justify-content: space-between; align-items: center; background: #000; color: #fff; padding: 2px 5px; }
          .dest-pin-large { font-size: 16px; font-weight: 900; font-family: monospace; }
          .dest-hub-text { font-size: 9px; font-weight: 800; }
          .thermal-consignee-box { border: 1.5px solid #000; padding: 3px 4px; margin: 2px 0; }
          .consignee-tag { font-size: 7.5px; font-weight: 800; text-decoration: underline; }
          .consignee-name { font-size: 12px; font-weight: 900; }
          .consignee-addr { font-size: 9px; line-height: 1.2; margin: 1px 0; }
          .consignee-mob { font-size: 9.5px; font-weight: 800; }
          .thermal-items-box { border: 1px solid #cbd5e1; padding: 3px; font-size: 8.5px; }
          .thermal-items-title { font-size: 7.5px; font-weight: 800; margin-bottom: 1px; }
          .thermal-middle-row { display: flex; justify-content: space-between; align-items: center; padding: 2px 0; border-bottom: 1px solid #000; font-size: 8px; }
          .thermal-return-box { font-size: 7px; line-height: 1.15; border-top: 1px dashed #64748b; padding-top: 2px; }
          .return-title { font-weight: 800; }
          .thermal-footer-note { font-size: 7px; font-weight: 800; text-align: center; text-transform: uppercase; }
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
  const docHtml = generatePrintDocumentHtml(cardHtml, options.size || '100x150');

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
  const docHtml = generatePrintDocumentHtml(cardsHtml, options.size || '100x150');

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
