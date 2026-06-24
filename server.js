// Backend tối giản: phục vụ web + gọi Claude API để phân loại đơn giao.
// Chạy: ANTHROPIC_API_KEY=sk-... node server.js
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";

function buildPrompt(depot, items) {
  return `Bạn là điều phối giao hàng của một tiệm bánh tại TP.HCM. Kho/điểm lấy hàng (depot): ${depot}.
Với mỗi đơn TỰ ĐẶT (không phải Shopee/TikTok), chọn đúng 1 hãng giao trong: "Xanh SM", "Grab", "Ahamove".
Nguyên tắc:
- Xanh SM: xe máy nhỏ, tài xế ổn định, giá tốt, hợp đơn nhỏ/dễ vỡ ở khu trung tâm gần depot.
- Grab: mạng lưới rộng, nhiều tài xế, hợp khu xa/ngoại thành hoặc giờ cao điểm (11-13h30, 17-20h30).
- Ahamove: dùng cho đơn LỚN/cồng kềnh (set nhiều ly mica, ≥4kg) hoặc cần van (≥8kg) — vì Xanh SM/Grab chỉ xe nhỏ.
Hãy ước "km" = khoảng cách thực tế ước lượng từ depot đến địa chỉ khách (số, theo đường bộ TP.HCM), và "zone" = một trong "trung tâm" | "khác" | "xa".
CHỈ trả về JSON array, không thêm chữ nào khác. Mỗi phần tử: {"i":<số>,"carrier":"Xanh SM|Grab|Ahamove","km":<số>,"zone":"trung tâm|khác|xa","reason":"<1 câu ngắn tiếng Việt>"}.
Dữ liệu đơn: ${JSON.stringify(items)}`;
}

app.post("/api/classify", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Chưa cấu hình ANTHROPIC_API_KEY trên server." });
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const depot = req.body.depot || "";
    if (!items.length) return res.json({ result: [] });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2500,
        messages: [{ role: "user", content: buildPrompt(depot, items) }],
      }),
    });
    const data = await r.json();
    if (data.error) return res.status(502).json({ error: data.error.message || "Lỗi Claude API" });

    const text = (data.content && data.content[0] && data.content[0].text) || "";
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) return res.status(502).json({ error: "AI không trả về JSON hợp lệ.", raw: text });
    return res.json({ result: JSON.parse(m[0]) });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, model: MODEL, hasKey: !!API_KEY }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}  (model: ${MODEL})`));
