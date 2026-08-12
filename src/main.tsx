import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  const registerServiceWorker = () => {
    navigator.serviceWorker
      .register("./firebase-messaging-sw.js")
      .then((registration) => {
        console.log("Service worker registered:", registration.scope);
      })
      .catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(registerServiceWorker, { timeout: 2500 });
  } else {
    window.setTimeout(registerServiceWorker, 1200);
  }
}
