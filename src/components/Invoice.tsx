/**
 * Invoice Component
 *
 * Renders a professional invoice that can be printed/saved as PDF
 * Uses browser's native print functionality - zero external dependencies
 */

import { forwardRef } from 'react';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  orderId: string;
  paymentId: string;
  planName: string;
  billingPeriod: 'monthly' | 'yearly';
  amountRupees: number;
  currency: string;
  currencySymbol: string;
  customerName: string;
  customerEmail: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  status: string;
}

interface InvoiceProps {
  data: InvoiceData;
}

// Company details
const COMPANY_INFO = {
  name: 'TermiVoxed',
  tagline: 'AI-Powered Video Creation',
  parent: 'LxusBrain',
  address: 'Bengaluru, Karnataka, India',
  email: 'lxusbrain@gmail.com',
  website: 'https://lxusbrain.com/termivoxed',
  // Add GSTIN if you have one
  // gstin: 'XXXXXXXXXXXX',
};

// TermiVoxed Logo SVG (inline for print)
const TERMIVOXED_LOGO_SVG = `
<svg viewBox="0 0 208.07 175.5" width="50" height="42" aria-label="TermiVoxed">
  <defs>
    <style>
      .tv-stroke { fill: none; stroke: #000; stroke-miterlimit: 10; stroke-width: 3px; }
      .tv-termi { font-family: 'JetBrains Mono', 'Cascadia Mono', monospace; font-size: 47px; }
      .tv-voxed { font-family: 'Press Start 2P', cursive; font-size: 45.3px; fill: #fff; }
      .tv-bg { fill: #fff; }
      .tv-black { fill: #000; }
      .tv-green { fill: #39b54a; }
      .tv-orange { fill: #ff931e; }
      .tv-red { fill: #ed1c24; }
    </style>
  </defs>
  <g>
    <rect class="tv-bg" x="1.5" y="1.5" width="205.07" height="172.5" rx="12" ry="12"/>
    <g>
      <rect class="tv-black" x="1.6" y="98.72" width="205.07" height="75.06" rx="12" ry="12"/>
      <text class="tv-voxed" transform="translate(22.7 158.56) scale(.72 1)">voxed</text>
    </g>
    <text class="tv-termi" transform="translate(13.66 76.6)">termi</text>
    <rect class="tv-stroke" x="1.5" y="1.5" width="205.07" height="172.5" rx="12" ry="12"/>
    <rect class="tv-black" x="170.13" y="60" width="7.5" height="28.5" transform="translate(248.13 -99.63) rotate(90)"/>
    <circle class="tv-red" cx="14.13" cy="14.5" r="3"/>
    <circle class="tv-orange" cx="25.13" cy="14.5" r="3"/>
    <circle class="tv-green" cx="36.13" cy="14.5" r="3"/>
  </g>
</svg>`;

