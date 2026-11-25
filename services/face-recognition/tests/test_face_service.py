import cv2
import numpy as np
import base64
import pytest
from app.core.face_engine import face_engine
from app.core.vector_vault import vector_vault

def create_synthetic_face_image() -> str:
    """Creates a synthetic face frame with eyes, nose, mouth for automated pipeline testing."""
    img = np.ones((300, 300, 3), dtype=np.uint8) * 180
    # Draw face oval
    cv2.ellipse(img, (150, 150), (80, 100), 0, 0, 360, (120, 140, 180), -1)
    # Draw eyes
    cv2.circle(img, (120, 130), 12, (30, 30, 30), -1)
    cv2.circle(img, (180, 130), 12, (30, 30, 30), -1)
    # Draw mouth
    cv2.ellipse(img, (150, 190), (30, 15), 0, 0, 180, (40, 40, 160), 3)

    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode('utf-8')

def test_image_decoding():
    b64 = create_synthetic_face_image()
    img = face_engine.decode_image(b64)
    assert img is not None
    assert img.shape == (300, 300, 3)

def test_embedding_and_matching():
    school_id = "test-school-1"
    student_id = "test-student-1"

    img = np.ones((128, 128, 3), dtype=np.uint8) * 150
    cv2.circle(img, (40, 40), 10, (20, 20, 20), -1)
    cv2.circle(img, (88, 40), 10, (20, 20, 20), -1)

    emb1, hash1 = face_engine.extract_embedding(img)
    assert len(emb1) == 512
    assert len(hash1) == 64

    # Enroll in vault
    vector_vault.save_embedding(school_id, student_id, emb1, hash1, 90)

    # Identical query should yield ~1.0 similarity
    matched_id, similarity, distance = vector_vault.find_best_match(school_id, emb1, 0.6)
    assert matched_id == student_id
    assert similarity > 0.99
    assert distance < 0.05

def test_unknown_rejection():
    school_id = "test-school-1"
    # Unrelated pattern
    img_unrelated = np.zeros((128, 128, 3), dtype=np.uint8)
    for i in range(0, 128, 8):
        cv2.line(img_unrelated, (0, i), (128, i), (255, 255, 255), 1)

    emb_unrelated, _ = face_engine.extract_embedding(img_unrelated)
    matched_id, similarity, distance = vector_vault.find_best_match(school_id, emb_unrelated, 0.7)
    assert matched_id is None
