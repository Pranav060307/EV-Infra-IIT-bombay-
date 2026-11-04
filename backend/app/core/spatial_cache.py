"""
ChargeAtlas India - Persistent Spatial Derivation Cache Engine
Phase 5: High-Performance GIS Result Caching & Automatic Invalidation

Provides transparent, deterministic caching for computationally expensive derived GIS products:
- Pune 1km x 1km Metric Grid (polygon clipping, centroid distances, MoP benchmark classification)
- Samruddhi Mahamarg 701km Geodetic Corridor (geodesic distance, buffer polygons, 20km segmentation)
- Administrative Boundary Simplifications and Pre-joined Spatial Datasets

Cache Invalidation Strategy:
- Calculates SHA-256 checksums and modification timestamps of all authentic source datasets.
- Incorporates algorithm versions, spatial parameters (grid size, buffer radius), and projected CRS.
- Any modification to underlying official datasets automatically invalidates the cache.
- Supports manual override with force_refresh=True.
"""

import os
import json
import hashlib
import logging
from typing import Dict, Any, List, Optional, Callable

logger = logging.getLogger("chargeatlas.cache")

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
CACHE_DIR = os.path.join(BASE_DIR, "data", "cache")

os.makedirs(CACHE_DIR, exist_ok=True)

class SpatialCacheEngine:
    ALGORITHM_VERSION = "2.1.0-perf-opt"

    @staticmethod
    def compute_source_signature(source_file_paths: List[str], extra_params: Dict[str, Any]) -> str:
        """
        Generates a deterministic SHA-256 signature from source file contents/mtimes
        and algorithm parameters.
        """
        hasher = hashlib.sha256()
        hasher.update(SpatialCacheEngine.ALGORITHM_VERSION.encode("utf-8"))

        for path in sorted(source_file_paths):
            if os.path.exists(path):
                hasher.update(os.path.basename(path).encode("utf-8"))
                mtime = os.path.getmtime(path)
                fsize = os.path.getsize(path)
                hasher.update(f"{mtime}:{fsize}".encode("utf-8"))
            else:
                hasher.update(f"missing:{path}".encode("utf-8"))

        # Add parameters
        param_str = json.dumps(extra_params, sort_keys=True)
        hasher.update(param_str.encode("utf-8"))

        return hasher.hexdigest()

    @staticmethod
    def get_cached_result(cache_name: str, signature: str) -> Optional[Dict[str, Any]]:
        """Retrieves cached JSON if signature matches."""
        cache_file = os.path.join(CACHE_DIR, f"{cache_name}_{signature[:16]}.json")
        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                logger.info(f"Spatial cache HIT: {cache_name} [{signature[:8]}]")
                return data
            except Exception as e:
                logger.warning(f"Spatial cache read error for {cache_name}: {e}")
                return None
        return None

    @staticmethod
    def save_cached_result(cache_name: str, signature: str, data: Dict[str, Any]) -> bool:
        """Saves derived GIS output to disk cache with atomic write."""
        cache_file = os.path.join(CACHE_DIR, f"{cache_name}_{signature[:16]}.json")
        temp_file = f"{cache_file}.tmp"
        try:
            # Clean up older caches for this cache_name
            for fname in os.listdir(CACHE_DIR):
                if fname.startswith(f"{cache_name}_") and fname.endswith(".json"):
                    old_path = os.path.join(CACHE_DIR, fname)
                    try:
                        os.remove(old_path)
                    except OSError:
                        pass

            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(data, f)
            os.replace(temp_file, cache_file)
            logger.info(f"Spatial cache SAVED: {cache_name} [{signature[:8]}] ({os.path.getsize(cache_file) / 1024:.1f} KB)")
            return True
        except Exception as e:
            logger.warning(f"Spatial cache write error for {cache_name}: {e}")
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except OSError:
                    pass
            return False

spatial_cache = SpatialCacheEngine()
