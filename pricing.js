/**
 * SocialEngine - Live Pricing & Stripe Checkout Engine
 * RM Studio Universal Engine
 */
const SOCIAL_PRICES = {
  starter: { id: "starter", name: "Starter Pack (10 Caroselli / 50 Slide)", price: 29 },
  pro:     { id: "pro",     name: "Pro Pack (35 Caroselli / 175 Slide)",  price: 79 },
  agency:  { id: "agency",  name: "Agency Hub (100 Caroselli)",           price: 199 }
};

async function initSocialPricing() {
  try {
    const res = await fetch("https://zqkqlhosyjvxdwfjmwwb.supabase.co/rest/v1/saas_pricing?saas=eq.social&select=*");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(item => {
          const pid = (item.plan_id || "").toLowerCase();
          if (SOCIAL_PRICES[pid]) {
            SOCIAL_PRICES[pid].price = Number(item.price);
          }
        });
      }
    }
  } catch (e) {
    console.warn("Utilizzo prezzi locali SocialEngine:", e);
  }

  const elStarter = document.getElementById("price-starter-val");
  const elPro = document.getElementById("price-pro-val");
  const elAgency = document.getElementById("price-agency-val");

  if (elStarter) elStarter.innerText = `€${SOCIAL_PRICES.starter.price}`;
  if (elPro) elPro.innerText = `€${SOCIAL_PRICES.pro.price}`;
  if (elAgency) elAgency.innerText = `€${SOCIAL_PRICES.agency.price}`;
}

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

    if (!res.ok) throw new Error("Errore sessione");
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

document.addEventListener("DOMContentLoaded", initSocialPricing);
