from fastapi import FastAPI
from routes.analysis import router as analysis_router

app = FastAPI(
    title="VoiceGuard AI Backend",
    description="Backend API for AI-powered voice cloning detection",
    version="1.0.0"
)

app.include_router(
    analysis_router,
    prefix="/api"
)


@app.get("/")
def root():
    return {
        "message": "VoiceGuard AI Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }