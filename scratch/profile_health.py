import time
import sys
import os
sys.path.insert(0, os.path.abspath('d:/EV Infra/backend'))

from app.services.gis import gis_service

t0 = time.time()
b = gis_service.get_boundaries_list()
t1 = time.time()
print(f"get_boundaries_list: {(t1 - t0)*1000:.2f}ms")

t0 = time.time()
st_len = len(gis_service._stations_gdf) if gis_service._stations_gdf is not None else 0
t1 = time.time()
print(f"stations count: {(t1 - t0)*1000:.2f}ms")
