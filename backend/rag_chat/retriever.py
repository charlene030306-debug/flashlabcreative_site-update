import hashlib
from typing import Any, Dict, List, Optional

try:
    import numpy as np  # type: ignore
    from sklearn.metrics.pairwise import cosine_similarity  # type: ignore

    SKLEARN_OK = True
except Exception:
    SKLEARN_OK = False
    cosine_similarity = None  # type: ignore
    np = None  # type: ignore

from rapidfuzz import fuzz

from .kb_loader import KBChunk, LoadedKB
from .thresholds import (
    CANDIDATES_TOP_K,
    MIN_RETRIEVAL_SCORE_FUZZY,
    MIN_RETRIEVAL_SCORE_TFIDF,
)


class Retriever:
    def __init__(self, kb: LoadedKB):
        self.kb = kb


    def retrieve(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Return top_k relevant chunks.

        Mandatory behavior enforced by caller/endpoints:
        - top 3 chunks
        """
        query = (query or "").strip()
        if not query or not self.kb.chunks:
            return []

        # If we can't compute vector similarity, fall back to fuzzy ranking.
        if (
            not SKLEARN_OK
            or self.kb.vectorizer is None
            or getattr(self.kb.vectorizer, "transform", None) is None
        ):
            return self._search_fuzzy(query, top_k=top_k)

        # We don't store the TF-IDF matrix here; easiest is to re-fit is avoided.
        # But kb_loader only returns the vectorizer, not the matrix.
        # For performance + correctness in this repo, we rebuild a light matrix
        # from chunks once per process.
        if not hasattr(self, "_matrix"):
            self._build_matrix_once()

        qv = self.kb.vectorizer.transform([query])
        scores = cosine_similarity(qv, self._matrix).reshape(-1)
        if scores.size == 0:
            return []

        top_idx = np.argsort(scores)[::-1][:top_k]
        hits: List[Dict[str, Any]] = []
        q_lower = query.lower()
        for i in top_idx:
            c = self.kb.chunks[int(i)]
            score = float(scores[int(i)])
            title_boost = fuzz.partial_ratio(q_lower, c.text[:1000].lower()) / 100.0
            final = score + 0.12 * title_boost
            hits.append({"id": c.id, "source": c.source, "score": final, "text": c.text})

        hits.sort(key=lambda h: h["score"], reverse=True)
        return hits[:top_k]

    def _build_matrix_once(self) -> None:
        corpus = [c.text for c in self.kb.chunks]
        self._matrix = self.kb.vectorizer.transform(corpus)

    def _search_fuzzy(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        q = query.lower().strip()
        scored = []
        for c in self.kb.chunks:
            sample = c.text[:1400].lower()
            kws = [t for t in _tokens(q) if len(t) > 2]
            overlap = sum(1 for kw in kws if kw in sample)
            f = fuzz.partial_ratio(q, sample) / 100.0
            score = overlap + 0.8 * f
            scored.append((score, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        hits: List[Dict[str, Any]] = []
        for score, c in scored[:top_k]:
            if score <= 0:
                continue
            hits.append({"id": c.id, "source": c.source, "score": float(score), "text": c.text})
        return hits


def _tokens(q: str) -> List[str]:
    import re

    stop = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "to",
        "of",
        "in",
        "on",
        "for",
        "with",
        "is",
        "are",
        "i",
        "you",
        "we",
        "it",
        "this",
        "that",
        "as",
        "at",
        "by",
        "be",
        "from",
        "your",
        "our",
        "what",
        "how",
        "who",
        "where",
        "when",
        "why",
        "can",
        "do",
        "does",
        "tell",
        "me",
        "please",
        "about",
        "offer",
        "offers",
        "service",
        "services",
        "register",
    }
    toks = re.findall(r"[a-zA-Z0-9]{3,}", q)
    return [t for t in toks if t.lower() not in stop]

