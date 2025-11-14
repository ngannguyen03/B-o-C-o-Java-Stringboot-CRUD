import React, { useState } from "react";
import { aiChatAPI } from "../api/aiChatAPI";
import "../styles/AIChatBox.css";

export default function AIChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await aiChatAPI(input);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: reply || "⚠️ AI không trả lời được!" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ Xin lỗi, AI đang gặp sự cố. Vui lòng thử lại!",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="ai-chat-container">
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chat-box">
          <div className="chat-header">✨ Jewelry AI Assistant</div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                {m.text}
              </div>
            ))}

            {loading && <div className="msg ai">⏳ AI đang phản hồi...</div>}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Hỏi AI về sản phẩm..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}
  