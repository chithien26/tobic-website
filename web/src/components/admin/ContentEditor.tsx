"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { slugify, type ContentKind } from "@/lib/admin/content-kinds";
import { api } from "@/lib/admin/session";
import { localeNames, locales, type Locale } from "@/lib/i18n";
import type { MediaItem } from "@/lib/types";
import { GalleryEditor } from "./GalleryEditor";
import { ImageField } from "./MediaPicker";
import { RichTextEditor } from "./RichTextEditor";
import { Card, Field, Notice, PageHeader } from "./ui";

type Translation = { lang: Locale; title: string } & Record<string, string>;

type Draft = {
  id?: string;
  slug: string;
  sortOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
  coverImageUrl: string | null;
  gallery?: MediaItem[];
  deadline?: string | null;
  translations: Translation[];
};

const emptyTranslation = (kind: ContentKind, lang: Locale): Translation =>
  ({ lang, ...Object.fromEntries(kind.fields.map((f) => [f.name, ""])) }) as Translation;

function withAllLocales(kind: ContentKind, translations: Translation[]) {
  return locales.map((lang) => ({ ...emptyTranslation(kind, lang), ...translations.find((t) => t.lang === lang) }));
}

const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function ContentEditor({ kind }: { kind: ContentKind }) {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const [draft, setDraft] = useState<Draft | null>(id ? null : { slug: "", sortOrder: 0, isPublished: false, publishedAt: null, coverImageUrl: null, gallery: [], deadline: null, translations: withAllLocales(kind, []) });
  const [lang, setLang] = useState<Locale>("vi");
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<Draft>(`/api/admin/${kind.key}/${id}`)
      .then((d) => setDraft({ ...d, translations: withAllLocales(kind, d.translations) }))
      .catch((e: Error) => setError(e.message));
  }, [id, kind]);

  if (!draft) {
    return error ? <Notice>{error}</Notice> : <p className="text-slate-500">Đang tải…</p>;
  }

  const update = (patch: Partial<Draft>) => {
    setSaved(false);
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const updateTranslation = (field: string, value: string) => {
    setSaved(false);
    setDraft((d) => {
      if (!d) return d;
      const translations = d.translations.map((t) => (t.lang === lang ? { ...t, [field]: value } : t));
      const autoSlug = !slugTouched && lang === "vi" && field === "title" ? slugify(value) : d.slug;
      return { ...d, translations, slug: autoSlug };
    });
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { ...draft, translations: draft!.translations.filter((t) => t.title.trim()) };
      const result = id
        ? await api<Draft>(`/api/admin/${kind.key}/${id}`, { method: "PUT", json: body })
        : await api<Draft>(`/api/admin/${kind.key}`, { method: "POST", json: body });
      setDraft({ ...result, translations: withAllLocales(kind, result.translations) });
      setSaved(true);
      if (!id) router.replace(`/admin/${kind.key}/edit?id=${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được");
    } finally {
      setSaving(false);
    }
  }

  const current = draft.translations.find((t) => t.lang === lang)!;
  const viTitle = draft.translations.find((t) => t.lang === "vi")?.title;

  return (
    <form onSubmit={save}>
      <PageHeader
        title={id ? `Sửa ${kind.singular}` : `Thêm ${kind.singular}`}
        description={viTitle || undefined}
        actions={
          <>
            <Link href={`/admin/${kind.key}`} className="btn-outline">
              ← Danh sách
            </Link>
            {id && draft.isPublished && (
              <a href={`/vi${kind.publicPath}/${draft.slug}`} target="_blank" rel="noopener" className="btn-outline">
                Xem trên website ↗
              </a>
            )}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
          </>
        }
      />

      <div className="mb-4 space-y-2">
        {error && <Notice>{error}</Notice>}
        {saved && <Notice kind="success">Đã lưu. Website sẽ cập nhật sau vài giây.</Notice>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card>
            <div className="mb-5 flex flex-wrap gap-1 border-b border-slate-100">
              {locales.map((l) => {
                const filled = draft.translations.find((t) => t.lang === l)?.title.trim();
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
                      lang === l ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {localeNames[l]}
                    {l === "vi" && <span className="text-rose-500"> *</span>}
                    {l !== "vi" && !filled && <span className="ml-1 text-xs font-normal text-slate-400">(chưa dịch)</span>}
                  </button>
                );
              })}
            </div>
            {lang !== "vi" && (
              <p className="mb-4 text-xs text-slate-500">Bỏ trống tiêu đề nếu chưa có bản dịch — website sẽ hiển thị bản tiếng Việt cho ngôn ngữ này.</p>
            )}
            <div className="space-y-5" key={lang}>
              {kind.fields.map((f) => (
                <Field key={f.name} label={f.label}>
                  {f.type === "text" && (
                    <input
                      className="input"
                      value={current[f.name] ?? ""}
                      placeholder={f.placeholder}
                      required={lang === "vi" && f.name === "title"}
                      onChange={(e) => updateTranslation(f.name, e.target.value)}
                    />
                  )}
                  {f.type === "textarea" && (
                    <textarea className="input min-h-24" value={current[f.name] ?? ""} onChange={(e) => updateTranslation(f.name, e.target.value)} />
                  )}
                  {f.type === "richtext" && <RichTextEditor value={current[f.name] ?? ""} onChange={(html) => updateTranslation(f.name, html)} />}
                </Field>
              ))}
            </div>
          </Card>

          {kind.gallery && (
            <Card>
              <h2 className="mb-1 font-semibold text-slate-900">Thư viện ảnh & video</h2>
              <p className="mb-4 text-sm text-slate-500">Hiển thị bên dưới nội dung. Video dài nên đăng YouTube rồi dán link.</p>
              <GalleryEditor items={draft.gallery ?? []} onChange={(gallery) => update({ gallery })} />
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="space-y-5">
            <label className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold text-slate-800">Hiển thị trên website</span>
                <span className="text-xs text-slate-500">Tắt để lưu dạng bản nháp</span>
              </span>
              <input type="checkbox" className="size-5 accent-brand-600" checked={draft.isPublished} onChange={(e) => update({ isPublished: e.target.checked })} />
            </label>

            <Field label="Đường dẫn (slug)" hint={`Website: /vi${kind.publicPath}/${draft.slug || "…"}`}>
              <input
                className="input font-mono"
                value={draft.slug}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                title="Chữ thường không dấu, số và dấu gạch ngang"
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: e.target.value });
                }}
              />
            </Field>

            <Field label="Ngày đăng" hint="Để trống: tự lấy thời điểm xuất bản">
              <input
                type="datetime-local"
                className="input"
                value={toLocalInput(draft.publishedAt)}
                onChange={(e) => update({ publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              />
            </Field>

            {kind.deadline && (
              <Field label="Hạn nộp hồ sơ">
                <input type="date" className="input" value={draft.deadline ?? ""} onChange={(e) => update({ deadline: e.target.value || null })} />
              </Field>
            )}

            <Field label="Thứ tự hiển thị" hint="Số nhỏ hiển thị trước">
              <input type="number" className="input" value={draft.sortOrder} onChange={(e) => update({ sortOrder: Number(e.target.value) || 0 })} />
            </Field>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Ảnh đại diện</h2>
            <ImageField value={draft.coverImageUrl} onChange={(coverImageUrl) => update({ coverImageUrl })} />
          </Card>
        </div>
      </div>
    </form>
  );
}
