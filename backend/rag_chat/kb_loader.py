import glob
import hashlib
import os
import pickle
from dataclasses import dataclass
from typing import Iterable, List, Optional, Tuple

from bs4 import BeautifulSoup

try:
    from sklearn.feature_extraction.text import TfidfVectorizer  # type: ignore

    SKLEARN_OK = True
except Exception:
    SKLEARN_OK = False
    TfidfVectorizer = None  # type: ignore


@dataclass
class KBChunk:
    id: str
    source: str
    text: str


@dataclass
class LoadedKB:
    chunks: List[KBChunk]
    vectorizer: Optional[object]


def _cache_path(workspace_root: str) -> str:
    h = hashlib.sha256(workspace_root.encode("utf-8")).hexdigest()[:12]
    return os.path.join(workspace_root, f".flashlab_rag_kb_{h}.pkl")


def _read_text_from_html(path: str) -> str:
    with open(path, "rb") as f:
        raw = f.read()
    text = raw.decode("utf-8", errors="ignore")
    soup = BeautifulSoup(text, "lxml")

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    parts: List[str] = []
    for sel in [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "p",
        "li",
        "strong",
        "em",
        "section",
        "article",
        "div",
        "a",
    ]:
        for el in soup.select(sel):
            t = el.get_text(" ", strip=True)
            if t:
                parts.append(t)

    cleaned = "\n".join(parts)
    cleaned = "\n".join([ln.strip() for ln in cleaned.splitlines() if ln.strip()])
    return cleaned


def _chunk_text(text: str, source: str, chunk_size: int = 900, overlap: int = 180) -> List[Tuple[str, str]]:
    text = text.strip()
    if not text:
        return []

    out: List[Tuple[str, str]] = []
    start = 0
    idx = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end]
        out.append((f"{source}::c{idx}", chunk))
        idx += 1
        if end == len(text):
            break
        start = max(0, end - overlap)
    return out


def _iter_html_paths(workspace_root: str, html_globs: List[str]) -> Iterable[str]:
    seen = set()
    for g in html_globs:
        for p in glob.glob(os.path.join(workspace_root, g), recursive=True):
            if os.path.isfile(p) and p.lower().endswith(".html"):
                rp = os.path.relpath(p, workspace_root)
                if rp not in seen:
                    seen.add(rp)
                    yield p


def build_kb(workspace_root: str, html_globs: List[str]) -> LoadedKB:
    chunks: List[KBChunk] = []

    for p in sorted(_iter_html_paths(workspace_root, html_globs)):
        try:
            text = _read_text_from_html(p)
        except Exception:
            continue
        if len(text) < 120:
            continue

        rel = os.path.relpath(p, workspace_root)
        for cid, ctext in _chunk_text(text, source=rel):
            if len(ctext.strip()) < 100:
                continue
            chunks.append(KBChunk(id=cid, source=rel, text=ctext))

    if not SKLEARN_OK or TfidfVectorizer is None:
        return LoadedKB(chunks=chunks, vectorizer=None)

    corpus = [c.text for c in chunks]
    # Hard safety: if the corpus is empty or tokenization yields nothing,
    # skip vectorizer building (retriever will use fuzzy ranking).
    if not corpus or not any((t or "").strip() for t in corpus):
        return LoadedKB(chunks=chunks, vectorizer=None)

    vectorizer = TfidfVectorizer(
        max_features=60000,
        ngram_range=(1, 2),
        stop_words="english",
    )
    try:
        vectorizer.fit(corpus)
    except ValueError:
        return LoadedKB(chunks=chunks, vectorizer=None)

    return LoadedKB(chunks=chunks, vectorizer=vectorizer)



def load_or_build_kb(workspace_root: str, html_globs: List[str]) -> LoadedKB:
    cache_path = _cache_path(workspace_root)
    if os.path.exists(cache_path):
        try:
            with open(cache_path, "rb") as f:
                kb = pickle.load(f)
            # Safety: if previous cache produced an empty KB, rebuild.
            if getattr(kb, "chunks", None):
                return kb
        except Exception:
            pass

    kb = build_kb(workspace_root=workspace_root, html_globs=html_globs)

    try:
        with open(cache_path, "wb") as f:
            pickle.dump(kb, f)
    except Exception:
        pass

    return kb

