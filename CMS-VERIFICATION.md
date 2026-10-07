# Kiểm tra Indieverse Studio — 07/10/2026

- Kiểm tra cú pháp và bộ test: xác thực, CSRF/Origin, phân quyền, nháp riêng, xung đột phiên bản, dữ liệu đầu vào, xuất bản, khôi phục, tải ảnh, từ chối SVG, lưu bền, xuất nội dung và thu hồi phiên.
- Bản GitHub Pages vẫn build được; backend không được đóng gói vào bản tĩnh.
- Cốc Cốc headless ở 1440 px và 390 px: đăng nhập, tất cả mục quản trị, sửa tiêu đề trang chủ, lưu nháp, xem trước, xuất bản, tải ảnh và chọn ảnh trang chủ. Không tràn ngang; không có lỗi JavaScript trên trang quản trị.
- Kiểm tra trang chủ, bài Core Keeper, hồ sơ Hoa, Góc indie, Chuyên đề, Mechanic Atlas, bộ tìm game và Rabbit Hole sau khi xuất bản.
- Đã xem ảnh chụp dashboard desktop và trang chỉnh giao diện mobile để kiểm tra chữ tiếng Việt và bố cục.

Giới hạn: chưa có VPS/tên miền và máy phát triển chưa có Docker; chưa chạy Docker Compose, DNS, cấp chứng chỉ HTTPS hoặc thử khôi phục volume trên máy chủ thật. OAuth/cộng đồng cần cấu hình nhà cung cấp. Đây không phải kết quả kiểm thử tải cao hay kiểm toán bảo mật độc lập.
