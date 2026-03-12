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

// Pls work

(function () {

  // Package label → internal key (matched via substring)
  const packageKeyMap = [
     { match: 'Bumper Car Rental', key: 'bumper_car' },
     { match: 'Bumper Car & Bounce House Rental', key: 'bumper_bounce' },
     { match: 'Little Racer Experience', key: 'little_racer_exp' },
     { match: 'Little Racer Deluxe', key: 'little_racer_deluxe' },
  ];

   function getPackageKey(label) {
      for (const entry of packageKeyMap) {
         if (label.includes(entry.match)) return entry.key;
      }
      return label; // fallback to raw label
   }

   function extractBasePrice(label) {
      // Pull the number out of "Starting from $XXX"
      const match = label.match(/\$(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
   }

   document.addEventListener('change', function (e) {
      const el = e.target;

      if (el.type === 'radio' && (el.name === 'package' || el.getAttribute('data-q') === 'package')) {
         const val = el.value.trim();
         const packageKey = getPackageKey(val);
         const basePrice = extractBasePrice(val);

         sessionStorage.setItem('lrpr_package', packageKey);
         sessionStorage.setItem('lrpr_base_price', basePrice);

         console.log('[LRPR] Package selected:', packageKey, '| Base price: $' + basePrice);
      }
   }};

  // ----------------------------------------------------------
  // BASE PRICE MAP
  // Stores the starting price so the calendar/add-ons pages
  // can calculate the 25% deposit correctly.
  // ----------------------------------------------------------
  const packagePrices = {
    'bumper_car'          : 595,
    'bumper_bounce'       : 795,
    'little_racer_exp'    : 795,
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
