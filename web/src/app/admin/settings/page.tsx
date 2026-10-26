"use client";

import { useState, type FormEvent } from "react";
import { Card, Field, Notice, PageHeader, useApi } from "@/components/admin/ui";
import { api } from "@/lib/admin/session";
import { localeNames, locales } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";

const fields: { name: keyof SiteSettings; label: string; hint?: string; type?: string }[] = [
  { name: "companyName", label: "Tên công ty (hiển thị)" },
  { name: "legalName", label: "Tên pháp lý (trang QR)" },
  { name: "taxCode", label: "Mã số thuế" },
  { name: "email", label: "Email liên hệ", type: "email" },
  { name: "phone", label: "Số điện thoại" },
  { name: "ceoName", label: "Tổng giám đốc" },
  { name: "established", label: "Thành lập", hint: "Ví dụ: 04/2019" },
  { name: "introVideoUrl", label: "Video giới thiệu (trang chủ)", hint: "Link YouTube. Để trống để ẩn." },
  { name: "mapEmbedUrl", label: "Google Maps embed URL", hint: "Google Maps → Chia sẻ → Nhúng bản đồ → copy phần src" },
  { name: "facebookUrl", label: "Facebook" },
  { name: "linkedinUrl", label: "LinkedIn" },
  { name: "youtubeUrl", label: "Kênh YouTube" },
];

export default function SettingsPage() {
  const { data, setData, error, loading } = useApi<SiteSettings>("/api/settings");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  if (loading || !data) return error ? <Notice>{error}</Notice> : <p className="text-slate-500">Đang tải…</p>;

  const translation = (lang: (typeof locales)[number]) => data.translations.find((t) => t.lang === lang) ?? { lang, address: "", officeNote: "" };
  const setTranslation = (lang: (typeof locales)[number], patch: { address?: string; officeNote?: string }) =>
    setData({ ...data, translations: [...data.translations.filter((t) => t.lang !== lang), { ...translation(lang), ...patch }] });

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      setData(await api<SiteSettings>("/api/admin/settings", { method: "PUT", json: data }));
      setMessage({ kind: "success", text: "Đã lưu thông tin công ty." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Không lưu được" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Thông tin công ty"
        description="Hiển thị ở chân trang, trang Giới thiệu, Liên hệ và trang QR."
        actions={
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
        }
      />
      {message && (
        <div className="mb-4">
          <Notice kind={message.kind}>{message.text}</Notice>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={f.name === "mapEmbedUrl" || f.name === "introVideoUrl" ? "sm:col-span-2" : ""}>
              <Field label={f.label} hint={f.hint}>
                <input
                  className="input"
                  type={f.type ?? "text"}
                  value={(data[f.name] as string) ?? ""}
                  onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
                />
              </Field>
            </div>
          ))}
        </Card>
        <Card className="space-y-6">
          {locales.map((lang) => (
            <div key={lang} className="space-y-3">
              <h3 className="text-sm font-semibold text-brand-700">{localeNames[lang]}</h3>
              <Field label="Địa chỉ">
                <textarea className="input min-h-16" value={translation(lang).address} onChange={(e) => setTranslation(lang, { address: e.target.value })} />
              </Field>
              <Field label="Ghi chú văn phòng" hint="Ví dụ: Trụ sở tại Sài Gòn – Văn phòng tại Đà Nẵng">
                <input className="input" value={translation(lang).officeNote} onChange={(e) => setTranslation(lang, { officeNote: e.target.value })} />
              </Field>
            </div>
          ))}
        </Card>
      </div>
    </form>
  );
}
