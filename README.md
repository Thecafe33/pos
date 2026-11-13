# Xiǎobù 小步 — Tiếng Trung giản thể 15 phút mỗi ngày

Web app học tiếng Trung giản thể cho người Việt. Mục tiêu: **xem phim Trung, giao tiếp và đọc chữ đời thường**.
Web tĩnh (HTML/CSS/JS thuần), không cần build, chạy miễn phí trên **GitHub Pages**, tối ưu cho điện thoại.

## Lộ trình 1 năm chia thành 4 gói

| Gói | Thời gian | Nội dung | Trạng thái |
|---|---|---|---|
| **Gói 1** | Tháng 1–3 | Nền tảng + chuyên đề phim (50 bài, ~570 từ) | ✅ có sẵn |
| **Gói 2** | Tháng 4–6 | Ngữ pháp cốt lõi & từ thông dụng (41 bài, ~540 từ, 41 điểm ngữ pháp) | ✅ có sẵn, tải khi xong Gói 1 |
| Gói 3 | Tháng 7–9 | Giao tiếp chủ động (đóng vai, kể chuyện) | 🛠️ đang soạn |
| Gói 4 | Tháng 10–12 | Nghe phim tốc độ thật | 🛠️ đang soạn |

- Lần đầu mở web, app chỉ tải **Gói 1**. Gói 2 nằm ở file riêng (`packs/goi-2.js`) và **chỉ được tải về khi bạn đã xong toàn bộ Gói 1**, hoặc đạt từ 80% bài **Kiểm tra vượt gói**. Nhờ vậy web mở nhanh và tốn ít dữ liệu hơn.
- Khi Gói 2 đã mở, từ vựng của cả 2 gói vẫn được ôn chung trong phần Ôn tập.
- Web lưu đệm (service worker) nên các lần mở sau rất nhanh, mạng yếu vẫn dùng được. **Khi sửa code**, hãy tăng số `VERSION` trong `sw.js` (ví dụ `xiaobu-v4`) để điện thoại tải bản mới.

## Có gì bên trong

- **11 chặng, 50 bài** (~570 từ, ~315 câu), chia làm 2 nhánh:
  - **Lộ trình chính** (học lần lượt): Pinyin → Giao tiếp sinh tồn → Đời sống & cảm xúc → Đọc chữ đời thường → Nâng cao.
  - **Chuyên đề phim & mạng xã hội** (mở sau chặng Pinyin, học song song): Thoại phim cơ bản · **Tiên hiệp – Huyền huyễn** · **Cổ trang – Cung đấu** · **Ngôn tình hiện đại** · **Douyin** (câu cửa miệng, livestream, meme, review quán) · **Phim ngắn** (trọng sinh, vả mặt, tổng tài).
- Các bài chuyên đề có **🎬 cảnh hội thoại ngắn**: nghe cả cảnh, đoán nghĩa trước rồi mới mở phần dịch.
- Mỗi bài khoảng 15 phút, gồm 5 bước: **Từ vựng → Nói thật → Nghe → Viết → Kiểm tra** (đúng ≥ 70% thì mở bài tiếp theo).
- **Câu người Trung nói thật**: mỗi câu có ghi chú 💬 so sánh với câu sách giáo khoa, kèm meme và tiếng lóng.
- **Phát âm**: dùng giọng đọc tiếng Trung có sẵn trên máy, có nút 🐢 nghe chậm. Bấm 🎤 để app chấm phát âm (gần đúng, trên Chrome/Safari).
- **Âm Hán Việt** cho từ vựng, giúp người Việt nhớ nhanh (bật/tắt trong Cài đặt).
- **Thiết kế cho người hay quên**:
  - Nút ▶ **Buổi học hôm nay** gồm 2 bước: ôn thẻ cũ đến hạn trước (tối đa 12 thẻ), sau đó học bài mới.
  - Học từ theo **nhóm 4 từ**, sau mỗi nhóm có kiểm tra nhanh. Từ nào sai sẽ được ôn lại ngay.
  - **🧠 Mẹo nhớ chữ** (chiết tự, khoảng 170 chữ) hiện trên thẻ từ, ở bước Viết và khi bạn trả lời sai.
  - Bài kiểm tra mỗi bài có **🔁 câu ôn xen kẽ từ bài cũ**.
  - Mục **🧩 Từ hay quên** gom các từ đã sai từ 2 lần trở lên.
  - **⏰ Nhắc học hằng ngày** qua lịch điện thoại (file .ics hoặc Google Calendar).
  - Nếu bỏ học vài ngày, app chào lại và ưu tiên cho ôn bài cũ trước.
  - **Kiểm tra nhảy cóc**: đạt từ 80% bài kiểm tra chặng thì có thể đánh dấu cả chặng là đã học (dành cho người đã từng học trước đây).
