// Tạo PDF tổng hợp cho 1 bài từ chính trang "Tổng hợp" trên web (để web và PDF luôn khớp nhau).
// Cách dùng (chạy ở thư mục gốc của site):
//   python3 -m http.server 8765 &
//   node tools/build-summary-pdf.js b10            # → pdf/b10-tong-hop.pdf
// Cần: Node + playwright (npm i playwright). Đổi BASE nếu server chạy cổng khác.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765';
const id = process.argv[2] || 'b10';
const lessonNum = id.replace(/\D/g, '');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
  await page.goto(`${BASE}/bai.html?level=mam&id=${id}#tong-hop/tong-hop`);
  await page.reload();
  await page.waitForSelector('.bai-sum');
  await page.evaluate(async () => { try { await document.fonts.ready; } catch (e) {} });
  // chỉ giữ lại phần tổng hợp, bỏ nút ▶ và nút tải
  await page.evaluate((num) => {
    const sum = document.querySelector('.bai-sum').cloneNode(true);
    const root = document.createElement('div'); root.className = 'pdf-root';
    const brand = document.createElement('div'); brand.className = 'pdf-brand';
    brand.textContent = 'học với hành · Bài ' + num + ' · Tổng hợp từ vựng & ngữ pháp';
    root.appendChild(brand); root.appendChild(sum);
    document.body.innerHTML = ''; document.body.appendChild(root);
  }, lessonNum);
  await page.addStyleTag({ content: `
    [class*=pomodoro], [id*=pomodoro] { display: none !important; }
    body { background: #fff !important; margin: 0 !important; }
    .pdf-root { padding: 0; }
    .pdf-brand { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #55535F; margin-bottom: 10px; font-weight: 700; }
    .bai-sum { max-width: none !important; }
    .bai-sum-play, .bai-sum-dlwrap { display: none !important; }
    .bai-sum-row, .bai-sum-ex, .bai-sum-tip { break-inside: avoid; }
    .bai-sum-label, .bai-sum-group { display: block !important; width: fit-content; break-after: avoid; }
  ` });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: `pdf/${id}-tong-hop.pdf`, format: 'A4', printBackground: true, scale: 0.86,
    margin: { top: '14mm', bottom: '16mm', left: '12mm', right: '12mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-size:8px;color:#777;text-align:center;font-family:Arial,sans-serif">hoc voi hanh · Bài ${lessonNum} · <span class="pageNumber"></span>/<span class="totalPages"></span></div>`
  });
  await browser.close();
  console.log('Đã tạo pdf/' + id + '-tong-hop.pdf');
})();
