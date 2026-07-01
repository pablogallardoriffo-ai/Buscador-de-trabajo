"""Módulo de match: evalúa cada oferta contra el CV usando la IA."""
from ai import ask_json
from prompts import MATCH_SYSTEM


def evaluar_match(cv_text: str, oferta: dict) -> dict | None:
    """
    Devuelve la oferta enriquecida con match (%) y razón, o None si falla.
    """
    user_content = (
        f"CURRÍCULUM DEL CANDIDATO:\n{cv_text[:6000]}\n\n"
        f"OFERTA:\n"
        f"Empresa: {oferta['empresa']}\n"
        f"Cargo: {oferta['cargo']}\n"
        f"Descripción: {oferta['descripcion']}\n"
    )
    try:
        data = ask_json(MATCH_SYSTEM, user_content, max_tokens=500)
    except Exception as e:
        print(f"    ⚠ Error de IA en match: {e}")
        return None

    if not data or "match" not in data:
        return None

    try:
        score = int(data["match"])
    except (ValueError, TypeError):
        return None

    return {
        **oferta,
        "match": max(0, min(100, score)),
        "razon": (data.get("razon") or "").strip(),
    }
