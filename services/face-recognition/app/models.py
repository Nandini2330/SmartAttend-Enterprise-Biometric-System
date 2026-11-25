from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class FaceEnrollRequest(BaseModel):
    student_id: str = Field(..., description="UUID of student")
    school_id: str = Field(..., description="UUID of school")
    image_base64: str = Field(..., description="Base64 encoded JPEG/PNG frame")

class FaceEnrollResponse(BaseModel):
    success: bool
    student_id: str
    quality_score: int
    face_detected: bool
    features_extracted: bool
    feature_hash: Optional[str] = None
    message: str

class FaceVerifyRequest(BaseModel):
    school_id: str = Field(..., description="UUID of school")
    image_base64: str = Field(..., description="Base64 encoded capture frame")
    session_id: Optional[str] = None
    device_id: Optional[str] = None

class FaceVerifyResponse(BaseModel):
    verified: bool
    student_id: Optional[str] = None
    confidence: float = 0.0
    distance: float = 1.0
    liveness_passed: bool = False
    liveness_score: float = 0.0
    verification_time_ms: float = 0.0
    message: str

class HealthCheckResponse(BaseModel):
    status: str
    version: str
    enrolled_count: int
    liveness_enabled: bool
    confidence_threshold: float
