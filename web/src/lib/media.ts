import type { Locale } from "./i18n";

export const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080").replace(/\/$/, "");

/** Resolves an uploaded file path ("/uploads/...") to an absolute URL on the API host. */
export function mediaUrl(url: string | null | undefined) {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `${PUBLIC_API_URL}${url}`;
}

/** Makes relative upload URLs inside rich-text HTML absolute. */
export function absolutizeHtml(html: string) {
  return html.replace(/(src|href)="(\/uploads\/[^"]+)"/g, (_, attr, path) => `${attr}="${PUBLIC_API_URL}${path}"`);
}

/** Inverse of absolutizeHtml, so stored HTML does not depend on the API host. */
export function relativizeHtml(html: string) {
  return html.split(`${PUBLIC_API_URL}/uploads/`).join("/uploads/");
}

export function youtubeEmbedUrl(url: string) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

/** Picks the translation for a locale, falling back to Vietnamese, then to the first available one. */
export function pick<T extends { lang: Locale }>(translations: T[], locale: Locale): T | undefined {
  return translations.find((t) => t.lang === locale && hasText(t)) ?? translations.find((t) => t.lang === "vi") ?? translations[0];
}

function hasText(t: object) {
  return "title" in t ? Boolean((t as { title: string }).title?.trim()) : true;
}
