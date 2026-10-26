import type { MetadataRoute } from "next";
import { getJobs, getPosts, getServices } from "@/lib/api";
import { htmlLang, locales } from "@/lib/i18n";

const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, posts, jobs] = await Promise.all([getServices(), getPosts(), getJobs()]);
  const paths = [
    "",
    "/about",
    "/services",
    "/news",
    "/careers",
    "/contact",
    ...services.map((s) => `/services/${s.slug}`),
    ...posts.map((p) => `/news/${p.slug}`),
    ...jobs.map((j) => `/careers/${j.slug}`),
  ];

  return paths.map((path) => ({
    url: `${siteUrl}/vi${path}`,
    alternates: { languages: Object.fromEntries(locales.map((l) => [htmlLang[l], `${siteUrl}/${l}${path}`])) },
  }));
}
