# Indieverse

**Chơi và đọc trực tuyến:** [Mở website Indieverse ↗](https://tranngochuyc-cyber.github.io/indieverse/)

## Bản mở rộng trải nghiệm — 29/09/2026

Danh mục giữ 250 game. Các bài có ảnh chụp màn chơi khác nhau từ trang Steam; OXENFREE dùng bốn ảnh từ press kit của Night School Studio, The Rewinder dùng bảy ảnh do nhà phát hành cung cấp trên Nintendo. Bản desktop được thu gọn, nhưng cỡ chữ bài và vùng chạm trên điện thoại vẫn dễ đọc. Bài game có liên kết Steam ở cuối và khu vực thảo luận riêng.

Play Lab gồm bộ tìm game theo thời gian/tâm trạng, Game DNA từ dữ liệu sổ tay, atlas cơ chế, gợi ý giữ/loại một đặc điểm, hành trình khám phá, demo mỗi ngày, nhật ký theo giờ chơi, lý do bỏ dở, Radar và so sánh hai game. Những suy luận sở thích là gợi ý biên tập dựa trên 24 hồ sơ game; không có chỉ số hay phiếu bầu cộng đồng giả. Kho game có bảng Steam Most Played theo ảnh chụp thời điểm và nút chuyển game.

Nhánh Art của Rabbit Hole đối chiếu nhãn phong cách hình ảnh được biên tập cho 24 game. Game Battle đặt các đặc tính đó cạnh nhau theo thang mô tả 0–5; đây không phải điểm chất lượng hay bình chọn người chơi.

Trang đăng nhập và khu đánh giá/thảo luận công khai đã có giao diện, connector và schema Supabase. Chưa có dự án Supabase của chủ website nên Google/email/diễn đàn công khai được khóa và ghi rõ trạng thái. Steam cần cổng xác thực riêng, chưa hoạt động. Xem [COMMUNITY-SETUP.md](COMMUNITY-SETUP.md) để kết nối và kiểm thử trước khi bật. Sổ tay, Game DNA, các lựa chọn khám phá hiện chỉ lưu trên trình duyệt đang dùng.

Website tiếng Việt review game indie 2D/3D. Chạy bằng Node.js 20 trở lên, không cần cài thư viện.

```sh
npm run dev
```

Mở http://localhost:5173. `npm run check` kiểm tra cú pháp; `npm test` kiểm tra API, đường dẫn trực tiếp, dữ liệu sau khi khởi động lại và tách biệt phiên người dùng.

## GitHub Pages

`npm run build:pages` tạo website tĩnh trong `dist/`. Workflow tại `.github/workflows/pages.yml` tự xây dựng và xuất bản khi có thay đổi trên nhánh `main`. Kho mã `indieverse` xuất bản tại [tranngochuyc-cyber.github.io/indieverse](https://tranngochuyc-cyber.github.io/indieverse/); GitHub Pages dùng nguồn **GitHub Actions**.

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
