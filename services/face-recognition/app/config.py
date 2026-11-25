import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "SmartAttend Face Recognition Microservice"
    VERSION: str = "1.0.0"
    API_KEY: str = os.getenv("FACE_SERVICE_API_KEY", "smartattend_face_service_dev_key_secret")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("FACE_CONFIDENCE_THRESHOLD", "0.60"))
    LIVENESS_ENABLED: bool = os.getenv("FACE_LIVENESS_ENABLED", "true").lower() == "true"
    MIN_FACE_WIDTH: int = 80
    MIN_FACE_HEIGHT: int = 80
    MIN_LAPLACIAN_VAR: float = 85.0  # Sharpness / Blur threshold
    MIN_BRIGHTNESS: float = 40.0
    MAX_BRIGHTNESS: float = 235.0
    DATA_DIR: str = os.getenv("FACE_DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))

settings = Settings()
