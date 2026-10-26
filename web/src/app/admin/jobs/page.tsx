"use client";

import { ContentList } from "@/components/admin/ContentList";
import { contentKinds } from "@/lib/admin/content-kinds";

export default function Page() {
  return <ContentList kind={contentKinds.jobs} />;
}
