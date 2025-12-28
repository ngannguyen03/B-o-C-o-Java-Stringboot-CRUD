import express from "express";
import "dotenv/config";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🔥 Dùng model ổn định nhất
const model = genAI.getGenerativeModel({
  model: "gemini-pro"
});

app.post("/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("📩 User prompt:", prompt);

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ reply: text });

  } catch (err) {
    console.error("🔥 GEMINI SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("🚀 Gemini AI Server running on port 3001");
});
