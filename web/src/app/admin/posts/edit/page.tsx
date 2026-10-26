"use client";

import { Suspense } from "react";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { contentKinds } from "@/lib/admin/content-kinds";

export default function Page() {
  return (
    <Suspense>
      <ContentEditor kind={contentKinds.posts} />
    </Suspense>
  );
}
