# API: Flashlab Chatbot Backend

## Base URL

Start server with `python backend/start_server.py` (default port 3001).

---

## Endpoints

### `GET /health`

Returns index state and LLM mode.

**Response:**
```json
{
  "status": "ok",
  "index_chunks": 1212,
  "mode": "openai"
}
```

| Field | Values |
|---|---|
| `mode` | `"openai"` when `OPENAI_API_KEY` is set; `"none"` otherwise |
| `index_chunks` | Number of text chunks in the knowledge base |

---

### `POST /chat`

The sole chatbot endpoint. Accepts a conversation and returns a RAG-grounded reply.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "What services do you offer?"}
  ],
  "maxTokens": 600,
  "temperature": 0.4, 
  "session_id": "optional-string"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `messages` | array | yes | Conversation history. Last `user` message is the query. |
| `maxTokens` | int | no | Default 600. Passed to LLM. |
| `temperature` | float | no | Default 0.4. |
| `session_id` | string | no | Ignored — backend is stateless. |

**Response:**
```json
{"reply": "Flashlab Creative offers brand strategy, web development, social media management..."}
```

**Greeting response** (hi, hello, hey, good morning, etc.):
```json
{"reply": "Hey! 😊 How can I help you today?"}
```

**Out-of-scope / no-context response:**
```json
{"reply": "I can only help with questions about Flashlab Creative's website 😊"}
```

**Error responses:**
- `400` — `messages` array is missing or empty
- `422` — malformed request body
- `500` — internal server error (details not exposed to client)

---

## Response Style

The chatbot is designed to be:
- Short (1–3 sentences)
- Friendly with light emoji use (1–2 max)
- Strictly grounded in website content — no hallucination

Greetings are handled before retrieval and return instantly.

---

## Notes

- All intelligence lives in `backend/rag_chat/`. No Node.js proxy.
- CORS origin is controlled via `ALLOWED_ORIGIN` env var (default `*` for dev).
- Set `OPENAI_API_KEY` for LLM-generated short friendly responses.
- Without a key (or on API error), the system returns an extractive answer from the retrieved context chunk.