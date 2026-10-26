import type { Metadata } from "next";
import Link from "next/link";
import { beVietnam } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = { title: "404 | TOBIC" };

export default function GlobalNotFound() {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body className="grid min-h-screen place-items-center font-sans">
        <div className="text-center">
          <p className="heading-gradient text-7xl font-bold">404</p>
          <p className="mt-4 text-slate-600">Không tìm thấy trang · Page not found</p>
          <Link href="/" className="btn-primary mt-8">
            TOBIC
          </Link>
        </div>
      </body>
    </html>
  );
}
