console.log("✅ Premium Chatbot Loaded");

const CHAT_API_URL = "http://localhost:3000/chat";

/* =========================
   PREMIUM UI HTML + CSS
========================= */
const chatbotHTML = `
<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

#ai-chatbot {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 360px;
  background: #020617;
  color: #fff;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0,0,0,.6);
  font-family: Inter, system-ui, Arial;
  overflow: hidden;
  z-index: 99999;
}

#ai-chatbot header {
  padding: 16px;
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
  animation: fadeIn .25s ease;
}

.user {
  text-align: right;
  color: #22c55e;
}

.bot {
  text-align: left;
  color: #e5e7eb;
}

.typing {
  font-size: 13px;
  opacity: .6;
  font-style: italic;
}

#chat-input {
  display: flex;
  padding: 12px;
  background: #020617;
  border-top: 1px solid #1e293b;
}

#chat-input input {
  flex: 1;
  background: #020617;
  color: #fff;
  border: none;
  outline: none;
  padding: 10px;
}

#chat-input button {
  background: #6366f1;
  border: none;
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
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

function addMsg(text, cls) {
  chat.innerHTML += `<div class="msg ${cls}">${text}</div>`;
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("userMessage");
  const msg = input.value.trim();
  if (!msg) return;

  addMsg(msg, "user");
  input.value = "";

  addMsg("AI is typing…", "typing");
  const typingEl = document.querySelector(".typing");

  try {
    const res = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, history: [] })
    });

    const data = await res.json();
    typingEl.remove();
    addMsg(data.reply, "bot");

  } catch {
    typingEl.remove();
    addMsg("⚠️ Server not responding", "bot");
  }
}

document.getElementById("sendBtn").onclick = sendMessage;
document.getElementById("userMessage").addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
