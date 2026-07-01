# Migration Log

## Production cleanup (Phase 2)

### What changed

**Fixed — critical bugs:**
- Created `backend/__init__.py` (was missing — relative imports in `app.py` were broken)
- Fixed `backend/start_server.py`: inserted project root into `sys.path` instead of the `backend/` subdirectory (server would not start previously)
- Renamed `/chat_rag` → `/chat` so the frontend config requires no changes

**Removed — legacy chatbot system:**
- `backend/chatbot_service.py`
- `backend/production_chatbot_service.py`
- `backend/knowledge_base.py`
- `backend/memory_manager.py`
- `backend/llm_providers.py`
- `backend/prompting.py`
- `backend/app_debug_models.py`
- `backend/kb_observer.py`

**Removed — unused Node.js proxy:**
- `js/chatbot/chatbot-server.js`
- `js/chatbot/.env`
- `js/chatbot/package.json`

**Removed — stale root-level documentation:**
- `CHATBOT_ARCHITECTURE.md`
- `CHATBOT_STATUS_REPORT.md`
- `FINAL_PRODUCTION_READINESS_REPORT.md`
- `MEMORY_VERIFICATION_REPORT.md`
- `TODO.md`
- `backend/rag_chat/README.md`

**Simplified — `backend/app.py`:**
- Removed legacy `/chat` (FlashlabChatbotService) endpoint
- Removed `/chat_rag` endpoint (renamed to `/chat`)
- Removed `/debug/retrieval` production-exposed debug endpoint
- Removed dual health response (`legacy` + `rag` keys)

**Updated — `/docs` folder:**
- `docs/api.md` — reflects single `/chat` endpoint
- `docs/setup.md` — correct `python backend/start_server.py` run instruction
- `docs/architecture.md` — full system architecture, single RAG system
- `docs/migration.md` — this file

### Why

The codebase had two parallel chatbot systems (`/chat` legacy, `/chat_rag` RAG) where the frontend was pointing to the legacy system. The RAG system is strictly better: context-only, no hallucination, deterministic fallback. The legacy system was dead weight. The `start_server.py` bug would have prevented the server from starting at all.

### What was kept

- `backend/rag_chat/` — entire RAG pipeline (unchanged)
- `backend/app.py` — FastAPI app (rewritten to single system)
- `backend/start_server.py` — server entry point (path bug fixed)
- `backend/__init__.py` — new (package marker)
- `backend/requirements.txt` — dependencies (unchanged)
- `js/chatbot/chatbot.js` — frontend widget (unchanged)
- `js/chatbot/chatbot-config.js` — frontend config (unchanged; `/chat` endpoint already set)
- `css/chatbot.css` — widget styles (unchanged)
- All HTML pages, CSS, images — unchanged

---

## Security + Personality audit (Phase 3)

### Security fix
- **Deleted `js/env`** — contained live `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, and `GOOGLE_API_KEY` in the publicly-served `js/` folder. Any visitor could fetch `/js/env` and read the keys. Keys moved to backend-only `.env`.

### Dead files removed
- `backend/rag_chat/embedder.py` — never imported anywhere
- `backend/rag_chat/telemetry.py` — imported but `log_retrieval` never called
- `js/package.json` + `js/package-lock.json` — referenced deleted `chatbot-server.js`
- Root `package-lock.json` — empty shell
- `.DS_Store` — macOS metadata
- `_blackboxai_tooling_note.txt` — tooling artifact
- `.flashlab_kb_bbbd239f02ad.pkl` — stale cache (old naming convention)
- 3× orphaned `.flashlab_rag_kb_*.pkl` — duplicate caches from different run paths

### Code fixes
- `backend/rag_chat/llm.py` — LLM call now wrapped in try/except; 429/quota/network errors fall back to extractive instead of returning HTTP 500
- `backend/rag_chat/retriever.py` — removed dead `from .telemetry import log_retrieval` import
- `backend/app.py` — added `charset=utf-8` to JSON Content-Type; explicit `dotenv_path` for `.env` loading
- `backend/rag_chat/llm.py` — cached `api_key`/`base_url`/`model` at init time (was read at request time, causing "key not set" when dotenv hadn't loaded yet)

### Chatbot personality
- `backend/rag_chat/service.py` — greeting detection (hi, hello, hey, good morning/evening…) returns instant friendly response without hitting retrieval
- `backend/rag_chat/prompt.py` — updated LLM instruction: short (1–3 sentences), friendly, 1–2 emojis, no formality
- `backend/rag_chat/service.py` + `llm.py` — no-context and out-of-scope messages updated to friendly tone
- `js/chatbot/chatbot.js` — added minimum response delay (400–900ms) so typing indicator feels natural
- `js/chatbot/chatbot-config.js` — removed stale `AI_PROVIDER` and `MODEL_OVERRIDES` fields unused by the widget

### Docs
- `README.md` — complete rewrite (was referencing deleted files)
- `docs/api.md` — updated response examples, greeting/out-of-scope responses
- `docs/architecture.md` — removed deleted files, corrected threshold (0.10 → 0.15), added greeting detection flow
- `docs/setup.md` — security note on key placement, updated test examples
- `env.example` — created (referenced in setup.md but missing)
