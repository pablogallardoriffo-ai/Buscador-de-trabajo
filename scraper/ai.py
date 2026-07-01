"""Cliente de IA (Claude) con parseo robusto de JSON."""
import json
import re
from anthropic import Anthropic
from config import ANTHROPIC_API_KEY, CLAUDE_MODEL

_client = Anthropic(api_key=ANTHROPIC_API_KEY) if ANTHROPIC_API_KEY else None


def _extract_json(text: str):
    """Extrae el primer objeto JSON del texto (tolerante a texto extra)."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                return None
    return None


def ask_json(system: str, user_content: str, max_tokens: int = 2000):
    """Envía un mensaje a Claude y devuelve el JSON parseado (o None)."""
    if _client is None:
        raise RuntimeError("Falta ANTHROPIC_API_KEY en el archivo .env")

    response = _client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_content}],
    )
    text = "".join(
        block.text for block in response.content if block.type == "text"
    )
    return _extract_json(text)
