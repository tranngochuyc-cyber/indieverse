# Indieverse trên indieverse.id.vn

Website đang được xuất bản bằng GitHub Pages tại [https://indieverse.id.vn/](https://indieverse.id.vn/). Địa chỉ `tranngochuyc-cyber.github.io/indieverse/` chuyển hướng về tên miền riêng. Tệp tĩnh phải dùng đường dẫn từ gốc `/`; nếu còn tiền tố `/indieverse/`, CSS và JavaScript sẽ trả 404.

Workflow `.github/workflows/pages.yml` chạy kiểm tra cú pháp, kiểm thử, làm mới bảng Steam khi nguồn sẵn sàng, dựng `dist/`, kiểm tra đường dẫn và triển khai. `build-pages.cjs` đặt `INDIEVERSE_BASE` rỗng cho tên miền riêng và tạo `CNAME`. Nếu chuyển lại sang project URL của GitHub Pages không dùng tên miền riêng, đặt `INDIEVERSE_PAGES_BASE=/indieverse` khi dựng.

Sau mỗi lần triển khai, mở trang chủ, `/games`, `/reviews/hoa` và một trang Góc indie trên máy tính lẫn điện thoại. Kiểm tra Console/Network: `catalog.json`, CSS, JavaScript và ảnh nội bộ phải tải; đường dẫn bài trực tiếp dùng `404.html` để khởi động ứng dụng. Chờ workflow hoàn tất trước khi đánh giá bản công khai, vì GitHub Pages có thể còn đang phục vụ bản cũ.

GitHub Pages **không chạy Node.js, SQLite hoặc Studio `/admin`**. Thư viện, hồ sơ và ghi chú ở bản Pages lưu trong `localStorage` của từng trình duyệt; không đồng bộ giữa thiết bị. Biểu mẫu liên hệ và tài khoản cộng đồng cần dịch vụ backend riêng trước khi có thể nhận dữ liệu thật. Nhánh `backup/indieverse-pre-restore-2026-10-24` lưu mã CMS trước lần khôi phục bản tĩnh, nhưng không phải máy chủ đang chạy trên tên miền. Muốn quản trị và đồng bộ công khai tại cùng tên miền, cần triển khai ứng dụng Node trên VPS, chuyển DNS và kiểm thử lại theo `DEPLOYMENT.md` của nhánh CMS; đổi DNS đơn thuần không thêm backend cho GitHub Pages.
