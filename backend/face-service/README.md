# face-service — Reconocimiento facial

**Responsable:** Kevin (DevOps + Stripe + face service) · IA: OpenCode

> Esqueleto vacío. Servicio Python independiente (no entra en pnpm).

## Qué hará

Microservicio interno (solo lo llama `backend/api`, nunca el móvil):

- `POST /embed` → recibe una imagen, devuelve el embedding facial (512 floats).
- `POST /verify` → compara una imagen con un embedding guardado y devuelve `{ match, score }`.

La API guarda el embedding en Supabase (pgvector). **Nunca se guardan fotos.**

## Puesta en marcha (cuando haya código)

```bash
cd backend/face-service
python -m venv .venv
.venv\Scripts\activate        # Windows  (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## Estructura prevista

```
app/
├── main.py      # FastAPI
├── model.py     # carga de InsightFace
└── schemas.py
```
