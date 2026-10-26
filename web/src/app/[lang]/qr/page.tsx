import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/api";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { pick } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/[lang]/qr">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.contact, robots: { index: false } };
}

export default async function QrPage({ params }: PageProps<"/[lang]/qr">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, settings] = await Promise.all([getDictionary(lang), getSettings()]);
  const t = pick(settings.translations, lang);

  const rows = [
    { label: dict.common.taxCode, value: settings.taxCode, icon: "M7 3h10v18l-5-3-5 3zM10 8h4M10 12h4" },
    { label: dict.contact.address, value: t?.address, icon: "M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
    { label: dict.contact.mail, value: settings.email, href: `mailto:${settings.email}`, icon: "M3 6h18v12H3zM3 7l9 6 9-6" },
    { label: dict.contact.phone, value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}`, icon: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" },
  ].filter((r) => r.value);

  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-4 py-8">
      <div className="w-full max-w-md animate-fade-up overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="px-6 pb-5 pt-7 text-center">
          <div className="mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-4 ring-brand-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-round.webp" alt="TOBIC" className="size-full object-contain p-2" />
          </div>
          <p className="mt-4 text-lg font-semibold leading-snug text-slate-900">{settings.legalName || settings.companyName}</p>
          {dict.common.qrNote && <p className="mt-1 text-xs italic text-slate-500">{dict.common.qrNote}</p>}
        </div>
        <ul className="space-y-3 px-5 pb-6">
          {rows.map((r) => {
            const content = (
              <>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
                    <path d={r.icon} />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-slate-500">{r.label}</span>
                  <span className="mt-0.5 block break-words text-[15px] text-slate-800">{r.value}</span>
                </span>
              </>
            );
            return (
              <li key={r.label}>
                {r.href ? (
                  <a href={r.href} className="flex gap-3 rounded-xl border border-slate-200 p-4 shadow-sm hover:border-brand-300">
                    {content}
                  </a>
                ) : (
                  <div className="flex gap-3 rounded-xl border border-slate-200 p-4 shadow-sm">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="border-t border-slate-100 py-4 text-center">
          <Link href={localePath(lang, "/")} className="text-sm font-semibold text-brand-600 hover:text-brand-800">
            tobic.com.vn →
          </Link>
        </div>
      </div>
    </main>
  );
}
