# hoc voi hanh

Công cụ đọc truyện tiếng Việt: bấm từng cụm từ để nghe audio + xem nghĩa, phát cả câu, phát cả bài, ẩn/hiện nghĩa tiếng Anh. Thuần HTML/CSS/JS — không backend, không database, deploy thẳng lên GitHub Pages.

```
.
├── index.html            # trang chủ (danh sách bài)
├── lesson.html           # trang đọc bài (?id=lesson1)
├── style.css
├── lessons/
│   ├── manifest.json     # danh sách bài hiện trên trang chủ
│   └── lesson1.json      # nội dung 1 bài
└── audio/
    └── lesson1/          # MP3 của bài (tên đặt theo quy ước)
        ├── full.mp3
        ├── sentence_01.mp3 …
        └── word_01.mp3 …
```

> Mở bằng cách nháy đúp file `index.html` sẽ **không** chạy được (trình duyệt chặn `fetch` JSON qua `file://`). Phải chạy qua web server — xem mục Deploy, hoặc chạy local: `python3 -m http.server` rồi mở `http://localhost:8000`.

---

## (a) Thêm bài mới

Ví dụ thêm `lesson2`:

1. **Copy** `lessons/lesson1.json` → `lessons/lesson2.json`. Sửa `id` thành `"lesson2"`, đổi `title`, `description`, và toàn bộ `sentences`. (Có thể xóa khối `_guide`.)
2. Trong mỗi câu, mọi `audio` đổi đường dẫn sang thư mục mới, ví dụ `audio/lesson2/word_01.mp3`.
3. **Thêm 1 mục** vào `lessons/manifest.json`:
   ```json
   { "id": "lesson2", "title": "...", "description": "...", "file": "lessons/lesson2.json" }
   ```
4. Tạo thư mục `audio/lesson2/` và bỏ các file MP3 vào (xem mục b).

Xong. Trang chủ tự hiện thẻ mới.

### Cấu trúc 1 cụm từ trong JSON
```json
{ "vi": "ăn phở", "en": "eat phở", "audio": "audio/lesson1/word_20.mp3" }
```
- `vi`: tiếng Việt có dấu (hiện to)
- `en`: nghĩa tiếng Anh (ẩn/hiện được)
- `audio`: MP3 đọc riêng cụm đó (bấm chip để phát)

Mỗi câu có thêm `translation` (nghĩa cả câu) và `audio` (MP3 cả câu). Bài có `fullAudio` (MP3 cả bài).

---

## (b) Đặt tên & đặt file audio

Tất cả MP3 của một bài nằm trong `audio/<id>/`. Quy ước tên:

| File | Nội dung |
|------|----------|
| `full.mp3` | đọc toàn bộ bài (nút "Cả bài") |
| `sentence_01.mp3`, `sentence_02.mp3`, … | đọc cả câu, đánh số theo thứ tự câu |
| `word_01.mp3`, `word_02.mp3`, … | đọc từng cụm, đánh số **tăng dần trên cả bài** (không reset mỗi câu) |

- Định dạng: **MP3**. Dùng đúng số 2 chữ số (`01`, không phải `1`).
- Đường dẫn trong JSON phải khớp tên file. Sai tên → bấm không ra tiếng (app không lỗi, chỉ log cảnh báo).
- File `audio/lesson1/_filenames.txt` liệt kê sẵn đúng tên + nội dung từng file để bạn thu cho đủ. Copy cách làm này cho bài mới.

---

## (c) Deploy GitHub Pages — 5 bước

1. Tạo repo trên GitHub, push toàn bộ thư mục này lên nhánh `main` (giữ nguyên cấu trúc, `index.html` ở gốc repo).
2. Vào **Settings → Pages**.
3. Mục **Source** chọn **Deploy from a branch**.
4. Chọn branch **main**, folder **/ (root)**, bấm **Save**.
5. Đợi ~1 phút, site lên tại `https://<tên-user>.github.io/<tên-repo>/`.

Mỗi lần `git push`, GitHub Pages tự cập nhật.
