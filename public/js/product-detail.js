// public/js/product-detail.js

const PRODUCT_IMAGES_DETAIL = {
  "☕": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&q=85&fit=crop",
  "🥣": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900&q=85&fit=crop",
  "👜": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=85&fit=crop",
  "🎒": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85&fit=crop",
  "🪵": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=900&q=85&fit=crop",
  "🥄": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&q=85&fit=crop",
  "🌱": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85&fit=crop",
  "🧤": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=85&fit=crop",
  "🧶": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=900&q=85&fit=crop",
  "🧵": "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=900&q=85&fit=crop",
  "🫖": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&q=85&fit=crop",
  "📓": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&q=85&fit=crop",
  "🧭": "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=900&q=85&fit=crop",
  "🪔": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=900&q=85&fit=crop",
  "🍃": "https://images.unsplash.com/photo-1490750967868-88df5691cc2e?w=900&q=85&fit=crop",
  "⚗️": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=900&q=85&fit=crop",
  "🔧": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85&fit=crop",
};

const FALLBACK_DETAIL = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=85&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=900&q=85&fit=crop",
];

async function loadProduct() {
  const id = qs("id");
  const container = document.getElementById("detail-container");

  if (!id) {
    container.innerHTML = `<div class="empty-state"><div class="icon">🧭</div><h3>No product specified</h3><p>Please browse the catalog.</p><a href="/index.html" class="btn btn-primary" style="margin-top:8px;">Back to Catalog</a></div>`;
    return;
  }

  let product;
  try {
    product = await api.get(`/api/products/${id}`);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">📦</div><h3>Product not found</h3><p>${escapeHtml(err.message)}</p></div>`;
    return;
  }

  const imgSrc = PRODUCT_IMAGES_DETAIL[product.image_emoji] || FALLBACK_DETAIL[product.id % FALLBACK_DETAIL.length];

  // Alternate images for the mini-gallery
  const altImages = Object.values(PRODUCT_IMAGES_DETAIL)
    .filter(u => u !== imgSrc)
    .slice(0, 3);

  const isLow = product.stock > 0 && product.stock <= 5;
  const isOut = product.stock === 0;
  const stockClass = isOut ? "" : isLow ? "low" : "in";
  const stockText  = isOut
    ? "Out of stock"
    : isLow
    ? `⚠ Only ${product.stock} left`
    : `✓ In stock (${product.stock})`;

  document.title = `${product.name} — Fieldwork Goods`;

  container.innerHTML = `
    <div class="detail-grid">
      <!-- Gallery -->
      <div class="detail-gallery">
        <div class="detail-thumb">
          <img src="${imgSrc}" alt="${escapeHtml(product.name)}" id="main-detail-img">
        </div>
        <div style="display:flex;gap:10px;margin-top:12px;">
          <div onclick="document.getElementById('main-detail-img').src='${imgSrc}'" style="width:64px;height:64px;border-radius:10px;overflow:hidden;border:2px solid var(--terracotta);cursor:pointer;flex-shrink:0;">
            <img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;" alt="View 1">
          </div>
          ${altImages.map((u,i) => `
          <div onclick="document.getElementById('main-detail-img').src='${u}'" style="width:64px;height:64px;border-radius:10px;overflow:hidden;border:1.5px solid var(--line);cursor:pointer;flex-shrink:0;transition:border-color 0.2s;" onmouseover="this.style.borderColor='var(--terracotta)'" onmouseout="this.style.borderColor='var(--line)'">
            <img src="${u}" style="width:100%;height:100%;object-fit:cover;" alt="View ${i+2}">
          </div>`).join("")}
        </div>
      </div>

      <!-- Info -->
      <div>
        <div class="detail-sku">SKU ${escapeHtml(product.sku)} · ${escapeHtml(product.category)}</div>
        <h1 class="detail-name">${escapeHtml(product.name)}</h1>
        <span class="detail-price">${formatPrice(product.price_cents)}</span>
        <p class="detail-desc">${escapeHtml(product.description || "A beautifully handcrafted piece made with care and precision by skilled artisans. Built to last a lifetime.")}</p>

        <div class="detail-attrs">
          <div class="detail-attr">
            <span>Category</span>
            <strong>${escapeHtml(product.category)}</strong>
          </div>
          <div class="detail-attr">
            <span>Availability</span>
            <strong class="stock-note ${stockClass}">${stockText}</strong>
          </div>
          <div class="detail-attr">
            <span>SKU</span>
            <strong>${escapeHtml(product.sku)}</strong>
          </div>
          <div class="detail-attr">
            <span>Shipping</span>
            <strong>Free over රු 10,000</strong>
          </div>
        </div>

        <div class="qty-row">
          <label class="qty-label" for="qty">Qty</label>
          <input type="number" id="qty" value="1" min="1" max="${Math.max(product.stock, 1)}" ${isOut ? "disabled" : ""}>
        </div>

        <div style="display:flex;gap:12px;margin-top:4px;">
          <button class="btn btn-primary" id="add-to-cart-btn" ${isOut ? "disabled" : ""} style="flex:1;">
            ${isOut ? "Out of Stock" : "Add to Cart"}
            ${!isOut ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>` : ""}
          </button>
          <a href="/index.html" class="btn btn-ghost">← Back</a>
        </div>

        <p id="add-msg" style="min-height:20px;font-size:0.85rem;margin-top:12px;color:var(--muted);"></p>

        <div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--line);display:flex;gap:24px;flex-wrap:wrap;">
          <span style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:6px;">🔒 Secure checkout</span>
          <span style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:6px;">♾️ Lifetime warranty</span>
          <span style="font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:6px;">🌿 Ethically made</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById("add-to-cart-btn")?.addEventListener("click", async () => {
    const btn = document.getElementById("add-to-cart-btn");
    const qty = parseInt(document.getElementById("qty").value, 10) || 1;
    const msg = document.getElementById("add-msg");
    btn.disabled = true;
    btn.textContent = "Adding…";
    try {
      await api.post("/api/cart", { product_id: product.id, quantity: qty });
      showToast(`Added ${qty} × ${product.name} to cart`);
      refreshCartCount();
      msg.textContent = "";
      btn.textContent = "Added ✓";
      btn.style.background = "var(--sage)";
      btn.style.borderColor = "var(--sage)";
      setTimeout(() => {
        btn.innerHTML = `Add to Cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
        btn.style.background = "";
        btn.style.borderColor = "";
        btn.disabled = false;
      }, 2200);
    } catch (err) {
      if (err.message.includes("logged in")) {
        window.location.href = `/login.html?next=/product.html?id=${product.id}`;
        return;
      }
      msg.textContent = err.message;
      btn.innerHTML = `Add to Cart <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
      btn.disabled = false;
    }
  });
}

loadProduct();
