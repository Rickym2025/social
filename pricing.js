/**
 * SocialEngine - Live Pricing & Stripe Checkout Engine
 * RM Studio Universal Engine
 */

const SUPABASE_S2_URL = 'https://jhijfulhntlhcytbhcly.supabase.co';
const SUPABASE_S2_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaWpmdWxobnRsaGN5dGJoY2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MzcxODcsImV4cCI6MjA5ODMxMzE4N30.z062NW4ApClll-XWHH2ufmcCleBRNHUUdKO6FiLa0TQ';

// 1. Prezzi di Fallback Immediati (Zero Flicker)
const SOCIAL_PRICES = {
  starter: { id: "starter", name: "Starter Pack (10 Caroselli / 50 Slide)", price: 29 },
  pro:     { id: "pro",     name: "Pro Pack (35 Caroselli / 175 Slide)",  price: 79 },
  agency:  { id: "agency",  name: "Agency Hub (100 Caroselli)",           price: 199 }
};

// 2. Render Reattivo del DOM
function renderSocialPrices() {
  const elStarter = document.getElementById("price-starter-val");
  const elPro = document.getElementById("price-pro-val");
  const elAgency = document.getElementById("price-agency-val");

  if (elStarter) elStarter.innerText = `€${SOCIAL_PRICES.starter.price}`;
  if (elPro) elPro.innerText = `€${SOCIAL_PRICES.pro.price}`;
  if (elAgency) elAgency.innerText = `€${SOCIAL_PRICES.agency.price}`;

  // Aggiornamento dei testi nei pulsanti (se presenti con data-btn-plan)
  const btnStarter = document.querySelector('[data-btn-plan="starter"]');
  const btnPro = document.querySelector('[data-btn-plan="pro"]');
  const btnAgency = document.querySelector('[data-btn-plan="agency"]');

  if (btnStarter) btnStarter.innerText = `Acquista Starter (€${SOCIAL_PRICES.starter.price})`;
  if (btnPro) btnPro.innerText = `Acquista Pro (€${SOCIAL_PRICES.pro.price}) 🔥`;
  if (btnAgency) btnAgency.innerText = `Acquista Agency (€${SOCIAL_PRICES.agency.price})`;
}

// 3. Fetch Live da Supabase S2 (Tabella saas_pricing)
async function initSocialPricing() {
  try {
    const res = await fetch(`${SUPABASE_S2_URL}/rest/v1/saas_pricing?saas=eq.social&select=*`, {
      headers: {
        'apikey': SUPABASE_S2_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_S2_ANON_KEY}`
      },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          const pid = (item.plan_id || "").toLowerCase();
          if (SOCIAL_PRICES[pid]) {
            SOCIAL_PRICES[pid].price = Number(item.price);
            if (item.name) SOCIAL_PRICES[pid].name = item.name;
          }
        });
        renderSocialPrices();
      }
    }
  } catch (e) {
    console.warn("Utilizzo prezzi locali fallback SocialEngine:", e);
  }
}

// 4. Avvio Checkout Stripe On-The-Fly via n8n
async function avviaCheckoutSocial(planKey = "pro", email = "") {
  const plan = SOCIAL_PRICES[planKey] || SOCIAL_PRICES.pro;
  const origin = window.location.origin;

  const payload = {
    progetto: "SocialEngine",
    portal_type: "social",
    title: `SocialEngine • ${plan.name}`,
    price: plan.price,
    ricarica_tipo: planKey,
    email: email || undefined,
    agency_id: email ? `lead_${email}` : "checkout_diretto",
    project_id: email ? `lead_${email}` : "checkout_diretto",
    origin: origin,
    success_url: `${origin}/?success=true&plan=${planKey}`,
    cancel_url: `${origin}/#prezzi`
  };

  try {
    const res = await fetch("https://n8n.rmstudio.app/webhook/crea-sessione-stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Errore sessione Stripe");
    const data = await res.json();
    const redirectUrl = data.url || data.checkout_url || data.session_url;

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      throw new Error("URL Stripe mancante");
    }
  } catch (err) {
    console.error("Errore checkout SocialEngine:", err);
    window.location.hash = "#prezzi";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderSocialPrices();
  initSocialPricing();
});
