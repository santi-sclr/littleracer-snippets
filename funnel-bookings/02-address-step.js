/* ============================================================
   SCRIPT 1 — ADDRESS STEP / LOCATION ROUTER
   Page: /location (address step)
   Purpose: Polls for address fields to be populated by GHL's
            autocomplete, then runs the router lookup automatically.
            Re-runs if the customer changes their address.
            Hidden fields are set before the user clicks submit,
            so GHL reads them instantly with no timing risk.
   Plugin dependency: lrpr-router (wp-json/lrpr-router/v1/lookup)
   ============================================================ */

(function () {

  // ── CONFIG ────────────────────────────────────────────────────
  const ROUTER_ENDPOINT = 'https://littleracerpartyrentals.com/wp-json/lrpr-router/v1/lookup';
  // ─────────────────────────────────────────────────────────────

  console.log('%c [LRPR] 👋 Script loaded', 'background:#1a1a2e;color:#4f9eff;font-weight:bold;padding:4px 8px;border-radius:4px;');

  let lookupComplete   = false;
  let lookupInProgress = false;
  let lastAddress      = null;
  let pollInterval     = null;

  // ----------------------------------------------------------
  // WAIT FOR FIELDS TO EXIST IN THE DOM
  // ----------------------------------------------------------
  function waitForFields(callback) {
    const interval = setInterval(() => {
      const street = document.querySelector('input[data-q="address"]');
      const city   = document.querySelector('input[data-q="city"]');
      const state  = document.querySelector('input[data-q="state"]');
      const zip    = document.querySelector('input[data-q="postal_code"]');
      const btn    = document.querySelector('button[type="submit"].btn-dark');
      if (street && city && state && zip && btn) {
        clearInterval(interval);
        callback({ street, city, state, zip, btn });
      }
    }, 300);
  }

  // ----------------------------------------------------------
  // BUILD FULL ADDRESS FROM SEPARATE FIELDS
  // ----------------------------------------------------------
  function getFullAddress() {
    const street = (document.querySelector('input[data-q="address"]')?.value     || '').trim();
    const city   = (document.querySelector('input[data-q="city"]')?.value        || '').trim();
    const state  = (document.querySelector('input[data-q="state"]')?.value       || '').trim();
    const zip    = (document.querySelector('input[data-q="postal_code"]')?.value || '').trim();
    const parts  = [street, city, state, zip].filter(Boolean);
    return parts.length === 4 ? parts.join(', ') : null;
  }

  // ----------------------------------------------------------
  // FILL HIDDEN FIELD
  // Uses native setter + events so GHL's Vue registers the change
  // ----------------------------------------------------------
  function fillHiddenField(dataQ, value) {
    const input = document.querySelector('input[data-q="' + dataQ + '"]');
    if (input) {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(input, value);
      input.dispatchEvent(new Event('input',  { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[LRPR] Set "' + dataQ + '" = "' + value + '"');
    } else {
      console.warn('[LRPR] Field not found: ' + dataQ);
    }
  }

  // ----------------------------------------------------------
  // CLEAR HIDDEN FIELDS
  // Called when address changes to reset stale values
  // ----------------------------------------------------------
  function clearHiddenFields() {
    fillHiddenField('location_type',      '');
    fillHiddenField('router_location_id', '');
    fillHiddenField('travel_fee',         '');
    fillHiddenField('affiliate_email',    '');
    sessionStorage.removeItem('lrpr_location_type');
  }

  // ----------------------------------------------------------
  // CALL ROUTER API
  // ----------------------------------------------------------
  async function lookupLocation(address) {
    try {
      const response = await fetch(ROUTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (!response.ok) return { type: 'out_of_area' };
      return await response.json();
    } catch (err) {
      console.error('[LRPR] Lookup error:', err);
      return { type: 'out_of_area' };
    }
  }

  // ----------------------------------------------------------
  // RUN LOOKUP AND POPULATE FIELDS
  // ----------------------------------------------------------
  async function runLookup() {
    if (lookupInProgress) return;

    const address = getFullAddress();
    if (!address) return;

    lookupInProgress = true;
    console.log('[LRPR] Running lookup for:', address);

    const result = await lookupLocation(address);
    console.log('[LRPR] Router result:', result);

    fillHiddenField('location_type',      result.type || 'out_of_area');
    fillHiddenField('router_location_id', result.id   || '');
    fillHiddenField('travel_fee',         result.travel_fee != null ? String(result.travel_fee) : '0');
    fillHiddenField('affiliate_email',    result.affiliate_email || '');

    // Also persist location_type to sessionStorage so later pages
    // (e.g. the calendar page) can read it without GHL form context
    sessionStorage.setItem('lrpr_location_type', result.type || 'out_of_area');

    lastAddress      = address;
    lookupComplete   = true;
    lookupInProgress = false;
    console.log('[LRPR] ✅ Hidden fields populated — ready for submit');
  }

  // ----------------------------------------------------------
  // START POLL
  // Checks every 500ms if all 4 fields have values and runs lookup
  // ----------------------------------------------------------
  function startPoll() {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(() => {
      const address = getFullAddress();
      if (!address) return;

      // Address changed — reset and re-run
      if (address !== lastAddress) {
        if (lookupComplete) {
          console.log('[LRPR] Address changed — resetting lookup');
          lookupComplete   = false;
          lookupInProgress = false;
          clearHiddenFields();
        }
        runLookup();
      }
    }, 500);
  }

  // ----------------------------------------------------------
  // ATTACH HANDLERS
  // ----------------------------------------------------------
  function attachHandlers({ btn }) {
    console.log('[LRPR] Fields found — starting address poll');

    startPoll();

    // Safety net on button click — if lookup somehow isn't done yet,
    // block submit, wait up to 5 seconds, then proceed
    btn.addEventListener('click', async function (event) {
      if (lookupComplete) {
        console.log('[LRPR] Lookup already complete — proceeding');
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      console.log('[LRPR] Lookup not yet complete — waiting...');

      if (!lookupInProgress) runLookup();

      let attempts = 0;
      while (!lookupComplete && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!lookupComplete) {
        console.warn('[LRPR] Lookup timed out — submitting with fallback');
        fillHiddenField('location_type', 'company');
        sessionStorage.setItem('lrpr_location_type', 'company');
      }

      console.log('[LRPR] Proceeding with submit');
      btn.click();
    });
  }

  waitForFields(attachHandlers);

})();
