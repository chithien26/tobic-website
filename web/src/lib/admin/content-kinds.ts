export type FieldType = "text" | "textarea" | "richtext";
export type TranslationField = { name: string; label: string; type: FieldType; placeholder?: string };

export type ContentKind = {
  key: "services" | "posts" | "jobs";
  label: string;
  singular: string;
  publicPath: string;
  fields: TranslationField[];
  gallery: boolean;
  deadline: boolean;
};

export const contentKinds: Record<ContentKind["key"], ContentKind> = {
  services: {
    key: "services",
    label: "Dịch vụ",
    singular: "dịch vụ",
    publicPath: "/services",
    gallery: true,
    deadline: false,
    fields: [
      { name: "title", label: "Tên dịch vụ", type: "text" },
      { name: "summary", label: "Mô tả ngắn (hiện trên thẻ)", type: "textarea" },
      { name: "body", label: "Nội dung chi tiết", type: "richtext" },
    ],
  },
  posts: {
    key: "posts",
    label: "Tin tức",
    singular: "bài viết",
    publicPath: "/news",
    gallery: true,
    deadline: false,
    fields: [
      { name: "title", label: "Tiêu đề", type: "text" },
      { name: "excerpt", label: "Tóm tắt", type: "textarea" },
      { name: "body", label: "Nội dung", type: "richtext" },
    ],
  },
  jobs: {
    key: "jobs",
    label: "Tuyển dụng",
    singular: "vị trí",
    publicPath: "/careers",
    gallery: false,
    deadline: true,
    fields: [
      { name: "title", label: "Vị trí", type: "text" },
      { name: "location", label: "Địa điểm", type: "text", placeholder: "TP. Hồ Chí Minh" },
      { name: "employmentType", label: "Hình thức", type: "text", placeholder: "Toàn thời gian" },
      { name: "salary", label: "Mức lương", type: "text", placeholder: "Thoả thuận" },
      { name: "body", label: "Mô tả công việc, yêu cầu, quyền lợi", type: "richtext" },
    ],
  },
};

/** "Mô hình BIM" -> "mo-hinh-bim" */
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