// LxusBrain Logo SVG (simplified for print - just the icon part)
const LXUSBRAIN_LOGO_SVG = `
<svg viewBox="0 0 1172.08 1461.12" width="20" height="25" aria-label="LxusBrain">
  <defs>
    <linearGradient id="plg1" x1="293.56" y1="763.76" x2="466.93" y2="905.08" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#00aa98"/>
      <stop offset=".57" stop-color="#1effdc"/>
      <stop offset=".99" stop-color="#00ff9c"/>
    </linearGradient>
    <linearGradient id="plg2" x1="5475.83" y1="763.76" x2="5649.21" y2="905.08" gradientTransform="translate(6343.67) rotate(-180) scale(1 -1)">
      <stop offset="0" stop-color="#00aa98"/>
      <stop offset=".57" stop-color="#1effdc"/>
      <stop offset=".99" stop-color="#00ff9c"/>
    </linearGradient>
    <linearGradient id="plg3" x1="333.07" y1="1352.85" x2="478.96" y2="1171.56" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0056aa"/>
      <stop offset=".57" stop-color="#71c0ff"/>
      <stop offset=".99" stop-color="#53dbff"/>
    </linearGradient>
  </defs>
  <g>
    <path fill="url(#plg1)" d="m240.48,792.96l12.91,38c1.65,4.85,5.77,8.43,10.8,9.39l152.98,29.19c5.95,1.13,11.96-1.62,14.98-6.86l28.74-49.84c5.19-9-.71-20.34-11.05-21.26l-194.63-17.35c-10.24-.91-18.03,9-14.72,18.74Z"/>
    <path fill="url(#plg2)" d="m920.92,792.96l-12.91,38c-1.65,4.85-5.77,8.43-10.8,9.39l-152.98,29.19c-5.95,1.13-11.96-1.62-14.98-6.86l-28.74-49.84c-5.19-9,.71-20.34,11.05-21.26l194.63-17.35c10.24-.91,18.03,9,14.72,18.74Z"/>
    <path fill="url(#plg3)" d="m485.18,1461.12l-220.37-326.41,156.07,63.41s16.15,9.67,29.77,54.13c13.62,44.46,46.86,191.68,46.86,191.68,0,0-.61,16.39-12.34,17.19Z"/>
    <path fill="url(#plg3)" d="m485.18,0l-220.37,326.41,156.07-63.41s16.15-9.67,29.77-54.13c13.62-44.46,46.86-191.68,46.86-191.68C497.51,17.19,496.9.79,485.18,0Z"/>
    <path fill="url(#plg3)" d="m686.9,1461.12l220.37-326.41-156.07,63.41s-16.15,9.67-29.77,54.13c-13.62,44.46-46.86,191.68-46.86,191.68,0,0,.61,16.39,12.34,17.19Z"/>
    <path fill="url(#plg3)" d="m686.9,0l220.37,326.41-156.07-63.41s-16.15-9.67-29.77-54.13c-13.62-44.46-46.86-191.68-46.86-191.68,0,0,.61-16.39,12.34-17.19Z"/>
  </g>
</svg>`;

/**
 * Format currency with proper Indian number formatting
 */
