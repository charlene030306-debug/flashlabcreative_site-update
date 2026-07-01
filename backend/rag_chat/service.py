﻿from __future__ import annotations

import os
import random
import re
from typing import Any, Dict, List, Optional

from .kb_loader import load_or_build_kb
from .prompt import build_prompt
from .retriever import Retriever
from .llm import LLM

_GREET_RE = re.compile(
    r"^(hi+|hello+|hey+|good\s+(morning|evening|afternoon|night|day)"
    r"|howdy|sup|yo+|greetings|what['’]?s\s+up)[!.,?\s]*$",
    re.IGNORECASE,
)

_GREETING_REPLIES = [
    "Hey! 😊 How can I help you today?",
    "Hi there 👋 What can I do for you?",
    "Hello! 😊 Need any help?",
    "Hey there! 👋 Ask me anything about Flashlab Creative.",
]


def _is_greeting(text: str) -> bool:
    return bool(_GREET_RE.match(text.strip()))


class RAGChatService:
    def __init__(self):
        # backend/.. => project root
        workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

        html_globs = [
            "*.html",
            "html/**/*.html",
            "js/**/*.js",
            "about.html",
            "career.html",
            "connect.html",
            "index.html",
            "services.html",
            "team.html",
            "portfolio.html",
            "clients.html",
            "case-studies.html",
            "loader.html",
            "story.html",
        ]
        self.kb = load_or_build_kb(workspace_root=workspace_root, html_globs=html_globs)
        # Safety: if cache produced an empty KB for any reason, rebuild once.
        if not getattr(self.kb, "chunks", None):
            from .kb_loader import build_kb

            self.kb = build_kb(workspace_root=workspace_root, html_globs=html_globs)

        # Final safety guard
        if not getattr(self.kb, "chunks", None):
            self.kb.chunks = []  # type: ignore[attr-defined]

        self.retriever = Retriever(self.kb)


        self.llm = LLM()

    @property
    def index_size(self) -> int:
        return len(self.kb.chunks)

    @property
    def mode(self) -> str:
        return self.llm.mode

    def chat(self, messages: List[Dict[str, str]], temperature: float = 0.2, max_tokens: int = 600) -> str:
        # extract last user question
        last_user: Optional[str] = None
        for m in reversed(messages or []):
            if m.get("role") == "user":
                last_user = m.get("content")
                break
        question = (last_user or "").strip()
        if not question:
            return "Hey! 😊 Type your question and I'll do my best to help."

        if _is_greeting(question):
            return random.choice(_GREETING_REPLIES)

        hits = self.retriever.retrieve(question, top_k=3)

        # Log retrieval scores for production debugging.
        import logging
        logger = logging.getLogger("rag_chat")
        logger.info("chat_rag query=%r hits=%s", question, [(h.get("id"), h.get("score")) for h in hits[:3]])

        # Enforce similarity threshold (no-context if below threshold).
        # Retriever returns the best top_k candidates already; we filter them here.
        from .thresholds import MIN_RETRIEVAL_SCORE_FUZZY, MIN_RETRIEVAL_SCORE_TFIDF

        def _score_ok(h: Dict[str, Any]) -> bool:
            score = float(h.get("score", 0.0))
            # TF-IDF similarity is typically < 1; fuzzy is on ~0-100-ish in our fallback.
            if self.retriever.kb.vectorizer is None or score <= 1.0:
                return score >= MIN_RETRIEVAL_SCORE_TFIDF
            return score >= MIN_RETRIEVAL_SCORE_FUZZY

        filtered = [h for h in hits if (h.get("text") or "").strip() and _score_ok(h)]

        if not filtered:
            return "I can only help with questions about Flashlab Creative's website 😊"

        # Only pass high-confidence chunks to the prompt/LLM.
        retrieved_chunks = filtered[:3]
        prompt = build_prompt(question=question, retrieved_chunks=retrieved_chunks)
        return self.llm.generate(prompt=prompt, temperature=temperature, max_tokens=max_tokens)
