/**
 * SocialEngine - Generatore Caroselli AI & Interattività
 */
async function generateCarouselDemo() {
  const urlRaw = document.getElementById('site-url').value.trim();
  const product = document.getElementById('site-product').value.trim();
  
  if (!urlRaw) { 
    document.getElementById('site-url').focus(); 
    return; 
  }

  let url = urlRaw;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  const submitBtn = document.getElementById('m-submit-btn');
  const originalText = submitBtn.textContent;
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Analisi del sito e impaginazione slide (circa 30s)... ⏳';

  try {
    const res = await fetch('https://n8n.rmstudio.app/webhook/social-carousel-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_url: url,
        product_topic: product || "Servizio Principale",
        format: "carousel_5_slides"
      })
    });
    
    const data = await res.json();
    
    if (data && (data.carousel_url || data.portal_link)) {
      const linkEl = document.getElementById('demo-link');
      const resultDiv = document.getElementById('demo-result');
      const targetUrl = data.carousel_url || data.portal_link;
      
      linkEl.href = targetUrl;
      linkEl.textContent = targetUrl;
      resultDiv.classList.remove('hidden');
    } else {
      alert("Carosello generato! Controlla il link per scaricare il PDF.");
    }
  } catch(e) {
    alert("I server stanno completando l'impaginazione. Se il link non compare, riprova tra qualche secondo.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function toggleFaq(idx) {
  const content = document.getElementById(`faq-content-${idx}`);
  const icon = document.getElementById(`faq-icon-${idx}`);
  if (!content) return;

  const isHidden = content.classList.contains('hidden');
  document.querySelectorAll('[id^="faq-content-"]').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('[id^="faq-icon-"]').forEach(el => el.style.transform = 'rotate(0deg)');

  if (isHidden) {
    content.classList.remove('hidden');
    if (icon) icon.style.transform = 'rotate(180deg)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetch("https://raw.githubusercontent.com/Rickym2025/mrstudio/main/public/orbit-template.html")
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById("orbit-template-container");
      if (container) container.innerHTML = html;
    })
    .catch(err => console.error("Orbit error:", err));
});
