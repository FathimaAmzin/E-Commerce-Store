// public/js/cart.js

const PRODUCT_IMAGES_CART = {
  "☕": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&q=80&fit=crop",
  "🥣": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&q=80&fit=crop",
  "👜": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200&q=80&fit=crop",
  "🎒": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80&fit=crop",
  "🪵": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=200&q=80&fit=crop",
  "🥄": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80&fit=crop",
  "🌱": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&q=80&fit=crop",
  "🧤": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200&q=80&fit=crop",
  "🧶": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=200&q=80&fit=crop",
  "🧵": "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=200&q=80&fit=crop",
  "🫖": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200&q=80&fit=crop",
  "📓": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=80&fit=crop",
  "🧭": "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=200&q=80&fit=crop",
  "🪔": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=200&q=80&fit=crop",
  "🍃": "https://images.unsplash.com/photo-1490750967868-88df5691cc2e?w=200&q=80&fit=crop",
  "⚗️": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&q=80&fit=crop",
  "🔧": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80&fit=crop",
};

const FALLBACK_CART = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&q=80&fit=crop";

async function loadCart() {
  const container = document.getElementById("cart-content");

  let cart;
  try {
    cart = await api.get("/api/cart");
  } catch (err) {
    if (err.message.includes("logged in")) {
      window.location.href = "/login.html?next=/cart.html";
      return;
    }
    container.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    return;
  }

  if (cart.items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>You haven't added anything yet. Explore our handcrafted catalog.</p>
        <a class="btn btn-primary" href="/index.html" style="margin-top:8px;">Browse the Catalog</a>
      </div>`;
    return;
  }

  const rows = cart.items.map((item) => {
    const imgSrc = PRODUCT_IMAGES_CART[item.image_emoji] || FALLBACK_CART;
    return `
    <div class="cart-row" data-cart-item-id="${item.cart_item_id}">
      <div class="thumb-sm">
        <img src="${imgSrc}" alt="${escapeHtml(item.name)}">
      </div>
      <div>
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-sku">${formatPrice(item.price_cents)} each</div>
      </div>
      <input type="number" class="qty-input" value="${item.quantity}" min="0" max="${item.stock}" data-qty-input>
      <div style="font-family:var(--font-display);font-weight:700;font-size:1.05rem;color:var(--terracotta);">${formatPrice(item.price_cents * item.quantity)}</div>
      <button class="btn btn-danger" data-remove-btn style="padding:9px 14px;font-size:0.82rem;">Remove</button>
    </div>`;
  }).join("");

  container.innerHTML = `
    <div class="stack">
      ${rows}
      <div class="cart-summary-box">
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:var(--muted);margin-bottom:8px;">
          <span>${cart.items.reduce((s, i) => s + i.quantity, 0)} items in your cart</span>
          <span style="color:var(--sage);font-weight:600;">Free shipping over රු 10,000 ✓</span>
        </div>
        <div class="cart-total-row">
          <span>Total</span>
          <span>${formatPrice(cart.total_cents)}</span>
        </div>
        <div class="row" style="justify-content:flex-end;gap:12px;margin-top:20px;">
          <a class="btn btn-ghost" href="/index.html">Continue Shopping</a>
          <a class="btn btn-primary" href="/checkout.html">
            Checkout
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-qty-input]").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const row = e.target.closest("[data-cart-item-id]");
      const id = row.dataset.cartItemId;
      try {
        await api.put(`/api/cart/${id}`, { quantity: parseInt(e.target.value, 10) });
        await loadCart(); refreshCartCount();
      } catch (err) {
        showToast(err.message); loadCart();
      }
    });
  });

  container.querySelectorAll("[data-remove-btn]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const row = e.target.closest("[data-cart-item-id]");
      const id = row.dataset.cartItemId;
      await api.delete(`/api/cart/${id}`);
      await loadCart(); refreshCartCount();
    });
  });
}

loadCart();
