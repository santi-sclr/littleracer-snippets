/* ============================================================
   SCRIPT 4E — AFFILIATE REDIRECT INTERCEPT
   Page: /affiliate/duration-bumper-cars ONLY
   Purpose: When the customer clicks "Schedule Event", redirects
            affiliate customers to /affiliate/addons instead of
            the company /addons page that GHL's static calendar
            redirect points to. URL params are preserved.
   How to use: Paste into the custom JS block on
               /affiliate/duration-bumper-cars ONLY — alongside
               Scripts 2A and 2B.
   ============================================================ */

(function () {

  const AFFILIATE_ADDONS_URL = 'https://book.littleracerpartyrentals.com/affiliate/addons';
  const SCHEDULE_BTN_ID      = 'schedule-meeting-button';

  function waitForButton() {
    const interval = setInterval(() => {
      const btn = document.getElementById(SCHEDULE_BTN_ID);
      if (btn) {
        clearInterval(interval);
        btn.addEventListener('click', function () {
          const locationType = sessionStorage.getItem('lrpr_location_type') || '';
          console.log('[LRPR] 2C — Schedule Event clicked, location_type:', locationType);

          if (locationType === 'affiliate') {
            console.log('[LRPR] 2C — Affiliate customer — redirecting to affiliate add-ons');
            window.location.replace(AFFILIATE_ADDONS_URL + window.location.search);
          }
        });
        console.log('[LRPR] 2C — Schedule button found, listener attached');
      }
    }, 300);
  }

  waitForButton();
  console.log('[LRPR] 4E — Affiliate redirect intercept loaded');

})();
