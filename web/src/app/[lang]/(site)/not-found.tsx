import Link from "next/link";

// not-found.tsx does not receive params, so the copy is shown in all three languages.
export default function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <p className="heading-gradient text-7xl font-bold">404</p>
      <p className="mt-6 text-lg text-slate-700">Không tìm thấy trang bạn yêu cầu.</p>
      <p className="text-slate-500">The page you requested could not be found. · お探しのページが見つかりませんでした。</p>
      <Link href="/" className="btn-primary mt-8">
        Trang chủ / Home
      </Link>
    </section>
  );
}
