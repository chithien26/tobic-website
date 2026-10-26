import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { contentTags, type ContentTag } from "@/lib/api";

/** Called by the .NET API after admins change content. */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: string[] };
  const tags = (body.tags ?? []).filter((t): t is ContentTag => (contentTags as readonly string[]).includes(t));
  // Expire immediately: with stale-while-revalidate, a background refresh still running
  // from an earlier edit can overwrite a newer one and leave stale content cached.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tags });
}
