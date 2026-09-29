# Kết nối cộng đồng Indieverse

Bản GitHub Pages vẫn hoạt động độc lập. Các nút đăng nhập/đăng bài chỉ được mở khi cấu hình dịch vụ; không có tài khoản mẫu hay đánh giá giả. Sổ tay và hành trình khám phá đang lưu riêng trong trình duyệt, chưa đồng bộ theo tài khoản.

## Email và Google

1. Tạo dự án Supabase do bạn sở hữu. Chạy `backend/community.sql` một lần trong SQL Editor của dự án mới. Bảng có Row Level Security: khách được đọc, người đăng nhập chỉ được tạo/xóa bài thuộc chính tài khoản mình.
2. Trong Authentication → URL Configuration, thêm Site URL `https://tranngochuyc-cyber.github.io/indieverse/` và Redirect URL `https://tranngochuyc-cyber.github.io/indieverse/login`. Khi thử local thêm `http://localhost:5174/indieverse/login`.
3. Bật Email, cấu hình SMTP để gửi thư cho người dùng thực tế. Luồng hiện dùng liên kết đăng nhập, không thu mật khẩu.
4. Bật Google provider. Tạo OAuth web client trong Google Cloud. Origin là `https://tranngochuyc-cyber.github.io`; callback lấy từ trang Google provider của Supabase. Client secret chỉ nhập trong Supabase, tuyệt đối không ghi vào repository.
5. Điền URL dự án và **publishable key** (hoặc anon key dành cho trình duyệt) vào `community-config.js`. Không dùng service-role key. Chạy kiểm thử, build và xuất bản.
6. Thử hai tài khoản khác nhau: đăng nhập email/Google, đăng bài, đọc ở trình duyệt thứ hai, từ chối giả mạo user_id, từ chối xóa bài người khác, đăng xuất. Kiểm tra thư rác và callback không thất lạc đường dẫn `/indieverse`.

Nguồn: [Google OAuth với Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google), [Đăng nhập email](https://supabase.com/docs/guides/auth/auth-email-passwordless).

## Steam — chưa hoàn thành cổng xác thực

Steam dùng OpenID, không phải provider Google của Supabase. `steamLoginUrl` được để trống có chủ đích. Chưa được bật chỉ bằng cách dán URL Steam vào đây.

Cổng máy chủ cần: tạo state một lần gắn phiên; chuyển tới Steam OpenID; xác minh assertion trực tiếp với Steam; kiểm tra return_to, realm, nonce chống phát lại và claimed_id đúng miền Steam; đổi danh tính đã xác minh thành phiên của dịch vụ cộng đồng. Không tin Steam ID từ query string. Không đưa khóa quản trị ra frontend. Phần cổng này còn phải triển khai và kiểm thử trước khi bật nút Steam.

Nguồn: [Steam Web API và OpenID](https://steamcommunity.com/dev).

## Trạng thái triển khai

- Đã viết connector Google/email và đọc/đăng reviews/topics/replies; chưa kiểm thử với dự án Supabase thật vì chưa có cấu hình.
- Bộ SQL dành cho dự án mới, cần chạy và kiểm thử RLS thực tế trước khi phát hành cộng đồng.
- Chưa có giao diện quản trị/moderation, báo cáo bài, sửa bài hoặc đồng bộ sổ tay. Chủ dự án có thể quản lý dữ liệu trong dashboard khi thử nghiệm.
- Steam, vote Game Battle và phiếu Comeback còn chờ triển khai; không có số liệu cộng đồng giả.
