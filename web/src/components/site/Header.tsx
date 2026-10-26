import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavLinks } from "./NavLinks";

export function navItems(lang: Locale, dict: Dictionary) {
  return [
    { href: localePath(lang, "/"), label: dict.nav.home, exact: true },
    { href: localePath(lang, "/about"), label: dict.nav.about },
    { href: localePath(lang, "/services"), label: dict.nav.services },
    { href: localePath(lang, "/news"), label: dict.nav.news },
    { href: localePath(lang, "/careers"), label: dict.nav.careers },
    { href: localePath(lang, "/contact"), label: dict.nav.contact },
  ];
}

export function Header({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-brand-100/70 bg-white/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href={localePath(lang, "/")} className="shrink-0" aria-label="TOBIC">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.webp" alt="TOBIC" width={140} height={40} className="h-9 w-auto" />
        </Link>
        <NavLinks items={navItems(lang, dict)} menuLabel={dict.common.menu}>
          <LanguageSwitcher lang={lang} label={dict.common.language} />
        </NavLinks>
      </div>
    </header>
  );
}
