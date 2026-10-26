"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The old site used HashRouter (e.g. tobic.com.vn/#/qr_info), and printed QR codes still point there.
const legacyRoutes: Record<string, string> = {
  "/": "",
  "/about": "/about",
  "/services": "/services",
  "/blogs": "/news",
  "/blogs/1": "/news/tobic-ar-vr-tai-iuh-2025",
  "/blogs/2": "/news/sinh-vien-bach-khoa-tham-quan-tobic",
  "/jobs": "/careers",
  "/contact": "/contact",
  "/qr_info": "/qr",
};

export function LegacyHashRedirect({ lang }: { lang: string }) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#/")) return;

    const path = hash.slice(1).split("?")[0].replace(/\/$/, "") || "/";
    const target = legacyRoutes[path] ?? (path.startsWith("/services/") ? "/services" : path.startsWith("/jobs/") ? "/careers" : null);
    if (target !== null) router.replace(`/${lang}${target}`);
  }, [lang, router]);

  return null;
}
