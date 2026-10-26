import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BackLink, RichText } from "@/components/site/ui";
import { getJob, getJobs, getSettings, staticSlugs } from "@/lib/api";
import { formatDate, getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { pick } from "@/lib/media";

export function generateStaticParams() {
  return staticSlugs(getJobs);
}

export async function generateMetadata({ params }: PageProps<"/[lang]/careers/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const job = await getJob(slug);
  const t = job && pick(job.translations, lang);
  return t ? { title: t.title, description: [t.location, t.employmentType, t.salary].filter(Boolean).join(" · ") } : {};
}

export default async function JobPage({ params }: PageProps<"/[lang]/careers/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, job, settings] = await Promise.all([getDictionary(lang), getJob(slug), getSettings()]);
  if (!job) notFound();

  const t = pick(job.translations, lang);
  const facts = [
    { label: dict.common.location, value: t?.location },
    { label: dict.common.employmentType, value: t?.employmentType },
    { label: dict.common.salary, value: t?.salary },
    { label: dict.common.deadline, value: formatDate(job.deadline, lang) },
  ].filter((f) => f.value);
  const subject = encodeURIComponent(`[TOBIC] ${t?.title ?? ""}`);

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      <article className="container-page max-w-4xl py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <BackLink href={localePath(lang, "/careers")} label={dict.nav.careers} />
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{t?.title}</h1>
          <dl className="mt-6 grid gap-3 rounded-xl bg-brand-50 p-5 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{f.label}</dt>
                <dd className="mt-0.5 font-semibold text-brand-800">{f.value}</dd>
              </div>
            ))}
          </dl>
          {t?.body && <RichText html={t.body} className="mt-8" />}
          {settings.email && (
            <a href={`mailto:${settings.email}?subject=${subject}`} className="btn-primary mt-10 px-6 py-3 text-base">
              {dict.common.applyByEmail}
            </a>
          )}
        </div>
      </article>
    </div>
  );
}
