import logging
import os
from typing import Optional

import httpx

_log = logging.getLogger("rag_chat")


class LLM:
    """LLM integration.

    Production requirements for this repo:
    - If no LLM provider env vars are set, we MUST still be deterministic and context-only.
    - No hidden fallback chatbot messages.

    Strategy:
    - If provider is configured, call it.
    - Otherwise, return an extractive answer derived from the prompt's context.

    NOTE: This preserves the RAG contract: endpoint controls the fixed no-context response.
    """

    def __init__(self, provider: Optional[str] = None):
        self.provider = provider or os.getenv("LLM_PROVIDER")
        # Cache at init time so values are captured after load_dotenv() runs.
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.mode = (
            "openai"
            if (self.provider in {"openai", "azure"} or self.api_key)
            else (self.provider or "none")
        )

    async def generate_async(self, prompt: str, temperature: float = 0.2, max_tokens: int = 600) -> str:
        return self.generate(prompt=prompt, temperature=temperature, max_tokens=max_tokens)

    def generate(self, prompt: str, temperature: float = 0.2, max_tokens: int = 600) -> str:
        if (self.provider in {"openai", "azure"} or self.api_key) and self.api_key:
            try:
                headers = {"Authorization": f"Bearer {self.api_key}"}
                url = f"{self.base_url}/chat/completions"
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You follow the user's instructions exactly."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                r = httpx.post(url, headers=headers, json=payload, timeout=30)
                r.raise_for_status()
                data = r.json()
                return data["choices"][0]["message"]["content"].strip()
            except (httpx.HTTPStatusError, httpx.RequestError, Exception) as exc:
                # LLM unavailable (rate-limit, quota, network) — degrade to extractive.
                _log.warning("LLM call failed (%s), using extractive fallback", exc)

        # Extractive fallback (context-only) when LLM is unconfigured or unavailable.
        marker = "[Context 1"
        idx = prompt.find(marker)
        if idx == -1:
            return "I can only help with questions about Flashlab Creative's website 😊"
        after = prompt[idx:]
        # Find the end of the context header line: "[Context 1 | source: ...]\n"
        text_start = after.find("]\n")
        # +2 skips the ]\n exactly; content begins at the first char of the chunk text.
        content = after[text_start + 2:] if text_start != -1 else after
        content = content.strip()
        # Stop before next context block header or the QUESTION marker.
        for stop in ("[Context 2", "[Context 3", "QUESTION:"):
            if stop in content:
                content = content.split(stop, 1)[0].strip()
        # Filter: prefer full sentences (>= 40 chars), fall back to shorter substantive lines.
        all_lines = [ln.strip() for ln in content.splitlines() if ln.strip()]
        sentences = [ln for ln in all_lines if len(ln) >= 40]
        substantive = [ln for ln in all_lines if len(ln) >= 15]
        lines = sentences or substantive or [ln for ln in all_lines if len(ln) > 4]
        if not lines:
            return "I can only help with questions about Flashlab Creative's website 😊"
        # 2 lines max — keep the answer short and readable.
        answer = " ".join(lines[:2]).strip()
        if len(answer) > 280:
            answer = answer[:277].rsplit(" ", 1)[0] + "..."
        elif answer and answer[-1] not in ".?!":
            answer += "."
        return answer

