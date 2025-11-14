import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ⭐ DeepSeek dùng SDK OpenAI nhưng đổi baseURL
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",  // quan trọng!
});

app.post("/ai", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",  // model FREE của DeepSeek
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("🔥 SERVER AI ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () =>
  console.log("🚀 DeepSeek AI Server running on 3001")
);
