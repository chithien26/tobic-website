import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/site/cards";
import { BackLink, Gallery, RichText } from "@/components/site/ui";
import { getPost, getPosts, staticSlugs } from "@/lib/api";
import { formatDate, getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { mediaUrl, pick } from "@/lib/media";

export function generateStaticParams() {
  return staticSlugs(getPosts);
}

export async function generateMetadata({ params }: PageProps<"/[lang]/news/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const post = await getPost(slug);
  if (!post) return {};
  const t = pick(post.translations, lang);
  return {
    title: t?.title,
    description: t?.excerpt,
    openGraph: { type: "article", publishedTime: post.publishedAt ?? undefined, images: post.coverImageUrl ? [mediaUrl(post.coverImageUrl)] : undefined },
  };
}

export default async function PostPage({ params }: PageProps<"/[lang]/news/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const [dict, post, all] = await Promise.all([getDictionary(lang), getPost(slug), getPosts()]);
  if (!post) notFound();

  const t = pick(post.translations, lang);
  const more = all.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <div className="bg-gradient-to-b from-brand-50 to-white">
      <article className="container-page max-w-4xl py-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <BackLink href={localePath(lang, "/news")} label={dict.nav.news} />
          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{t?.title}</h1>
          <p className="mt-3 text-sm text-slate-500">
            {dict.common.publishedOn} {formatDate(post.publishedAt, lang)}
          </p>
          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl(post.coverImageUrl)} alt={t?.title ?? ""} className="mt-8 w-full rounded-xl object-cover shadow-md" />
          )}
          {t?.body && <RichText html={t.body} className="mt-8 text-justify" />}
          {post.gallery.length > 0 && (
            <div className="mt-10">
              <Gallery items={post.gallery} title={t?.title ?? ""} />
            </div>
          )}
        </div>
      </article>

      {more.length > 0 && (
        <section className="container-page pb-6">
          <h2 className="text-2xl font-bold text-brand-700">{dict.common.latestNews}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {more.map((p) => (
              <PostCard key={p.id} post={p} lang={lang} dict={dict} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
