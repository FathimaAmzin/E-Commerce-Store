// public/js/checkout.js

async function initCheckout() {
  const container = document.getElementById("checkout-content");

  let cart;
  try {
    cart = await api.get("/api/cart");
  } catch (err) {
    if (err.message.includes("logged in")) {
      window.location.href = "/login.html?next=/checkout.html";
      return;
    }
    container.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    return;
  }

  if (cart.items.length === 0) {
    container.innerHTML = `<p class="muted">Your cart is empty. <a href="/index.html">Go shopping</a>.</p>`;
    return;
  }

  const summary = cart.items
    .map((i) => `<div class="order-line"><span>${i.quantity} × ${escapeHtml(i.name)}</span><span class="mono">${formatPrice(i.price_cents * i.quantity)}</span></div>`)
    .join("");

  container.innerHTML = `
    <h3>Order summary</h3>
    ${summary}
    <div class="order-line" style="border-top:1px solid var(--line); margin-top:8px; padding-top:12px; font-weight:600;">
      <span>Total</span><span class="mono">${formatPrice(cart.total_cents)}</span>
    </div>

    <h3 style="margin-top:24px;">Shipping details</h3>
    <div id="checkout-error"></div>
    <form id="checkout-form">
      <div class="field">
        <label for="shipping_name">Full name</label>
        <input type="text" id="shipping_name" required>
      </div>
      <div class="field">
        <label for="shipping_address">Shipping address</label>
        <textarea id="shipping_address" required placeholder="Street, city, state, ZIP"></textarea>
      </div>
      <button class="btn full" type="submit">Place order</button>
    </form>
  `;

  document.getElementById("checkout-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("checkout-error");
    errorBox.innerHTML = "";

    const shipping_name = document.getElementById("shipping_name").value.trim();
    const shipping_address = document.getElementById("shipping_address").value.trim();

    try {
      const order = await api.post("/api/orders", { shipping_name, shipping_address });
      refreshCartCount();
      window.location.href = `/orders.html?placed=${order.id}`;
    } catch (err) {
      errorBox.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    }
  });
}

initCheckout();
