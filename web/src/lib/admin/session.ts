"use client";

import { useSyncExternalStore } from "react";
import { PUBLIC_API_URL } from "@/lib/media";
import type { UserInfo } from "@/lib/types";

export type Session = { token: string; expiresAt: string; user: UserInfo };

const KEY = "tobic_admin_session";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSession: Session | null = null;

function read(): Session | null {
  const raw = typeof window === "undefined" ? null : localStorage.getItem(KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  cachedSession = null;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Session;
      if (new Date(parsed.expiresAt).getTime() > Date.now()) cachedSession = parsed;
    } catch {
      /* corrupted value: treat as signed out */
    }
  }
  return cachedSession;
}

function emit() {
  listeners.forEach((l) => l());
}

export function saveSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
  emit();
}

export function clearSession() {
  localStorage.removeItem(KEY);
  emit();
}

/** `undefined` while hydrating, `null` when signed out. */
export function useSession(): Session | null | undefined {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      window.addEventListener("storage", listener);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
      };
    },
    read,
    () => undefined,
  );
}

export const isAdmin = (session: Session | null | undefined) => Boolean(session?.user.roles.includes("Admin"));

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const session = read();
  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (res.status === 401 && session) {
    clearSession();
    throw new ApiError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", 401);
  }
  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as { title?: string; errors?: Record<string, string[]> } | null;
    const detail = problem?.errors ? Object.values(problem.errors).flat().join(" ") : "";
    throw new ApiError(problem?.title && !detail ? problem.title : detail || problem?.title || `Lỗi ${res.status}`, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
