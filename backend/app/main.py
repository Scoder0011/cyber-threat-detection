from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.alerts import router as alerts_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.bots import router as bots_router

app = FastAPI(title="Cyber Threat Detection API")
app.include_router(alerts_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(bots_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}