import { formatINR } from './helpers';
import { invoiceService } from '@/services/api';

/**
 * Downloads the official server-rendered PDF invoice for an order.
 * Falls back to local browser rendering and print dialogue if server is unreachable.
 */
export async function downloadOrderInvoice(order: any): Promise<void> {
  const orderId = order.id || order.orderNumber;
  try {
    const filename = `Invoice-${order.invoiceNumber || order.orderNumber || orderId}.pdf`;
    await invoiceService.downloadInvoice(orderId, filename);
  } catch (err) {
    console.warn('[INVOICE] Server download failed, falling back to browser print view:', err);
    generateAndPrintInvoice(order);
  }
}

/**
 * HTML/Browser print fallback invoice layout with SKU, HSN 4901 (0% GST), SAC 9968.
 */
export function generateAndPrintInvoice(order: any) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to view and print your invoice.');
    return;
  }

  const orderNum = order.orderNumber || order.id || 'N/A';
  const invoiceNum = order.invoiceNumber || `TW-INV-${orderNum}`;
  const orderDate = new Date(order.createdAt || order.placedAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const customerName = order.pickupName || order.address?.fullName || order.address?.name || order.user?.name || 'Valued Customer';
  const customerPhone = order.pickupPhone || order.address?.phone || order.user?.phone || 'N/A';
  const customerEmail = order.pickupEmail || order.customerEmail || order.address?.email || order.user?.email || 'N/A';
  const isPickup = order.shippingMethod === 'SELF_PICKUP' || order.shippingCarrier === 'STORE_TAKEAWAY';
  const pickupSlot = order.selectedPickupSlot || 'Appointment Slot Pending';
  const paymentMethod = (order.paymentMethod || 'PREPAID').toUpperCase();

  const itemsHtml = (order.items || []).map((it: any, idx: number) => {
    const title = it.book?.title || it.title || 'Academic Book';
    const author = it.book?.author || (it.book?.authors && it.book.authors[0]?.name) || it.author || '';
    const sku = it.book?.sku || it.book?.isbn13 || it.sku || '—';
    const qty = it.quantity || it.qty || 1;
    const price = it.priceAtPurchase || it.unitPrice || it.price || 0;
    const total = qty * price;
    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; text-align: center; color: #64748b; font-size: 12px;">${idx + 1}</td>
        <td style="padding: 10px 8px;">
          <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${title}</div>
          ${author ? `<div style="font-size: 11px; color: #64748b;">Author: ${author}</div>` : ''}
        </td>
        <td style="padding: 10px 8px; text-align: center; font-size: 12px; color: #475569; font-family: monospace;">${sku}</td>
        <td style="padding: 10px 8px; text-align: center; font-size: 12px; color: #64748b;">4901</td>
        <td style="padding: 10px 8px; text-align: center; font-weight: 600; font-size: 13px;">${qty}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 13px;">${formatINR(price)}</td>
        <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">${formatINR(total)}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${invoiceNum} - Techno World Books</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 32px;
            background: #ffffff;
          }
          @media print {
            body { padding: 12px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
          <button onclick="window.print()" style="background: #047857; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div style="max-width: 760px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 28px;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
            <div>
              <div style="font-size: 20px; font-weight: 900; color: #065f46; letter-spacing: -0.5px;">TECHNO WORLD BOOKS</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Online Academic & Medical Bookstore Division</div>
              <div style="font-size: 11px; color: #475569; margin-top: 6px; max-width: 320px; line-height: 1.4;">
                90/6A, Mahatma Gandhi Rd, opp. Grace Cinema, Calcutta University, College Street, Kolkata, WB 700007
              </div>
              <div style="font-size: 11px; color: #475569; margin-top: 2px;">
                WhatsApp Support: <b>+91 747 913 5626</b>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 800; color: #0f172a;">TAX INVOICE</div>
              <div style="font-size: 13px; font-weight: 700; color: #047857; margin-top: 4px;">${invoiceNum}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Date: ${orderDate}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Order Ref: #${orderNum}</div>
              <div style="margin-top: 6px; display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
                ${paymentMethod} · PAID
              </div>
            </div>
          </div>

          <!-- Pickup / Delivery Info Banner -->
          <div style="margin-top: 20px; padding: 14px; border-radius: 8px; background: ${isPickup ? '#f0fdf4' : '#f8fafc'}; border: 1px solid ${isPickup ? '#bbf7d0' : '#e2e8f0'};">
            ${isPickup ? `
              <div style="font-size: 12px; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 6px;">
                🏪 STORE SELF-PICKUP (TAKEAWAY DESK)
              </div>
              <div style="margin-top: 6px; font-size: 12px; color: #14532d; line-height: 1.4;">
                <b>Appointed Collection Slot:</b> ${pickupSlot}<br/>
                <b>Pickup Desk:</b> Techno World Books, 90/6A Mahatma Gandhi Rd, College Street (Opp. Grace Cinema)<br/>
                <b>Collector:</b> ${customerName} &bull; +91 ${customerPhone} &bull; ${customerEmail}
              </div>
            ` : `
              <div style="font-size: 12px; font-weight: 800; color: #1e293b;">
                🚚 POSTAL DELIVERY (${order.shippingMethod === 'SPEED_POST' ? 'SPEED POST' : order.shippingMethod === 'EXPRESS_LOCAL' ? 'EXPRESS LOCAL' : 'INDIA POST / COURIER'})
              </div>
              <div style="margin-top: 6px; font-size: 12px; color: #475569; line-height: 1.4;">
                <b>Deliver to:</b> ${customerName}<br/>
                ${order.address?.addressLine1 || order.address?.line1 || ''}, ${order.address?.city || ''} — ${order.address?.pincode || ''}<br/>
                <b>Phone:</b> +91 ${customerPhone}
              </div>
            `}
          </div>

          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                <th style="padding: 10px 8px; text-align: center; font-size: 11px; font-weight: 800; color: #475569; width: 35px;">#</th>
                <th style="padding: 10px 8px; text-align: left; font-size: 11px; font-weight: 800; color: #475569;">ITEM DESCRIPTION</th>
                <th style="padding: 10px 8px; text-align: center; font-size: 11px; font-weight: 800; color: #475569; width: 90px;">SKU</th>
                <th style="padding: 10px 8px; text-align: center; font-size: 11px; font-weight: 800; color: #475569; width: 60px;">HSN</th>
                <th style="padding: 10px 8px; text-align: center; font-size: 11px; font-weight: 800; color: #475569; width: 50px;">QTY</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 11px; font-weight: 800; color: #475569; width: 80px;">RATE</th>
                <th style="padding: 10px 8px; text-align: right; font-size: 11px; font-weight: 800; color: #475569; width: 90px;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
            <div style="width: 280px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569;">
                <span>Subtotal:</span>
                <span>${formatINR(order.subtotal || order.totalAmount || 0)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569;">
                <span>Shipping (SAC 9968):</span>
                <span style="font-weight: 700; color: #047857;">${(order.shippingCharge || 0) === 0 ? 'FREE' : formatINR(order.shippingCharge)}</span>
              </div>
              ${order.discountAmount ? `
                <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #047857;">
                  <span>Discount:</span>
                  <span>- ${formatINR(order.discountAmount)}</span>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569;">
                <span>Tax on Books (HSN 4901 - 0%):</span>
                <span>₹0.00</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #e2e8f0; margin-top: 4px; font-weight: 900; font-size: 15px; color: #0f172a;">
                <span>Grand Total:</span>
                <span>${formatINR(order.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          <!-- Enterprise Division Notice -->
          <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 14px; font-size: 10px; color: #64748b; line-height: 1.5;">
            <b>Tax Compliance Note:</b> Printed books (HSN 4901) are exempt from Goods & Services Tax (GST) under Indian tax laws. This is an electronically generated tax invoice requiring no physical signature.
            <br/><br/>
            <b>Notice Regarding Corporate Structure:</b> Techno World Books Online and the College Street offline retail bookstore operate under the same parent brand trademark, but are managed as independent business entities with distinct inventory and accounting. Offline counter exchanges or retail returns are strictly prohibited. For store self-pickup orders, present this invoice at the College Street dispatch desk during your appointed time to collect your items.
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