function formatCurrency(amount: number, symbol: string = '₹'): string {
  // Use Indian number formatting (1,00,000 instead of 100,000)
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Format date in a readable format
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Invoice Component - Printable
 */
export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ data }, ref) => {
  const {
    invoiceNumber,
    invoiceDate,
    paymentId,
    planName,
    billingPeriod,
    amountRupees,
    currencySymbol,
    customerName,
    customerEmail,
    subscriptionStart,
    subscriptionEnd,
    lineItems,
  } = data;

  return (
    <div
      ref={ref}
      className="invoice-container bg-white text-gray-900 p-8 max-w-[800px] mx-auto"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div dangerouslySetInnerHTML={{ __html: TERMIVOXED_LOGO_SVG }} />
          <div>
            <h1 className="text-3xl font-bold text-cyan-600">{COMPANY_INFO.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{COMPANY_INFO.tagline}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-gray-600 mt-1">#{invoiceNumber}</p>
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Bill To */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Bill To
          </h3>
          <p className="font-semibold text-gray-900">{customerName}</p>
          <p className="text-gray-600">{customerEmail}</p>
        </div>

        {/* Invoice Info */}
        <div className="text-right">
          <div className="space-y-1">
            <div className="flex justify-end gap-4">
              <span className="text-gray-500">Invoice Date:</span>
              <span className="font-medium">{formatDate(invoiceDate)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="text-gray-500">Payment ID:</span>
              <span className="font-medium text-sm">{paymentId}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium text-green-600">PAID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Validity: {formatDate(subscriptionStart)} - {formatDate(subscriptionEnd)}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-gray-700">{item.quantity}</td>
                <td className="py-4 px-4 text-right text-gray-700">
                  {formatCurrency(item.unitPrice, currencySymbol)}
                </td>
                <td className="py-4 px-4 text-right font-medium text-gray-900">
                  {formatCurrency(item.total, currencySymbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(amountRupees, currencySymbol)}</span>
          </div>
          {/* Add tax row if applicable */}
          {/* <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-600">GST (18%)</span>
            <span className="font-medium">{formatCurrency(amountRupees * 0.18, currencySymbol)}</span>
          </div> */}
          <div className="flex justify-between py-3 bg-gray-100 px-2 -mx-2 mt-2">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-xl text-gray-900">
              {formatCurrency(amountRupees, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="bg-cyan-50 rounded-lg p-4 mb-8">
        <h4 className="font-semibold text-cyan-800 mb-2">Subscription Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-cyan-600">Plan:</span>
            <span className="ml-2 font-medium text-cyan-900">{planName}</span>
          </div>
          <div>
            <span className="text-cyan-600">Billing:</span>
            <span className="ml-2 font-medium text-cyan-900 capitalize">{billingPeriod}</span>
          </div>
          <div>
            <span className="text-cyan-600">Valid From:</span>
            <span className="ml-2 font-medium text-cyan-900">{formatDate(subscriptionStart)}</span>
          </div>
          <div>
            <span className="text-cyan-600">Valid Until:</span>
            <span className="ml-2 font-medium text-cyan-900">{formatDate(subscriptionEnd)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">{COMPANY_INFO.name}</p>
        <p>{COMPANY_INFO.address}</p>
        <p className="mt-2">
          {COMPANY_INFO.email} | {COMPANY_INFO.website}
        </p>
        {/* Uncomment if you have GSTIN */}
        {/* <p className="mt-2">GSTIN: {COMPANY_INFO.gstin}</p> */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div dangerouslySetInnerHTML={{ __html: LXUSBRAIN_LOGO_SVG }} />
          <span className="text-xs text-gray-500">
            A product of <strong className="text-gray-700">{COMPANY_INFO.parent}</strong>
          </span>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          This is a computer-generated invoice and does not require a signature.
        </p>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .invoice-container {
            padding: 0;
            max-width: 100%;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
});

Invoice.displayName = 'Invoice';

/**
 * Opens invoice in a new window for printing/saving as PDF
 */
export function printInvoice(data: InvoiceData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the invoice');
    return;
  }

  const invoiceHtml = generateInvoiceHtml(data);
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Generate standalone HTML for invoice (for print window)
 */
function generateInvoiceHtml(data: InvoiceData): string {
  const {
    invoiceNumber,
    invoiceDate,
    paymentId,
    planName,
    billingPeriod,
    amountRupees,
    currencySymbol,
    customerName,
    customerEmail,
    subscriptionStart,
    subscriptionEnd,
    lineItems,
  } = data;

  const formatCurrencyLocal = (amount: number, symbol: string = '₹'): string => {
    const formatted = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  };

  const formatDateLocal = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoiceNumber} - TermiVoxed</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: system-ui, -apple-system, sans-serif;
          color: #111827;
          background: white;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 24px;
          margin-bottom: 24px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #0891b2;
        }
        .company-tagline {
          color: #6b7280;
          font-size: 14px;
          margin-top: 4px;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
        }
        .invoice-number {
          color: #4b5563;
          margin-top: 4px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          margin-bottom: 32px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .customer-name {
          font-weight: 600;
          color: #111827;
        }
        .customer-email {
          color: #4b5563;
        }
        .info-row {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          margin-bottom: 4px;
        }
        .info-label {
          color: #6b7280;
        }
        .info-value {
          font-weight: 500;
        }
        .status-paid {
          color: #059669;
          font-weight: 500;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
        }
        th {
          background: #f3f4f6;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
        }
        th:nth-child(2) { text-align: center; }
        th:nth-child(3), th:nth-child(4) { text-align: right; }
        td {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        td:nth-child(2) { text-align: center; }
        td:nth-child(3), td:nth-child(4) { text-align: right; }
        .item-desc {
          font-weight: 500;
          color: #111827;
        }
        .item-validity {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 32px;
        }
        .totals-box {
          width: 256px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-row.final {
          background: #f3f4f6;
          padding: 12px 8px;
          margin: 8px -8px 0;
          border: none;
        }
        .total-label {
          color: #4b5563;
        }
        .total-value {
          font-weight: 500;
        }
        .total-row.final .total-label,
        .total-row.final .total-value {
          font-weight: bold;
          color: #111827;
        }
        .total-row.final .total-value {
          font-size: 20px;
        }
        .subscription-box {
          background: #ecfeff;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 32px;
        }
        .subscription-title {
          font-weight: 600;
          color: #155e75;
          margin-bottom: 8px;
        }
        .subscription-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          font-size: 14px;
        }
        .subscription-label {
          color: #0891b2;
        }
        .subscription-value {
          font-weight: 500;
          color: #164e63;
          margin-left: 8px;
        }
        .footer {
          border-top: 2px solid #e5e7eb;
          padding-top: 24px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .footer-company {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }
        .footer-note {
          margin-top: 16px;
          font-size: 12px;
          color: #9ca3af;
        }
        @media print {
          body { padding: 0; }
          @page { margin: 20mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${TERMIVOXED_LOGO_SVG}
            <div>
              <div class="company-name">${COMPANY_INFO.name}</div>
              <div class="company-tagline">${COMPANY_INFO.tagline}</div>
            </div>
          </div>
        </div>
        <div style="text-align: right;">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-number">#${invoiceNumber}</div>
        </div>
      </div>

      <div class="details-grid">
        <div>
          <div class="section-title">Bill To</div>
          <div class="customer-name">${customerName}</div>
          <div class="customer-email">${customerEmail}</div>
        </div>
        <div style="text-align: right;">
          <div class="info-row">
            <span class="info-label">Invoice Date:</span>
            <span class="info-value">${formatDateLocal(invoiceDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment ID:</span>
            <span class="info-value" style="font-size: 12px;">${paymentId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="status-paid">PAID</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItems.map(item => `
            <tr>
              <td>
                <div class="item-desc">${item.description}</div>
                <div class="item-validity">Validity: ${formatDateLocal(subscriptionStart)} - ${formatDateLocal(subscriptionEnd)}</div>
              </td>
              <td>${item.quantity}</td>
              <td>${formatCurrencyLocal(item.unitPrice, currencySymbol)}</td>
              <td style="font-weight: 500;">${formatCurrencyLocal(item.total, currencySymbol)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-box">
          <div class="total-row">
            <span class="total-label">Subtotal</span>
            <span class="total-value">${formatCurrencyLocal(amountRupees, currencySymbol)}</span>
          </div>
          <div class="total-row final">
            <span class="total-label">Total</span>
            <span class="total-value">${formatCurrencyLocal(amountRupees, currencySymbol)}</span>
          </div>
        </div>
      </div>

      <div class="subscription-box">
        <div class="subscription-title">Subscription Details</div>
        <div class="subscription-grid">
          <div>
            <span class="subscription-label">Plan:</span>
            <span class="subscription-value">${planName}</span>
          </div>
          <div>
            <span class="subscription-label">Billing:</span>
            <span class="subscription-value" style="text-transform: capitalize;">${billingPeriod}</span>
          </div>
          <div>
            <span class="subscription-label">Valid From:</span>
            <span class="subscription-value">${formatDateLocal(subscriptionStart)}</span>
          </div>
          <div>
            <span class="subscription-label">Valid Until:</span>
            <span class="subscription-value">${formatDateLocal(subscriptionEnd)}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-company">${COMPANY_INFO.name}</div>
        <div>${COMPANY_INFO.address}</div>
        <div style="margin-top: 8px;">${COMPANY_INFO.email} | ${COMPANY_INFO.website}</div>
        <div style="margin-top: 16px; display: flex; align-items: center; justify-content: center; gap: 6px;">
          ${LXUSBRAIN_LOGO_SVG}
          <span style="color: #6b7280; font-size: 12px;">A product of <strong style="color: #374151;">${COMPANY_INFO.parent}</strong></span>
        </div>
        <div class="footer-note">This is a computer-generated invoice and does not require a signature.</div>
      </div>
    </body>
    </html>
  `;
}

export default Invoice;
