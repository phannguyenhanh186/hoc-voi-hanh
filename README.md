# Học với Hạnh 🇻🇳
**Website luyện nghe & ôn từ vựng tiếng Việt cho người nước ngoài**

---

## 🚀 5 bước deploy lên GitHub Pages

### Bước 1 — Tạo repository trên GitHub
1. Đăng nhập [github.com](https://github.com), nhấn **New repository**
2. Đặt tên repo (ví dụ: `hoc-voi-hanh`), chọn **Public**, nhấn **Create**

### Bước 2 — Upload toàn bộ file
**Cách A — Kéo thả (dễ nhất):**
1. Vào repo vừa tạo → nhấn **Add file → Upload files**
2. Kéo thả toàn bộ thư mục vào ô upload
3. Nhấn **Commit changes**

**Cách B — Dùng Git:**
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TÊN_BẠN/TÊN_REPO.git
git push -u origin main
```

### Bước 3 — Bật GitHub Pages
1. Vào repo → **Settings** → **Pages** (cột trái)
2. Source: chọn **Deploy from a branch**
3. Branch: chọn **main**, thư mục **/ (root)**
4. Nhấn **Save**

### Bước 4 — Chờ 1–2 phút
GitHub Pages sẽ build và gửi email xác nhận.

### Bước 5 — Truy cập website
URL có dạng:
```
https://TÊN_BẠN.github.io/TÊN_REPO/
```
Ví dụ: `https://hanh.github.io/hoc-voi-hanh/`

---

## ➕ Cách thêm bài học mới

### 1. Tạo file JSON
Sao chép file `lessons/lesson1.json`, đổi tên thành `lessons/lesson2.json`.

Chỉnh các trường sau:
```json
{
  "title": "Bài 2: Đặt bàn ở nhà hàng",
  "description": "Học cách gọi món và hỏi giá.",
  "level": "Sơ cấp (A1)",
  "audio_file": "audio/lesson2.mp3",
  "sentences": [
    {
      "vietnamese": "Tôi muốn đặt bàn.",
      "english": "I would like to reserve a table.",
      "chunks": [
        { "word": "Tôi muốn", "meaning": "I would like" },
        { "word": "đặt bàn",  "meaning": "reserve a table" }
      ]
    }
  ]
}
```

### 2. Đăng ký bài mới trong `index.html`
Mở `index.html`, tìm đoạn `const LESSONS = [` và thêm dòng:
```js
const LESSONS = [
  { file: 'lessons/lesson1.json' },
  { file: 'lessons/lesson2.json' },  // ← thêm dòng này
];
```

### 3. Upload lên GitHub
Kéo thả file mới vào repo hoặc dùng `git add . && git commit -m "add lesson 2" && git push`.

---

## 🎵 Cách thêm / thay file audio

### Cấu trúc thư mục audio
```
audio/
  lesson1.mp3    ← audio toàn bài lesson 1
  lesson2.mp3    ← audio toàn bài lesson 2
```

### Các bước
1. Chuẩn bị file MP3 hoặc WAV (ghi âm giọng đọc thật của giáo viên)
2. Đặt tên file rõ ràng: `lesson1.mp3`, `lesson2.mp3`, ...
3. Upload vào thư mục `audio/` trên GitHub
4. Trong file JSON, đặt đường dẫn:
   ```json
   "audio_file": "audio/lesson1.mp3"
   ```
5. Nếu chưa có audio, để trống (`""`) hoặc xóa dòng đó — website sẽ tự dùng giọng đọc máy (TTS) thay thế.

### Lưu ý định dạng audio
| Định dạng | Chrome | Firefox | Safari |
|-----------|--------|---------|--------|
| MP3       | ✅     | ✅      | ✅     |
| WAV       | ✅     | ✅      | ✅     |
| OGG       | ✅     | ✅      | ❌     |

→ **Khuyến nghị dùng MP3** để tương thích mọi trình duyệt.

---

## 📁 Cấu trúc thư mục

```
hoc-voi-hanh/
├── index.html          ← Trang chủ, danh sách bài học
├── lesson.html         ← Template bài học (dùng chung)
├── style.css           ← Toàn bộ CSS
├── lessons/
│   ├── lesson1.json    ← Dữ liệu bài 1
│   └── lesson2.json    ← Dữ liệu bài 2 (thêm khi cần)
└── audio/
    ├── lesson1.mp3     ← Audio bài 1 (tùy chọn)
    └── lesson2.mp3     ← Audio bài 2 (tùy chọn)
```

---

## ❓ Câu hỏi thường gặp

**Q: Tôi không có file audio, website có hoạt động không?**  
A: Có. Khi không có audio, website sẽ dùng Web Speech API (TTS) để đọc từng cụm từ khi học sinh click vào. Chất lượng giọng đọc phụ thuộc vào trình duyệt và hệ điều hành.

**Q: Làm sao thêm phiên âm IPA?**  
A: Thêm trường `"ipa"` vào mỗi chunk trong JSON:
```json
{ "word": "xin chào", "meaning": "hello", "ipa": "sin tʂàːw" }
```
Sau đó sửa nhỏ trong `lesson.html` để hiển thị trường này.

**Q: Website có dùng được offline không?**  
A: Phần hiển thị văn bản hoạt động offline. TTS và audio cần kết nối internet nếu dùng Google Font hoặc audio từ URL ngoài.

**Q: Tôi có thể đổi tên website không?**  
A: Có. Sửa dòng `<title>` trong `index.html` và `lesson.html`, và chỉnh text trong `.site-header .logo`.
