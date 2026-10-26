import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, SectionHeading } from "@/components/site/ui";
import { getSettings } from "@/lib/api";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { pick } from "@/lib/media";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.about, description: dict.about.reason };
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, settings] = await Promise.all([getDictionary(lang), getSettings()]);
  const a = dict.about;
  const t = pick(settings.translations, lang);

  const facts = [
    { label: a.companyName, value: settings.companyName },
    { label: a.location, value: [t?.officeNote, t?.address].filter(Boolean).join(" — ") },
    { label: a.established, value: settings.established },
    { label: a.ceo, value: settings.ceoName },
  ].filter((f) => f.value);

  return (
    <>
      <PageHero title={a.question} description={a.reason} />

      <section className="container-page -mt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/about-cover.webp" alt="TOBIC" className="aspect-[21/9] w-full rounded-2xl object-cover shadow-xl" />
      </section>

      <section className="container-page py-16">
        <SectionHeading title={a.title} />
        <div className="mx-auto mt-10 grid max-w-5xl items-center gap-10 rounded-2xl border border-brand-100 bg-white p-8 shadow-sm md:grid-cols-[240px_1fr]">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.webp" alt="TOBIC" className="mx-auto w-56" />
            <p className="mt-3 font-bold text-brand-600">トゥビック</p>
          </div>
          <dl className="divide-y divide-slate-100">
            {facts.map((f) => (
              <div key={f.label} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]">
                <dt className="text-slate-500">{f.label}</dt>
                <dd className="font-semibold text-brand-700">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-8 text-center">
          <Link href={localePath(lang, "/contact")} className="btn-primary px-8 py-3 text-base">
            {dict.nav.contact}
          </Link>
        </div>
      </section>

      <section className="bg-gradient-to-b from-brand-50 to-white py-16">
        <div className="container-page">
          <SectionHeading title={a.workTitle} description={a.workDesc} />
          <div className="mt-10 grid gap-6">
            {["about-company", "about-work-1", "about-work-2"].map((name) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={name} src={`/images/${name}.webp`} alt={a.workTitle} loading="lazy" className="w-full rounded-2xl shadow-md" />
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <SectionHeading title={a.teamTitle} description={a.teamDesc} />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={n}
              src={`/images/team-${n}.webp`}
              alt={a.teamTitle}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-md transition hover:scale-[1.01]"
            />
          ))}
        </div>
      </section>
    </>
  );
}
