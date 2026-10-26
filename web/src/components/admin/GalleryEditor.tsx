"use client";

import { useState } from "react";
import { mediaUrl, youtubeEmbedUrl } from "@/lib/media";
import type { MediaItem } from "@/lib/types";
import { MediaPicker } from "./MediaPicker";

export function GalleryEditor({ items, onChange }: { items: MediaItem[]; onChange: (items: MediaItem[]) => void }) {
  const [picker, setPicker] = useState<"image" | "video" | null>(null);

  const set = (index: number, patch: Partial<MediaItem>) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, delta: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-slate-200 p-3">
          <div className="h-20 w-32 shrink-0 overflow-hidden rounded bg-slate-100">
            {item.type === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(item.url)} alt="" className="size-full object-cover" />
            )}
            {item.type === "video" && <video src={mediaUrl(item.url)} muted preload="metadata" className="size-full object-cover" />}
            {item.type === "youtube" && (
              <div className={`flex size-full items-center justify-center text-xs font-semibold ${youtubeEmbedUrl(item.url) ? "text-rose-600" : "text-slate-400"}`}>
                YouTube
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            {item.type === "youtube" ? (
              <input className="input" placeholder="https://www.youtube.com/watch?v=…" value={item.url} onChange={(e) => set(i, { url: e.target.value })} />
            ) : (
              <p className="truncate text-xs text-slate-500">{item.url}</p>
            )}
            <input className="input" placeholder="Chú thích (không bắt buộc)" value={item.caption ?? ""} onChange={(e) => set(i, { caption: e.target.value })} />
          </div>
          <div className="flex shrink-0 flex-col gap-1 text-xs">
            <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-30" aria-label="Lên">
              ↑
            </button>
            <button type="button" disabled={i === items.length - 1} onClick={() => move(i, 1)} className="rounded px-2 py-1 hover:bg-slate-100 disabled:opacity-30" aria-label="Xuống">
              ↓
            </button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="rounded px-2 py-1 text-rose-600 hover:bg-rose-50" aria-label="Xoá">
              ✕
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-outline" onClick={() => setPicker("image")}>
          + Ảnh
        </button>
        <button type="button" className="btn-outline" onClick={() => setPicker("video")}>
          + Video (file)
        </button>
        <button type="button" className="btn-outline" onClick={() => onChange([...items, { type: "youtube", url: "" }])}>
          + YouTube
        </button>
      </div>

      {picker && (
        <MediaPicker
          type={picker}
          onClose={() => setPicker(null)}
          onSelect={(f) => {
            onChange([...items, { type: picker, url: f.url }]);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
