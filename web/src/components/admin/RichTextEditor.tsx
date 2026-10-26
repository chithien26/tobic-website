"use client";

import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { absolutizeHtml, mediaUrl, relativizeHtml } from "@/lib/media";
import { MediaPicker } from "./MediaPicker";

export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: true } }),
      Image,
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
    ],
    content: absolutizeHtml(value),
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none min-h-[240px] px-4 py-3 focus:outline-none prose-img:rounded-lg",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : relativizeHtml(editor.getHTML())),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20">
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [picker, setPicker] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
    }),
  });
  const chain = () => editor.chain().focus();

  const buttons: { label: string; title: string; active?: boolean; run: () => void }[] = [
    { label: "B", title: "In đậm", active: state.bold, run: () => chain().toggleBold().run() },
    { label: "I", title: "In nghiêng", active: state.italic, run: () => chain().toggleItalic().run() },
    { label: "U", title: "Gạch chân", active: state.underline, run: () => chain().toggleUnderline().run() },
    { label: "H2", title: "Tiêu đề lớn", active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: "H3", title: "Tiêu đề nhỏ", active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: "• Danh sách", title: "Danh sách chấm", active: state.bullet, run: () => chain().toggleBulletList().run() },
    { label: "1. Danh sách", title: "Danh sách số", active: state.ordered, run: () => chain().toggleOrderedList().run() },
    { label: "❝", title: "Trích dẫn", active: state.quote, run: () => chain().toggleBlockquote().run() },
    {
      label: "Link",
      title: "Chèn liên kết",
      active: state.link,
      run: () => {
        const previous = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Địa chỉ liên kết (để trống để bỏ link):", previous ?? "https://");
        if (url === null) return;
        if (!url.trim()) chain().unsetLink().run();
        else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
      },
    },
    { label: "Ảnh", title: "Chèn ảnh từ thư viện", run: () => setPicker(true) },
    {
      label: "YouTube",
      title: "Chèn video YouTube",
      run: () => {
        const url = window.prompt("Dán link video YouTube:");
        if (url) chain().setYoutubeVideo({ src: url }).run();
      },
    },
    { label: "↶", title: "Hoàn tác", run: () => chain().undo().run() },
    { label: "↷", title: "Làm lại", run: () => chain().redo().run() },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      {buttons.map((b) => (
        <button
          key={b.title}
          type="button"
          title={b.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={b.run}
          className={`rounded px-2 py-1 text-xs font-semibold ${b.active ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-200"}`}
        >
          {b.label}
        </button>
      ))}
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onSelect={(f) => {
            chain().setImage({ src: mediaUrl(f.url), alt: f.fileName }).run();
            setPicker(false);
          }}
        />
      )}
    </div>
  );
}
