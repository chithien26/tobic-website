"use client";

import { useState, type FormEvent } from "react";
import { Card, Field, Notice, PageHeader } from "@/components/admin/ui";
import { api } from "@/lib/admin/session";

export default function AccountPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setMessage({ kind: "error", text: "Mật khẩu nhập lại không khớp." });
      return;
    }
    try {
      await api("/api/auth/change-password", { method: "POST", json: { currentPassword: current, newPassword: next } });
      setMessage({ kind: "success", text: "Đã đổi mật khẩu." });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Không đổi được mật khẩu" });
    }
  }

  return (
    <>
      <PageHeader title="Đổi mật khẩu" />
      <Card className="max-w-md">
        <form onSubmit={submit} className="space-y-4">
          {message && <Notice kind={message.kind}>{message.text}</Notice>}
          <Field label="Mật khẩu hiện tại">
            <input className="input" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </Field>
          <Field label="Mật khẩu mới" hint="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số">
            <input className="input" type="password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
          <Field label="Nhập lại mật khẩu mới">
            <input className="input" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          <button type="submit" className="btn-primary">
            Đổi mật khẩu
          </button>
        </form>
      </Card>
    </>
  );
}
