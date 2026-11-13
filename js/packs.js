/* =====================================================================
   DANH SÁCH GÓI HỌC (lộ trình 1 năm, mỗi gói ~3 tháng)
   Gói 1 có sẵn trong app. Các gói sau chỉ được TẢI VỀ khi gói trước đã xong
   (hoặc vượt bài kiểm tra gói ≥ 80%) → mở web nhanh hơn, tiết kiệm dữ liệu.
   ===================================================================== */
window.PACKS = [
  { id: 1, name: 'Gói 1', months: 'Tháng 1–3', title: 'Nền tảng & thế giới phim',
    desc: 'Pinyin, giao tiếp sinh tồn, đời sống, đọc chữ + chuyên đề tiên hiệp, cổ trang, ngôn tình, Douyin, phim ngắn.',
    builtin: true },
  { id: 2, name: 'Gói 2', months: 'Tháng 4–6', title: 'Ngữ pháp cốt lõi & từ thông dụng',
    desc: '41 bài · ~540 từ · 41 điểm ngữ pháp (了, 过, 把, 被, bổ ngữ, câu phức…) — tự đặt được câu, không chỉ học thuộc cụm.',
    file: 'packs/goi-2.js', strokes: 'data/strokes-2.json', size: '≈ 120 KB', ready: true },
  { id: 3, name: 'Gói 3', months: 'Tháng 7–9', title: 'Giao tiếp chủ động',
    desc: 'Bài đóng vai (app hỏi – bạn nói), kể chuyện về bản thân, nghe tốc độ thật.',
    ready: false },
  { id: 4, name: 'Gói 4', months: 'Tháng 10–12', title: 'Nghe phim tốc độ thật',
    desc: 'Thoại phim dài, nghe – chép chính tả, chuyên đề phim nâng cao. Mục tiêu ~HSK 3.',
    ready: false }
];
