import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/site/cards";
import { EmptyState, PageHero, SectionHeading } from "@/components/site/ui";
import { getJobs, getSettings } from "@/lib/api";
import { getDictionary, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/careers">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.careers, description: dict.careers.invite };
}

export default async function CareersPage({ params }: PageProps<"/[lang]/careers">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, jobs, settings] = await Promise.all([getDictionary(lang), getJobs(), getSettings()]);

  return (
    <>
      <PageHero title={dict.careers.title} description={dict.careers.invite}>
        <p className="mt-2 text-slate-600">{dict.careers.invite2}</p>
        {settings.email && (
          <a href={`mailto:${settings.email}`} className="btn-primary mt-6 px-6 py-3 text-base">
            {dict.common.applyByEmail}: {settings.email}
          </a>
        )}
      </PageHero>
      <section className="container-page max-w-5xl py-14">
        <SectionHeading title={dict.common.openPositions} />
        <div className="mt-10 space-y-4">
          {jobs.length ? jobs.map((j) => <JobCard key={j.id} job={j} lang={lang} dict={dict} />) : <EmptyState message={dict.common.noJobs} />}
        </div>
      </section>
    </>
  );
}
