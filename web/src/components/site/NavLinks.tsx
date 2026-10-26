"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

type Item = { href: string; label: string; exact?: boolean };

export function NavLinks({ items, menuLabel, children }: { items: Item[]; menuLabel: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (item: Item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <>
      <nav className="hidden items-center gap-1 lg:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              isActive(item) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-brand-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        {children}
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md text-brand-700 hover:bg-brand-50 lg:hidden"
          aria-label={menuLabel}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="absolute inset-x-0 top-16 border-b border-brand-100 bg-white shadow-lg lg:hidden">
          <ul className="container-page flex flex-col py-3">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-3 font-semibold ${isActive(item) ? "bg-brand-50 text-brand-700" : "text-slate-700"}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
