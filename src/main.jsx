import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./data/store.js";
import "./global/theme.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
// Refresh password guard that works across browser UI refreshes and in dev (Vite)
(function installRefreshGuard() {
  const FLAG = "__require_refresh_password__";
  const PASSWORD = "190725";

  // Inside installRefreshGuard, replace the overlay function with this:
function showPasswordOverlay({ message, onSuccess, expected }) {
  const overlay = document.createElement("div");
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:999999",
    "background:rgba(0,0,0,0.85)",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "color:#fff",
  ].join(";");

  overlay.innerHTML = `
    <div style="background:#222;padding:20px;border-radius:8px;min-width:280px;max-width:90vw;">
      <h2 style="margin:0 0 12px 0;font-size:18px;">Confirm</h2>
      <p style="margin:0 0 12px 0;">${message}</p>
      <input id="refreshPwdInput" type="password" style="width:100%;padding:8px;margin-bottom:12px;color:#000" placeholder="Enter password" autocomplete="off" />
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="pwdOkBtn" style="padding:6px 10px;">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const input = overlay.querySelector("#refreshPwdInput");
  const okBtn = overlay.querySelector("#pwdOkBtn");

  function submit() {
    const required = typeof expected === "string" ? expected : PASSWORD; // PASSWORD from the guard
    if (input.value === required) {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      onSuccess && onSuccess();
    } else {
      window.alert("Incorrect password.");
      input.value = "";
      input.focus();
    }
  }

  okBtn.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
  input.focus();
}

// Add this line right after the function so others can reuse the same alert box:
window.showPasswordOverlay = showPasswordOverlay;

  // If the page just reloaded (via toolbar, context menu, etc.), require password immediately
  if (sessionStorage.getItem(FLAG) === "1") {
    showPasswordOverlay({
      message: "Enter password to continue",
      onSuccess: () => sessionStorage.removeItem(FLAG),
    });
  }

  // Set the flag on any unload so the next load prompts
  window.addEventListener("beforeunload", (e) => {
    sessionStorage.setItem(FLAG, "1");
    e.preventDefault();
    e.returnValue = ""; // triggers native confirmation dialog
  });

  // Intercept keyboard-initiated refresh and prompt before reloading
  window.addEventListener("keydown", (e) => {
    const isRefresh =
      e.key === "F5" || (e.ctrlKey && (e.key === "r" || e.key === "R"));
    if (!isRefresh) return;
    e.preventDefault();
    showPasswordOverlay({
      message: "Enter password to refresh the page.",
      onSuccess: () => {
        sessionStorage.removeItem(FLAG); // avoid double prompt after reload
        window.location.reload();
      },
    });
  });

  // Support Vite dev full-reload (so you’re covered during development, too)
  // Vite dev full-reload support (corrected)
if (import.meta && import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", () => {
    // Ensure the next page load prompts for password
    sessionStorage.setItem("__require_refresh_password__", "1");
  });
}
})();