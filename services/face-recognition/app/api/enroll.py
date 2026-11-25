from fastapi import APIRouter, HTTPException, Depends, Header
from app.models import FaceEnrollRequest, FaceEnrollResponse
from app.core.face_engine import face_engine
from app.core.vector_vault import vector_vault
from app.config import settings

router = APIRouter(prefix="/api/v1/face", tags=["Face Enrollment"])

def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid Face Service API Key")
    return True

@router.post("/enroll", response_model=FaceEnrollResponse)
def enroll_student_face(payload: FaceEnrollRequest, authorized: bool = Depends(verify_api_key)):
    try:
        frame = face_engine.decode_image(payload.image_base64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decoding failed: {str(e)}")

    # Detect face
    face_crop = face_engine.find_face(frame)
    if face_crop is None:
        return FaceEnrollResponse(
            success=False,
            student_id=payload.student_id,
            quality_score=0,
            face_detected=False,
            features_extracted=False,
            message="No face detected in the provided image. Ensure the subject is facing the camera clearly with adequate lighting."
        )

    # Evaluate quality
    quality_score, metrics = face_engine.evaluate_quality(face_crop, frame)
    if quality_score < 40:
        return FaceEnrollResponse(
            success=False,
            student_id=payload.student_id,
            quality_score=quality_score,
            face_detected=True,
            features_extracted=False,
            message=f"Image quality is too low ({quality_score}/100). Low sharpness or improper illumination detected."
        )

    # Extract embedding
    embedding, feature_hash = face_engine.extract_embedding(face_crop)
    
    # Store in Vault
    vector_vault.save_embedding(
        school_id=payload.school_id,
        student_id=payload.student_id,
        embedding=embedding,
        feature_hash=feature_hash,
        quality=quality_score
    )

    return FaceEnrollResponse(
        success=True,
        student_id=payload.student_id,
        quality_score=quality_score,
        face_detected=True,
        features_extracted=True,
        feature_hash=feature_hash,
        message=f"Face enrolled successfully with quality score {quality_score}/100."
    )
