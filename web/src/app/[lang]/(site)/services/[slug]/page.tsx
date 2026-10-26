import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink, Gallery, RichText } from "@/components/site/ui";
import { getService, getServices, staticSlugs } from "@/lib/api";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { mediaUrl, pick } from "@/lib/media";

export function generateStaticParams() {
  return staticSlugs(getServices);
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const service = await getService(slug);
  if (!service) return {};
  const t = pick(service.translations, lang);
  return {
    title: t?.title,
    description: t?.summary,
    openGraph: service.coverImageUrl ? { images: [mediaUrl(service.coverImageUrl)] } : undefined,
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, service, all] = await Promise.all([getDictionary(lang), getService(slug), getServices()]);
  if (!service) notFound();

  const t = pick(service.translations, lang);
  const others = all.filter((s) => s.id !== service.id).slice(0, 8);

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0 rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <BackLink href={localePath(lang, "/services")} label={dict.common.allServices} />
          <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{t?.title}</h1>
          {t?.summary && <p className="mt-4 text-lg text-slate-600">{t.summary}</p>}
          {service.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(service.coverImageUrl)} alt={t?.title ?? ""} className="mt-8 w-full rounded-xl shadow-md" />
          )}
          {t?.body && <RichText html={t.body} className="mt-8" />}
          {service.gallery.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold text-brand-700">{dict.common.gallery}</h2>
              <Gallery items={service.gallery} title={t?.title ?? ""} />
            </div>
          )}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 p-6 text-white shadow-lg">
            <p className="font-semibold">{dict.home.ctaTitle}</p>
            <Link href={localePath(lang, "/contact")} className="btn mt-4 w-full bg-white text-brand-700 hover:bg-brand-50">
              {dict.common.contactUs}
            </Link>
          </div>
          {others.length > 0 && (
            <nav className="rounded-2xl border border-brand-100 bg-white p-5">
              <p className="font-semibold text-brand-800">{dict.common.otherServices}</p>
              <ul className="mt-3 space-y-1">
                {others.map((s) => (
                  <li key={s.id}>
                    <Link href={localePath(lang, `/services/${s.slug}`)} className="block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700">
                      {pick(s.translations, lang)?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
    </div>
  );
}
