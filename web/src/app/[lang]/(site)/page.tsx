import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard, ServiceCard } from "@/components/site/cards";
import { SectionHeading, VideoEmbed } from "@/components/site/ui";
import { getPosts, getServices, getSettings } from "@/lib/api";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";

const icons = [
  "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 0v18m8-13.5L12 12 4 7.5",
  "M9 3h6v4H9zM4 14h6v7H4zm10 0h6v7h-6zM12 7v4m-5 3v-3h10v3",
  "M4 20V10m6 10V4m6 16v-7m6 7V8",
];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, services, posts, settings] = await Promise.all([getDictionary(lang), getServices(), getPosts(), getSettings()]);
  const h = dict.home;

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('/images/home-bg.webp')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/40 via-white/70 to-white" />
        <div className="container-page animate-fade-up py-20 text-center sm:py-28">
          <p className="text-2xl font-bold text-slate-800 sm:text-4xl">{h.welcome}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.webp" alt="TOBIC" width={450} height={130} className="mx-auto my-8 w-64 sm:w-[420px]" />
          <p className="text-xl font-medium text-slate-700 sm:text-3xl">{h.intro}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href={localePath(lang, "/services")} className="btn-primary px-6 py-3 text-base">
              {dict.common.allServices}
            </Link>
            <Link href={localePath(lang, "/contact")} className="btn-outline px-6 py-3 text-base">
              {dict.common.contactUs}
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-brand-600 sm:text-3xl">{h.innovationTitle}</h2>
          <p className="mt-3 text-lg text-slate-600">{h.innovationDesc}</p>
          <FeatureList items={h.innovation} />
        </div>
        <div className="grid gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/feature-3d.webp" alt="" loading="lazy" className="rounded-xl shadow-lg" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/feature-hero.webp" alt="" loading="lazy" className="rounded-xl shadow-lg" />
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/feature-flow.webp" alt="" loading="lazy" className="order-last rounded-xl shadow-lg lg:order-first" />
        <div>
          <h2 className="text-2xl font-bold text-brand-600 sm:text-3xl">{h.dataTitle}</h2>
          <p className="mt-3 text-lg text-slate-600">{h.dataDesc}</p>
          <FeatureList items={h.data} />
        </div>
      </section>

      {services.length > 0 && (
        <section className="bg-gradient-to-b from-brand-50 to-white py-16">
          <div className="container-page">
            <SectionHeading title={h.servicesTitle} description={h.servicesDesc} />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((s) => (
                <ServiceCard key={s.id} service={s} lang={lang} dict={dict} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href={localePath(lang, "/services")} className="btn-outline">
                {dict.common.viewAll} ({services.length})
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="container-page space-y-10 py-16">
        {settings.introVideoUrl && (
          <div className="space-y-6">
            <SectionHeading title={h.overviewTitle} />
            <div className="mx-auto max-w-5xl">
              <VideoEmbed url={settings.introVideoUrl} title={h.overviewTitle} />
            </div>
          </div>
        )}
        <div className="space-y-6">
          <SectionHeading title={h.mindsetTitle} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/five-mindsets.webp" alt={h.mindsetTitle} loading="lazy" className="mx-auto w-full max-w-5xl rounded-xl shadow-md" />
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading title={dict.common.latestNews} />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <PostCard key={p.id} post={p} lang={lang} dict={dict} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-14 text-center text-white shadow-xl sm:px-12">
          <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-2xl font-bold sm:text-3xl">{h.ctaTitle}</h2>
          <p className="relative mx-auto mt-4 max-w-2xl text-brand-50">{h.ctaDesc}</p>
          <Link href={localePath(lang, "/contact")} className="btn relative mt-8 bg-white px-6 py-3 text-base text-brand-700 hover:bg-brand-50">
            {h.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}

function FeatureList({ items }: { items: { title: string; desc: string }[] }) {
  return (
    <ul className="mt-8 space-y-6">
      {items.map((item, i) => (
        <li key={item.title} className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
              <path d={icons[i % icons.length]} />
            </svg>
          </span>
          <div>
            <h3 className="font-semibold text-brand-800">{item.title}</h3>
            <p className="mt-1 text-slate-600">{item.desc}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
