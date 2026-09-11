from fastapi import APIRouter, UploadFile, File, HTTPException

from service.ml_services import detect_voice
from service.risk_service import calculate_risk


router = APIRouter(
    prefix="/analyze",
    tags=["Voice Analysis"]
)


@router.post("")
async def analyze_audio(
    file: UploadFile = File(...)
):


    allowed_formats = {
        "audio/wav",
        "audio/x-wav",
        "audio/mpeg",
        "audio/flac"
    }


    if file.content_type not in allowed_formats:
        raise HTTPException(
            status_code=400,
            detail="Only WAV, MP3 and FLAC files are supported."
        )


    audio_data = await file.read()

    max_size = 10 * 1024 * 1024

    if len(audio_data) > max_size:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10 MB."
        )


    ml_result = detect_voice(audio_data)

    risk_result = calculate_risk(
        ai_probability=ml_result["ai_probability"]
    )

    return {
        "analysis_id": "A001",
        "filename": file.filename,

        "is_ai_generated": ml_result["is_ai_generated"],
        "ai_probability": ml_result["ai_probability"],

        "risk_score": risk_result["risk_score"],
        "risk_level": risk_result["risk_level"],

        "message": risk_result["message"]
    }