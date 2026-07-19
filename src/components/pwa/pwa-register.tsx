"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const shouldRegister =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!shouldRegister) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The PWA shell remains usable even if service worker registration fails.
    });
  }, []);

  return null;
}
