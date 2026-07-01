"""Salida de resultados: Excel y/o base de datos de la plataforma."""
import hashlib
import pandas as pd
from config import (
    EXCEL_PATH,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    TARGET_USER_EMAIL,
)


def export_excel(rows: list[dict]) -> None:
    """Genera el Excel con las columnas solicitadas."""
    df = pd.DataFrame(
        [
            {
                "Nombre de la Empresa": r["empresa"],
                "Nombre del Cargo": r["cargo"],
                "Porcentaje de Match (%)": r["match"],
                "Razón": r["razon"],
                "Link Directo a la postulación": r["link"],
            }
            for r in rows
        ]
    )
    df.sort_values("Porcentaje de Match (%)", ascending=False, inplace=True)
    df.to_excel(EXCEL_PATH, index=False)
    print(f"📄 Excel generado: {EXCEL_PATH} ({len(rows)} ofertas)")


def _source_id(link: str) -> str:
    return hashlib.sha1(link.encode("utf-8")).hexdigest()[:32]


def push_to_platform(rows: list[dict]) -> None:
    """
    Sube las ofertas a la base de datos de Es Sencillo para que aparezcan en
    el panel del usuario. Requiere SUPABASE_SERVICE_ROLE_KEY y TARGET_USER_EMAIL.
    """
    if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and TARGET_USER_EMAIL):
        print("ℹ Sin credenciales de Supabase: se omite la subida a la plataforma.")
        return

    from supabase import create_client

    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    user = (
        client.table("profiles")
        .select("id")
        .eq("email", TARGET_USER_EMAIL)
        .maybe_single()
        .execute()
    )
    if not user.data:
        print(f"⚠ No se encontró el usuario {TARGET_USER_EMAIL} en la plataforma.")
        return
    user_id = user.data["id"]

    jobs_payload = [
        {
            "source": "scraper",
            "source_id": _source_id(r["link"]),
            "title": r["cargo"],
            "company_name": r["empresa"],
            "description": r["razon"] or r["descripcion"],
            "url": r["link"],
            "is_national": False,
        }
        for r in rows
    ]

    jobs = (
        client.table("jobs")
        .upsert(jobs_payload, on_conflict="source,source_id")
        .execute()
    )
    id_by_source = {j["source_id"]: j["id"] for j in jobs.data}

    matches_payload = []
    for r in rows:
        job_id = id_by_source.get(_source_id(r["link"]))
        if not job_id:
            continue
        # Sin 'status': en altas usa el valor por defecto ('nueva'); en las
        # que el usuario ya movió, conserva su estado.
        matches_payload.append(
            {
                "user_id": user_id,
                "job_id": job_id,
                "score": r["match"],
                "reasoning": r["razon"],
            }
        )

    if matches_payload:
        client.table("matches").upsert(
            matches_payload, on_conflict="user_id,job_id"
        ).execute()

    print(f"✅ {len(matches_payload)} ofertas subidas a tu panel de Es Sencillo.")
