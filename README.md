# Indieverse

Website tiếng Việt review game indie 2D/3D. Chạy bằng Node.js 20 trở lên, không cần cài thư viện.

```sh
npm run dev
```

Mở http://localhost:5173. `npm run check` kiểm tra cú pháp; `npm test` kiểm tra API, đường dẫn trực tiếp, dữ liệu sau khi khởi động lại và tách biệt phiên người dùng.

## GitHub Pages

`npm run build:pages` tạo website tĩnh trong `dist/`. Workflow tại `.github/workflows/pages.yml` tự xây dựng và xuất bản khi có thay đổi trên nhánh `main`. Để có địa chỉ `https://tranngochuyc-cyber.github.io/`, kho mã cần mang đúng tên `tranngochuyc-cyber.github.io` và GitHub Pages cần dùng nguồn **GitHub Actions**.

GitHub Pages không chạy máy chủ Node.js. Bản công khai lưu sổ tay, hồ sơ, cảm nhận và bộ sưu tập bằng `localStorage` trong trình duyệt. Các dữ liệu này không đồng bộ hay công khai. Trang liên hệ và bản tin hiển thị rõ là chưa có dịch vụ nhận thư. Các đường dẫn bài trực tiếp dùng `404.html` làm lối vào ứng dụng một trang.

## Các trang

- Trang chủ, kho 250 game với tìm kiếm, bộ lọc, sắp xếp và phân trang.
- Chi tiết từng game: thông tin Steam, artwork, review và nhật ký.
- Danh sách review và 250 bài chi tiết: mục lục, ưu/nhược điểm, điểm biên tập minh họa ở các bài gốc, tác giả và cảm nhận cá nhân.
- Bộ sưu tập biên tập và bộ sưu tập tự tạo, chỉnh sửa, chọn game.
- Thư viện cá nhân: trạng thái chơi, điểm, ghi chú, tìm kiếm, bảng hành trình/danh sách và xuất JSON.
- Hồ sơ, cài đặt, tác giả, Góc indie với bộ gợi ý, so sánh hai game và sáu chuyên đề, tìm kiếm toàn trang.
- Giới thiệu, liên hệ, FAQ, cách chấm điểm, quyền riêng tư và trang 404.

## Dữ liệu và giới hạn bản cục bộ

Máy chủ lưu thư viện, hồ sơ, bộ sưu tập và cảm nhận trong `data/store.json`; cookie phiên phân biệt trình duyệt. Dữ liệu tồn tại sau khi tải lại trang và khởi động lại máy chủ. Đây chưa phải tài khoản đăng nhập đồng bộ nhiều thiết bị. Cảm nhận là nhật ký cá nhân, không giả lập một cộng đồng công khai.

Biểu mẫu liên hệ và đăng ký bản tin lưu dữ liệu tại máy này, thông báo rõ chưa gửi email. Để triển khai công khai cần xác thực tài khoản, cơ sở dữ liệu dùng chung, dịch vụ email, chống spam và vận hành bảo mật. Máy chủ hiện chỉ lắng nghe 127.0.0.1.

Nội dung biên tập, tác giả và điểm số là dữ liệu minh họa. Thông tin phát hành dẫn nguồn Steam; hình ảnh tải từ Steam và các trang nhà phát triển nên cần kết nối internet. Phông chữ Google có phông hệ thống dự phòng.

## Thiết kế

Lấy cảm hứng từ giao diện thư viện tối của Infinite Backlog, bảng màu nhấn và luồng đọc review của Checkpoint Gaming, danh sách bài và sidebar của Indie Hive. Không sao chép thương hiệu hoặc nội dung của các trang tham khảo. Infinite Backlog không hiển thị nội dung đầy đủ trong môi trường khảo sát.

Quy tắc nghiệm thu cho thay đổi sau nằm trong QUALITY.md: kiểm tra các trang bên trong, điều hướng, trạng thái dữ liệu và màn hình di động; không nghiệm thu chỉ bằng landing page.

## Bản chỉnh sửa 27/09/2026

Giữ nguyên trang Khám phá và 12 tựa gốc. Danh mục hiện có 42 game (thêm 30) với lọc nguồn gốc studio. Các trang bên trong được xây lại: atlas game/hồ sơ trải nghiệm, phòng đọc, lộ trình có lời dẫn, sổ tay theo trạng thái, hồ sơ hành trình, bàn tác giả và các bài Góc indie độc lập.

42 bài có lời mở riêng, bốn chương phân tích, nhận định phù hợp/cần cân nhắc và ít nhất ba ảnh minh họa riêng được dẫn nguồn. Logo mở đầu có nút bỏ qua, tự đóng, tôn trọng reduced motion và có thể xem lại trong cài đặt. Có chuyển trang, xuất hiện khi cuộn, hover, tiến độ đọc và mục lục theo chương.

Ảnh lấy từ Steam và trang của nhà phát triển/nhà phát hành; ảnh Raji được ghi rõ là hình môi trường giai đoạn phát triển. Các bài và bút danh là nội dung biên tập minh họa. 30 tựa mới không được gán điểm giả.

## Bản mở rộng 100 game — 27/09/2026

Giữ 42 tựa hiện có và thêm 58 game khác nhau. Mỗi tựa mới có bốn chương riêng, lưu ý phù hợp/cần cân nhắc, nguồn Steam và ít nhất ba hình minh họa chính thức; không gán điểm mẫu cho các tựa mới. Ảnh artwork được ghi đúng loại, không gọi thành ảnh gameplay.

Atlas có sáu khu vực được ghi tên và 27 lựa chọn nguồn gốc studio; trên điện thoại dùng nút khu vực dễ đọc. Chọn nơi hoặc phân trang đưa tới kết quả. Góc indie cung cấp gợi ý theo ý định, 2D/3D và Co-op, cùng bàn so sánh hai game. Sáu bài Chuyện ngoài màn hình đều tập trung vào game của bài, có bốn chương, mục lục và ba ảnh. Ba bài trang chủ được thiết kế lại; các khối Khám phá còn lại giữ nguyên.

Chuẩn hóa tiếng Việt NFC, dùng phông hỗ trợ dấu cho cả tiêu đề và nội dung, bỏ kiểu serif gây dấu bị lệch. Tăng sáng nhẹ nền và panel trong bảng màu tím/hổ phách hiện có.

## Cập nhật v6 — 27/09/2026
- Danh mục 150 tựa: giữ 100 hồ sơ cũ, thêm 50 hồ sơ có bốn chương và ba artwork chính thức riêng. Hồ sơ mới chưa chấm điểm, ghi rõ nội dung biên tập minh họa.
- Điều hướng Bộ sưu tập đổi thành Chuyên đề. Trang đọc được ngay không cần tạo danh sách; có tám chuyên đề biên tập, ba chuyên đề mới giới thiệu game của đợt mở rộng.
- Hai thế giới, một ý tưởng: ba cặp game, liên kết URL giữ lựa chọn khi tải lại và Back/Forward.
- Kho game dùng sáu thẻ khu vực có ảnh, danh sách quốc gia mở/đóng và lọc nguồn gốc studio.
- Chữ bài sáng hơn, mục lục desktop rộng 320px, chuyển về khối dọc trên điện thoại.
