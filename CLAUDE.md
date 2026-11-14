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
- **Gói 3** (tháng 7–9, xong): `packs/goi-3.js` — giao tiếp chủ động, stage k1–k6, 30 bài, mỗi bài có `rp` (đóng vai: `[[câu NPC, py, nghĩa, câu đáp, py, nghĩa]]`) → mục "🎭 Đóng vai" ở bước Nói thật + 2 câu trong bài kiểm tra (QT.rp, có nút 🎤).
- **Gói 4** (tháng 10–12, xong): `packs/goi-4.js` — nghe phim tốc độ thật, stage h1–h6, 24 bài, mỗi bài có `scene` dài → bước Nghe dùng câu thoại (l.S) ở tốc độ 1.05 + nghe–chép (QT.dict); kiểm tra có 1 câu nghe–chép. Tổng ~1940 từ (sau v8 dời từ lên bài dùng đầu tiên).
- Ý tưởng tiếp theo nếu người dùng muốn: Gói 5 (HSK 4), ôn tập tổng hợp cả năm.
- Danh sách gói: `js/packs.js` (đặt `ready:true`, `file`, `strokes`, `size` khi gói xong).

## Cấu trúc & quy ước
- `js/app.js`: toàn bộ logic (router hash, bài 5 bước Từ vựng → Nói thật → Nghe → Viết → Kiểm tra, SRS, TTS Web Speech zh-CN, nhận giọng nói, Hanzi Writer, gói, nhắc học .ics).
- Định dạng bài: `words:[chữ, pinyin, nghĩa, Hán Việt, (câu đọc)]`, `phrases:[câu, pinyin, nghĩa, ghi chú]`, `scene:{t, l:[[vai,câu,pinyin,nghĩa]]}`, `gram:{t,f,d,ex}`, `chars:'字:pīnyīn:nghĩa|…'`.
- Stage gói mới: `{ id, pack:N, zh, name, short, color, track:'main', requires:'stage trước', lessons:[…] }`, file gói `window.COURSE.push(...)` + `Object.assign(window.MEMO, {...})` cho mẹo nhớ chữ.
- **Không trùng từ** giữa các bài/gói (kiểm tra bằng script node trước khi chốt). Pinyin có dấu, ghi biến điệu thực tế của 不/一. Hán Việt chỉ ghi khi chắc chắn.
- Dữ liệu nét chữ: `data/strokes.json` (gói 1), `data/strokes-2.json` (gói 2), `strokes-3.json`, `strokes-4.json` — tạo từ npm `hanzi-writer-data`, chỉ chứa chữ chưa có ở file trước.
- **Mỗi lần sửa code phải tăng `VERSION` trong `sw.js`** (hiện `xiaobu-v8`).
- Thiết kế chống quên: buổi học = ôn thẻ cũ trước rồi bài mới; học 4 từ → kiểm tra ngay; mẹo nhớ chữ; ôn xen kẽ bài cũ trong bài kiểm tra; "Từ hay quên".
- Kiểm thử bằng Playwright + Chrome ở cỡ 390×844 (mobile) và 1440×1000.

## Góp ý người dùng (v7) — giữ nguyên các nguyên tắc này
- **Hán tự trước, pinyin sau**: pinyin mặc định ẩn (chạm để xem); bài thường không hỏi "chọn pinyin". Người dùng muốn nhớ mặt chữ, phản xạ bằng chữ Hán.
- **Không để chữ nào "lạ không nghĩa"**: mọi câu có "🔍 Từ trong câu" (segment() dùng từ các bài + `js/gloss.js`), từ chưa học gắn nhãn "mới". Thêm câu mới → chạy script tách từ, bổ sung gloss nếu thiếu.
- **Mẹo nhớ phải có nghĩa từng bộ phận**: memoHtml tự hiện "bộ phận = nghĩa" từ `js/comp.js` (+ từ 1 chữ). Mẹo mới dùng bộ phận lạ → thêm vào comp.js.
- Dạy từ đúng dạng dùng trong câu (dạy 妈妈 chứ không dạy 妈 rồi bắt ghép 妈+妈). Câu ghép (build) xếp theo **từ**, không theo chữ.
- Bước Viết đi tuần tự từng chữ (xem nét → tự viết → "Chữ tiếp"), không có nút "xong" dễ bấm nhầm.
- Âm thanh: máy nào phải dùng online thì nhớ lại (`S.audioPath`) và tải trước âm thanh của bài.
- v8: đã chạy rà toàn bộ (script /tmp/fixall.js-kiểu): từ xuất hiện trong câu mà chưa dạy → dời từ bài sau lên bài dùng đầu tiên (không dời từ khóa ngữ pháp) hoặc thêm từ gloss; số "từ mới" chưa dạy trong câu giảm 1673 → ~290 (mỗi bài tối đa 18 từ). chars (bước Viết) luôn lấy từ chữ có trong words của bài. Sửa nội dung xong phải tạo lại data/strokes*.json.
