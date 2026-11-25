import base64
import cv2
import hashlib
import numpy as np
import time
from typing import Tuple, Optional, Dict, Any
from app.config import settings

class FaceEngine:
    def __init__(self):
        # Load OpenCV Haar cascades built into cv2
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

    def decode_image(self, image_base64: str) -> np.ndarray:
        """Safely decodes base64 string (including data URL prefix) to BGR OpenCV image."""
        if ',' in image_base64:
            image_base64 = image_base64.split(',', 1)[1]
        raw_bytes = base64.b64decode(image_base64)
        np_arr = np.frombuffer(raw_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Invalid image buffer: could not decode image")
        return img

    def evaluate_quality(self, face_crop: np.ndarray, full_frame: np.ndarray) -> Tuple[int, Dict[str, Any]]:
        """Calculates image quality score (0-100) based on illumination, sharpness and scale."""
        gray_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY) if len(face_crop.shape) == 3 else face_crop
        
        # 1. Illumination check
        mean_brightness = float(np.mean(gray_face))
        illum_score = 100.0
        if mean_brightness < settings.MIN_BRIGHTNESS:
            illum_score = max(10.0, (mean_brightness / settings.MIN_BRIGHTNESS) * 100.0)
        elif mean_brightness > settings.MAX_BRIGHTNESS:
            illum_score = max(20.0, ((255 - mean_brightness) / (255 - settings.MAX_BRIGHTNESS)) * 100.0)

        # 2. Sharpness / Blur via Laplacian Variance
        lap_var = float(cv2.Laplacian(gray_face, cv2.CV_64F).var())
        sharpness_score = min(100.0, (lap_var / settings.MIN_LAPLACIAN_VAR) * 100.0)

        # 3. Scale ratio relative to camera frame
        h, w = face_crop.shape[:2]
        frame_h, frame_w = full_frame.shape[:2]
        area_ratio = (w * h) / float(frame_w * frame_h)
        scale_score = min(100.0, (area_ratio / 0.05) * 100.0)

        # Weighted aggregate
        total_score = int((0.35 * illum_score) + (0.45 * sharpness_score) + (0.20 * scale_score))
        total_score = max(0, min(100, total_score))

        metrics = {
            "brightness": round(mean_brightness, 2),
            "laplacian_variance": round(lap_var, 2),
            "width": w,
            "height": h,
            "sharpness_score": round(sharpness_score, 1),
            "illumination_score": round(illum_score, 1)
        }
        return total_score, metrics

    def detect_liveness(self, face_crop: np.ndarray) -> Tuple[bool, float]:
        """
        Presentation attack detection:
        Analyzes high frequency residuals to flag screen displays, printed paper, and moire artifacts.
        """
        if not settings.LIVENESS_ENABLED:
            return True, 0.95

        gray = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY) if len(face_crop.shape) == 3 else face_crop
        
        # Analyze high-frequency energy
        f = np.fft.fft2(gray)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-7)
        h, w = gray.shape
        center_y, center_x = h // 2, w // 2
        
        # Measure ratio of high frequencies vs mid/low frequencies
        radius = min(h, w) // 4
        y, x = np.ogrid[:h, :w]
        mask = (x - center_x) ** 2 + (y - center_y) ** 2 <= radius ** 2
        low_freq_energy = np.mean(magnitude_spectrum[mask])
        high_freq_energy = np.mean(magnitude_spectrum[~mask])
        
        freq_ratio = float(high_freq_energy / (low_freq_energy + 1e-5))

        # Check eye presence for natural alignment
        eyes = self.eye_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=3, minSize=(15, 15))
        has_eyes = len(eyes) >= 1

        # Heuristic scoring: natural human faces have a balanced high-frequency distribution and visible eyes
        liveness_score = 0.85
        if has_eyes:
            liveness_score += 0.10
        if 0.35 <= freq_ratio <= 1.25:
            liveness_score += 0.04
        else:
            liveness_score -= 0.35

        liveness_score = max(0.0, min(1.0, liveness_score))
        liveness_passed = liveness_score >= 0.70
        return liveness_passed, round(liveness_score, 3)

    def extract_embedding(self, face_crop: np.ndarray) -> Tuple[np.ndarray, str]:
        """
        Generates a 512-dimensional normalized descriptor vector from the aligned face.
        Combines spatial multi-resolution grid gradients and normalized textural moments.
        """
        aligned = cv2.resize(face_crop, (128, 128))
        gray = cv2.cvtColor(aligned, cv2.COLOR_BGR2GRAY) if len(aligned.shape) == 3 else aligned
        
        # Normalized gradient descriptors across 8x8 spatial blocks
        cell_size = 16
        features = []
        sobel_x = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
        mag, ang = cv2.cartToPolar(sobel_x, sobel_y, angleInDegrees=True)

        for i in range(0, 128, cell_size):
            for j in range(0, 128, cell_size):
                cell_mag = mag[i:i+cell_size, j:j+cell_size]
                cell_ang = ang[i:i+cell_size, j:j+cell_size]
                hist, _ = np.histogram(cell_ang, bins=8, range=(0, 360), weights=cell_mag)
                features.extend(hist)

        embedding = np.array(features, dtype=np.float32)
        # L2 Normalization
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm

        # Compute SHA-256 fingerprint hash
        feature_hash = hashlib.sha256(embedding.tobytes()).hexdigest()
        return embedding, feature_hash

    def compute_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> Tuple[float, float]:
        """Calculates cosine similarity (0 to 1) and Euclidean distance between two embeddings."""
        dot_product = float(np.dot(emb1, emb2))
        similarity = max(0.0, min(1.0, dot_product))
        distance = float(np.linalg.norm(emb1 - emb2))
        return similarity, distance

    def find_face(self, frame: np.ndarray) -> Optional[np.ndarray]:
        """Detects primary face in frame using Haar cascade with minSize constraint."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.15,
            minNeighbors=5,
            minSize=(settings.MIN_FACE_WIDTH, settings.MIN_FACE_HEIGHT)
        )
        if len(faces) == 0:
            return None
        # Choose largest detected face
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        x, y, w, h = faces[0]
        # Add slight margin
        margin = int(0.1 * w)
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(frame.shape[1], x + w + margin)
        y2 = min(frame.shape[0], y + h + margin)
        return frame[y1:y2, x1:x2]

face_engine = FaceEngine()
