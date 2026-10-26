import Link from "next/link";
import { formatDate, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/media";
import type { Job, Post, Service } from "@/lib/types";
import { Cover } from "./ui";

export function ServiceCard({ service, lang, dict }: { service: Service; lang: Locale; dict: Dictionary }) {
  const t = pick(service.translations, lang);
  return (
    <Link
      href={localePath(lang, `/services/${service.slug}`)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Cover src={service.coverImageUrl} alt={t?.title ?? ""} className="aspect-[16/10] w-full transition group-hover:scale-[1.02]" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">{t?.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{t?.summary}</p>
        <span className="mt-4 text-sm font-semibold text-brand-600">{dict.common.readMore} →</span>
      </div>
    </Link>
  );
}

export function PostCard({ post, lang, dict }: { post: Post; lang: Locale; dict: Dictionary }) {
  const t = pick(post.translations, lang);
  return (
    <Link
      href={localePath(lang, `/news/${post.slug}`)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Cover src={post.coverImageUrl} alt={t?.title ?? ""} className="aspect-[16/9] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <span className="w-fit rounded bg-brand-500/90 px-3 py-1 text-xs font-semibold text-white">{formatDate(post.publishedAt, lang)}</span>
        <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{t?.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">{t?.excerpt}</p>
        <span className="mt-4 text-sm font-semibold text-brand-600">{dict.common.readMore} →</span>
      </div>
    </Link>
  );
}

export function JobCard({ job, lang, dict }: { job: Job; lang: Locale; dict: Dictionary }) {
  const t = pick(job.translations, lang);
  return (
    <Link
      href={localePath(lang, `/careers/${job.slug}`)}
      className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:items-center"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo.webp" alt="" className="h-12 w-auto shrink-0" />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-slate-900">{t?.title}</h3>
        <p className="mt-1 text-sm text-slate-600">
          {[t?.location, t?.employmentType].filter(Boolean).join(" · ")}
          {t?.salary && <span className="font-semibold text-rose-600"> · {t.salary}</span>}
        </p>
      </div>
      <span className="text-sm text-slate-500">
        {job.deadline ? `${dict.common.deadline}: ${formatDate(job.deadline, lang)}` : formatDate(job.publishedAt, lang)}
      </span>
    </Link>
  );
}
