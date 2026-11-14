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
    desc: '30 bài · ~370 từ · đóng vai 130+ lượt (app hỏi – bạn chọn câu đáp rồi nói to): bản thân, du lịch, bạn bè, tình cảm, công việc, nêu ý kiến.',
    file: 'packs/goi-3.js', strokes: 'data/strokes-3.json', size: '≈ 75 KB', ready: true },
  { id: 4, name: 'Gói 4', months: 'Tháng 10–12', title: 'Nghe phim tốc độ thật',
    desc: '24 bài · 24 cảnh thoại dài tốc độ thật + nghe – chép: tiên hiệp, cung đấu, ngôn tình, phim ngắn, Douyin, đời thường. Tổng ~1900 từ (≈ HSK 3).',
    file: 'packs/goi-4.js', strokes: 'data/strokes-4.json', size: '≈ 65 KB', ready: true }
];
