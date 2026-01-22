/* =========================
   IMPORTS
========================= */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fetch from "node-fetch";

dotenv.config();

/* =========================
   APP INIT
========================= */
const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   GROQ CLIENT
========================= */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* =========================
   GOOGLE SHEET URL
========================= */
const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyn9Xs_gjU0nJTKqVQcvQcU6FWy-uikJrL9Y09u3Ln6bI3OVN198UJTq_FArbqX1Uoy/exec";

/* =========================
   SYSTEM PROMPT (BRAIN)
========================= */
const SYSTEM_PROMPT = `
You are an AI-powered business assistant for a Digital Marketing and Web Services company.

LANGUAGE:
- Reply in English by default.
- Use Hinglish only if user writes in Hinglish/Hindi.

STYLE:
- Short, clear replies (4–6 lines).
- Professional and helpful.
- No sales pressure.

RULES:
- Never claim real-time website scanning.
- Never invent audit numbers or data.
- Explain services conceptually only.

CTA:
- Ask for contact details ONLY if user asks for expert help, call, or services.
- Ask for mobile number politely (email optional).
- Ask only once.

AFTER LEAD:
- Confirm submission.
- Do not ask anything else.

RESTRICTIONS:
- Never say "visit our website".
- Never expose backend or systems.
`;

/* ======*
