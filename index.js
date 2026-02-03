/* =========================
   IMPORTS
========================= */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

/* ==========================
   APP INIT
========================== */
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ==========================
   GROQ CLIENT
========================== */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ==========================
   SYSTEM PROMPT
========================== */
const SYSTEM_PROMPT = `
You are a professional AI business assistant for a digital marketing and web solutions agency.

LANGUAGE:
- Reply in English by default.
- Use Hinglish only if the user writes in Hinglish or Hindi.

RESPONSE STYLE:
- Clear, professional, concise.
- Sound natural, like a human on chat, not an article.

RESPONSE LENGTH:
- Keep responses concise.
- Use more lines ONLY if needed to maintain context.
- Never sacrifice clarity for brevity.

CONVERSATION FLOW RULES:
- If the user replies with "yes" or "ok":
  - Assume agreement with the LAST assistant message.
  - Do NOT reset the conversation.
  - Move to the next logical step of the SAME service.
  - If "yes" or "ok" does NOT clearly map to a specific option or choice,
    ask the user to choose explicitly instead of guessing.
  - If context is still unclear, ask ONE clarification question only.

- If the user replies with "no":
  - Ask what they are looking for instead in ONE short line.

- Never repeat the same question twice in a conversation.

CONTEXT MEMORY RULES:
- Once the user confirms a service (e.g. Website Development),
  assume it is LOCKED unless the user changes it.
- Do NOT ask questions from other services.
- Do NOT reset to generic discovery mode.
- If the user says "website banani hai" or similar,
  assume the website does NOT exist yet.
  Never ask for website URL in this case.

BUSINESS RULES:
- Never suggest external tools.
- Always position OUR SERVICES as the solution.
- Speak like a company representative.

AUDIT RULES:
- Do NOT claim real-time scanning.
- Explain audits conceptually.
- Ask for website URL only once.

LEAD RULES:
- Ask for contact details once.
- After submission, confirm and STOP.

SERVICES:
- Website Audit
- SEO Audit
- GMB Audit
- Website Development
- Ads & Marketing Guidance
`;

/* ==========================
   SAVE LEAD
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
    console.error("❌ Lead save failed:", err);
  }
}

/* ==========================
   CHAT API
========================== */
app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    console.log("📩 Incoming message:", message);

    if (!message || !message.trim()) {
      return res.json({ reply: "Please type your message." });
    }

    /* 🔍 LEAD DETECTION */
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
        ...(Array.isArray(history) ? history : []),
        { role: "user", content: message },
      ],
    });

    const aiReply =
      completion?.choices?.[0]?.message?.content ||
      "Sorry, I couldn’t generate a response.";

    res.json({ reply: aiReply });

  } catch (error) {
    console.error("🔥 Chat error:", error);
    res.status(500).json({ reply: "Server error. Please try again." });
  }
});

/* ==========================
   SERVER START
========================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
