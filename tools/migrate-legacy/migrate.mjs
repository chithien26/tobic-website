// Usage: node migrate.mjs [path-to-old-web.client/src]
// Writes: api/SeedData/legacy.json, api/wwwroot/uploads/legacy/*.webp,
//         web/public/images/*.webp, web/src/dictionaries/*.json, legacy-videos.md
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
const oldSrc = path.resolve(process.argv[2] ?? "D:/TIEN/web-asp-react/web.client/src");
const oldImages = path.join(oldSrc, "components/2/images");

const out = {
  seed: path.join(repo, "api/SeedData/legacy.json"),
  uploads: path.join(repo, "api/wwwroot/uploads/legacy"),
  publicImages: path.join(repo, "web/public/images"),
  dictionaries: path.join(repo, "web/src/dictionaries"),
  videos: path.join(here, "legacy-videos.md"),
};

const languages = JSON.parse(fs.readFileSync(path.join(oldSrc, "languages.json"), "utf8"));
const LANGS = { vi: "vi", en: "en", ja: "jp" };

// Untranslated Japanese text falls back to English before Vietnamese.
const sourcesFor = (lang) => [...new Set([LANGS[lang], "en", "vi"])].map((key) => languages[key]);

const pick = (lang, ...lookups) => {
  for (const source of sourcesFor(lang)) {
    for (const [section, key] of lookups) {
      const value = source?.[section]?.[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }
  return "";
};

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function toWebp(relative, destDir, name, { width = 1920, quality = 80 } = {}) {
  const src = path.join(oldImages, relative);
  if (!fs.existsSync(src)) throw new Error(`Missing image ${src}`);
  fs.mkdirSync(destDir, { recursive: true });
  const file = `${name}.webp`;
  const dest = path.join(destDir, file);
  if (!fs.existsSync(dest)) {
    await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(dest);
  }
  return file;
}

const upload = async (relative, name) => `/uploads/legacy/${await toWebp(relative, out.uploads, name)}`;

// ---------- Services (order and content follow the old Services page / serviceDetailData.js)
const services = [
  { slug: "mo-hinh-bim-kien-truc-ket-cau", title: ["service1"], summary: [["products", "pro1Desc"]], body: ["s1p1", "s1p2"], cover: "services/bim_model2.png", gallery: [], videos: ["service1.mp4"] },
  { slug: "mo-hinh-bim-mep", title: ["service2"], summary: [["products", "pro2Desc"]], body: ["s2p1", "s2p2"], cover: "services/mep.png", gallery: ["mep1.jpg", "mep2.jpg", "mep3.jpg", "mep4.jpg", "mep5.jpg"] },
  { slug: "chi-tiet-cau-tao", title: ["service3"], summary: [["products", "pro3Desc"]], body: ["s3p1", "s3p2"], cover: "services/part.png", gallery: [], videos: ["service1.mp4"] },
  { slug: "mo-hinh-chi-tiet-cot-thep", title: ["service4"], summary: [["products", "pro4Desc"]], body: ["pro4Desc"], cover: "services/steel.png", gallery: ["thep1.jpg", "thep2.png"] },
  { slug: "mo-phong-tien-do-4d", title: ["service5"], summary: [["products", "pro5Desc"]], body: ["pro5Desc"], cover: "services/4d.png", gallery: [], videos: ["4d.mp4"] },
  { slug: "boc-tach-khoi-luong-5d", title: ["service6"], summary: [["products", "pro6Desc"]], body: ["pro6Desc", "s5p1", "s5p2"], cover: "services/addin.png", gallery: ["revit1.png", "revit2.png", "revit3.png", "revit4.png"] },
  { slug: "xu-ly-du-lieu-point-cloud", title: ["service9"], summary: [["products", "pro9Desc"]], body: ["s6p1", "s6p2"], cover: "services/pc.png", gallery: [], videos: ["pc.mp4"] },
  { slug: "lap-va-chuan-bi-du-lieu", title: ["service7"], summary: [["products", "pro7Desc"]], body: ["pro7Desc"], cover: "services/data.png", gallery: ["data1.png", "data2.png"] },
  { slug: "tu-dong-tao-mo-hinh", title: ["service8"], summary: [["products", "pro8Desc"]], body: ["pro8Desc"], cover: "services/automodel.png", gallery: [], videos: ["dynamo.mp4"] },
  { slug: "phoi-canh-va-tai-lieu", title: ["service11"], summary: [["products", "pro13Desc"]], body: ["pro13Desc"], cover: "services/render.png", gallery: ["pasu1.png", "pasu2.png", "pasu3.jpg", "pasu6.jpg"] },
  { slug: "san-xuat-video", title: ["service10"], summary: [["products", "pro10Desc"]], body: ["pro10Desc", "s7p1", "s7p2"], cover: "services/video.png", gallery: [], videos: ["vid.mp4"] },
  { slug: "mo-hinh-gia-lap-ky-thuat-so", title: ["service12"], summary: [["products", "pro14Desc"]], body: ["pro14Desc"], cover: "services/mockup.png", gallery: ["mockup1.png", "mockup2.png", "mockup3.png", "mockup5.jpg"] },
  { slug: "phan-tich-mo-phong-6d", title: ["service13"], summary: [["products", "pro15Desc"]], body: ["pro15Desc"], cover: "services/6d.png", gallery: ["6d1.png", "6d2.png", "6d3.png"] },
  { slug: "phat-trien-revit-api", title: ["service14"], summary: [["products", "pro16Desc"]], body: ["pro16Desc"], cover: "services/revit.png", gallery: ["rv1.png", "rv2.png", "rv3.png", "rv6.png"] },
  { slug: "mo-hinh-van-hanh-bao-tri-7d", title: ["service20"], summary: [["services", "service12desc"]], body: ["service12desc"], cover: "services/7d.png", gallery: ["1-7d.png", "2-7d.png", "3-7d.png"] },
  { slug: "tobic-xr", title: ["service15"], summary: [["products", "pro11Desc"]], body: ["pro11Desc", "s8p1", "s8p2"], cover: "services/vr.png", gallery: [], videos: ["ar1.mp4", "Arプロモーションビデオ-1.mp4", "bus.mp4", "BEAMTracking.mp4", "ColumnTracking.mp4"] },
  { slug: "ban-ve-thi-cong", title: ["service16", "service17", "service18"], summary: [["products", "pro12Desc"]], body: ["pro12Desc", "s9p1", "s9p2", "s10p1", "s10p2"], cover: "services/bv1.png", gallery: ["../bv1.png", "../bv2.png", "../bv3.png"] },
  { slug: "ban-ve-che-tao-alc-ecp", title: ["service19"], summary: [["products", "pro17Desc"]], body: ["pro17Desc"], cover: "services/ecp.png", gallery: ["sd1.png", "sd2.png", "sd3.png", "sd4.png"] },
];

const paragraph = (lang, key) => pick(lang, ["serviceDetail", key], ["products", key], ["services", key]);

const videoTodo = [];
const serviceEntities = [];
for (const [index, s] of services.entries()) {
  const coverUrl = await upload(s.cover, `${s.slug}-cover`);
  const gallery = [];
  for (const [i, file] of s.gallery.entries()) {
    gallery.push({ type: "image", url: await upload(`services/servicesDetail/${file}`, `${s.slug}-${i + 1}`) });
  }
  if (s.videos?.length) videoTodo.push(`- Dịch vụ \`${s.slug}\`: ${s.videos.map((v) => `\`videos/${v}\``).join(", ")}`);

  serviceEntities.push({
    slug: s.slug,
    sortOrder: (index + 1) * 10,
    isPublished: true,
    publishedAt: "2025-01-01T00:00:00Z",
    coverImageUrl: coverUrl,
    gallery,
    translations: Object.keys(LANGS).map((lang) => ({
      lang,
      title: s.title.map((k) => pick(lang, ["services", k])).filter(Boolean).join(" / "),
      summary: pick(lang, ...s.summary),
      body: s.body.map((k) => paragraph(lang, k)).filter(Boolean).map((p) => `<p>${escapeHtml(p)}</p>`).join("\n"),
    })),
  });
}

// ---------- Posts (old NewsDetail1 / NewsDetail2)
const posts = [
  {
    key: "news1",
    slug: "tobic-ar-vr-tai-iuh-2025",
    publishedAt: "2025-03-16T09:00:00+07:00",
    cover: "blogs/news/iuh.jpg",
    layout: ["p1", "p2", "p3", { img: "blogs/news/dung_vr.jpg" }, { img: "blogs/news/hsiuh2.jpg" }, "p4", "p5"],
    videos: ["components/2/images/blogs/news/Chi Mai-1.mp4"],
  },
  {
    key: "news2",
    slug: "sinh-vien-bach-khoa-tham-quan-tobic",
    publishedAt: "2024-11-06T09:00:00+07:00",
    cover: "blogs/news/bk1.jpg",
    layout: ["p1", "p2", "p3", { img: "blogs/news/bk2.jpg" }, "p4", { img: "blogs/news/bk3.jpg" }, "p5", "p6"],
  },
];

const postEntities = [];
for (const p of posts) {
  const coverUrl = await upload(p.cover, `${p.slug}-cover`);
  const images = {};
  let n = 0;
  for (const block of p.layout) {
    if (typeof block === "object") images[block.img] = await upload(block.img, `${p.slug}-${++n}`);
  }
  if (p.videos) videoTodo.push(`- Bài viết \`${p.slug}\`: ${p.videos.map((v) => `\`${v}\``).join(", ")}`);

  postEntities.push({
    slug: p.slug,
    isPublished: true,
    publishedAt: p.publishedAt,
    coverImageUrl: coverUrl,
    gallery: [],
    translations: Object.keys(LANGS).map((lang) => {
      const sources = sourcesFor(lang).map((l) => l?.[p.key]).filter(Boolean);
      const source = sources[0];
      const body = p.layout
        .map((block) => {
          if (typeof block === "object") return `<figure><img src="${images[block.img]}" alt="" /></figure>`;
          const text = sources.map((s) => s.content?.[block]).find(Boolean);
          return text ? `<p>${escapeHtml(text)}</p>` : "";
        })
        .filter(Boolean)
        .join("\n");
      return { lang, title: source.title, excerpt: source.description, body };
    }),
  });
}

// Short club announcements that existed in the translations but were never published.
for (const [key, slug] of [["news3", "doi-bong-da-tobic"], ["news4", "giai-cau-long-tobic"]]) {
  postEntities.push({
    slug,
    isPublished: false,
    coverImageUrl: key === "news3" ? await upload("blogs/FCTobic1.png", `${slug}-cover`) : null,
    gallery: [],
    translations: Object.keys(LANGS).map((lang) => {
      const source = sourcesFor(lang).map((l) => l?.[key]).find(Boolean);
      return { lang, title: source.title, excerpt: source.description, body: `<p>${escapeHtml(source.description)}</p>` };
    }),
  });
}

// ---------- Company settings (old QROnly, Footer, About, Contact)
const settings = {
  companyName: "TOBIC Co., Ltd.",
  legalName: "Công Ty Trách Nhiệm Hữu Hạn TOBIC",
  taxCode: "0315566092",
  email: "contact@tobic.com.vn",
  phone: "+84 28 3823 9326",
  ceoName: "Honda Tetsuya",
  established: "04/2019",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.271972748328!2d106.71574147573602!3d10.790469458933087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752980188f4abb%3A0x84e5c974056c6945!2sTobic%20Co.%2C%20Ltd!5e0!3m2!1sen!2s!4v1743671630617!5m2!1sen!2s",
  introVideoUrl: "",
  facebookUrl: "https://www.facebook.com/people/TOBIC-CO-LTD/100072317361762",
  linkedinUrl: "",
  youtubeUrl: "",
  translations: Object.keys(LANGS).map((lang) => ({
    lang,
    address: pick(lang, ["about", "locationDetail"]),
    officeNote: pick(lang, ["about", "office"]),
  })),
};
videoTodo.unshift("- Trang chủ (video giới thiệu): `videos/intro-1.mp4` → dán link YouTube vào Cài đặt > Video giới thiệu");

fs.mkdirSync(path.dirname(out.seed), { recursive: true });
fs.writeFileSync(out.seed, JSON.stringify({ settings, services: serviceEntities, posts: postEntities, jobs: [] }, null, 2));

// ---------- Static images used by fixed page sections
const staticImages = {
  logo: ["logo_demo.png", 900],
  "logo-round": ["logo_tobic.png", 512],
  "home-bg": ["HomePage.png", 1920],
  "feature-3d": ["Features/3d.png", 1200],
  "feature-hero": ["Features/hero_img.png", 1200],
  "feature-flow": ["flow-2.png", 1200],
  "five-mindsets": ["5dieu.png", 1600],
  "about-cover": ["About/dl1.jpg", 1920],
  "about-company": ["About/anhcty1.png", 1600],
  "about-work-1": ["working_environment.jpg", 1600],
  "about-work-2": ["About/workenv1.png", 1600],
  "team-1": ["About/dl6.jpg", 1600],
  "team-2": ["About/dl2.jpg", 1600],
  "team-3": ["About/dl4.jpg", 1600],
  "team-4": ["blogs/FCTobic1.png", 1600],
};
for (const [name, [file, width]] of Object.entries(staticImages)) {
  await toWebp(file, out.publicImages, name, { width });
}
await sharp(path.join(oldImages, "logo_tobic.png")).resize(256, 256, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toFile(path.join(repo, "web/src/app/icon.png"));

// ---------- UI dictionaries
const extra = {
  vi: {
    readMore: "Xem chi tiết", back: "Quay lại", allServices: "Tất cả dịch vụ", otherServices: "Dịch vụ khác", gallery: "Hình ảnh dự án",
    noJobs: "Hiện chưa có vị trí đang tuyển. Bạn vẫn có thể gửi CV cho chúng tôi qua email.", noPosts: "Chưa có bài viết.",
    applyByEmail: "Ứng tuyển qua email", location: "Địa điểm", salary: "Mức lương", employmentType: "Hình thức", deadline: "Hạn nộp",
    publishedOn: "Đăng ngày", taxCode: "Mã số thuế", language: "Ngôn ngữ", notFound: "Không tìm thấy trang bạn yêu cầu.", backHome: "Về trang chủ",
    qrNote: "* Không viết tắt tên công ty thành \"TNHH\".", contactUs: "Liên hệ ngay", openPositions: "Vị trí đang tuyển", menu: "Mở menu",
    rights: "Bảo lưu mọi quyền.", unavailable: "Nội dung đang được cập nhật. Vui lòng quay lại sau.", latestNews: "Tin tức mới nhất", viewAll: "Xem tất cả",
  },
  en: {
    readMore: "Read more", back: "Back", allServices: "All services", otherServices: "Other services", gallery: "Project gallery",
    noJobs: "There are no open positions right now. You can still send us your CV by email.", noPosts: "No posts yet.",
    applyByEmail: "Apply by email", location: "Location", salary: "Salary", employmentType: "Employment type", deadline: "Deadline",
    publishedOn: "Published", taxCode: "Tax code", language: "Language", notFound: "The page you requested could not be found.", backHome: "Back to home",
    qrNote: "", contactUs: "Contact us", openPositions: "Open positions", menu: "Open menu",
    rights: "All rights reserved.", unavailable: "Content is being updated. Please check back later.", latestNews: "Latest news", viewAll: "View all",
  },
  ja: {
    readMore: "詳しく見る", back: "戻る", allServices: "すべてのサービス", otherServices: "その他のサービス", gallery: "プロジェクト画像",
    noJobs: "現在募集中のポジションはありません。メールで履歴書をお送りいただくことも可能です。", noPosts: "まだ記事がありません。",
    applyByEmail: "メールで応募", location: "勤務地", salary: "給与", employmentType: "雇用形態", deadline: "応募締切",
    publishedOn: "公開日", taxCode: "法人番号", language: "言語", notFound: "お探しのページが見つかりませんでした。", backHome: "ホームへ戻る",
    qrNote: "", contactUs: "お問い合わせ", openPositions: "募集中のポジション", menu: "メニューを開く",
    rights: "All rights reserved.", unavailable: "コンテンツは現在更新中です。しばらくしてから再度ご確認ください。", latestNews: "最新ニュース", viewAll: "すべて見る",
  },
};

fs.mkdirSync(out.dictionaries, { recursive: true });
for (const lang of Object.keys(LANGS)) {
  const t = (section, key) => pick(lang, [section, key]);
  const dict = {
    nav: { home: t("navbar", "home"), about: t("navbar", "about"), services: t("navbar", "services"), news: t("navbar", "news"), careers: t("navbar", "hiring"), contact: t("navbar", "contact") },
    home: {
      welcome: t("features", "welcome"),
      intro: t("features", "intro"),
      innovationTitle: t("features", "innoTitle"),
      innovationDesc: t("features", "innoDesc"),
      innovation: [
        { title: t("features", "innoA"), desc: t("features", "innoA1") },
        { title: t("features", "innoB"), desc: `${t("features", "innoB1")} ${t("features", "innoB2")}`.trim() },
        { title: t("features", "innoC"), desc: t("features", "innoC1") },
      ],
      dataTitle: t("features", "data"),
      dataDesc: t("features", "dataDesc"),
      data: [
        { title: t("features", "dataA"), desc: t("features", "dataA1") },
        { title: t("features", "dataB"), desc: t("features", "dataB1") },
        { title: t("features", "dataC"), desc: t("features", "dataC1") },
      ],
      overviewTitle: t("hero", "hero1"),
      mindsetTitle: t("hero", "hero2"),
      servicesTitle: t("services", "home_title"),
      servicesDesc: t("services", "desc2"),
      ctaTitle: t("callToAct", "intro"),
      ctaDesc: `${t("callToAct", "desc1")} ${t("callToAct", "desc2")} ${t("callToAct", "desc3")}`.trim(),
      ctaButton: t("callToAct", "but2"),
    },
    about: {
      question: t("about", "question"), reason: t("about", "reason"), title: t("about", "about"),
      companyName: t("about", "companyName"), location: t("about", "location"), established: t("about", "established"), ceo: t("about", "ceo"),
      workTitle: t("about", "work_env"), workDesc: t("about", "work_desc"), teamTitle: t("about", "team"), teamDesc: t("about", "teamBuilding"),
    },
    services: { title: t("services", "desc1"), desc: t("services", "desc2") },
    news: { title: t("newsIntro", "title"), intro: t("newsIntro", "intro") },
    careers: { title: t("jobs", "header"), invite: t("jobs", "invite"), invite2: t("jobs", "invite_1") },
    contact: {
      title: t("contact", "title"), desc1: t("contact", "desc1"), desc2: t("contact", "desc2"),
      address: t("contact", "address"), phone: t("contact", "phone"), mail: t("contact", "mail"),
      location: t("contact", "location"), locationDesc: t("contact", "locationDesc"),
    },
    footer: { links: t("footer", "link"), company: t("footer", "company") },
    common: extra[lang],
  };
  fs.writeFileSync(path.join(out.dictionaries, `${lang}.json`), JSON.stringify(dict, null, 2) + "\n");
}

fs.writeFileSync(
  out.videos,
  `# Video cần đưa lên YouTube\n\nCác video của site cũ quá nặng để đóng gói (tổng ~630 MB). Hãy đăng lên YouTube (hoặc nén lại < 50 MB rồi upload ở trang admin) và thêm vào phần "Thư viện" của từng mục:\n\n${videoTodo.join("\n")}\n`,
);

console.log(`Services: ${serviceEntities.length}, posts: ${postEntities.length}`);
console.log(`Seed → ${path.relative(repo, out.seed)}`);
