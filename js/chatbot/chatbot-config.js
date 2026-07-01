/**
 * FLASHLAB CREATIVE — Chatbot Configuration
 *
 * Change API_ENDPOINT to point to your deployed backend in production.
 * All intelligence and provider selection live in the Python backend.
 */

window.FLASHLAB_CHAT_CONFIG = {

  /* ── BACKEND URL ─────────────────────────────────────────────
   *  Development : "http://localhost:3001/chat"
   *  Production  : "https://yourdomain.com/api/chat"
   * ─────────────────────────────────────────────────────────── */
  API_ENDPOINT: "http://localhost:3001/chat",

  /* ── RESPONSE TUNING ─────────────────────────────────────────
   *  MAX_TOKENS  : maximum tokens in each AI response
   *  TEMPERATURE : 0 = factual, 1 = creative (0.4 recommended)
   * ─────────────────────────────────────────────────────────── */
  MAX_TOKENS:   600,
  TEMPERATURE:  0.4,

};