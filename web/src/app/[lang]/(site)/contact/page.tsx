import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero, SectionHeading } from "@/components/site/ui";
import { getSettings } from "@/lib/api";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { pick } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.contact, description: dict.contact.desc1 };
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, settings] = await Promise.all([getDictionary(lang), getSettings()]);
  const c = dict.contact;
  const t = pick(settings.translations, lang);

  const cards = [
    settings.email && { label: c.mail, value: settings.email, href: `mailto:${settings.email}`, icon: "M3 6h18v12H3zM3 7l9 6 9-6" },
    settings.phone && { label: c.phone, value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}`, icon: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" },
    t?.address && { label: c.address, value: t.address, href: "#map", icon: "M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  ].filter(Boolean) as { label: string; value: string; href: string; icon: string }[];

  return (
    <>
      <PageHero title={c.title} description={c.desc1}>
        <p className="mt-2 text-slate-600">{c.desc2}</p>
      </PageHero>

      <section className="container-page py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </span>
              <h3 className="mt-5 text-xl font-semibold text-brand-700">{card.label}</h3>
              <p className="mt-2 text-slate-700">{card.value}</p>
            </a>
          ))}
        </div>
      </section>

      {settings.mapEmbedUrl && (
        <section id="map" className="container-page scroll-mt-24 pb-6">
          <SectionHeading title={c.location} description={c.locationDesc} />
          <div className="mt-10 overflow-hidden rounded-2xl shadow-lg">
            <iframe
              src={settings.mapEmbedUrl}
              title={c.location}
              className="h-[28rem] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      )}
    </>
  );
}
