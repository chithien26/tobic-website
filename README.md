# Website TOBIC

Website giới thiệu công ty TOBIC (3 ngôn ngữ: Tiếng Việt, English, 日本語) kèm trang quản trị để người không biết code tự sửa nội dung.

| Thư mục | Nội dung |
| --- | --- |
| `api/` | ASP.NET Core (.NET 10) Web API + PostgreSQL. Lưu dịch vụ, tin tức, tuyển dụng, ảnh/video, tài khoản admin. |
| `web/` | Next.js 16 (React 19). Website công khai (`/vi`, `/en`, `/ja`) và trang quản trị (`/admin`). |
| `tools/migrate-legacy/` | Script đã dùng để chuyển dữ liệu và ảnh từ website cũ sang (chỉ chạy lại khi cần nạp lại dữ liệu gốc). |

## Chạy trên máy dev

Cần: Docker Desktop, .NET SDK 10, Node.js 22 trở lên.

```powershell
# 1. Database (Postgres ở cổng 5433)
docker compose up -d db

# 2. API ở http://localhost:5080 — lần đầu tự tạo bảng, tài khoản admin và nạp dữ liệu từ site cũ
cd api
dotnet run --launch-profile http

# 3. Website ở http://localhost:3000 (terminal khác)
cd web
copy .env.example .env.local   # lần đầu
npm install
npm run dev
```

Đăng nhập quản trị tại http://localhost:3000/admin với tài khoản dev `admin@tobic.com.vn` / `Admin@12345` (khai báo trong `api/appsettings.Development.json`).

## Trang quản trị làm được gì

- **Dịch vụ, Tin tức, Tuyển dụng**: thêm/sửa/xoá, viết nội dung bằng trình soạn thảo (đậm, tiêu đề, danh sách, chèn ảnh, chèn YouTube), nhập riêng cho từng ngôn ngữ, ẩn/hiện, sắp xếp, ảnh bìa và thư viện ảnh/video.
- **Thư viện ảnh**: tải ảnh, video, PDF lên một chỗ để dùng lại.
- **Thông tin công ty** (chỉ Admin): địa chỉ, điện thoại, email, bản đồ, video giới thiệu, mạng xã hội.
- **Tài khoản** (chỉ Admin): tạo tài khoản cho nhân viên với quyền *Admin* (toàn quyền) hoặc *Editor* (chỉ sửa nội dung).

Sau khi bấm Lưu, API báo cho website làm mới, nội dung mới hiện ngay trên web.

Văn bản cố định của trang chủ, trang Giới thiệu và các nhãn giao diện nằm trong `web/src/dictionaries/{vi,en,ja}.json` (sửa bằng code). Muốn admin tự sửa được các phần này thì cần làm thêm.

## Deploy: Neon (database) + Render (API) + Vercel (website)

**1. Neon:** tạo project (region Singapore), vào *Connect*, tắt *Connection pooling*, rồi copy chuỗi dạng `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`. API đọc được trực tiếp chuỗi này, và lần chạy đầu tự tạo bảng, tạo admin, nạp dữ liệu cũ.

**2. Render (API):** *New → Blueprint*, chọn repo này. Render đọc `render.yaml` và hỏi các giá trị sau:

| Biến | Giá trị |
| --- | --- |
| `ConnectionStrings__Default` | chuỗi Neon ở bước 1 |
| `Web__BaseUrl`, `Cors__Origins__0` | URL website (bước 3), ví dụ `https://tobic-web.vercel.app` |
| `Web__RevalidateSecret` | một chuỗi ngẫu nhiên, dùng lại ở bước 3 |
| `Seed__AdminPassword` | mật khẩu admin đầu tiên |

`Jwt__Key` được Render tự sinh. Ảnh tải lên được lưu trên disk `/var/data` nên cần gói **Starter** trở lên, vì gói Free không có disk và ảnh sẽ mất mỗi lần deploy. Nếu tạo tay thay vì dùng Blueprint: *New → Web Service → Docker*, Root Directory `api`, Health Check `/health`, thêm các biến trên, `Storage__UploadRoot=/var/data/uploads` và một Disk mount ở `/var/data`.

**3. Vercel (website):** *Import* repo, Root Directory `web`, thêm biến môi trường:

| Biến | Giá trị |
| --- | --- |
| `API_URL`, `NEXT_PUBLIC_API_URL` | URL API trên Render, ví dụ `https://tobic-api.onrender.com` |
| `REVALIDATE_SECRET` | giống `Web__RevalidateSecret` |
| `SITE_URL` | URL website |