- **Ôn tập lặp lại ngắt quãng (SRS)**: từ đã học sẽ quay lại đúng lúc bạn sắp quên. Có 3 chế độ: nhìn chữ / nghe / Việt → Trung.
- **Tập viết chữ Hán**: xem thứ tự nét và vẽ bằng ngón tay (Hanzi Writer). Dữ liệu nét của các chữ trong giáo trình đã có sẵn trong repo (`data/strokes.json`), chữ khác sẽ tự tải từ CDN.
- **Luyện tai thanh điệu**, bảng pinyin có so sánh với âm tiếng Việt, **Kiểm tra chặng** 15 câu.
- **Tự lưu tiến độ** (localStorage). Có chuỗi ngày học 🔥, vòng phút học mỗi ngày, XP và cấp độ.
- **Sao lưu / khôi phục**: tải file JSON hoặc copy “mã sao lưu” để chuyển sang máy khác.
- Font **Noto Sans SC**: nét rõ, đúng chuẩn chữ giản thể, không bị lẫn font Nhật.

## Đưa lên GitHub Pages (5 phút)

1. Tạo repo mới trên GitHub, ví dụ `hoc-tieng-trung`, để chế độ **Public** (GitHub Pages miễn phí cần repo public).
2. Bấm **Add file → Upload files**, kéo **toàn bộ nội dung** của thư mục này vào (gồm `index.html`, `sw.js`, `css/`, `js/`, `packs/`, `data/`, `icons/`, `manifest.webmanifest`, `.nojekyll`). Sau đó bấm **Commit changes**. Nếu repo đã có bản cũ, cứ upload đè lên: tiến độ học trên máy vẫn được giữ nguyên.
   - File `.nojekyll` bị ẩn trên máy Mac/Windows. Nếu không thấy, có thể bỏ qua, web vẫn chạy.
3. Vào **Settings → Pages**. Ở mục *Source* chọn **Deploy from a branch**, branch `main`, thư mục `/ (root)`, rồi bấm **Save**.
4. Đợi 1–2 phút, web sẽ có ở địa chỉ `https://<tên-github>.github.io/hoc-tieng-trung/`.

### Cài như app trên điện thoại
- **iPhone (Safari)**: mở link → nút Chia sẻ → **Thêm vào MH chính**.
- **Android (Chrome)**: mở link → menu ⋮ → **Thêm vào màn hình chính** / **Cài đặt ứng dụng**.

### Nếu không nghe được tiếng
App dùng giọng đọc của thiết bị. Nếu máy chưa có giọng tiếng Trung:
- **iPhone**: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Trung (Trung Quốc đại lục) → tải một giọng.
- **Android**: Cài đặt → Quản lý chung → Ngôn ngữ → Chuyển văn bản thành giọng nói → Google → cài Tiếng Trung.
- Kiểm tra nút gạt im lặng trên iPhone (đang ở chế độ im lặng thì không nghe thấy).

## Lưu ý về tiến độ
Tiến độ được lưu **trên trình duyệt của từng máy**. Nếu học trên cả điện thoại lẫn máy tính, hoặc trước khi xóa dữ liệu trình duyệt, hãy vào **Cài đặt → Sao lưu tiến độ**.

## Thêm bài học mới
Mở `js/data.js` (hoặc `js/data-phim.js`) và copy một bài có sẵn, sau đó sửa:
```js
{ id:'g1', zh:'旅游', title:'Du lịch', sub:'订酒店 · 景点', desc:'Mô tả ngắn',
  words:[ ['酒店','jiǔdiàn','khách sạn','tửu điếm'], ... ],      // [chữ, pinyin, nghĩa, Hán Việt]
  phrases:[ ['我想订一间房。','Wǒ xiǎng dìng yì jiān fáng.','Tôi muốn đặt một phòng.','ghi chú'] ],
  scene:{ t:'Tên cảnh', l:[ ['Vai','câu','pinyin','nghĩa'], ... ] },   // tùy chọn
  gram:{ t:'Tên điểm ngữ pháp', f:'công thức', d:'giải thích', ex:[['câu','pinyin','nghĩa']] }, // tùy chọn
  chars:'酒:jiǔ:rượu|店:diàn:tiệm' }                            // chữ cho bước Viết
```
`id` của mỗi bài phải khác nhau. Nếu một chữ ở bước Viết chưa có trong `data/strokes.json`, app sẽ tự tải dữ liệu nét từ CDN.

## Cấu trúc
```
index.html            khung trang
css/style.css         giao diện (desktop + điện thoại)
js/packs.js           danh sách 4 gói của lộ trình 1 năm
js/data.js            Gói 1 · lộ trình chính
js/data-phim.js       Gói 1 · chuyên đề phim, tiên hiệp, ngôn tình, Douyin, phim ngắn
packs/goi-2.js        Gói 2 · ngữ pháp & từ thông dụng (chỉ tải khi mở gói)
sw.js                 lưu đệm để mở nhanh, tiết kiệm dữ liệu
js/memo.js            mẹo nhớ chữ (chiết tự)
js/app.js             logic: lộ trình, bài học, quiz, SRS, phát âm, lưu tiến độ
js/vendor/            Hanzi Writer (MIT)
data/strokes*.json    dữ liệu nét chữ theo gói (Arphic Public License, xem data/ARPHICPL.TXT)
icons/, manifest      icon và cấu hình "thêm vào màn hình chính"
```

Ghi công: [Hanzi Writer](https://hanziwriter.org) (MIT) · dữ liệu nét từ dự án Make Me a Hanzi / Arphic (Arphic Public License).
