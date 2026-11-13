# Xiǎobù 小步 — web học tiếng Trung giản thể (bối cảnh cho Claude)

Repo này chỉ chứa app học tiếng Trung (app POS cũ đã xóa theo yêu cầu người dùng, còn trong lịch sử git).

## Người dùng
- Người Việt, 25 tuổi, **hay quên**, từng học HelloChinese nhưng bỏ lâu. Trả lời bằng **tiếng Việt**.
- Mục tiêu: xem phim Trung, giao tiếp, đọc chữ đời thường. Học ~15 phút/ngày, chủ yếu trên **điện thoại**.
- Thích nội dung: phim **tiên hiệp / huyền huyễn**, **cổ trang**, **ngôn tình**, **Douyin**, **phim ngắn (短剧)**. Ưu tiên câu người Trung nói thật, không chỉ câu sách giáo khoa.
- Host bằng GitHub Pages (miễn phí), static, không build. Tiến độ lưu localStorage (`xiaobu.v1`).

## Lộ trình 1 năm = 4 gói (mỗi gói ~3 tháng)
- **Gói 1** (tháng 1–3, có sẵn): `js/data.js` (lộ trình chính: Pinyin, Sinh tồn, Đời sống, Đọc chữ, Nâng cao) + `js/data-phim.js` (chuyên đề: Thoại phim, Tiên hiệp, Cổ trang, Ngôn tình, Douyin, Phim ngắn). 50 bài.
- **Gói 2** (tháng 4–6, xong): `packs/goi-2.js` — ngữ pháp cốt lõi, 41 bài, mỗi bài có `gram`. Chỉ tải khi xong Gói 1 hoặc đạt ≥80% "Kiểm tra vượt gói".
- **Gói 3** (tháng 7–9, **CẦN LÀM TIẾP**): Giao tiếp chủ động — bài đóng vai (app hỏi, người học nói trả lời bằng nhận giọng nói / chọn câu đáp), kể chuyện về bản thân, nghe tốc độ thật. ~40 bài, ~500 từ mới (không trùng Gói 1–2).
- **Gói 4** (tháng 10–12): Nghe phim tốc độ thật — thoại dài, nghe-chép, chuyên đề phim nâng cao. Mục tiêu ~2000 từ tổng (≈HSK 3).
- Danh sách gói: `js/packs.js` (đặt `ready:true`, `file`, `strokes`, `size` khi gói xong).

## Cấu trúc & quy ước
- `js/app.js`: toàn bộ logic (router hash, bài 5 bước Từ vựng → Nói thật → Nghe → Viết → Kiểm tra, SRS, TTS Web Speech zh-CN, nhận giọng nói, Hanzi Writer, gói, nhắc học .ics).
- Định dạng bài: `words:[chữ, pinyin, nghĩa, Hán Việt, (câu đọc)]`, `phrases:[câu, pinyin, nghĩa, ghi chú]`, `scene:{t, l:[[vai,câu,pinyin,nghĩa]]}`, `gram:{t,f,d,ex}`, `chars:'字:pīnyīn:nghĩa|…'`.
- Stage gói mới: `{ id, pack:N, zh, name, short, color, track:'main', requires:'stage trước', lessons:[…] }`, file gói `window.COURSE.push(...)` + `Object.assign(window.MEMO, {...})` cho mẹo nhớ chữ.
- **Không trùng từ** giữa các bài/gói (kiểm tra bằng script node trước khi chốt). Pinyin có dấu, ghi biến điệu thực tế của 不/一. Hán Việt chỉ ghi khi chắc chắn.
- Dữ liệu nét chữ: `data/strokes.json` (gói 1), `data/strokes-2.json` (gói 2) — tạo từ npm `hanzi-writer-data`, chỉ chứa chữ chưa có ở file trước.
- **Mỗi lần sửa code phải tăng `VERSION` trong `sw.js`** (hiện `xiaobu-v5`).
- Thiết kế chống quên: buổi học = ôn thẻ cũ trước rồi bài mới; học 4 từ → kiểm tra ngay; mẹo nhớ chữ; ôn xen kẽ bài cũ trong bài kiểm tra; "Từ hay quên".
- Kiểm thử bằng Playwright + Chrome ở cỡ 390×844 (mobile) và 1440×1000.
