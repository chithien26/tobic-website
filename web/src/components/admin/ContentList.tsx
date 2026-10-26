"use client";

import Link from "next/link";
import { useState } from "react";
import type { ContentKind } from "@/lib/admin/content-kinds";
import { api } from "@/lib/admin/session";
import { mediaUrl } from "@/lib/media";
import type { Job, Post, Service } from "@/lib/types";
import { Notice, PageHeader, StatusBadge, formatDateTime, useApi } from "./ui";

type Item = Service | Post | Job;

export function ContentList({ kind }: { kind: ContentKind }) {
  const { data, setData, error, loading } = useApi<Item[]>(`/api/admin/${kind.key}`);
  const [query, setQuery] = useState("");
  const [actionError, setActionError] = useState("");

  const title = (item: Item) => item.translations.find((t) => t.lang === "vi")?.title ?? item.slug;
  const items = (data ?? []).filter((i) => `${title(i)} ${i.slug}`.toLowerCase().includes(query.toLowerCase()));

  async function togglePublish(item: Item) {
    setActionError("");
    try {
      const updated = await api<Item>(`/api/admin/${kind.key}/${item.id}`, { method: "PUT", json: { ...item, isPublished: !item.isPublished } });
      setData((prev) => prev?.map((i) => (i.id === item.id ? updated : i)));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Không cập nhật được");
    }
  }

  async function remove(item: Item) {
    if (!window.confirm(`Xoá ${kind.singular} "${title(item)}"? Không thể hoàn tác.`)) return;
    setActionError("");
    try {
      await api(`/api/admin/${kind.key}/${item.id}`, { method: "DELETE" });
      setData((prev) => prev?.filter((i) => i.id !== item.id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Không xoá được");
    }
  }

  return (
    <>
      <PageHeader
        title={kind.label}
        description={`${data?.length ?? 0} ${kind.singular} · ${data?.filter((i) => i.isPublished).length ?? 0} đang hiển thị trên website`}
        actions={
          <Link href={`/admin/${kind.key}/edit`} className="btn-primary">
            + Thêm {kind.singular}
          </Link>
        }
      />
      <div className="mb-4">
        <input className="input max-w-sm" placeholder="Tìm kiếm…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {(error || actionError) && (
        <div className="mb-4">
          <Notice>{error || actionError}</Notice>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Ngôn ngữ</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Cập nhật</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Chưa có {kind.singular} nào.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(item.coverImageUrl)} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-16 shrink-0 rounded bg-slate-100" />
                    )}
                    <div className="min-w-0">
                      <Link href={`/admin/${kind.key}/edit?id=${item.id}`} className="font-semibold text-slate-900 hover:text-brand-700">
                        {title(item)}
                      </Link>
                      <p className="truncate text-xs text-slate-400">/{item.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(["vi", "en", "ja"] as const).map((l) => {
                      const has = item.translations.some((t) => t.lang === l && t.title.trim());
                      return (
                        <span
                          key={l}
                          title={has ? "Đã có bản dịch" : "Chưa dịch (website sẽ hiện tiếng Việt)"}
                          className={`rounded px-1.5 py-0.5 text-[11px] font-bold uppercase ${has ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400 line-through"}`}
                        >
                          {l}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => togglePublish(item)} title="Bấm để đổi trạng thái">
                    <StatusBadge published={item.isPublished} />
                  </button>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDateTime(item.updatedAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {item.isPublished && (
                    <a href={`/vi${kind.publicPath}/${item.slug}`} target="_blank" rel="noopener" className="mr-3 font-medium text-slate-500 hover:text-brand-700">
                      Xem
                    </a>
                  )}
                  <Link href={`/admin/${kind.key}/edit?id=${item.id}`} className="mr-3 font-medium text-brand-600 hover:underline">
                    Sửa
                  </Link>
                  <button type="button" onClick={() => remove(item)} className="font-medium text-rose-600 hover:underline">
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
