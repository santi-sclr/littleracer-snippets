/* ============================================================
   SCRIPT 2A — CALENDAR PRICE INJECTOR
   Pages: /duration-bumpercars, /duration-selfpickup,
          /duration-littleracer, /duration-megaracer
          (and affiliate equivalents)
   Purpose: Finds each calendar card by title text (one time,
            on page load) and stamps a data-cal-price attribute
            onto it. This means the reader script (2B) never
            has to touch title text again — it just reads the
            attribute. If you update a price, only change it
            here in 2A. If you rename a calendar, nothing breaks.
   How to use: Paste into the custom JS block on EACH
               duration/calendar page.
   ============================================================ */

(function () {

  // ----------------------------------------------------------
  // PRICE MAP — keyed by a unique substring of the card title.
  // Keep these strings short but distinct enough to not
  // accidentally match the wrong card.
  // If you ADD a new calendar, add a new line here.
  // If you CHANGE a price, update the number here.
  // If you RENAME a calendar, update the key string here.
  // ----------------------------------------------------------
  const titlePriceMap = [

    // — Self Pick-Up / Drop-Off —
    { match: '5-Hour Self-Service Rental',   price: 345 },
    { match: '12-Hour Self-Service Rental',  price: 445 },
    { match: '24-Hour Self-Service Rental',  price: 545 },

    // — Bumper Car Rental —
    { match: '1-Hour Bumper Car Rental',     price: 595 },
    { match: '2-Hour Bumper Car Rental',     price: 695 },
    { match: '3-Hour Bumper Car Rental',     price: 845 },
    { match: '4-Hour Bumper Car Rental',     price: 995 },

    // — Affiliate Mega Racer Experience —
    { match: '2-Hour Little Racer Deluxe', price: 1795 },
    { match: '3-Hour Little Racer Deluxe', price: 2095 },
    { match: '4-Hour Little Racer Deluxe', price: 2395 },
    { match: '5-Hour Little Racer Deluxe', price: 2795 },
    
    // — Little Racer Experience —
    { match: '1-Hour Little Racer',          price: 795  },
    { match: '1 1/2-Hour Little Racer',      price: 895  },
    { match: '2-Hour Little Racer',          price: 995  },
    { match: '3-Hour Little Racer',          price: 1195 },
    { match: '4-Hour Little Racer',          price: 1395 },
    { match: '5-Hour Little Racer',          price: 1595 },

    // — Mega Racer Experience —
    { match: '2-Hour Mega Racer',            price: 1795 },
    { match: '3-Hour Mega Racer',            price: 2095 },
    { match: '4-Hour Mega Racer',            price: 2395 },
    { match: '5-Hour Mega Racer',            price: 2795 },

    // — Affiliate: Bumper Cars & Bounce House —
    { match: '1-Hour Bumper Cars & Bounce',  price: 795  },
    { match: '2-Hour Bumper Cars & Bounce',  price: 895  },
    { match: '3-Hour Bumper Cars & Bounce',  price: 1045 },
    { match: '4-Hour Bumper Cars & Bounce',  price: 1195 },
    { match: '5-Hour Bumper Cars & Bounce',  price: 1345 },


  ];

  // ----------------------------------------------------------
  // Stamp data-cal-price onto each card
  // ----------------------------------------------------------
  function stampPrices() {
    const cards = document.querySelectorAll('.appointment_widgets--service-event--card');

    if (cards.length === 0) return; // Cards not loaded yet, observer will retry

    cards.forEach(function (card) {
      if (card.dataset.calPrice) return; // Already stamped, skip

      const nameEl = card.querySelector('.name');
      if (!nameEl) return;

      const cardText = nameEl.textContent.trim();

      for (const entry of titlePriceMap) {
        if (cardText.includes(entry.match)) {
          card.dataset.calPrice = entry.price;
          console.log('[LRPR Injector] Stamped card "' + cardText + '" → $' + entry.price);
          break;
        }
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', stampPrices);
  } else {
    stampPrices();
  }

  // Re-run if GHL dynamically renders cards after initial load
  const observer = new MutationObserver(stampPrices);
  observer.observe(document.body, { childList: true, subtree: true });

})();




/* ============================================================
   SCRIPT 2B — CALENDAR PRICE READER
   Pages: Same as 2A — paste on every duration/calendar page
          alongside Script 2A.
   Purpose: Listens for card clicks and reads the data-cal-price
            attribute stamped by Script 2A. Stores the base
            price in sessionStorage for use on the add-ons page.
            Falls back to title text if attribute is missing.
   ============================================================ */

(function () {

  // ----------------------------------------------------------
  // Fallback title-text map — last resort if 2A didn't stamp
  // the card for any reason (e.g. GHL rendered it too late)
  // ----------------------------------------------------------
  const titlePrices = {
    '5-Hour Self-Service Rental'     : 345,
    '12-Hour Self-Service Rental'    : 445,
    '24-Hour Self-Service Rental'    : 545,
    '1-Hour Bumper Car Rental'       : 595,
    '2-Hour Bumper Car Rental'       : 695,
    '3-Hour Bumper Car Rental'       : 845,
    '4-Hour Bumper Car Rental'       : 995,
    '1-Hour Little Racer'            : 795,
    '1 1/2-Hour Little Racer'        : 895,
    '2-Hour Little Racer'            : 995,
    '3-Hour Little Racer'            : 1195,
    '4-Hour Little Racer'            : 1395,
    '5-Hour Little Racer'            : 1595,
    '2-Hour Mega Racer'              : 1795,
    '3-Hour Mega Racer'              : 2095,
    '4-Hour Mega Racer'              : 2395,
    '5-Hour Mega Racer'              : 2795,
    '1-Hour Bumper Cars & Bounce'    : 795,
    '2-Hour Bumper Cars & Bounce'    : 895,
    '3-Hour Bumper Cars & Bounce'    : 1045,
    '4-Hour Bumper Cars & Bounce'    : 1195,
    '5-Hour Bumper Cars & Bounce'    : 1345,
  };

  function getPriceFromTitle(card) {
    const nameEl = card.querySelector('.name');
    if (!nameEl) return null;
    const text = nameEl.textContent.trim();
    for (const [key, price] of Object.entries(titlePrices)) {
      if (text.includes(key)) return price;
    }
    return null;
  }

  // ----------------------------------------------------------
  // Click handler — reads data-cal-price first, falls back
  // to title text if needed
  // ----------------------------------------------------------
  document.addEventListener('click', function (e) {
    const card = e.target.closest('.appointment_widgets--service-event--card');
    if (!card) return;

    let price = null;

    // Primary: read stamped attribute from Script 2A
    if (card.dataset.calPrice) {
      price = parseFloat(card.dataset.calPrice);
      console.log('[LRPR Reader] Price from data attribute: $' + price);
    }

    // Fallback: title text
    if (price === null) {
      price = getPriceFromTitle(card);
      if (price !== null) {
        console.warn('[LRPR Reader] Fell back to title text match: $' + price);
      }
    }

    if (price !== null) {
      sessionStorage.setItem('lrpr_base_price', price);
      console.log('[LRPR Reader] Base price stored: $' + price);
    } else {
      console.warn('[LRPR Reader] Could not determine price — check card title matches in Script 2A.');
    }
  });

})();
