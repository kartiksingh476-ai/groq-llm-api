import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
- Use Hinglish ONLY if the user writes in Hinglish or Hindi.
- Never force Hinglish.

RESPONSE LENGTH:
- Keep responses concise.
- 4–6 lines unless user asks for details.

ANTI-HALLUCINATION (CRITICAL):
- You CANNOT actually scan or audit websites.
- Never claim real-time analysis, speed numbers, errors, or reports.
- Explain audits conceptually.

SERVICE LOGIC:
- Website Audit, SEO, GMB, Social Media Audit, Website Development.
- Explain WHAT the service includes.
- Do NOT repeat CTAs unnecessarily.

CTA RULE (VERY IMPORTANT):
- CTA only when user clearly wants:
  - audit
  - expert help
  - website development
  - call / meeting
- CTA should be soft and professional.

NO WEBSITE CASE:
- If user has NO website:
  - Do NOT ask for URL.
  - Offer website development.
  - Suggest expert connection.

EXPERT CONNECT FLOW:
- If user asks to connect with expert:
  - Ask for mobile number once.
- After number:
  - Say it’s submitted.
  - Say expert will contact soon.
  - Do NOT ask more questions.

MEETING FLOW:
- Ask date & time once.
- Confirm once user agrees.
- Do not loop.

GENERAL QUESTIONS:
- Answer like ChatGPT normally.
- Do not push services unnecessarily.

TONE:
- Professional
- Helpful
- Business-focused
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "LLM error" });
  }
});

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log("🚀 AI Chatbot API running on port 3000");
});
