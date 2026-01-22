import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   GROQ CLIENT
========================= */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =========================
   SYSTEM PROMPT (BRAIN)
========================= */
const SYSTEM_PROMPT = `
You are a professional AI business assistant for a digital marketing and web services company.

LANGUAGE RULE:
- Reply in ENGLISH by default.
- Use Hinglish ONLY if the user writes in Hindi/Hinglish.
- Never force Hinglish.

RESPONSE LENGTH:
- Keep replies short (4–6 lines max).
- Only go detailed if user asks clearly.

ANTI-HALLUCINATION (CRITICAL):
- Never claim real-time website scanning.
- Never invent performance data or audit numbers.
- Explain audits conceptually only.

CTA RULE (VERY IMPORTANT):
- Do NOT repeat CTA in every reply.
- Use CTA ONLY when user explicitly asks for:
  website audit, SEO, GMB, social media, expert help, website development.
- No CTA spam.

NO-WEBSITE LOGIC:
- If user says they don’t have a website:
  - Do NOT ask for URL
  - Offer Website Development service
  - Offer expert connection

MEETING & EXPERT RULE:
- If user wants to connect with expert or arrange a call:
  - Ask politely for mobile number (and email if shared)
- Once details are shared:
  - Say clearly that details are submitted
  - Say expert team will contact shortly
  - Do NOT ask more questions

GENERAL KNOWLEDGE:
- Answer general questions like ChatGPT.
- Don’t redirect everything to sales.

TONE:
- Professional
- Helpful
- Business friendly
`;

/* =========================
   CHAT API
========================= */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    res.status(500).json({ error: "LLM error" });
  }
});

/* =========================
   LEAD SAVE API (CRITICAL)
   Browser → Render → Google Sheet
========================= */
app.post("/lead", async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ success: false, message: "No lead data" });
    }

    await fetch(process.env.GOOGLE_SHEET_URL,https://script.google.com/macros/s/AKfycbyn9Xs_gjU0nJTKqVQcvQcU6FWy-uikJrL9Y09u3Ln6bI3OVN198UJTq_FArbqX1Uoy/exec{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone || "",
        email: email || "",
        source: "AI Chatbot",
        timestamp: new Date().toISOString(),
      }),
    });

    res.json({
      success: true,
      message: "Lead saved successfully",
    });
  } catch (error) {
    console.error("LEAD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Lead save failed",
    });
  }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
