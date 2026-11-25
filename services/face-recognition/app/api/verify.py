import time
from fastapi import APIRouter, HTTPException, Depends, Header
from app.models import FaceVerifyRequest, FaceVerifyResponse
from app.core.face_engine import face_engine
from app.core.vector_vault import vector_vault
from app.config import settings

router = APIRouter(prefix="/api/v1/face", tags=["Face Verification"])

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Face Service API Key")
    return True

@router.post("/verify", response_model=FaceVerifyResponse)
def verify_student_face(payload: FaceVerifyRequest, authorized: bool = Depends(verify_api_key)):
    start_time = time.time()
    
    try:
        frame = face_engine.decode_image(payload.image_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decoding failed: {str(e)}")

    # 1. Detect Face
    face_crop = face_engine.find_face(frame)
    if face_crop is None:
        elapsed = (time.time() - start_time) * 1000
        return FaceVerifyResponse(
            verified=False,
            message="No face detected in capture frame.",
            verification_time_ms=round(elapsed, 2)
        )

    # 2. Liveness / Presentation Attack Check
    liveness_passed, liveness_score = face_engine.detect_liveness(face_crop)
    if settings.LIVENESS_ENABLED and not liveness_passed:
        elapsed = (time.time() - start_time) * 1000
        return FaceVerifyResponse(
            verified=False,
            liveness_passed=False,
            liveness_score=liveness_score,
            message=f"Liveness check failed (score: {liveness_score}). Presentation attack or screen photo suspected.",
            verification_time_ms=round(elapsed, 2)
        )

    # 3. Extract Query Embedding
    query_emb, _ = face_engine.extract_embedding(face_crop)

    # 4. Search Enrolled Database
    matched_student_id, confidence, distance = vector_vault.find_best_match(
        school_id=payload.school_id,
        query_embedding=query_emb,
        threshold=settings.CONFIDENCE_THRESHOLD
    )

    elapsed = (time.time() - start_time) * 1000

    if matched_student_id:
        return FaceVerifyResponse(
            verified=True,
            student_id=matched_student_id,
            confidence=confidence,
            distance=distance,
            liveness_passed=True,
            liveness_score=liveness_score,
            verification_time_ms=round(elapsed, 2),
            message=f"Identity verified with confidence {round(confidence * 100, 1)}%."
        )
    else:
        return FaceVerifyResponse(
            verified=False,
            confidence=confidence,
            distance=distance,
            liveness_passed=liveness_passed,
            liveness_score=liveness_score,
            verification_time_ms=round(elapsed, 2),
            message=f"No matching student identity found (confidence: {round(confidence * 100, 1)}% was below threshold {round(settings.CONFIDENCE_THRESHOLD * 100, 1)}%)."
        )
