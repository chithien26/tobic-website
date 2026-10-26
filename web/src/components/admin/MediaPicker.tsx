"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/admin/session";
import { mediaUrl } from "@/lib/media";
import type { MediaFile } from "@/lib/types";
import { Modal, Notice, formatSize, useApi } from "./ui";

export async function uploadFiles(files: FileList | File[]) {
  const uploaded: MediaFile[] = [];
  for (const file of Array.from(files)) {
    const form = new FormData();
    form.append("file", file);
    uploaded.push(await api<MediaFile>("/api/admin/media", { method: "POST", body: form }));
  }
  return uploaded;
}

export function UploadButton({ onUploaded, accept = "image/*,video/mp4,video/webm,application/pdf", label = "Tải file lên" }: {
  onUploaded: (files: MediaFile[]) => void;
  accept?: string;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={input}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          setBusy(true);
          setError("");
          try {
            onUploaded(await uploadFiles(e.target.files));
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload thất bại");
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
      <button type="button" className="btn-primary" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? "Đang tải lên…" : label}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function MediaThumb({ file }: { file: Pick<MediaFile, "url" | "contentType" | "fileName"> }) {
  if (file.contentType.startsWith("image/")) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={mediaUrl(file.url)} alt={file.fileName} loading="lazy" className="size-full object-cover" />;
  }
  if (file.contentType.startsWith("video/")) {
    return <video src={mediaUrl(file.url)} muted preload="metadata" className="size-full object-cover" />;
  }
  return <div className="flex size-full items-center justify-center bg-slate-100 text-xs font-semibold text-slate-500">PDF</div>;
}

/** Lets editors pick an existing upload or upload a new one. */
export function MediaPicker({ type = "image", onSelect, onClose }: { type?: "image" | "video"; onSelect: (file: MediaFile) => void; onClose: () => void }) {
  const { data, setData, error, loading } = useApi<MediaFile[]>(`/api/admin/media?type=${type}/`);
  const [query, setQuery] = useState("");
  const files = (data ?? []).filter((f) => f.fileName.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal title={type === "image" ? "Chọn ảnh" : "Chọn video"} onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <input className="input max-w-xs" placeholder="Tìm theo tên file…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <UploadButton
          accept={type === "image" ? "image/*" : "video/mp4,video/webm"}
          onUploaded={(uploaded) => {
            setData((prev) => [...uploaded, ...(prev ?? [])]);
            if (uploaded.length === 1) onSelect(uploaded[0]);
          }}
        />
      </div>
      {error && <Notice>{error}</Notice>}
      {loading && <p className="py-10 text-center text-slate-500">Đang tải…</p>}
      {!loading && files.length === 0 && <p className="py-10 text-center text-slate-500">Chưa có file nào. Hãy tải lên.</p>}
      <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-5">
        {files.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect(f)}
            className="group overflow-hidden rounded-lg border border-slate-200 text-left hover:border-brand-500 hover:ring-2 hover:ring-brand-500/30"
          >
            <div className="aspect-square bg-slate-50">
              <MediaThumb file={f} />
            </div>
            <div className="px-2 py-1.5">
              <p className="truncate text-xs font-medium text-slate-700">{f.fileName}</p>
              <p className="text-[11px] text-slate-400">{formatSize(f.size)}</p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}

/** A single image field (e.g. cover image) with preview, choose and remove. */
export function ImageField({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-4">
      <div className="aspect-[16/10] w-48 shrink-0 overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(value)} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-slate-400">Chưa có ảnh</div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" className="btn-outline" onClick={() => setOpen(true)}>
          {value ? "Đổi ảnh" : "Chọn ảnh"}
        </button>
        {value && (
          <button type="button" className="text-sm font-medium text-rose-600 hover:underline" onClick={() => onChange(null)}>
            Bỏ ảnh
          </button>
        )}
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onSelect={(f) => {
            onChange(f.url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
