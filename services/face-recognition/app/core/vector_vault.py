import json
import os
import numpy as np
from typing import Dict, Optional, Tuple, List
from app.config import settings

class VectorVault:
    def __init__(self):
        self._vault: Dict[str, Dict[str, Dict]] = {} # school_id -> {student_id: {embedding: np.ndarray, hash: str, quality: int}}
        self._storage_path = os.path.join(settings.DATA_DIR, "vault.json")
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        self._load_disk()

    def _load_disk(self):
        if os.path.exists(self._storage_path):
            try:
                with open(self._storage_path, "r") as f:
                    data = json.load(f)
                    for school_id, students in data.items():
                        self._vault[school_id] = {}
                        for student_id, item in students.items():
                            self._vault[school_id][student_id] = {
                                "embedding": np.array(item["embedding"], dtype=np.float32),
                                "hash": item["hash"],
                                "quality": item.get("quality", 85)
                            }
            except Exception as e:
                print(f"Warning: Could not read vault disk store: {e}")

    def _save_disk(self):
        try:
            serialized = {}
            for school_id, students in self._vault.items():
                serialized[school_id] = {}
                for student_id, item in students.items():
                    serialized[school_id][student_id] = {
                        "embedding": item["embedding"].tolist(),
                        "hash": item["hash"],
                        "quality": item["quality"]
                    }
            with open(self._storage_path, "w") as f:
                json.dump(serialized, f)
        except Exception as e:
            print(f"Warning: Could not persist vault to disk: {e}")

    def save_embedding(self, school_id: str, student_id: str, embedding: np.ndarray, feature_hash: str, quality: int):
        if school_id not in self._vault:
            self._vault[school_id] = {}
        self._vault[school_id][student_id] = {
            "embedding": embedding,
            "hash": feature_hash,
            "quality": quality
        }
        self._save_disk()

    def get_embedding(self, school_id: str, student_id: str) -> Optional[np.ndarray]:
        school_store = self._vault.get(school_id, {})
        item = school_store.get(student_id)
        return item["embedding"] if item else None

    def find_best_match(self, school_id: str, query_embedding: np.ndarray, threshold: float) -> Tuple[Optional[str], float, float]:
        """
        Scans all students enrolled in school_id.
        Returns: (best_student_id, best_similarity, best_distance)
        """
        school_store = self._vault.get(school_id, {})
        if not school_store:
            return None, 0.0, 1.0

        best_student_id = None
        best_similarity = -1.0
        best_distance = 999.0

        for student_id, item in school_store.items():
            enrolled_emb = item["embedding"]
            similarity = float(np.dot(query_embedding, enrolled_emb))
            distance = float(np.linalg.norm(query_embedding - enrolled_emb))

            if similarity > best_similarity:
                best_similarity = similarity
                best_distance = distance
                best_student_id = student_id

        if best_similarity >= threshold:
            return best_student_id, round(best_similarity, 4), round(best_distance, 4)
        
        return None, round(best_similarity, 4), round(best_distance, 4)

    def total_enrolled(self) -> int:
        return sum(len(students) for students in self._vault.values())

vector_vault = VectorVault()
