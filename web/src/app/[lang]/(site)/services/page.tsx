import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/site/cards";
import { EmptyState, PageHero } from "@/components/site/ui";
import { getServices } from "@/lib/api";
import { getDictionary, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.services.title, description: dict.services.desc };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, services] = await Promise.all([getDictionary(lang), getServices()]);

  return (
    <>
      <PageHero title={dict.services.title} description={dict.services.desc} />
      <section className="container-page py-14">
        {services.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} lang={lang} dict={dict} />
            ))}
          </div>
        ) : (
          <EmptyState message={dict.common.unavailable} />
        )}
      </section>
    </>
  );
}
