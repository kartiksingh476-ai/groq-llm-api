/* =========================
   IMPORTS
========================= */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fetch from "node-fetch";
import fetch from "node-fetch";

dotenv.config();

/* ==========================
   APP INIT
========================== */
const app = express();
app.use(cors());
app.use(express.json());

/* ==========================
   GROQ CLIENT
========================== */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ==========================
   SYSTEM PROMPT (BRAIN)
========================== */
const SYSTEM_PROMPT = `
You are a professional AI business assistant for a digital marketing and web solutions agency.

LANGUAGE:
- Reply in English by default.
- Use Hinglish only if the user writes in Hinglish or Hindi.

RESPONSE STYLE:
- Clear, professional, concise.
- Avoid long explanations unless asked.

BUSINESS BEHAVIOR:
- Never suggest Google, Search Console, or external tools.
- Always position OUR WEBSITE and OUR SERVICES as the solution.
- Speak like a company representative.

CONTEXT:
- Understand replies like "yes", "ok", "done" using conversation context.
- Never act confused if context exists.

AUDIT RULES:
- Do NOT claim real-time website scanning.
- Explain audits conceptually.
- Ask for website URL only once.

CTA RULE:
- Mention CTA only when user shows clear intent.
- Never repeat CTA unnecessarily.

ANTI-HALLUCINATION:
- Never invent reports, numbers, or performance data.

NO-WEBSITE RULE:
- If user has no website:
  - Do NOT ask for URL.
  - Offer website development.
  - Offer expert connect.

SERVICES:
- Website Audit
- SEO Audit
- GMB Audit & Optimization
- Website Development
- Social Media Audit & Setup
- Ads (Google & Meta)
- Marketing Profit & Loss Guidance

MEETING & EXPERT CONNECT:
- Ask for contact details once.
- After submission, confirm and STOP.

FINAL STOP:
- After lead submission, politely close conversation.
`;

/* ==========================
   SAVE LEAD (GOOGLE SHEET)
========================== */
async function saveLead(mobile, email) {
  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbxWGOiPZlBNGspDDSQcEHtvONr5oh809MTzrn-fOk1QrX5tR7JQ7KSn56-VX7eHQOPj/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, email }),
      }
    );
  } catch (err) {
    console.error("Lead save failed:", err);
  }
}

/* ==========================
   CHAT API
========================== */
app.post("/chat", async (req, res) => {
  try {
    const { message = "", history = [] } = req.body;

    if (!message.trim()) {
      return res.json({ reply: "Please type your message." });
    }

    /* 📌 LEAD DETECTION */
    const mobileMatch = message.match(/\b[6-9]\d{9}\b/);
    const emailMatch = message.match(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
    );

    if (mobileMatch || emailMatch) {
      await saveLead(
        mobileMatch ? mobileMatch[0] : "",
        emailMatch ? emailMatch[0] : ""
      );

      return res.json({
        reply:
          "Thank you. Your details have been submitted successfully. Our expert team will contact you shortly.",
      });
    }

    /* 🤖 AI RESPONSE */
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error. Please try again." });
  }
});

/* ==========================
   SERVER START
========================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API running on port ${PORT}`);
});
