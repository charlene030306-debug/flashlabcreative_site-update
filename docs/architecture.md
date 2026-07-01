# Architecture: Flashlab Chatbot System

## Overview

A RAG (Retrieval-Augmented Generation) chatbot embedded in the Flashlab Creative website. The user types a message; the backend classifies it (greeting vs. question), retrieves relevant chunks from the website's own HTML content, builds a short friendly prompt, and returns a grounded answer.

---

## End-to-End Flow

```
Browser (chatbot.js)
  │
  │  POST /chat  {"messages": [...]}
  ▼
FastAPI (backend/app.py)
  │
  │  rag_service.chat(messages)
  ▼
RAGChatService (backend/rag_chat/service.py)
  │
  ├─► Greeting detection (regex)
  │     └─ "hi" / "hello" / "good morning" → instant friendly reply
  │
  ├─► Retriever.retrieve(question, top_k=3)
  │     ├─ TF-IDF cosine similarity (sklearn)
  │     └─ RapidFuzz partial_ratio boost (+12% weight)
  │
  ├─► Score threshold filter (MIN_RETRIEVAL_SCORE_TFIDF = 0.15)
  │     └─ Below threshold → "I can only help with Flashlab Creative questions 😊"
  │
  ├─► build_prompt(question, chunks)
  │     └─ Short, friendly, context-only prompt
  │
  └─► LLM.generate(prompt)
        ├─ OPENAI_API_KEY set → OpenAI API call → short friendly answer
        ├─ API error (429, quota, network) → extractive fallback
        └─ No key → extractive fallback (first sentences of Context 1)
  │
  ▼
{"reply": "..."}  →  Browser renders in chat bubble
```

---

## Component Map

| File | Role |
|---|---|
| `backend/app.py` | FastAPI app; `/health` and `/chat` endpoints; UTF-8 JSON response |
| `backend/start_server.py` | Uvicorn entry point; run from project root |
| `backend/__init__.py` | Python package marker (enables relative imports) |
| `backend/rag_chat/service.py` | Orchestrates greeting → retrieval → prompt → LLM |
| `backend/rag_chat/kb_loader.py` | Parses HTML, chunks text, builds + caches TF-IDF KB |
| `backend/rag_chat/retriever.py` | TF-IDF + RapidFuzz hybrid retrieval |
| `backend/rag_chat/prompt.py` | Builds short, friendly, strict context-only prompt |
| `backend/rag_chat/llm.py` | OpenAI call; graceful fallback to extractive on any error |
| `backend/rag_chat/thresholds.py` | Retrieval score cutoffs |
| `js/chatbot/chatbot.js` | Widget: inject HTML, handle input, call `/chat`, render reply |
| `js/chatbot/chatbot-config.js` | Frontend config: `API_ENDPOINT`, `MAX_TOKENS`, `TEMPERATURE` |
| `css/chatbot.css` | Widget styles |
| `backend/requirements.txt` | Python dependencies |

---

## Knowledge Base

- **Source:** all `.html` files under the project root (including `html/services/*.html`)
- **Parser:** BeautifulSoup (lxml) — extracts text from headings, paragraphs, lists, links
- **Chunking:** 900-char chunks with 180-char overlap
- **Index:** sklearn `TfidfVectorizer` (max_features=60000, ngram_range=(1,2), stop_words="english")
- **Cache:** `.flashlab_rag_kb_<path-hash>.pkl` at project root — auto-loaded on restart, delete to rebuild

---

## Retrieval

- Primary: TF-IDF cosine similarity
- Boost: RapidFuzz `partial_ratio` on first 1 KB of each chunk (+12% weight)
- Threshold: `MIN_RETRIEVAL_SCORE_TFIDF = 0.15` — chunks below this are discarded
- Top K passed to prompt: 3

---

## Response Personality

Handled in layers:

| Input | Handler | Output |
|---|---|---|
| Greeting ("hi", "hello", "hey", "good morning"…) | `service.py` — instant, no retrieval | "Hey! 😊 How can I help you today?" |
| In-scope question | Retrieval → LLM or extractive | Short (1–3 sentence) friendly answer |
| Out-of-scope (score < 0.15) | `service.py` — no LLM call | "I can only help with Flashlab Creative questions 😊" |

---

## LLM

- Provider: OpenAI-compatible API (`OPENAI_API_KEY`)
- Default model: `gpt-3.5-turbo` (override with `OPENAI_MODEL`)
- On 429 / quota / network error → graceful extractive fallback (no 500)
- Prompt instructs: short (1–3 sentences), friendly, 1–2 emojis, context-only

---

## Session Handling

- **Frontend:** session ID stored in `localStorage`, sent with every request
- **Backend:** stateless — no server-side session storage
- Conversation history is reconstructed from the DOM and sent in the `messages` array

---

## Production Considerations

| Concern | Current State | Recommendation |
|---|---|---|
| CORS | `ALLOWED_ORIGIN=*` | Set to your domain in production |
| KB cache | `.pkl` file at project root | Mount persistent volume; delete to force rebuild |
| LLM | OpenAI (with graceful fallback) | Ensure key has sufficient credits |
| Multi-worker | Stateless by design | Safe for multiple uvicorn workers |
| Logging | stdout via Python logging | Pipe to log aggregator |
| API key security | `.env` file (not committed) | Never put keys in `js/` or any public folder |