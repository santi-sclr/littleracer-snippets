<script>
/* ============================================================
   SCRIPT — AFFILIATE PACKAGE SELECTION PAGE
   Page: /package-selection-affiliate (or equivalent)
   Purpose: Listens for radio selection on the affiliate
            package field (contact.affiliate_packages) and
            stores a clean internal key + the base price to
            sessionStorage so the calendar and add-ons pages
            can calculate the deposit correctly.
   GHL Query Key: affiliate_packages
   GHL Unique Key: contact.affiliate_packages
   How to use: Paste into the custom JS block on the
               affiliate package selection page ONLY.
   Plugin dependency: none (sessionStorage only)
   ============================================================ */

(function () {

  // ----------------------------------------------------------
  // PACKAGE MAP
  // Keys must match the exact radio option labels in GHL.
  // Values are the clean internal keys passed downstream.
  // ----------------------------------------------------------
  const packageMap = {
    'Bumper Car Rental (Starting from $595)'             : 'bumper_car',
    'Bumper Car & Bounce House Rental (Starting from $795)' : 'bumper_bounce',
    'Little Racer Deluxe (Starting from $1795)'          : 'little_racer_deluxe',
  };

  // ----------------------------------------------------------
  // BASE PRICE MAP
  // Stores the starting price so the calendar/add-ons pages
  // can calculate the 25% deposit correctly.
  // ----------------------------------------------------------
  const packagePrices = {
    'bumper_car'          : 595,
    'bumper_bounce'       : 795,
    'little_racer_deluxe' : 1795,
  };

  // ----------------------------------------------------------
  // LISTEN FOR SELECTION
  // ----------------------------------------------------------
  document.addEventListener('change', function (e) {
    const el = e.target;

    if (el.type === 'radio' && (el.name === 'affiliate_packages' || el.getAttribute('data-q') === 'affiliate_packages')) {
      const val        = el.value.trim();
      const packageKey = packageMap[val] || val;
      const basePrice  = packagePrices[packageKey] || 0;

      sessionStorage.setItem('lrpr_package',    packageKey);
      sessionStorage.setItem('lrpr_base_price', basePrice);

      console.log('[LRPR Affiliate] Package selected:', packageKey, '| Base price: $' + basePrice);
    }
  });

})();
</script>
