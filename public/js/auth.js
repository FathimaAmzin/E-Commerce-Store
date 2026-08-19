// public/js/auth.js — handles both login.html and register.html

function nextUrl() {
  return qs("next") || "/index.html";
}

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("form-error");
    errorBox.innerHTML = "";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await api.post("/api/auth/login", { email, password });
      window.location.href = nextUrl();
    } catch (err) {
      errorBox.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    }
  });
}

const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("form-error");
    errorBox.innerHTML = "";

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await api.post("/api/auth/register", { name, email, password });
      window.location.href = nextUrl();
    } catch (err) {
      errorBox.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    }
  });
}
