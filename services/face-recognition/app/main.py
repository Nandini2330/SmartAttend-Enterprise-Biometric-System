from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import enroll, verify, health

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Real-world face recognition, quality scoring, and presentation attack protection service for SmartAttend."
)

# Enable CORS for web dashboard & kiosks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(health.router)
app.include_router(enroll.router)
app.include_router(verify.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
