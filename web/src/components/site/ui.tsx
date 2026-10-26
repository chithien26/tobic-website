import Link from "next/link";
import type { ReactNode } from "react";
import { absolutizeHtml, mediaUrl, youtubeEmbedUrl } from "@/lib/media";
import type { MediaItem } from "@/lib/types";

export function PageHero({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-white">
      <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="container-page relative animate-fade-up py-16 text-center sm:py-20">
        <h1 className="heading-gradient text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-600">{description}</p>}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ title, description, align = "center" }: { title: string; description?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <h2 className="text-2xl font-bold text-brand-700 sm:text-3xl lg:text-4xl">{title}</h2>
      <div className={`divider-gradient mt-4 ${align === "center" ? "mx-auto" : ""}`} />
      {description && <p className="mt-4 text-lg text-slate-600">{description}</p>}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-800">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Link>
  );
}

/** Renders HTML that the API has already sanitized. */
export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return (
    <div
      className={`prose prose-slate max-w-none prose-headings:text-brand-800 prose-a:text-brand-600 prose-img:w-full prose-img:rounded-xl prose-img:shadow-md ${className}`}
      dangerouslySetInnerHTML={{ __html: absolutizeHtml(html) }}
    />
  );
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const youtube = youtubeEmbedUrl(url);
  if (youtube) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl bg-slate-900 shadow-lg">
        <iframe
          src={youtube}
          title={title}
          className="size-full"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return <video src={mediaUrl(url)} controls preload="metadata" playsInline className="aspect-video w-full rounded-xl bg-slate-900 shadow-lg" />;
}

export function Gallery({ items, title }: { items: MediaItem[]; title: string }) {
  if (!items.length) return null;
  const videos = items.filter((i) => i.type !== "image");
  const images = items.filter((i) => i.type === "image");

  return (
    <div className="space-y-6">
      {videos.map((v, i) => (
        <figure key={`v${i}`}>
          <VideoEmbed url={v.url} title={v.caption || title} />
          {v.caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{v.caption}</figcaption>}
        </figure>
      ))}
      {images.length > 0 && (
        <div className={`grid gap-4 ${images.length > 1 ? "sm:grid-cols-2" : ""}`}>
          {images.map((img, i) => (
            <figure key={`i${i}`} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
              <a href={mediaUrl(img.url)} target="_blank" rel="noopener">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(img.url)} alt={img.caption || title} loading="lazy" className="w-full object-cover transition hover:scale-[1.02]" />
              </a>
              {img.caption && <figcaption className="px-3 py-2 text-sm text-slate-500">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-10 text-center text-slate-600">{message}</p>;
}

export function Cover({ src, alt, className = "" }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.webp" alt="" className="w-1/2 opacity-40" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={mediaUrl(src)} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}
