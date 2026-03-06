/* ============================================================
   SCRIPT 3 — MAIN FLOW ADD-ONS PAGE
   Page: /addons
   Purpose: Reads all add-on selections, sums them with the
            base price from sessionStorage, calculates the 25%
            deposit and remaining balance, then passes the
            deposit value directly into the Stripe payment form.
   How to use: Paste into the custom JS block on the main
               add-ons page.
   ============================================================ */

(function () {

  // ----------------------------------------------------------
  // PRICING CONSTANTS
  // ----------------------------------------------------------
  const ADDON_PRICES = {
    'Two extra Bumper Cars - $100'                                          : 100,
    'Four extra Bumper Cars - $200'                                        : 200,
    'Inflatable foam axe throwing (kids 8+ and adults) - $125'             : 125,
    'Arts & crafts - $30'                                                  : 30,
  };

  const BATTLE_PARTY_PRICES = {
    '1 Inflatable Maze With Equipment For 10 Players at a time (24x24 ft) - $575' : 575,
    '2 Inflatable Maze With Equipment For 20 Players at a time (24x48 ft) - $750' : 750,
  };

  /*
  const TRAVEL_FEE_PRICES = {
    '0 - 20 Miles - $0'                                    : 0,
    '21 - 35 Miles - $50'                                  : 50,
    '36 - 45 Miles - $100'                                 : 100,
    '46 - 60 Miles - $150'                                 : 150,
    '60 - 80 Miles - $200'                                 : 200,
    'New York City - $100'                                 : 100,
    'Long Island/Brooklyn NY/Stamford/Greenwich CT - $165' : 165,
  };
  */

  const ARTIFICIAL_TURF_PRICE = 125;
  const GENERATOR_PRICE       = 95;
  const DEPOSIT_RATE          = 0.25;
  const DMG_WAIVER			  = 45;
  
  // ----------------------------------------------------------
  // Determine if this customer is in California
  // ----------------------------------------------------------
  
  const urlParams   = new URLSearchParams(window.location.search);
  const customerState = (urlParams.get('state') || urlParams.get('State') || '').toLowerCase();
  const isCaliforniaCustomer = customerState === 'california' || customerState === 'ca';

  // ----------------------------------------------------------
  // CALCULATION FUNCTION
  // ----------------------------------------------------------
  function calculatePricing() {
    let total = parseFloat(sessionStorage.getItem('lrpr_base_price') || '0');

    // — Checkboxes: Addons —
    document.querySelectorAll('[data-q="addons"]:checked').forEach(function (cb) {
      const price = ADDON_PRICES[cb.value.trim()];
      if (price !== undefined) total += price;
    });

    // — Checkboxes: Battle Party — excluded for CA —
    if (!isCaliforniaCustomer) {
      document.querySelectorAll('[data-q="battleparty"]:checked').forEach(function (cb) {
        const price = BATTLE_PARTY_PRICES[cb.value.trim()];
        if (price !== undefined) total += price;
      });
    }

    // — Radio: Artificial Turf — only if Indoor selected —
    const indoorOutdoorEl = document.querySelector('[data-q="choose_event"]:checked');
    const isIndoor = indoorOutdoorEl && indoorOutdoorEl.value.trim().toLowerCase() === 'indoor';

    if (isIndoor) {
      const turfEl = document.querySelector('[data-q="turf"]:checked');
      if (turfEl && turfEl.value.trim().toLowerCase() === 'yes') {
        total += ARTIFICIAL_TURF_PRICE;
      }
    }

    // — Radio: Generator —
    const generatorEl = document.querySelector('[data-q="generator"]:checked');
    if (generatorEl && generatorEl.value.trim().toLowerCase() === 'yes') {
      total += GENERATOR_PRICE;
    }
    
   // — Radio: Damage Waiver —
	// — Radio: Damage Waiver —
	const dmgWaiverEl = document.querySelector('[data-q="radio_26qs7"]:checked');

	if (dmgWaiverEl) {
  	console.log('[LRPR] Damage Waiver Value:', dmgWaiverEl.value);

  	if (dmgWaiverEl.value.trim().toLowerCase() === 'yes') {
    	total += DMG_WAIVER;
  }
}
    
    
    /*
    // — Travel Fee Logic Disabled —
    const travelFeeFields = [
      'travel_fee__nj',
      'travel_fee__dc',
      'travel_fee_la',
    ];

    travelFeeFields.forEach(function (fieldName) {
      const el = document.querySelector('[data-q="' + fieldName + '"]:checked');
      if (el) {
        const price = TRAVEL_FEE_PRICES[el.value.trim()];
        if (price !== undefined) total += price;
      }
    });
    */

    const deposit   = Math.round(total * DEPOSIT_RATE * 100) / 100;
    const remaining = Math.round((total - deposit) * 100) / 100;

    return { total, deposit, remaining };
  }

  // ----------------------------------------------------------
  // STORE & INJECT
  // ----------------------------------------------------------
  function updatePricing() {
    const { total, deposit, remaining } = calculatePricing();

    sessionStorage.setItem('lrpr_total',     total.toFixed(2));
    sessionStorage.setItem('lrpr_deposit',   deposit.toFixed(2));
    sessionStorage.setItem('lrpr_remaining', remaining.toFixed(2));

    console.log('[LRPR] Total:', total, '| Deposit:', deposit, '| Remaining:', remaining);
  }

  // ----------------------------------------------------------
  // Intercept submission
  // ----------------------------------------------------------
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button, [type="submit"], [class*="next"], [class*="submit"]');
    if (btn) {
      updatePricing();
    }
  });

  document.addEventListener('change', function (e) {
    const el = e.target;
    if (el.type === 'checkbox' || el.type === 'radio') {
      updatePricing();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePricing);
  } else {
    updatePricing();
  }

})();
