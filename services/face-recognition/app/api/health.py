from fastapi import APIRouter
from app.models import HealthCheckResponse
from app.core.vector_vault import vector_vault
from app.config import settings

router = APIRouter(tags=["Health & Diagnostics"])

@router.get("/health", response_model=HealthCheckResponse)
def health_check():
    return HealthCheckResponse(
        status="HEALTHY",
        version=settings.VERSION,
        enrolled_count=vector_vault.total_enrolled(),
        liveness_enabled=settings.LIVENESS_ENABLED,
        confidence_threshold=settings.CONFIDENCE_THRESHOLD
    )
