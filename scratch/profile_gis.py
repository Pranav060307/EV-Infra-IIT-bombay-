import time
import sys
import os
import json
sys.path.insert(0, os.path.abspath('d:/EV Infra/backend'))

from app.services.gis import gis_service
from app.services.gap_engine import gap_engine
from app.services.policy_engine import policy_engine

print("=== GIS SERVICE PROFILING ===")

# Test 1: Pune Urban Grid (first run without cache)
gis_service._cached_pune_grid = None
t0 = time.time()
raw_grid = gis_service.generate_pune_urban_grid(1000.0)
t1 = time.time()
print(f"Pune Grid Raw Generation (uncached): {(t1 - t0)*1000:.2f}ms | Features: {len(raw_grid.get('features', []))}")

# Test 2: compute_grid_cgi
t0 = time.time()
grid_with_cgi = gap_engine.compute_grid_cgi(raw_grid)
t1 = time.time()
print(f"compute_grid_cgi: {(t1 - t0)*1000:.2f}ms")

# Test 3: evaluate_urban_compliance
t0 = time.time()
compliance_report = policy_engine.evaluate_urban_compliance(grid_with_cgi)
t1 = time.time()
print(f"evaluate_urban_compliance: {(t1 - t0)*1000:.2f}ms")

# Test 4: JSON dumps size and serialization time
t0 = time.time()
serialized = json.dumps({
    "urban_region": "Pune Urban Agglomeration (PMC + PCMC)",
    "area_sq_km": 516.18,
    "grid_resolution_meters": 1000.0,
    "total_grid_cells": len(grid_with_cgi.get("features", [])),
    "mop_policy_evaluation": compliance_report,
    "summary": raw_grid.get("summary", {}),
    "grid_geojson": grid_with_cgi
})
t1 = time.time()
print(f"JSON dumps of Pune Grid: {(t1 - t0)*1000:.2f}ms | Size: {len(serialized)/1024:.2f} KB")

# Test 5: Samruddhi Corridor (first run without cache)
gis_service._cached_samruddhi = None
t0 = time.time()
sam_corridor = gis_service.analyze_samruddhi_corridor(20.0)
t1 = time.time()
print(f"Samruddhi Corridor Analysis (uncached): {(t1 - t0)*1000:.2f}ms | Stations in buffer: {sam_corridor.get('total_stations_in_buffer')}")

t0 = time.time()
serialized_sam = json.dumps(sam_corridor)
t1 = time.time()
print(f"JSON dumps of Samruddhi: {(t1 - t0)*1000:.2f}ms | Size: {len(serialized_sam)/1024:.2f} KB")

# Test 6: Maharashtra Districts GeoJSON
t0 = time.time()
mh_geojson = gis_service.get_boundary_geojson("maharashtra_districts")
t1 = time.time()
print(f"Maharashtra Districts GeoJSON retrieval: {(t1 - t0)*1000:.2f}ms | Size: {len(json.dumps(mh_geojson))/1024:.2f} KB")
