import Link from "next/link";
import { cacheLife } from "next/cache";
import { getSettings } from "@/lib/api";
import type { Dictionary, Locale } from "@/lib/i18n";
import { pick } from "@/lib/media";
import { navItems } from "./Header";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const settings = await getSettings();
  const t = pick(settings.translations, lang);
  const socials = [
    { href: settings.facebookUrl, label: "Facebook", path: "M14 9h3V5h-3c-2.8 0-4 1.7-4 4.3V11H7v4h3v9h4v-9h3l1-4h-4V9.5c0-.3.2-.5.5-.5Z" },
    { href: settings.linkedinUrl, label: "LinkedIn", path: "M5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21h-4V9Z" },
    { href: settings.youtubeUrl, label: "YouTube", path: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8ZM9.8 15V9l5.7 3-5.7 3Z" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-20 border-t border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-50">
      <div className="container-page grid gap-10 py-12 md:grid-cols-12">
        <div className="md:col-span-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.webp" alt="TOBIC" width={160} height={46} className="h-11 w-auto" />
          <p className="mt-4 text-lg font-bold text-slate-900">{settings.companyName}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
            {t?.address && (
              <li>
                <span className="font-medium text-slate-800">{dict.contact.address}:</span> {t.address}
              </li>
            )}
            {settings.phone && (
              <li>
                <span className="font-medium text-slate-800">{dict.contact.phone}:</span>{" "}
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <span className="font-medium text-slate-800">{dict.contact.mail}:</span>{" "}
                <a href={`mailto:${settings.email}`} className="hover:text-brand-700">
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-800">{dict.footer.links}</p>
          <ul className="mt-3 space-y-2 text-sm">
            {navItems(lang, dict).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-medium text-brand-600 hover:text-brand-800">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-800">{dict.footer.company}</p>
          {settings.taxCode && (
            <p className="mt-3 text-sm text-slate-600">
              {dict.common.taxCode}: <span className="font-medium text-slate-800">{settings.taxCode}</span>
            </p>
          )}
          {socials.length > 0 && (
            <div className="mt-4 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex size-9 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-brand-100 py-5 text-center text-sm text-slate-500">
        © {await currentYear()} <span className="font-semibold text-brand-600">TOBIC</span>. {dict.common.rights}
      </div>
    </footer>
  );
}
