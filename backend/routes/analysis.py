from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from sqlalchemy.orm import Session

from database.database import get_db
from dbmodels.models import Analysis

from service.ml_services import detect_voice
from service.risk_service import calculate_risk


router = APIRouter(
    prefix="/analyze",
    tags=["Voice Analysis"]
)


@router.post("")
async def analyze_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # 1. Validate file type
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # 2. Read audio
    # -----------------------------------------------------

    audio_data = await file.read()


    # -----------------------------------------------------
    # 3. Validate file size
    # -----------------------------------------------------

    max_size = 10 * 1024 * 1024

    if len(audio_data) > max_size:

        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10 MB."
        )


    # -----------------------------------------------------
    # 4. Run ML model
    # -----------------------------------------------------

    ml_result = detect_voice(audio_data)


    # -----------------------------------------------------
    # 5. Calculate risk
    # -----------------------------------------------------

    risk_result = calculate_risk(
        ai_probability=ml_result["ai_probability"],
        audio_quality_score=ml_result["audio_quality_score"]
    )


    # -----------------------------------------------------
    # 6. Save analysis to PostgreSQL
    # -----------------------------------------------------

    analysis = Analysis(

        original_filename=file.filename,

        file_path=None,

        file_size_bytes=len(audio_data),

        mime_type=file.content_type,

        ai_probability=ml_result["ai_probability"],

        is_ai_generated=ml_result["is_ai_generated"],

        risk_score=risk_result["risk_score"],

        risk_level=risk_result["risk_level"],

        risk_message=risk_result["message"],

        model_id=1
    )


    db.add(analysis)

    db.commit()

    db.refresh(analysis)


    # -----------------------------------------------------
    # 7. Return result
    # -----------------------------------------------------

    return {
        "analysis_id": analysis.analysis_id,
        "filename": analysis.original_filename,

        "is_ai_generated": risk_result["is_ai_generated"],
        "ai_probability": ml_result["ai_probability"],

        "audio_quality_score": ml_result["audio_quality_score"],
        "audio_quality_level": ml_result["audio_quality_level"],

        "risk_score": risk_result["risk_score"],
        "risk_level": risk_result["risk_level"],

        "message": analysis.risk_message
    }