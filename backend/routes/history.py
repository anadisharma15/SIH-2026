from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["History & Reports"])

@router.get("/analyses")
def get_recent_analyses():
    # Return dummy data to populate the frontend recent analyses page
    return [
        {
            "id": "A001",
            "filename": "demo_audio_1.wav",
            "is_ai_generated": False,
            "ai_probability": 0.15,
            "risk_level": "low"
        },
        {
            "id": "A002",
            "filename": "suspicious_call.mp3",
            "is_ai_generated": True,
            "ai_probability": 0.92,
            "risk_level": "high"
        }
    ]

@router.get("/report/{analysis_id}")
def download_report(analysis_id: str):
    # For now, return a generic mock response 
    # A true implementation would return a FileResponse or StreamingResponse with a PDF blob
    return JSONResponse(content={"message": f"Report for {analysis_id} (Mocked Data)"})
