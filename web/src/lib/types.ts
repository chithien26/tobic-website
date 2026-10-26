import type { Locale } from "./i18n";

export type MediaItem = { type: "image" | "video" | "youtube"; url: string; caption?: string | null };

type BaseTranslation = { lang: Locale; title: string };

export type ServiceTranslation = BaseTranslation & { summary: string; body: string };
export type PostTranslation = BaseTranslation & { excerpt: string; body: string };
export type JobTranslation = BaseTranslation & { location: string; employmentType: string; salary: string; body: string };

type ContentBase<T> = {
  id: string;
  slug: string;
  sortOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
  coverImageUrl: string | null;
  translations: T[];
  createdAt: string;
  updatedAt: string;
};

export type Service = ContentBase<ServiceTranslation> & { gallery: MediaItem[] };
export type Post = ContentBase<PostTranslation> & { gallery: MediaItem[] };
export type Job = ContentBase<JobTranslation> & { deadline: string | null };

export type SiteSettingsTranslation = { lang: Locale; address: string; officeNote: string };

export type SiteSettings = {
  companyName: string;
  legalName: string;
  taxCode: string;
  email: string;
  phone: string;
  ceoName: string;
  established: string;
  mapEmbedUrl: string;
  introVideoUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  translations: SiteSettingsTranslation[];
};

export type MediaFile = { id: string; fileName: string; url: string; contentType: string; size: number; createdAt: string };

export type UserInfo = { id: string; email: string; displayName: string; roles: string[] };
