"use client";

import { useState, type FormEvent } from "react";
import { Card, Field, Modal, Notice, PageHeader, useApi } from "@/components/admin/ui";
import { api, useSession } from "@/lib/admin/session";
import type { UserInfo } from "@/lib/types";

const roleLabels: Record<string, string> = {
  Admin: "Quản trị (toàn quyền)",
  Editor: "Biên tập (chỉ sửa nội dung)",
};

type Form = { id?: string; email: string; displayName: string; password: string; role: string };

export default function UsersPage() {
  const session = useSession();
  const { data, error, loading, reload } = useApi<UserInfo[]>("/api/admin/users");
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setFormError("");
    try {
      if (form.id) {
        await api(`/api/admin/users/${form.id}`, { method: "PUT", json: { displayName: form.displayName, role: form.role } });
        if (form.password) await api(`/api/admin/users/${form.id}/reset-password`, { method: "POST", json: { newPassword: form.password } });
      } else {
        await api("/api/admin/users", { method: "POST", json: form });
      }
      setForm(null);
      setMessage("Đã lưu tài khoản.");
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không lưu được");
    }
  }

  async function remove(user: UserInfo) {
    if (!window.confirm(`Xoá tài khoản ${user.email}?`)) return;
    try {
      await api(`/api/admin/users/${user.id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Không xoá được");
    }
  }

  return (
    <>
      <PageHeader
        title="Tài khoản quản trị"
        description="Biên tập viên chỉ sửa được nội dung; Quản trị viên quản lý thêm tài khoản và thông tin công ty."
        actions={
          <button type="button" className="btn-primary" onClick={() => setForm({ email: "", displayName: "", password: "", role: "Editor" })}>
            + Thêm tài khoản
          </button>
        }
      />
      {(error || message) && (
        <div className="mb-4">
          <Notice kind={error ? "error" : "success"}>{error || message}</Notice>
        </div>
      )}
      <Card className="divide-y divide-slate-100 p-0">
        {loading && <p className="p-5 text-slate-500">Đang tải…</p>}
        {data?.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-semibold text-slate-900">
                {u.displayName} {u.id === session?.user.id && <span className="text-xs font-normal text-slate-400">(bạn)</span>}
              </p>
              <p className="text-sm text-slate-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{roleLabels[u.roles[0]] ?? u.roles[0]}</span>
              <button
                type="button"
                className="font-medium text-brand-600 hover:underline"
                onClick={() => setForm({ id: u.id, email: u.email, displayName: u.displayName, password: "", role: u.roles[0] ?? "Editor" })}
              >
                Sửa
              </button>
              {u.id !== session?.user.id && (
                <button type="button" className="font-medium text-rose-600 hover:underline" onClick={() => remove(u)}>
                  Xoá
                </button>
              )}
            </div>
          </div>
        ))}
      </Card>

      {form && (
        <Modal title={form.id ? "Sửa tài khoản" : "Thêm tài khoản"} onClose={() => setForm(null)}>
          <form onSubmit={submit} className="space-y-4">
            {formError && <Notice>{formError}</Notice>}
            <Field label="Email">
              <input className="input" type="email" required disabled={Boolean(form.id)} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Tên hiển thị">
              <input className="input" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </Field>
            <Field label={form.id ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"} hint="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số">
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                required={!form.id}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
            <Field label="Quyền">
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setForm(null)}>
                Huỷ
              </button>
              <button type="submit" className="btn-primary">
                Lưu
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