Deploy API trước rồi mới deploy website, để lúc build website lấy được dữ liệu. Có tên miền riêng thì cập nhật lại `Web__BaseUrl`, `Cors__Origins__0` và `SITE_URL`.

## Deploy website lên Windows Server (IIS)

Script nằm trong `web/deploy/windows/`. Website chạy nền bằng Task Scheduler (tự bật lại khi server khởi động lại), IIS đứng trước làm tên miền và HTTPS.

**Cài một lần** (PowerShell chạy bằng quyền Administrator):

1. Cài [Node.js 24 LTS](https://nodejs.org) và [Git](https://git-scm.com/download/win), rồi mở PowerShell mới.
2. Lấy code và tạo file cấu hình:
   ```powershell
   git clone https://github.com/chithien26/tobic-website.git C:\sites\tobic-website
   cd C:\sites\tobic-website\web
   copy deploy\windows\env.production.example .env.production.local
   notepad .env.production.local
   ```
3. Build và chạy: `.\deploy\windows\deploy.ps1`. Thấy `Website is running.` là xong. Website lúc này chạy ở `http://127.0.0.1:3000` trên server.
4. IIS: cài [URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) và [ARR](https://www.iis.net/downloads/microsoft/application-request-routing), rồi bật proxy:
   ```powershell
   $appcmd = "$env:windir\system32\inetsrv\appcmd.exe"
   & $appcmd set config -section:system.webServer/proxy /enabled:"True" /preserveHostHeader:"True" /commit:apphost
   & $appcmd set config -section:system.webServer/rewrite/allowedServerVariables /+"[name='HTTP_X_FORWARDED_PROTO']" /+"[name='HTTP_X_FORWARDED_HOST']" /commit:apphost
   ```
5. Tạo site trong IIS Manager, trỏ tới thư mục trống `C:\sites\tobic-iis`, binding `http` với tên miền (đã trỏ DNS về IP server). Mở port 80 và 443 trên firewall.
6. Lấy chứng chỉ HTTPS miễn phí bằng [win-acme](https://www.win-acme.com/): chạy `wacs.exe`, chọn site vừa tạo.
7. Copy `web\deploy\windows\web.config` vào `C:\sites\tobic-iis`.
8. Trên Render, đặt `Web__BaseUrl` và `Cors__Origins__0` thành `https://<tên-miền>`.

**Cập nhật về sau:** PowerShell (Administrator) chạy `C:\sites\tobic-website\web\deploy\windows\deploy.ps1`. Script tự `git pull`, build, rồi khởi động lại website (gián đoạn vài giây). Log nằm ở `C:\sites\tobic-web\logs\web.log`.

## Triển khai bằng Docker

```powershell
copy .env.example .env   # rồi điền JWT_KEY, REVALIDATE_SECRET, ADMIN_PASSWORD, URL thật
docker compose --profile app up -d --build
```

- `web` chạy cổng 3000, `api` chạy cổng 5080. Đặt reverse proxy (Nginx, Caddy, IIS…) có HTTPS phía trước, trỏ tên miền chính vào `web` và tên miền API (`PUBLIC_API_URL`) vào `api`.
- Ảnh tải lên nằm trong volume `uploads`, database trong volume `db-data`. Nhớ sao lưu cả hai.
- `PUBLIC_API_URL` được nhúng vào website lúc build. Đổi giá trị này thì phải build lại `web`.
- Lúc build image, web không gọi được API nên ngay sau khi khởi động, trang có thể trống khoảng 1 phút rồi tự có nội dung.
- Tài khoản admin đầu tiên chỉ được tạo khi database chưa có ai. Đăng nhập xong hãy đổi mật khẩu ở mục "Đổi mật khẩu".

## Việc còn lại

- **Video của site cũ** (~630 MB) chưa chuyển sang vì quá nặng. Danh sách nằm ở `tools/migrate-legacy/legacy-videos.md`: đăng lên YouTube rồi thêm link vào thư viện của từng mục trong trang admin.
- Một số đoạn tiếng Nhật ở site cũ chưa dịch nên đang hiển thị bằng tiếng Anh. Có thể dịch lại trong trang admin, tab 日本語.
- Link cũ dạng `tobic.com.vn/#/services` hoặc `/#/qr_info` tự chuyển sang trang mới. Trang danh thiếp QR mới là `/vi/qr`.
