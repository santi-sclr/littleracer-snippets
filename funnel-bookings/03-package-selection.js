/* ============================================================
   SCRIPT — PACKAGE SELECTION
   Purpose: Stores the selected package key and base price
            to sessionStorage when the customer picks a package.
   ============================================================ */

(function () {

  // Package label → internal key (matched via substring)
  const packageKeyMap = [
    { match: 'Self pick-up',  key: 'self_pickup'  },
    { match: 'Bumper Car',    key: 'bumper_car'   },
    { match: 'Little Racer',  key: 'little_racer' },
    { match: 'Mega Racer',    key: 'mega_racer'   },
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
      const val        = el.value.trim();
      const packageKey = getPackageKey(val);
      const basePrice  = extractBasePrice(val);

      sessionStorage.setItem('lrpr_package',    packageKey);
      sessionStorage.setItem('lrpr_base_price', basePrice);

      console.log('[LRPR] Package selected:', packageKey, '| Base price: $' + basePrice);
    }
  });

})();
