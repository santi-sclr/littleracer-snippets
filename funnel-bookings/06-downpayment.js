  // ── CONFIG ─────────────────────────────────────────────
  const STRIPE_PK    = 'pk_live_51QHsDEL04FDSgxArYLBGJmT4o6uboa8KfV9xzBNsctLdo2Gaicsl5K6YtuMjIMGjjMlKV6rTUYxv80EnoOUubDFQ00FD5MDrgQ';  // Stripe publishable key
  const WP_ENDPOINT  = 'https://littleracerpartyrentals.com/wp-json/stripe-deposit/v1/create-payment-intent';
  const THANK_YOU_URL = 'https://book.littleracerpartyrentals.com/waiver'; // Your thank-you page URL
  // ───────────────────────────────────────────────────────

  const stripe = Stripe(STRIPE_PK);

  // Read values passed in from GHL via URL params
  const params = new URLSearchParams(window.location.search);

  // Map GHL parameter names to what we need
  const name          = params.get('name') || params.get('customer_name') || 'Guest';
  const phone         = params.get('phone') || params.get('customer_phone') || '';
  const address       = params.get('location') || params.get('address') || '';
  const packageType   = params.get('package') || '';
  const eventType     = params.get('type_of_event') || '';
  const travelFee     = params.get('travel_fee') || '';
  const scheduledDate = params.get('date') || params.get('scheduled_date') || '';
  const addonsParam   = params.get('add_ons') || params.get('addons') || '';  // renamed to avoid conflict
  const damageWaiver  = params.get('damage_waiver') || '';
  const source        = params.get('source') || '';
  const depositCents  = Math.round(parseFloat(sessionStorage.getItem('lrpr_deposit') || '0') * 100);
  const orderId       = params.get('orderId') || params.get('opportunity_id') || '';
  const contactId     = params.get('contactId') || '';
  const email         = params.get('email') || '';

  // Show deposit amount to customer
  document.getElementById('display-amount').textContent =
    depositCents > 0
      ? '$' + (depositCents / 100).toFixed(2)
      : 'Amount unavailable';

  // ── Handle Affiliate Note ────────────────────────
  const affiliateNoteEl = document.getElementById('affiliate-note');
  if (affiliateNoteEl) {
    affiliateNoteEl.style.display = source === 'affiliate' ? 'block' : 'none';
  }

  // ── Handle Damage Waiver display logic ────────────────────
  if (source !== 'affiliate' && damageWaiver && damageWaiver !== 'null') {
    const waiverRow = document.getElementById('damage-waiver-row');
    const waiverVal = document.getElementById('damage-waiver-value');
    if (waiverRow && waiverVal) {
      waiverVal.textContent = damageWaiver;
      waiverRow.style.display = 'block';
    }
  }

  // ── Handle Travel Fee display logic ────────────────────
  const travelRow = document.getElementById('travel-fee-row');
  const travelVal = document.getElementById('travel-fee-value');
  if (travelRow && travelVal) {
    if (source === 'affiliate') {
      travelVal.textContent = 'A travel fee up to 175$ may be added based on distance from our nearest vendor.';
      travelRow.style.display = 'block';
    } else if (travelFee && travelFee !== 'null' && travelFee !== '0.00') {
      travelVal.textContent = '$' + parseFloat(travelFee).toFixed(2);
      travelRow.style.display = 'block';
    }
  }

  // ── Handle Affiliate Disclaimer ────────────────────────
  const disclaimerRow = document.getElementById('affiliate-disclaimer-row');
  if (disclaimerRow) {
    if (source === 'affiliate') {
      disclaimerRow.style.display = 'block';
    }
  }

  // ── Handle Add-Ons Display ────────────────────────
  const addonsRow = document.getElementById('addons-row');
  if (addonsRow) {
  // Try sessionStorage first, then fall back to URL param (GHL passes contact fields as params)
    const addonsData = JSON.parse(sessionStorage.getItem('lrpr_addons') || '[]');
    const addonsParam = params.get('add_ons') || params.get('addons') || params.get('addons_affiliates') || '';

    if (addonsData.length > 0) {
      const addonsValue = document.getElementById('addons-value');
        if (addonsValue) addonsValue.textContent = addonsData.map(a => a.label).join(' | ');
        addonsRow.style.display = 'block';
    } else if (addonsParam && addonsParam !== 'null' && addonsParam.trim() !== '') {
        const addonsValue = document.getElementById('addons-value');
        if (addonsValue) addonsValue.textContent = addonsParam.replace(/,/g, ' | ');
          addonsRow.style.display = 'block';
        }
  }

  // Call WordPress to create the PaymentIntent
  fetch(WP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      depositAmount: depositCents,
      orderId: orderId,
      contactId: contactId,
      email: email,
      name: name,
      phone: phone,
      address: address,
      packageType: packageType + (eventType ? ' - ' + eventType : ''),
      scheduledDate: scheduledDate,
      travelNJ: travelFee.includes('NJ') ? travelFee : '',
      travelDC: travelFee.includes('DC') ? travelFee : '',
      travelLA: travelFee.includes('LA') ? travelFee : '',
      addons: addonsParam
    })
  })
  .then(res => res.json())
  .then(({ clientSecret }) => {

    const elements  = stripe.elements({ clientSecret });
    const paymentEl = elements.create('payment');
    paymentEl.mount('#payment-element');

    document.getElementById('pay-btn').addEventListener('click', async () => {
      const btn = document.getElementById('pay-btn');
      btn.textContent = 'Processing...';
      btn.disabled    = true;

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: THANK_YOU_URL },
        redirect: "if_required"
      });

      if (error) {
        document.getElementById('error-msg').textContent = error.message;
        btn.textContent = 'Pay Deposit Now';
        btn.disabled    = false;
        return;
      }
      if (paymentIntent && paymentIntent.status === "succeeded") {
        window.location.href = THANK_YOU_URL;
      }
    });
  })
  .catch(() => {
    document.getElementById('error-msg').textContent =
      'Payment form failed to load. Please refresh and try again.';
  });
