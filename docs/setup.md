# Setup: Flashlab Chatbot Backend

## Requirements

- Python 3.10+
- pip

## Install dependencies

Run from the **project root**:

```bash
pip install -r backend/requirements.txt
```
## Environment variables

Copy `env.example` to `.env` in the project root (or set variables directly in your hosting environment). **Never put API keys inside the `js/` folder** — that directory is publicly served.

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Recommended | — | Enables LLM-generated responses. Without it, extractive fallback is used. |
| `OPENAI_BASE_URL` | No | `https://api.openai.com/v1` | API base URL (override for Azure or local LLM) |
| `OPENAI_MODEL` | No | `gpt-3.5-turbo` | Model to use |
| `LLM_PROVIDER` | No | — | Set to `openai` if needed explicitly |
| `PORT` | No | `3001` | Port the server listens on |
| `ALLOWED_ORIGIN` | No | `*` | CORS allowed origin — set to your domain in production |

## Start the server

Run from the **project root**:

```bash
python backend/start_server.py
```

The server starts on `http://0.0.0.0:3001` (or `$PORT`).

## Test the server

### Health check
```bash
curl http://localhost:3001/health
```

Expected:
```json
{"status": "ok", "index_chunks": 1212, "mode": "openai"}
```

`mode` is `"openai"` when `OPENAI_API_KEY` is set, `"none"` otherwise.

### Greeting
```bash
curl -X POST http://127.0.0.1:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

Expected:
```json
{"reply": "Hey! 😊 How can I help you today?"}
```

### In-scope question
```bash
curl -X POST http://127.0.0.1:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What services does Flashlab Creative offer?"}]}'
```

### Out-of-scope question
```bash
curl -X POST http://127.0.0.1:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is the weather in Tokyo?"}]}'
```

Expected: `{"reply": "I can only help with questions about Flashlab Creative's website 😊"}`

## Knowledge base

On startup, the backend automatically:
1. Scans all `.html` files in the project
2. Parses and chunks the text via BeautifulSoup
3. Builds a TF-IDF index
4. Caches the result to `.flashlab_rag_kb_<hash>.pkl`

Subsequent starts load from cache. Delete the `.pkl` file to force a rebuild after changing HTML content.

## Frontend integration

The widget (`js/chatbot/chatbot.js`) posts to `http://localhost:3001/chat` by default.
Change `API_ENDPOINT` in `js/chatbot/chatbot-config.js` for production.

The chat widget is currently embedded on `connect.html`.

## Without an OpenAI key

The system still works — it returns extractive text from the top-scored KB chunk. Greetings and out-of-scope rejection work in all modes. For best quality short friendly answers, set `OPENAI_API_KEY` with a key that has available credits.