// public/js/products.js — catalog page logic

let activeCategory = "";
let searchTimer = null;

// Map product emoji to colorful e-commerce product images
const PRODUCT_IMAGES = {
  "☕": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&q=85&fit=crop", // Colorful ceramic mug
  "🥣": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700&q=85&fit=crop", // Colorful speckled ceramic bowl
  "👜": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=700&q=85&fit=crop", // Vibrant stylish canvas tote bag
  "🎒": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=85&fit=crop", // Modern colorful backpack
  "🪵": "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=700&q=85&fit=crop", // Artisan handcrafted wood board
  "🥄": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&q=85&fit=crop", // Beechwood spoon set
  "🌱": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=85&fit=crop", // Garden trowel & botanicals
  "🧤": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=700&q=85&fit=crop", // Canvas garden apron & gear
  "🧶": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=700&q=85&fit=crop", // Vibrant wool blanket
  "🧵": "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=700&q=85&fit=crop", // Colorful linen napkins & textiles
  "🫖": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=700&q=85&fit=crop", // Ceramic coffee dripper & kettle
  "📓": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=700&q=85&fit=crop", // Handcrafted leather journal
  "🧭": "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=700&q=85&fit=crop",
  "🪔": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=700&q=85&fit=crop",
  "🍃": "https://images.unsplash.com/photo-1490750967868-88df5691cc2e?w=700&q=85&fit=crop",
  "⚗️": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=700&q=85&fit=crop",
  "🔧": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=85&fit=crop",
};

// Fallback pool for unknown emojis - colorful product shots
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85&fit=crop",
  "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=700&q=85&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=85&fit=crop",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=85&fit=crop",
];

function getProductImage(emoji, id) {
  return PRODUCT_IMAGES[emoji] || FALLBACK_IMAGES[id % FALLBACK_IMAGES.length];
}

async function loadCategories() {
  const categories = await api.get("/api/products/categories");
  const wrap = document.getElementById("category-chips");
  wrap.innerHTML = "";
  const allChip = makeChip("All", "");
  wrap.appendChild(allChip);
  categories.forEach((c) => wrap.appendChild(makeChip(c, c)));
}

function makeChip(label, value) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "chip" + (activeCategory === value ? " active" : "");
  btn.textContent = label;
  btn.addEventListener("click", () => {
    activeCategory = value;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    loadProducts();
  });
  return btn;
}

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  const q = document.getElementById("search-input").value.trim();

  const params = new URLSearchParams();
  if (activeCategory) params.set("category", activeCategory);
  if (q) params.set("q", q);

  const products = await api.get(`/api/products?${params.toString()}`);

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="icon">🔍</div>
        <h3>Nothing found</h3>
        <p>No goods match that search. Try a different term or category.</p>
        <a href="/index.html" class="btn btn-ghost" style="margin-top:8px;">Clear Search</a>
      </div>`;
    return;
  }

  grid.innerHTML = products.map((p) => {
    const imgSrc = getProductImage(p.image_emoji, p.id);
    const isLow = p.stock > 0 && p.stock <= 5;
    const isOut = p.stock === 0;

    const badgeHtml = isLow
      ? `<span class="card-badge badge-limited">Only ${p.stock} Left</span>`
      : isOut
      ? `<span class="card-badge badge-out">Sold Out</span>`
      : "";

    const stockClass = isOut ? "" : isLow ? "low" : "in";
    const stockText  = isOut
      ? "Out of stock"
      : isLow
      ? `Only ${p.stock} left`
      : "In stock ✓";

    return `
    <a class="product-card" href="/product.html?id=${p.id}" id="product-card-${p.id}">
      <div class="thumb">
        <img src="${imgSrc}" alt="${escapeHtml(p.name)}" loading="lazy">
        <div class="thumb-overlay"></div>
        ${badgeHtml}
        <button class="card-wishlist" onclick="event.preventDefault();event.stopPropagation();showToast('Added to wishlist ♥')" aria-label="Add to wishlist">♥</button>
      </div>
      <div class="card-body">
        <div class="sku">SKU ${escapeHtml(p.sku)}</div>
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="price-row">
          <span class="price">${formatPrice(p.price_cents)}</span>
          <span class="stock-note ${stockClass}">${stockText}</span>
        </div>
      </div>
    </a>`;
  }).join("");

  // Staggered card animation
  setTimeout(() => {
    document.querySelectorAll(".product-card").forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(18px)";
      card.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.style.transform = "none";
      }));
    });
  }, 10);
}

document.getElementById("search-input").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 250);
});

loadCategories();
loadProducts();
