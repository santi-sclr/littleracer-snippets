<script>
  /* ============================================================
   SCRIPT 4 — AFFILIATE ADD-ONS PAGE
   Page: /addons-affiliate (or equivalent affiliate URL)
   Purpose: Same as Script 3 but for affiliate locations.
            No travel fee, no generator, no artificial turf,
            no Battle Party. Uses contact.addons_affiliates.
   How to use: Paste into the custom JS block on the
               affiliate add-ons page ONLY.
   ============================================================ */

(function () {

  // ----------------------------------------------------------
  // PRICING CONSTANTS — Affiliate only
  // ----------------------------------------------------------
  const AFFILIATE_ADDON_PRICES = {
    'Two extra Bumper Cars - $100'                                      : 100,
    'Four extra Bumper Cars - $200'                                     : 200,
    'Inflatable foam axe throwing (kids 8+ and adults) - $125'         : 125,
    '2 XL Hot Wheels Racing Tracks - $125'                             : 125,
  };

  const DEPOSIT_RATE = 0.25;

  // ----------------------------------------------------------
  // CALCULATION FUNCTION
  // ----------------------------------------------------------
  function calculateAffiliatePricing() {
    let total = parseFloat(sessionStorage.getItem('lrpr_base_price') || '0');

    // — Checkboxes: Affiliate Addons (contact.addons_affiliates) —
    document.querySelectorAll('[data-q="addons_affiliates"]:checked').forEach(function (cb) {
      const price = AFFILIATE_ADDON_PRICES[cb.value.trim()];
      if (price !== undefined) total += price;
    });

    const deposit   = Math.round(total * DEPOSIT_RATE * 100) / 100;
    const remaining = Math.round((total - deposit) * 100) / 100;

    return { total, deposit, remaining };
  }

  // ----------------------------------------------------------
  // STORE & INJECT
  // ----------------------------------------------------------
  function updateAffiliatePricing() {
    const { total, deposit, remaining } = calculateAffiliatePricing();

    sessionStorage.setItem('lrpr_total',     total.toFixed(2));
    sessionStorage.setItem('lrpr_deposit',   deposit.toFixed(2));
    sessionStorage.setItem('lrpr_remaining', remaining.toFixed(2));

    console.log('[LRPR Affiliate] Total:', total, '| Deposit:', deposit, '| Remaining:', remaining);
  }

  // Intercept next/submit button
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button, [type="submit"], [class*="next"], [class*="submit"]');
    if (btn) {
      updateAffiliatePricing();
    }
  });

  // Recalculate on change
  document.addEventListener('change', function (e) {
    const el = e.target;
    if (el.type === 'checkbox' || el.type === 'radio') {
      updateAffiliatePricing();
    }
  });

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAffiliatePricing);
  } else {
    updateAffiliatePricing();
  }

})();
</script>
