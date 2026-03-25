import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/global.css";
import App from "./App.jsx";

const rootEl = document.getElementById("root");
if (!rootEl) {
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
}

const root = createRoot(document.getElementById("root"));
// Global runtime error handlers that write a visible message into the DOM (helps when DevTools isn't open)
function showRuntimeError(message) {
  try {
    const elId = "__secureshare_error_overlay";
    let overlay = document.getElementById(elId);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = elId;
      document.body.appendChild(overlay);
      overlay.style.position = "fixed";
      overlay.style.right = "12px";
      overlay.style.bottom = "12px";
      overlay.style.zIndex = 99999;
      overlay.style.maxWidth = "420px";
      overlay.style.background = "rgba(220,0,30,0.95)";
      overlay.style.color = "white";
      overlay.style.padding = "12px";
      overlay.style.borderRadius = "6px";
      overlay.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
      overlay.style.fontSize = '12px';
      overlay.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    }
    overlay.innerText = 'Runtime error: ' + message;
  } catch (e) {
    // ignore
  }
}

window.addEventListener('error', (ev) => {
  showRuntimeError(ev.error ? (ev.error.message || String(ev.error)) : ev.message || 'Unknown error');
});

window.addEventListener('unhandledrejection', (ev) => {
  showRuntimeError(ev.reason ? (ev.reason.message || String(ev.reason)) : String(ev.reason));
});
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


