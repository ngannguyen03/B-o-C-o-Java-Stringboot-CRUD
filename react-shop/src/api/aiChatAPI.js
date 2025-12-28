export async function aiChatAPI(text) {
  try {
    const res = await fetch("http://localhost:3001/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    // ❌ Nếu server trả lỗi HTTP (400 / 500)
    if (!res.ok) {
      const err = await res.json();
      console.error("🚨 Lỗi AI:", err);
      throw new Error(err.message || "AI server error");
    }

    const data = await res.json();
    return data.reply;

  } catch (error) {
    console.error("❌ AI Chat API Error:", error);
    return "Xin lỗi 😢 AI đang gặp sự cố, vui lòng thử lại!";
  }
}
