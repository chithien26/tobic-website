import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { beVietnam } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Quản trị | TOBIC", template: "%s | Quản trị TOBIC" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body className="min-h-screen bg-slate-50 font-sans">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
