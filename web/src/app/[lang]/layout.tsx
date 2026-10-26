import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyHashRedirect } from "@/components/site/LegacyHashRedirect";
import { beVietnam } from "@/lib/fonts";
import { getDictionary, hasLocale, htmlLang, locales } from "@/lib/i18n";
import "../globals.css";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `TOBIC | ${dict.home.intro}`, template: "%s | TOBIC" },
    description: dict.home.servicesDesc,
    openGraph: { siteName: "TOBIC", type: "website", locale: htmlLang[lang], images: ["/images/about-cover.webp"] },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html lang={htmlLang[lang]} className={beVietnam.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <LegacyHashRedirect lang={lang} />
        {children}
      </body>
    </html>
  );
}
