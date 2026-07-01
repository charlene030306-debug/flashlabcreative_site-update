from typing import List, Dict, Any


def build_prompt(question: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
    context_blocks: List[str] = []
    for i, ch in enumerate(retrieved_chunks[:3], start=1):
        text = (ch.get("text") or "").strip()
        source = ch.get("source") or ch.get("id") or f"chunk_{i}"
        if not text:
            continue
        context_blocks.append(f"[Context {i} | source: {source}]\n{text}")

    context = "\n\n".join(context_blocks).strip()

    return (
        "You are Flash, a friendly AI assistant for the Flashlab Creative website. "
        "Answer the user's question using ONLY the provided CONTEXT. "
        "Be SHORT (1-3 sentences max), friendly, and easy to read. "
        "Use 1-2 emojis naturally — never more. "
        "Do NOT write long paragraphs. Do NOT be overly formal. "
        "If the CONTEXT does not contain the information needed, reply with exactly: "
        "I can only help with questions about Flashlab Creative's website 😊\n\n"
        f"CONTEXT:\n{context}\n\n"
        f"QUESTION: {question.strip()}\n\n"
        "Answer:"
    )