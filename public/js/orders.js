// public/js/orders.js

async function loadOrders() {
  const container = document.getElementById("orders-content");
  const placedId = qs("placed");

  let orders;
  try {
    orders = await api.get("/api/orders");
  } catch (err) {
    if (err.message.includes("logged in")) {
      window.location.href = "/login.html?next=/orders.html";
      return;
    }
    container.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    return;
  }

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <p>No orders yet.</p>
        <a class="btn" href="/index.html" style="margin-top:12px;">Browse the catalog</a>
      </div>`;
    return;
  }

  const banner = placedId
    ? `<div class="form-success">Order #${escapeHtml(placedId)} placed successfully. Thank you!</div>`
    : "";

  container.innerHTML =
    banner +
    orders
      .map((order) => {
        const date = new Date(order.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        const items = order.items
          .map(
            (i) =>
              `<div class="order-line"><span>${i.quantity} × ${escapeHtml(i.product_name)}</span><span class="mono">${formatPrice(i.unit_price_cents * i.quantity)}</span></div>`
          )
          .join("");

        return `
        <div class="order-ticket">
          <div class="order-ticket-head">
            <span>ORDER #${order.id} · ${date}</span>
            <span class="status-pill">${escapeHtml(order.status)}</span>
          </div>
          <div class="order-ticket-body">
            ${items}
            <div class="order-line" style="border-top:1px solid var(--line); margin-top:8px; padding-top:10px; font-weight:600;">
              <span>Total</span><span class="mono">${formatPrice(order.total_cents)}</span>
            </div>
            <p class="muted" style="font-size:0.82rem; margin-top:10px;">
              Shipping to ${escapeHtml(order.shipping_name)} — ${escapeHtml(order.shipping_address)}
            </p>
          </div>
        </div>`;
      })
      .join("");
}

loadOrders();
