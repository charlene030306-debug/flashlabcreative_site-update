import os
import logging
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from dotenv import load_dotenv

# Explicit path so load_dotenv always finds the root .env regardless of CWD.
_dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=_dotenv_path)

logger = logging.getLogger(__name__)

class _UTF8JSON(JSONResponse):
    media_type = "application/json; charset=utf-8"


app = FastAPI(title="Flashlab Chatbot API", version="2.0", default_response_class=_UTF8JSON)

allowed_origin = os.getenv("ALLOWED_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin] if allowed_origin != "*" else ["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    provider: Optional[str] = None
    model: Optional[str] = None
    session_id: Optional[str] = None
    messages: List[ChatMessage]
    maxTokens: Optional[int] = 600
    temperature: Optional[float] = 0.4


class ChatResponse(BaseModel):
    reply: str


from .rag_chat.service import RAGChatService  # noqa: E402

rag_service = RAGChatService()


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "index_chunks": rag_service.index_size,
        "mode": rag_service.mode,
    }


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages array is required")

    try:
        messages: List[Dict[str, str]] = [
            {"role": m.role, "content": m.content}
            for m in req.messages
        ]
        reply = rag_service.chat(
            messages,
            temperature=req.temperature or 0.2,
            max_tokens=req.maxTokens or 600,
        )
        return ChatResponse(reply=reply)
    except Exception:
        logger.exception("/chat failed")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")
