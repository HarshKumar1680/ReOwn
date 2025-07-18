// Helper to get query parameter
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

document.addEventListener('DOMContentLoaded', function() {
  // UPI details
  const UPI_ID = 'harshkumar1680@oksbi';
  const PAYEE_NAME = 'Harsh Kumar';

  function renderCartAndShipping(pendingOrder) {
    // Cart summary
    const cartDiv = document.getElementById('cart-summary');
    if (pendingOrder.items && pendingOrder.items.length) {
      let total = 0;
      cartDiv.innerHTML = '<h3>Order Summary</h3><ul>' +
        pendingOrder.items.map(item => {
          const subtotal = item.price * item.quantity;
          total += subtotal;
          return `<li>${item.quantity} x ${item.name} @ ₹${item.price} = ₹${subtotal}</li>`;
        }).join('') +
        '</ul>';
      document.getElementById('amount').textContent = total;
      return total;
    } else {
      cartDiv.innerHTML = '<p style="color:red;">No items in cart.</p>';
      document.getElementById('amount').textContent = '0';
      return 0;
    }
  }
  function renderShipping(pendingOrder) {
    const shipDiv = document.getElementById('shipping-summary');
    if (pendingOrder.shippingAddress) {
      const s = pendingOrder.shippingAddress;
      shipDiv.innerHTML = `<h4>Shipping To:</h4><div>${s.fullName}, ${s.address}, ${s.city}, ${s.postalCode}, ${s.country}${s.phone ? ', ' + s.phone : ''}</div>`;
    } else {
      shipDiv.innerHTML = '';
    }
  }

  function generateUpiUrl({ upiId, payeeName, amount }) {
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&tn=ReOwnold%20Order`;
  }

  // On page load
  const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
  if (!pendingOrder.items || !pendingOrder.items.length || !pendingOrder.shippingAddress) {
    document.getElementById('payment-info').innerHTML = '<div style="text-align:center;padding:2em 0;"><div style="font-size:3em;">💸</div><div style="font-size:1.2em;font-weight:600;margin:0.5em 0 0.2em 0;">No items in cart!</div><div style="color:#888;">Please add products and proceed to checkout.</div><a href="/views/cart.html" class="cta-btn btn-animate" style="margin-top:1em;display:inline-block;">Go to Cart</a></div>';
  } else {
    const total = renderCartAndShipping(pendingOrder);
    renderShipping(pendingOrder);
    document.getElementById('upi-id').textContent = UPI_ID;
    document.getElementById('payee-name').textContent = PAYEE_NAME;
    const upiUrl = generateUpiUrl({ upiId: UPI_ID, payeeName: PAYEE_NAME, amount: total });
    console.log('UPI URL:', upiUrl);
    console.log('Total:', total);
    // Use qrcodejs to render QR code
    const qrDiv = document.getElementById('qr-container');
    qrDiv.innerHTML = '';
    new QRCode(qrDiv, {
      text: upiUrl,
      width: 300,
      height: 300,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  // Handle payment proof form submission
  const form = document.getElementById('payment-proof-form');
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const txnId = document.getElementById('txn-id').value.trim();
    if (!txnId) return;
    const statusDiv = document.getElementById('payment-status');
    statusDiv.textContent = '';
    // Get pending order data
    const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder') || '{}');
    if (!pendingOrder.items || !pendingOrder.items.length || !pendingOrder.shippingAddress) {
      statusDiv.textContent = 'No pending order found.';
      return;
    }
    // Calculate total again for safety
    let totalPrice = 0;
    pendingOrder.items.forEach(item => { totalPrice += item.price * item.quantity; });
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: pendingOrder.items.map(({product, quantity, price}) => ({product, quantity, price})),
          shippingAddress: pendingOrder.shippingAddress,
          totalPrice,
          paymentProof: { txnId },
          paymentStatus: 'awaiting_verification'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        statusDiv.textContent = 'Order placed and payment proof submitted. Awaiting admin verification.';
        this.querySelector('button[type="submit"]').disabled = true;
        this.querySelector('#txn-id').disabled = true;
        localStorage.removeItem('pendingOrder');
      } else {
        statusDiv.textContent = data.message || 'Failed to place order.';
      }
    } catch (err) {
      statusDiv.textContent = 'Failed to place order.';
    }
  });
}); 