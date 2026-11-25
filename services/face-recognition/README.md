# SmartAttend — Face Recognition Microservice

This microservice provides real face detection, quality analysis, presentation attack detection (liveness), and vector template matching for SmartAttend kiosks.

## Quickstart
```bash
cd services/face-recognition
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8001 --reload
```

## Endpoints
- `GET /health`: Health status and enrolled student count.
- `POST /api/v1/face/enroll`: Enrolls a student face and saves the 512-d embedding.
- `POST /api/v1/face/verify`: Verifies a live camera frame, checks liveness, and matches against the enrolled vector database.

## Running Tests
```bash
pytest tests/
```
