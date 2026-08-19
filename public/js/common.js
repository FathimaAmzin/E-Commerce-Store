// public/js/common.js
// Small shared helpers used across every page.

const api = {
  async request(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
    }
    return data;
  },
  get(url) { return this.request("GET", url); },
  post(url, body) { return this.request("POST", url, body); },
  put(url, body) { return this.request("PUT", url, body); },
  delete(url) { return this.request("DELETE", url); },
};

function formatPrice(cents) {
  const rupees = cents / 100;
  return `රු ${rupees.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

async function refreshCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (!el) return;
  try {
    const cart = await api.get("/api/cart");
    const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  } catch {
    el.style.display = "none";
  }
}

async function renderAuthState() {
  const slot = document.querySelector("[data-auth-slot]");
  if (!slot) return;
  try {
    const { user } = await api.get("/api/auth/me");
    if (user) {
      slot.innerHTML = `
        <span style="color:var(--terracotta);font-size:0.82rem;font-weight:600;">Hi, ${escapeHtml(user.name)}</span>
        <a href="/orders.html">Orders</a>
        <a href="#" id="logout-link">Log out</a>
      `;
      document.getElementById("logout-link").addEventListener("click", async (e) => {
        e.preventDefault();
        await api.post("/api/auth/logout");
        window.location.href = "/index.html";
      });
      refreshCartCount();
    } else {
      slot.innerHTML = `<a href="/login.html">Log in</a><a href="/register.html">Sign up</a>`;
    }
  } catch {
    slot.innerHTML = `<a href="/login.html">Log in</a>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", renderAuthState);
