"use client";

import Link from "next/link";
import { Card, PageHeader, useApi } from "@/components/admin/ui";
import { contentKinds } from "@/lib/admin/content-kinds";
import { useSession } from "@/lib/admin/session";
import type { Job, MediaFile, Post, Service } from "@/lib/types";

export default function DashboardPage() {
  const session = useSession();
  const services = useApi<Service[]>("/api/admin/services");
  const posts = useApi<Post[]>("/api/admin/posts");
  const jobs = useApi<Job[]>("/api/admin/jobs");
  const media = useApi<MediaFile[]>("/api/admin/media");

  const stats = [
    { kind: contentKinds.services, data: services.data },
    { kind: contentKinds.posts, data: posts.data },
    { kind: contentKinds.jobs, data: jobs.data },
  ];

  return (
    <>
      <PageHeader title={`Xin chào, ${session?.user.displayName ?? ""}`} description="Quản lý nội dung website TOBIC" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ kind, data }) => (
          <Link key={kind.key} href={`/admin/${kind.key}`}>
            <Card className="h-full transition hover:border-brand-300 hover:shadow-md">
              <p className="text-sm font-medium text-slate-500">{kind.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{data?.length ?? "–"}</p>
              <p className="mt-1 text-xs text-slate-500">{data ? `${data.filter((d) => d.isPublished).length} đang hiển thị` : "Đang tải…"}</p>
            </Card>
          </Link>
        ))}
        <Link href="/admin/media">
          <Card className="h-full transition hover:border-brand-300 hover:shadow-md">
            <p className="text-sm font-medium text-slate-500">Thư viện ảnh</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{media.data?.length ?? "–"}</p>
            <p className="mt-1 text-xs text-slate-500">file</p>
          </Card>
        </Link>
      </div>

      <Card className="mt-6">
        <h2 className="font-semibold text-slate-900">Thao tác nhanh</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/posts/edit" className="btn-primary">
            + Viết bài tin tức
          </Link>
          <Link href="/admin/jobs/edit" className="btn-outline">
            + Đăng tin tuyển dụng
          </Link>
          <Link href="/admin/services/edit" className="btn-outline">
            + Thêm dịch vụ
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Mọi thay đổi được cập nhật lên website sau vài giây. Mỗi nội dung có 3 ngôn ngữ; ngôn ngữ nào chưa dịch sẽ hiển thị bản tiếng Việt.
        </p>
      </Card>
    </>
  );
}
