import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <Header lang={lang} dict={dict} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
