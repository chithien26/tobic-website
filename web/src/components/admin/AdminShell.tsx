"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { clearSession, isAdmin, useSession } from "@/lib/admin/session";

const nav = [
  { href: "/admin", label: "Tổng quan", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10", exact: true },
  { href: "/admin/services", label: "Dịch vụ", icon: "M4 5h16v4H4zM4 11h16v4H4zM4 17h10v2H4z" },
  { href: "/admin/posts", label: "Tin tức", icon: "M5 4h11l3 3v13H5zM8 9h8M8 13h8M8 17h5" },
  { href: "/admin/jobs", label: "Tuyển dụng", icon: "M4 8h16v11H4zM9 8V5h6v3" },
  { href: "/admin/media", label: "Thư viện ảnh", icon: "M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01" },
  { href: "/admin/settings", label: "Thông tin công ty", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-2V4h-6v2L7 8 5 7l-2 4 2 1v2l-2 1 2 4 2-1 2 2v2h6v-2l2-2 2 1 2-4-2-1z", adminOnly: true },
  { href: "/admin/users", label: "Tài khoản", icon: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 19v-1a3 3 0 0 0-2-2.8M17 5.2a3 3 0 0 1 0 5.6", adminOnly: true },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const onLogin = pathname === "/admin/login";

  useEffect(() => {
    if (session === null && !onLogin) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [session, onLogin, pathname, router]);

  if (onLogin) return <>{children}</>;
  if (!session) {
    return <div className="grid min-h-screen place-items-center text-slate-500">Đang tải…</div>;
  }

  const items = nav.filter((n) => !n.adminOnly || isAdmin(session));
  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[250px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[250px] flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:flex lg:translate-x-0 ${
          menuOpen ? "flex translate-x-0" : "hidden -translate-x-full lg:flex"
        }`}
      >
        <Link href="/admin" className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.webp" alt="TOBIC" className="h-8 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</span>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                active(item.href, item.exact) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4 text-sm">
          <p className="font-semibold text-slate-800">{session.user.displayName}</p>
          <p className="truncate text-slate-500">{session.user.email}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/admin/account" className="font-medium text-brand-600 hover:underline">
              Đổi mật khẩu
            </Link>
            <button
              type="button"
              className="font-medium text-rose-600 hover:underline"
              onClick={() => {
                clearSession();
                router.replace("/admin/login");
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button type="button" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <span />
          <a href="/vi" target="_blank" rel="noopener" className="text-sm font-semibold text-brand-600 hover:text-brand-800">
            Xem website ↗
          </a>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
