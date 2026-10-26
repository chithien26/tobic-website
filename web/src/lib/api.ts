import { cacheLife, cacheTag } from "next/cache";
import type { Job, Post, Service, SiteSettings } from "./types";

const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080").replace(/\/$/, "");

export const contentTags = ["services", "posts", "jobs", "settings"] as const;
export type ContentTag = (typeof contentTags)[number];

/**
 * Cached GET against the public API. Content is refreshed on demand by the API's
 * revalidate webhook; when the API is unreachable (e.g. during a Docker image build)
 * the fallback is cached for about a minute so real content appears soon after it is up.
 * A shorter cache life would make these pages dynamic and break prerendering.
 */
async function getJson<T>(path: string, tag: ContentTag, fallback: T): Promise<T> {
  "use cache";
  cacheTag(tag);

  try {
    const res = await fetch(`${API_URL}${path}`);
    if (res.status === 404) {
      cacheLife("hours");
      return fallback;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    cacheLife("hours");
    return (await res.json()) as T;
  } catch (error) {
    console.error(`[api] GET ${path} failed:`, error instanceof Error ? error.message : error);
    cacheLife("minutes");
    return fallback;
  }
}

export const getServices = () => getJson<Service[]>("/api/services", "services", []);
export const getService = (slug: string) => getJson<Service | null>(`/api/services/${encodeURIComponent(slug)}`, "services", null);

export const getPosts = () => getJson<Post[]>("/api/posts", "posts", []);
export const getPost = (slug: string) => getJson<Post | null>(`/api/posts/${encodeURIComponent(slug)}`, "posts", null);

export const getJobs = () => getJson<Job[]>("/api/jobs", "jobs", []);
export const getJob = (slug: string) => getJson<Job | null>(`/api/jobs/${encodeURIComponent(slug)}`, "jobs", null);

const emptySettings: SiteSettings = {
  companyName: "TOBIC Co., Ltd.",
  legalName: "",
  taxCode: "",
  email: "contact@tobic.com.vn",
  phone: "",
  ceoName: "",
  established: "",
  mapEmbedUrl: "",
  introVideoUrl: "",
  facebookUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  translations: [],
};

export const getSettings = () => getJson<SiteSettings>("/api/settings", "settings", emptySettings);

/** Slugs to prerender at build time; Cache Components needs at least one entry. */
export async function staticSlugs(load: () => Promise<{ slug: string }[]>) {
  const items = await load();
  return items.length ? items.map((i) => ({ slug: i.slug })) : [{ slug: "_" }];
}
