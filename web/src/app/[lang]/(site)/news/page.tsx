import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/cards";
import { EmptyState, PageHero } from "@/components/site/ui";
import { getPosts } from "@/lib/api";
import { getDictionary, hasLocale } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/news">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.nav.news, description: dict.news.intro };
}

export default async function NewsPage({ params }: PageProps<"/[lang]/news">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, posts] = await Promise.all([getDictionary(lang), getPosts()]);

  return (
    <>
      <PageHero title={dict.news.title} description={dict.news.intro} />
      <section className="container-page py-14">
        {posts.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} lang={lang} dict={dict} />
            ))}
          </div>
        ) : (
          <EmptyState message={dict.common.noPosts} />
        )}
      </section>
    </>
  );
}
