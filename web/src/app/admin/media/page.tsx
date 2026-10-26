"use client";

import { useState } from "react";
import { MediaThumb, UploadButton } from "@/components/admin/MediaPicker";
import { Notice, PageHeader, formatDateTime, formatSize, useApi } from "@/components/admin/ui";
import { api } from "@/lib/admin/session";
import { mediaUrl } from "@/lib/media";
import type { MediaFile } from "@/lib/types";

export default function MediaPage() {
  const { data, setData, error, loading } = useApi<MediaFile[]>("/api/admin/media");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState("");
  const [actionError, setActionError] = useState("");
  const files = (data ?? []).filter((f) => f.fileName.toLowerCase().includes(query.toLowerCase()));

  async function remove(file: MediaFile) {
    if (!window.confirm(`Xoá "${file.fileName}"? Những trang đang dùng file này sẽ bị mất ảnh.`)) return;
    try {
      await api(`/api/admin/media/${file.id}`, { method: "DELETE" });
      setData((prev) => prev?.filter((f) => f.id !== file.id));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Không xoá được");
    }
  }

  return (
    <>
      <PageHeader
        title="Thư viện ảnh & video"
        description="Ảnh nên dưới 2 MB (định dạng webp/jpg). Video dài nên đăng YouTube."
        actions={<UploadButton onUploaded={(uploaded) => setData((prev) => [...uploaded, ...(prev ?? [])])} />}
      />
      <input className="input mb-4 max-w-sm" placeholder="Tìm theo tên file…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {(error || actionError) && (
        <div className="mb-4">
          <Notice>{error || actionError}</Notice>
        </div>
      )}
      {loading && <p className="text-slate-500">Đang tải…</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {files.map((f) => (
          <div key={f.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <a href={mediaUrl(f.url)} target="_blank" rel="noopener" className="block aspect-square bg-slate-50">
              <MediaThumb file={f} />
            </a>
            <div className="space-y-1 p-3">
              <p className="truncate text-sm font-medium text-slate-800" title={f.fileName}>
                {f.fileName}
              </p>
              <p className="text-xs text-slate-400">
                {formatSize(f.size)} · {formatDateTime(f.createdAt)}
              </p>
              <div className="flex gap-3 pt-1 text-xs font-medium">
                <button
                  type="button"
                  className="text-brand-600 hover:underline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(mediaUrl(f.url));
                    setCopied(f.id);
                  }}
                >
                  {copied === f.id ? "Đã copy ✓" : "Copy link"}
                </button>
                <button type="button" className="text-rose-600 hover:underline" onClick={() => remove(f)}>
                  Xoá
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
