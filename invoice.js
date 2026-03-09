// FocusBill - Invoice Script
// ==========================

// Get invoice data from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const invoiceData = JSON.parse(decodeURIComponent(urlParams.get('data') || '{}'));

console.log('📄 Invoice data received:', invoiceData);

// Populate invoice
function populateInvoice() {
  if (!invoiceData || !invoiceData.client) {
    console.error('❌ No invoice data or client found');
    return;
  }

  console.log('✅ Starting invoice population...');

  // Determine data structure (old vs new)
  const invoice = invoiceData.invoice || invoiceData; // Support both old and new structure
  const client = invoiceData.client;

  // Header info
  const invoiceNumber = invoice.number || `INV-${invoiceData.invoiceNumber || Date.now()}`;
  document.getElementById('invoice-num').textContent = invoiceNumber;

  // From - with better fallback handling
  const fromName = invoiceData.fromName && invoiceData.fromName.trim() !== ''
    ? invoiceData.fromName
    : 'Your Business';
  const fromEmail = invoiceData.fromEmail && invoiceData.fromEmail.trim() !== ''
    ? invoiceData.fromEmail
    : 'your@email.com';
  const fromCompany = invoiceData.fromCompany || '';

  console.log('From Name:', fromName);
  console.log('From Email:', fromEmail);
  console.log('From Company:', fromCompany);
  console.log('From Address:', invoiceData.fromAddress);

  document.getElementById('from-name').textContent = fromCompany || fromName;
  let fromDetails = fromEmail;
  if (invoiceData.fromAddress && invoiceData.fromAddress.trim() !== '') {
    fromDetails += '\n' + invoiceData.fromAddress;
  }
  document.getElementById('from-email').textContent = fromDetails;

  // To
  document.getElementById('to-name').textContent = client.name;
  const clientEmail = client.email && client.email.trim() !== ''
    ? client.email
    : 'No email provided';
  document.getElementById('to-email').textContent = clientEmail;

  console.log('Client Name:', client.name);
  console.log('Client Email:', clientEmail);

  // Dates
  const invoiceDate = new Date(invoice.createdAt || invoiceData.invoiceDate);
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  document.getElementById('invoice-date').textContent = invoiceDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  document.getElementById('due-date').textContent = dueDate.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  document.getElementById('period').textContent = invoice.type ? invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1) : 'Custom Period';

  // Items
  const itemsBody = document.getElementById('items-body');
  itemsBody.innerHTML = '';

  // Handle both old structure (logs) and new structure (items)
  const items = invoice.items || invoiceData.logs || [];

  items.forEach(item => {
    let dateStr = '';
    let description = '';
    let quantity = 0;
    let rate = 0;
    let amount = 0;

    if (item.date) {
      // Old structure (time log)
      const date = new Date(item.date);
      dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const hours = (item.duration / 60).toFixed(2);
      quantity = hours;
      rate = client.rate || 75;
      amount = hours * rate;
      description = item.task || 'Professional Services';
    } else {
      // New structure (invoice item)
      dateStr = item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
      description = item.description || 'Professional Services';
      quantity = item.quantity.toFixed(2);
      rate = item.rate;
      amount = item.amount;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="item-date">${dateStr}</td>
      <td>
        <div class="item-description">${description}</div>
      </td>
      <td class="item-hours">${quantity} ${invoice.type === 'hourly' ? 'hrs' : 'qty'}</td>
      <td>$${rate.toFixed(2)}</td>
      <td class="item-amount">$${amount.toFixed(2)}</td>
    `;
    itemsBody.appendChild(row);
  });

  // Totals
  const subtotal = invoice.subtotal || items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = invoice.taxAmount || 0;
  const discount = invoice.discount || 0;
  const total = invoice.total || (subtotal + taxAmount - discount);

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;

  // Show tax row if there's tax
  if (taxAmount > 0) {
    const taxRow = document.createElement('div');
    taxRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 10px; color: #666;';
    taxRow.innerHTML = `
      <span>Tax (${invoice.taxRate || 0}%)</span>
      <span>$${taxAmount.toFixed(2)}</span>
    `;
    document.getElementById('total').parentElement.insertBefore(taxRow, document.getElementById('total').parentElement.firstChild);
  }

  // Show discount row if there's a discount
  if (discount > 0) {
    const discountRow = document.createElement('div');
    discountRow.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 10px; color: #666;';
    discountRow.innerHTML = `
      <span>Discount</span>
      <span>-$${discount.toFixed(2)}</span>
    `;
    document.getElementById('total').parentElement.insertBefore(discountRow, document.getElementById('total').parentElement.firstChild);
  }

  document.getElementById('total').textContent = `$${total.toFixed(2)}`;

  // Add invoice notes if present
  if (invoice.notes && invoice.notes.trim() !== '') {
    const notesSection = document.createElement('div');
    notesSection.style.cssText = 'margin-top: 30px; padding: 15px; background: #f9f9f9; border-left: 4px solid #2484BF; border-radius: 4px;';
    notesSection.innerHTML = `
      <h4 style="margin: 0 0 10px 0; color: #2484BF; font-size: 14px;">Notes</h4>
      <p style="margin: 0; color: #666; line-height: 1.6;">${invoice.notes}</p>
    `;
    document.getElementById('payment-terms').insertBefore(notesSection, document.getElementById('payment-terms').firstChild);
  }

  // Payment terms
  const paymentTermsText = invoiceData.paymentTerms || 'Payment is due within 30 days of invoice date. Please include the invoice number with your payment.';
  document.getElementById('payment-terms-text').innerHTML = paymentTermsText + '<br><br><strong>Thank you for your business!</strong>';

  // Payment links
  const stripeLink = invoiceData.stripeLink;
  const paypalLink = invoiceData.paypalLink;

  if (stripeLink || paypalLink) {
    document.getElementById('payment-methods').style.display = 'block';

    if (stripeLink) {
      const stripeBtn = document.getElementById('stripe-payment-link');
      stripeBtn.href = stripeLink;
      stripeBtn.style.display = 'inline-block';
    }

    if (paypalLink) {
      const paypalBtn = document.getElementById('paypal-payment-link');
      paypalBtn.href = paypalLink;
      paypalBtn.style.display = 'inline-block';
    }
  }
}

function downloadPDF() {
  // Check if html2pdf is available
  if (typeof html2pdf === 'undefined') {
    alert('PDF download is not available. Please use the Print button instead (Ctrl+P or Cmd+P).');
    return;
  }

  const element = document.getElementById('invoice');
  const opt = {
    margin: 0.5,
    filename: `Invoice_${invoiceData.client.name}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Temporarily hide action buttons
  document.querySelector('.action-buttons').style.display = 'none';

  html2pdf().set(opt).from(element).save().then(() => {
    document.querySelector('.action-buttons').style.display = 'flex';
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', populateInvoice);
} else {
  populateInvoice();
}

// Make functions globally accessible
window.downloadPDF = downloadPDF;
