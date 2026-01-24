/* ===============================
   AI CHATBOT DEMO (WITH MEMORY)
================================ */

/* 🔧 BACKEND API */
const API_URL = "https://groq-llm-api.onrender.com/chat";

/* ===============================
   CHATBOT UI
================================ */
const chatbotHTML = `
<style>
#ai-chatbot {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  font-family: Arial, sans-serif;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0,0,0,.25);
  z-index: 99999;
}
#ai-chatbot header {
  background: #0d6efd;
  color: #fff;
  padding: 12px;
  text-align: center;
  font-weight: bold;
}
#chat-messages {
  height: 260px;
  overflow-y: auto;
  padding: 10px;
  font-size: 14px;
}
.msg { margin-bottom: 8px; }
.user { text-align: right; color: #000; }
.bot { text-align: left; color: #0d6efd; }
#chat-input {
  display: flex;
  border-top: 1px solid #ddd;
}
#chat-input input {
  flex: 1;
  border: none;
  padding: 10px;
  outline: none;
}
#chat-input button {
  border: none;
  background: #0d6efd;
  color: #fff;
  padding: 10px 15px;
  cursor: pointer;
}
</style>

<div id="ai-chatbot">
  <header>AI Assistant</header>
  <div id="chat-messages"></div>
  <div id="chat-input">
    <input id="userMessage" placeholder="Type your message..." />
    <button id="sendBtn">Send</button>
  </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", chatbotHTML);

/* ===============================
   CONVERSATION MEMORY
================================ */
let chatHistory = [];

/* ===============================
   SEND MESSAGE
================================ */
async function sendMessage() {
  const input = document.getElementById("userMessage");
  const msg = input.value.trim();
  if (!msg) return;

  const chat = document.getElementById("chat-messages");

  chat.innerHTML += `<div class="msg user"><b>You:</b> ${msg}</div>`;
  input.value = "";
  chat.scrollTop = chat.scrollHeight;

  chatHistory.push({ role: "user", content: msg });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
  message: msg,
  history: chatHistory
})
      })
    });

    const data = await res.json();

    chat.innerHTML += `<div class="msg bot"><b>Bot:</b> ${data.reply}</div>`;
    chat.scrollTop = chat.scrollHeight;

    chatHistory.push({ role: "assistant", content: data.reply });

  } catch (err) {
    chat.innerHTML += `<div class="msg bot">⚠️ Server not responding</div>`;
  }
}

/* ===============================
   EVENTS
================================ */
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("userMessage").addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
