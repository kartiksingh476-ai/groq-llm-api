console.log("✅ Premium Chatbot Loaded");

const CHAT_API_URL = "/chat";

/* =========================
   PREMIUM UI + CSS
========================= */
const chatbotHTML = `
<style>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes typing {
  0% { content: "."; }
  33% { content: ".."; }
  66% { content: "..."; }
}

#ai-chatbot {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  background: #020617;
  color: #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0,0,0,.6);
  font-family: Inter, system-ui, Arial;
  overflow: hidden;
  z-index: 99999;
}

#ai-chatbot header {
  padding: 14px 16px;
  background: linear-gradient(135deg,#0ea5e9,#6366f1);
  font-weight: 600;
  text-align: center;
}

#chat-messages {
  height: 380px;
  padding: 16px;
  overflow-y: auto;
}

.msg {
  margin-bottom: 12px;
  animation: fadeUp .2s ease;
  line-height: 1.4;
}

.msg.user {
  text-align: right;
  color: #22c55e;
}

.msg.bot {
  text-align: left;
  color: #e5e7eb;
}

.msg.bot span {
  background: #0b1220;
  padding: 10px 12px;
  border-radius: 12px;
  display: inline-block;
  max-width: 90%;
}

.msg.user span {
  background: #022c22;
  padding: 10px 12px;
  border-radius: 12px;
  display: inline-block;
  max-width: 90%;
}

.typing {
  font-size: 13px;
  opacity: .7;
  font-style: italic;
}

#chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #020617;
  border-top: 1px solid #1e293b;
}

#chat-input input {
  flex: 1;
  background: #020617;
  color: #fff;
  border: 1px solid #1e293b;
  border-radius: 10px;
  padding: 10px;
  outline: none;
}

#chat-input button {
  background: #6366f1;
  border: none;
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
}
</style>

<div id="ai-chatbot">
  <header>AI Business Assistant</header>
  <div id="chat-messages"></div>
  <div id="chat-input">
    <input id="userMessage" placeholder="Ask anything..." />
    <button id="sendBtn">➤</button>
  </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", chatbotHTML);

/* =========================
   CHAT LOGIC
========================= */
const chat = document.getElementById("chat-messages");

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.innerHTML = `<span>${text}</span>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function showTyping() {
  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.id = "typing";
  div.innerHTML = `<span>AI is typing<span id="dots">...</span></span>`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById("typing");
  if (t) t.remove();
}

async function sendMessage() {
  const input = document.getElementById("userMessage");
  const msg = input.value.trim();
  if (!msg) return;

  addMsg(msg, "user");
  input.value = "";

  showTyping();

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, history: [] })
    });

    const data = await res.json();
    hideTyping();
    addMsg(data.reply, "bot");

  } catch {
    hideTyping();
    addMsg("⚠️ Server not responding", "bot");
  }
}

document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("userMessage").addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
