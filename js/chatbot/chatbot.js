﻿/**
 * FLASHLAB CREATIVE — Chatbot Widget (UI only)
 *
 * Responsibilities (JS):
 *  - Capture user input
 *  - Send request to FastAPI (/chat)
 *  - Display responses in existing UI
 */
(function () {
  'use strict';

  const EXT = window.FLASHLAB_CHAT_CONFIG || {};

  const CONFIG = {
    BOT_NAME: 'Flash Bot',
    DELAY_MIN: 400,
    DELAY_MAX: 900,
    BUBBLE_MS: 3500,
    API_ENDPOINT: EXT.API_ENDPOINT || 'http://localhost:3001/chat',
    MAX_TOKENS: EXT.MAX_TOKENS || 600,
    TEMPERATURE: EXT.TEMPERATURE != null ? EXT.TEMPERATURE : 0.4,
    SESSION_KEY_STORAGE: 'flashlab-chat-session-id',
  };

  const THINKING_MESSAGES = [
    "🚀 Let's get started!",
    '🎨 Need a brand refresh?',
    '📣 Grow your brand with us!',
    '🌟 Your next project starts here!',
    '💡 Ask me anything about Flashlab!',
    "📱 Let's build something amazing!",
  ];

  // -------------------- UI State --------------------
  let isOpen = false;
  let isTyping = false;
  let bubbleIndex = 0;

  let chatbox, messagesArea, chatInput, sendBtn;
  let robotBtn, thinkingBubble, bubbleText;

  // -------------------- Session IDs --------------------
  function getOrCreateSessionId() {
    try {
      const existing = localStorage.getItem(CONFIG.SESSION_KEY_STORAGE);
      if (existing) return existing;
      // lightweight UUID v4
      const id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
      localStorage.setItem(CONFIG.SESSION_KEY_STORAGE, id);
      return id;
    } catch (e) {
      // If localStorage unavailable, fall back to a session-less behavior.
      return null;
    }
  }

  // -------------------- Networking (UI -> Python) --------------------
  function getConversationHistory() {
    const nodes = messagesArea ? Array.from(messagesArea.querySelectorAll('.cb-msg')) : [];
    const out = [];
    for (const n of nodes) {
      const bubble = n.querySelector('.cb-msg-bubble');
      if (!bubble) continue;
      const text = (bubble.innerText || '').trim();
      if (!text) continue;
      const isBot = n.classList.contains('bot');
      out.push({ role: isBot ? 'assistant' : 'user', content: text });
    }
    return out;
  }

  async function sendToPython(userMessage) {
    const history = getConversationHistory();
    const messages = [...history.filter(m => m.role === 'user' || m.role === 'assistant'), { role: 'user', content: userMessage }];

    const session_id = getOrCreateSessionId();

    const res = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id,
        messages,
        maxTokens: CONFIG.MAX_TOKENS,
        temperature: CONFIG.TEMPERATURE,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Server error ${res.status}`);
    }

    const data = await res.json();
    if (!data.reply) throw new Error('Empty reply from server');
    return data.reply;
  }

  // -------------------- UI Helpers --------------------
  function injectHTML() {
    const panelHTML = `
      <div id="fl-chatbox" role="dialog" aria-label="Chat with Flash Bot" aria-hidden="true">
        <div class="cb-resize-handle cb-resize-n"  data-dir="n"></div>
        <div class="cb-resize-handle cb-resize-ne" data-dir="ne"></div>
        <div class="cb-resize-handle cb-resize-e"  data-dir="e"></div>
        <div class="cb-resize-handle cb-resize-se" data-dir="se"></div>
        <div class="cb-resize-handle cb-resize-s"  data-dir="s"></div>
        <div class="cb-resize-handle cb-resize-sw" data-dir="sw"></div>
        <div class="cb-resize-handle cb-resize-w"  data-dir="w"></div>
        <div class="cb-resize-handle cb-resize-nw" data-dir="nw"></div>
        <div class="cb-header">
          <div class="cb-header-left">
            <div class="cb-header-avatar">🤖</div>
            <div class="cb-header-info">
              <div class="cb-header-name">${CONFIG.BOT_NAME}</div>
              <div class="cb-header-status">
                <span class="cb-status-dot"></span>
                Online — Typically replies instantly
              </div>
            </div>
          </div>
          <div class="cb-header-actions">
            <button class="cb-icon-btn danger" id="fl-clear-btn" title="Clear chat">
              <i class="ri-delete-bin-line"></i>
            </button>
            <button class="cb-icon-btn" id="fl-minimize-btn" title="Minimize">
              <i class="ri-subtract-line"></i>
            </button>
            <button class="cb-icon-btn" id="fl-close-btn" title="Close">
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>
        <div class="cb-messages" id="fl-messages" aria-live="polite" tabindex="0">
          <div class="cb-welcome">
            <div class="cb-welcome-emoji">👋</div>
            <h4>Hi! I'm Flash, your Flashlab assistant.</h4>
            <p>Ask me anything about our services, team, portfolio, careers, pricing, and more!</p>
            <div class="cb-chips" role="group" aria-label="Quick questions">
              <button class="cb-chip" data-msg="What services do you offer?">Our Services</button>
              <button class="cb-chip" data-msg="How can I contact you?">Contact Info</button>
              <button class="cb-chip" data-msg="Tell me about pricing">Pricing</button>
              <button class="cb-chip" data-msg="Are you hiring?">Careers</button>
              <button class="cb-chip" data-msg="Tell me about your portfolio">Portfolio</button>
              <button class="cb-chip" data-msg="Who are your clients?">Our Clients</button>
            </div>
          </div>
          <div class="cb-date-divider"><span>Today</span></div>
        </div>
        <div class="cb-input-area">
          <div class="cb-input-row">
            <textarea id="fl-chat-input"
                      rows="1"
                      placeholder="Ask Flash Bot anything..."
                      aria-label="Type your message"
                      autocomplete="off"
                      spellcheck="true"
                      maxlength="500"></textarea>
            <button id="fl-send-btn" aria-label="Send" title="Send (Enter)">
              <i class="ri-send-plane-fill"></i>
            </button>
          </div>
          <p class="cb-footer-note">Powered by <strong>Flashlab AI</strong> · <a href="connect.html">Contact us</a></p>
        </div>
      </div>
    `;

    const rootHTML = `
      <div id="fl-chatbot-root" role="complementary" aria-label="Flashlab AI Chat">
        <div id="fl-thinking-bubble" aria-live="polite">
          <span class="bubble-text">${THINKING_MESSAGES[0]}</span>
        </div>
        <button id="fl-robot-btn"
                aria-label="Open AI Chat Assistant"
                aria-expanded="false"
                aria-controls="fl-chatbox">
          <span class="cb-robot-icon cb-robot-svg">🤖</span>
          <span class="cb-close-icon"><i class="ri-close-line"></i></span>
        </button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);
    document.body.insertAdjacentHTML('beforeend', rootHTML);
  }

  function bindRefs() {
    chatbox = document.getElementById('fl-chatbox');
    messagesArea = document.getElementById('fl-messages');
    chatInput = document.getElementById('fl-chat-input');
    sendBtn = document.getElementById('fl-send-btn');
    robotBtn = document.getElementById('fl-robot-btn');
    thinkingBubble = document.getElementById('fl-thinking-bubble');
    bubbleText = thinkingBubble.querySelector('.bubble-text');
  }

  function startBubbleCycle() {
    setInterval(() => {
      if (isOpen) return;
      bubbleText.classList.add('fade-out');
      setTimeout(() => {
        bubbleIndex = (bubbleIndex + 1) % THINKING_MESSAGES.length;
        bubbleText.textContent = THINKING_MESSAGES[bubbleIndex];
        bubbleText.classList.remove('fade-out');
      }, 280);
    }, CONFIG.BUBBLE_MS);
  }

  function openChat() {
    if (typeof chatbox._positionPanel === 'function') chatbox._positionPanel();
    isOpen = true;
    chatbox.classList.add('open');
    chatbox.setAttribute('aria-hidden', 'false');
    robotBtn.classList.add('open');
    robotBtn.setAttribute('aria-expanded', 'true');
    robotBtn.setAttribute('aria-label', 'Close AI Chat Assistant');
    thinkingBubble.classList.add('hidden');
    setTimeout(() => chatInput.focus(), 380);
  }

  function closeChat() {
    isOpen = false;
    chatbox.classList.remove('open');
    chatbox.setAttribute('aria-hidden', 'true');
    robotBtn.classList.remove('open');
    robotBtn.setAttribute('aria-expanded', 'false');
    robotBtn.setAttribute('aria-label', 'Open AI Chat Assistant');
    thinkingBubble.classList.remove('hidden');
    robotBtn.focus();
  }

  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }

  function getTimestamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function appendMessage(text, role) {
    const isBot = role === 'bot';

    const msgDiv = document.createElement('div');
    msgDiv.className = `cb-msg ${isBot ? 'bot' : 'user'}`;

    const safeText = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
      <div class="cb-msg-row">
        ${isBot ? '<div class="cb-msg-avatar" aria-hidden="true">🤖</div>' : ''}
        <div class="cb-msg-bubble">
          ${safeText}
          ${isBot ? '<button class="cb-copy-btn" title="Copy"><i class="ri-file-copy-line"></i></button>' : ''}
        </div>
      </div>
      <time class="cb-msg-time">${getTimestamp()}</time>
    `;

    if (isBot) {
      const copyBtn = msgDiv.querySelector('.cb-copy-btn');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = '<i class="ri-check-line"></i>';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="ri-file-copy-line"></i>';
            copyBtn.classList.remove('copied');
          }, 1800);
        });
      });
    }

    messagesArea.appendChild(msgDiv);
    scrollToBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'cb-typing';
    el.id = 'fl-typing';
    el.setAttribute('aria-label', 'Flash Bot is typing');
    el.innerHTML = `
      <div class="cb-msg-avatar" aria-hidden="true">🤖</div>
      <div class="cb-typing-dots" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    `;
    messagesArea.appendChild(el);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('fl-typing');
    if (el) el.remove();
  }

  function scrollToBottom() {
    messagesArea.scrollTo({ top: messagesArea.scrollHeight, behavior: 'smooth' });
  }

  function autoResize() {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
  }

  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text || isTyping) return;

    appendMessage(text, 'user');
    chatInput.value = '';
    autoResize();
    chatInput.disabled = true;
    sendBtn.disabled = true;
    isTyping = true;
    showTyping();

    try {
      const delay = CONFIG.DELAY_MIN + Math.random() * (CONFIG.DELAY_MAX - CONFIG.DELAY_MIN);
      const [reply] = await Promise.all([
        sendToPython(text),
        new Promise(r => setTimeout(r, delay)),
      ]);
      hideTyping();
      appendMessage(reply, 'bot');
    } catch (err) {
      hideTyping();
      appendMessage('Something went wrong. Please try again shortly.', 'bot');
      console.error('[Flash AI] chat failed:', err);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      isTyping = false;
      chatInput.focus();
    }
  }

  function clearChat() {
    Array.from(messagesArea.children).forEach(el => {
      if (!el.classList.contains('cb-welcome') && !el.classList.contains('cb-date-divider')) {
        el.remove();
      }
    });
  }

  function handleChipClick(e) {
    const chip = e.target.closest('.cb-chip');
    if (!chip) return;
    const msg = chip.dataset.msg;
    if (msg) {
      chatInput.value = msg;
      handleSend();
    }
  }

  function bindEvents() {
    robotBtn.addEventListener('click', () => {
      robotBtn.classList.remove('spinning');
      void robotBtn.offsetWidth;
      robotBtn.classList.add('spinning');
      robotBtn.addEventListener('animationend', () => robotBtn.classList.remove('spinning'), { once: true });
      toggleChat();
    });

    document.getElementById('fl-minimize-btn').addEventListener('click', closeChat);
    document.getElementById('fl-close-btn').addEventListener('click', closeChat);
    document.getElementById('fl-clear-btn').addEventListener('click', clearChat);
    sendBtn.addEventListener('click', handleSend);

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });

    chatInput.addEventListener('input', autoResize);
    messagesArea.addEventListener('click', handleChipClick);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeChat();
    });

    document.addEventListener('click', (e) => {
      if (!isOpen) return;
      const root = document.getElementById('fl-chatbot-root');
      if (!chatbox.contains(e.target) && !root.contains(e.target)) closeChat();
    });
  }

  function initDragResize() {
    const MIN_W = 320, MIN_H = 400, THRESHOLD = 4;

    function positionPanel() {
      if (chatbox.dataset.positioned) return;
      chatbox.dataset.positioned = '1';

      const vw = window.innerWidth, vh = window.innerHeight;
      if (vw <= 480) {
        chatbox.style.width = '100vw';
        chatbox.style.height = (vh - 64) + 'px';
        chatbox.style.left = '0px';
        chatbox.style.top = '64px';
      } else {
        const w = Math.min(720, vw - 24);
        const h = Math.min(590, vh - 40);
        chatbox.style.width = w + 'px';
        chatbox.style.height = h + 'px';
        chatbox.style.left = Math.max(8, (vw - w) / 2) + 'px';
        chatbox.style.top = Math.max(8, (vh - h) / 2) + 'px';
      }
    }

    chatbox._positionPanel = positionPanel;

    const header = chatbox.querySelector('.cb-header');

    function startDrag(ox, oy) {
      let moved = false;
      const sl = parseFloat(chatbox.style.left) || 0;
      const st = parseFloat(chatbox.style.top) || 0;

      function move(cx, cy) {
        const dx = cx - ox, dy = cy - oy;
        if (!moved) {
          if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
          moved = true;
          chatbox.style.transition = 'none';
          header.classList.add('dragging');
          document.body.style.userSelect = 'none';
        }

        const vw = window.innerWidth, vh = window.innerHeight;
        const w = chatbox.offsetWidth, h = chatbox.offsetHeight;
        chatbox.style.left = Math.max(0, Math.min(sl + dx, vw - w)) + 'px';
        chatbox.style.top = Math.max(0, Math.min(st + dy, vh - h)) + 'px';
      }

      function end() {
        chatbox.style.transition = '';
        header.classList.remove('dragging');
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMM);
        document.removeEventListener('mouseup', onMU);
        document.removeEventListener('touchmove', onTM);
        document.removeEventListener('touchend', onTE);
      }

      const onMM = e => move(e.clientX, e.clientY);
      const onMU = () => end();
      const onTM = e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };
      const onTE = () => end();

      document.addEventListener('mousemove', onMM);
      document.addEventListener('mouseup', onMU);
      document.addEventListener('touchmove', onTM, { passive: false });
      document.addEventListener('touchend', onTE);
    }

    header.addEventListener('mousedown', e => {
      if (e.target.closest('button') || e.target.closest('select')) return;
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });

    header.addEventListener('touchstart', e => {
      if (e.target.closest('button') || e.target.closest('select')) return;
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    chatbox.querySelectorAll('.cb-resize-handle').forEach(handle => {
      function startResize(ox, oy) {
        const dir = handle.dataset.dir;
        const sl = parseFloat(chatbox.style.left) || 0;
        const st = parseFloat(chatbox.style.top) || 0;
        const sw = chatbox.offsetWidth;
        const sh = chatbox.offsetHeight;

        chatbox.style.transition = 'none';
        document.body.style.userSelect = 'none';

        function move(cx, cy) {
          const dx = cx - ox, dy = cy - oy;
          const vw = window.innerWidth, vh = window.innerHeight;
          let l = sl, t = st, w = sw, h = sh;

          if (dir.includes('e')) w = Math.max(MIN_W, Math.min(sw + dx, vw - sl));
          if (dir.includes('s')) h = Math.max(MIN_H, Math.min(sh + dy, vh - st));
          if (dir.includes('w')) { w = Math.max(MIN_W, sw - dx); l = sl + (sw - w); }
          if (dir.includes('n')) { h = Math.max(MIN_H, sh - dy); t = st + (sh - h); }

          chatbox.style.width = w + 'px';
          chatbox.style.height = h + 'px';
          chatbox.style.left = l + 'px';
          chatbox.style.top = t + 'px';
        }

        function end() {
          chatbox.style.transition = '';
          document.body.style.userSelect = '';
          document.removeEventListener('mousemove', onMM);
          document.removeEventListener('mouseup', onMU);
          document.removeEventListener('touchmove', onTM);
          document.removeEventListener('touchend', onTE);
        }

        const onMM = e => move(e.clientX, e.clientY);
        const onMU = () => end();
        const onTM = e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); };
        const onTE = () => end();

        document.addEventListener('mousemove', onMM);
        document.addEventListener('mouseup', onMU);
        document.addEventListener('touchmove', onTM, { passive: false });
        document.addEventListener('touchend', onTE);
      }

      handle.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        startResize(e.clientX, e.clientY);
      });

      handle.addEventListener('touchstart', e => {
        e.stopPropagation();
        startResize(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });
    });
  }

  function init() {
    if (!document.getElementById('fl-chatbox')) {
      injectHTML();
      bindRefs();
      bindEvents();
      initDragResize();
      startBubbleCycle();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.FlashlabChat = {
    open: () => openChat(),
    close: () => closeChat(),
    toggle: () => toggleChat(),
    send: (text) => { if (!isOpen) openChat(); chatInput.value = text; handleSend(); },
    clear: () => {
      openChat();
      clearChat();
    },
  };

})();
