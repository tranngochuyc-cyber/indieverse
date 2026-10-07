# Indieverse Studio: máy chủ và tên miền

Website động và quản trị chạy chung tại `https://TEN-MIEN/` và `https://TEN-MIEN/admin`. Bản GitHub Pages là bản tĩnh độc lập: GitHub Pages không chạy Node.js hay SQLite. Xuất bản trong Studio không sửa bản GitHub Pages.

## Thử trước khi có VPS

Cần Node.js 24 trở lên. Chạy `npm run admin:create -- EMAIL-CUA-BAN`, nhập mật khẩu ít nhất 14 ký tự (không hiển thị), rồi `npm start`. Mở `http://localhost:5173/admin`. Không có tài khoản hay mật khẩu mặc định. Không gửi mật khẩu trong chat hoặc đưa mật khẩu vào Git.

## Triển khai bằng Docker Compose trên VPS

1. Chuẩn bị VPS Linux có Docker Engine và Compose, tên miền thuộc quyền quản lý của bạn. Trỏ bản ghi DNS A của tên miền đến IP VPS. Nếu có AAAA, nó phải trỏ đúng IPv6 của VPS. Mở cổng 80/443; không mở cổng 3000 ra Internet.
2. Clone kho mã: `git clone https://github.com/tranngochuyc-cyber/indieverse.git`, sau đó vào thư mục `indieverse`.
3. Sao chép `.env.example` thành `.env`. Điền `DOMAIN` (chỉ tên miền, không có https://) và `ACME_EMAIL`. Chưa có tên miền thì chỉ chạy thử ở localhost; Caddy không thể cấp chứng chỉ cho tên miền ví dụ.
4. Chạy `docker compose up -d --build`. Caddy đứng trước Node, tự xin và gia hạn HTTPS. `PUBLIC_ORIGIN` phải chính xác với tên miền truy cập, nếu khác thì các thao tác lưu sẽ bị từ chối.
5. Tạo admin: `docker compose exec web npm run admin:create -- EMAIL-CUA-BAN`. Nhập mật khẩu khi được hỏi. Nếu quên mật khẩu, chạy lại lệnh bằng email cũ; tất cả phiên cũ bị thu hồi.
6. Mở `https://TEN-MIEN/admin`. Tạo thêm biên tập viên trong Tài khoản quản trị nếu cần. Admin được xuất bản và quản lý tài khoản; editor chỉ sửa nháp/tải ảnh/xem trước.
7. Thử đổi tiêu đề, tải ảnh, lưu nháp, xem trước, xuất bản rồi tải lại trang ngoài. Thử truy cập admin khi đã đăng xuất để xác nhận dữ liệu riêng không lộ.

## Nội dung quản trị

- Trang chủ: tên, lời dẫn, logo, bảng màu, menu, thứ tự 12 game, ảnh riêng của ba vị trí nổi bật; bật/tắt Play Lab và diễn đàn.
- Game: toàn bộ trường hồ sơ, Steam ID/link, ảnh bìa/ảnh nổi bật, bộ ảnh, điểm biên tập và bốn chương. Không đổi ID hoặc slug của game đã có để tránh hỏng liên kết; muốn đổi tên bài, sửa Tiêu đề.
- Góc indie, chuyên đề, tác giả, trang thông tin, dữ liệu Steam và các hồ sơ Game DNA/đề xuất.
- Kho ảnh PNG/JPEG/WebP (8 MB/tệp, 2 GB toàn kho), hộp góp ý, đăng ký bản tin, cảm nhận được lưu tại máy chủ, tài khoản quản trị, nhật ký thao tác.
- Bản nháp tách riêng bản công khai, kiểm tra xung đột khi hai cửa sổ cùng sửa. Giữ 30 bản xuất bản. Khôi phục tạo bản nháp để kiểm tra, không tự ghi đè trang công khai.

Không thể thay thuật toán hoặc bố cục tùy ý bằng CMS. Những thay đổi lập trình vẫn cần sửa mã. Cộng đồng Google/email/Steam dùng tích hợp riêng trong `COMMUNITY-SETUP.md`; CMS không tự cấp tài khoản OAuth hay thông tin nhà cung cấp. Bản sổ tay/Game DNA lưu localStorage vẫn thuộc từng trình duyệt, không giả thành dữ liệu đồng bộ. Hộp thư chỉ lưu tin nhắn; chưa gửi email.

## Lưu trữ, sao lưu và phục hồi

`indieverse_data` chứa `/data/indieverse.sqlite` (nội dung, tài khoản, nhật ký, phiên, dữ liệu cá nhân) và `/data/uploads` (ảnh). Không xóa volume khi cập nhật. Chỉ chạy **một** bản ứng dụng, không nhân bản nhiều container ghi cùng dữ liệu. Các truy vấn CMS dùng SQLite giao dịch; ứng dụng nhắm tới website cá nhân/nhóm nhỏ, chưa phải cụm nhiều máy chủ.

Chạy `docker compose exec web npm run backup`. Lệnh tạo bản sao nhất quán của SQLite bằng API backup, kèm uploads tại `/data/backups/THOI-DIEM`. Sao chép bản đó ra máy khác bằng `docker compose cp web:/data/backups/THOI-DIEM ./backups/THOI-DIEM`. Giữ bản sao riêng tư vì chứa dữ liệu cá nhân và mật khẩu đã băm. Tệp JSON tải ở Studio chỉ sao lưu nội dung, không thay thế sao lưu đầy đủ. Bản sao có thể chứa ảnh vừa tải mà chưa được tham chiếu; không xóa ảnh đang dùng khi sao lưu.

Phục hồi khi ứng dụng đã dừng ghi: `docker compose stop web`, sao chép database và uploads từ bản sao vào volume `indieverse_data` bằng container bảo trì cùng ảnh (UID 1000), thay cả cơ sở dữ liệu và thư mục ảnh. Xóa các tệp WAL/SHM cũ của database đã thay khi máy chủ đang dừng. Kiểm tra quyền sở hữu UID 1000 rồi `docker compose up -d web`. Luôn sao lưu hiện trạng trước và thực tập trên VPS thử nghiệm trước khi phục hồi bản thật.

## Cập nhật

Sao lưu, `git pull --ff-only`, `docker compose up -d --build`, rồi kiểm tra `docker compose ps` và `docker compose logs --tail 80 web caddy`. Không chạy `docker compose down -v` vì sẽ xóa volume. Theo dõi dung lượng đĩa và thiết lập sao lưu định kỳ ở nhà cung cấp VPS.

Tham khảo kỹ thuật: [Node SQLite](https://nodejs.org/docs/latest-v24.x/api/sqlite.html), [Caddy HTTPS](https://caddyserver.com/docs/automatic-https).
