# hoc voi hanh

Công cụ đọc truyện tiếng Việt + trang giải thích ngữ pháp (core inputs). Thuần HTML/CSS/JS, không backend, deploy thẳng lên GitHub Pages.

```
.
├── index.html          # trang chủ (danh sách bài, lọc theo cấp độ)
├── lesson.html         # trang đọc bài  (?id=lesson1)
├── input.html          # trang core input (?id=pronouns&level=mam)
├── style.css
├── manifest.json       # DANH SÁCH bài học (master index, ở gốc)
├── mam/                # cấp độ "mầm"  (choi/ = chồi, la/ = lá)
│   ├── lessons/lesson1.json
│   └── inputs/pronouns.json
└── audio/
    └── lesson1/        # audio của bài (đặt tên theo quy ước)
```

> Mở bằng nháy đúp index.html sẽ KHÔNG chạy (trình duyệt chặn fetch JSON qua file://). Chạy local: `python3 -m http.server` rồi mở http://localhost:8000. Hoặc deploy GitHub Pages.

## Cấp độ (level)
3 cấp: `mam` (mầm), `choi` (chồi), `la` (lá). Mỗi cấp là một thư mục ở gốc, bên trong có `lessons/` và `inputs/`. Đường dẫn suy ra tự động:
- Bài học:   <level>/lessons/<id>.json
- Core input: <level>/inputs/<id>.json

## (a) Thêm bài học mới
Ví dụ thêm `lesson2` cấp chồi:
1. Tạo choi/lessons/lesson2.json (copy từ mam/lessons/lesson1.json; sửa id, title, sentences).
2. Thêm 1 mục vào manifest.json ở gốc:
   { "id": "lesson2", "title": "...", "description": "...", "level": "choi" }
3. Thêm audio (mục b). Xong — trang chủ tự hiện thẻ; bấm "chồi" sẽ lọc ra bài này.

id phải DUY NHẤT trên toàn site (link là lesson.html?id=<id>).

## (b) Đặt tên & đặt file audio
Audio để trong audio/<id>/. Đường dẫn ghi thẳng trong JSON của bài (trường "audio") nên đặt đâu cũng được miễn khớp. Quy ước tên:
- full.m4a — đọc cả bài
- sentence_01.m4a, sentence_02.m4a… — mỗi câu/lượt
- word_01.m4a, word_02.m4a… — tăng dần trên cả bài (không reset mỗi câu)

Đuôi .m4a hay .mp3 đều phát được; chỉ cần đuôi trong JSON khớp file thật. Phân biệt hoa/thường, số 2 chữ số. Danh sách đầy đủ: audio/lesson1/_filenames.txt.

## (c) Thêm core input (trang giải thích)
1. Tạo <level>/inputs/<id>.json (copy mam/inputs/pronouns.json). Mỗi section có "label" (chữ trên badge) + "blocks". Block 3 kiểu: text, table (columns + rows), example (context + vi + en).
2. Gắn vào bài: trong file bài thêm trường:
   "inputs": [ { "id": "pronouns", "title": "Which pronouns to use?" } ]
   Nút điều hướng hiện ở trang bài, dẫn sang input.html. Input mặc định cùng cấp với bài; muốn khác thì thêm "level": "choi" vào mục input.

## (d) Deploy GitHub Pages — 5 bước
1. Push toàn bộ lên nhánh main (giữ nguyên cấu trúc, index.html ở gốc repo).
2. Settings → Pages.
3. Source → Deploy from a branch.
4. Branch main, folder / (root) → Save.
5. Đợi ~1 phút, site lên tại https://<user>.github.io/<repo>/.

Mỗi lần git push, Pages tự cập nhật (có thể chậm vài phút do cache CDN; thêm ?v=2 vào link CSS để né cache khi cần).
