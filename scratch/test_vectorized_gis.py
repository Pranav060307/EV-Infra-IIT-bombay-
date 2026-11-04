import time
import sys
import os
import numpy as np
import geopandas as gpd
from shapely.geometry import box
from shapely.prepared import prep
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.abspath('d:/EV Infra/backend'))
from app.services.gis import gis_service, CRS_UTM43N

pune_utm = gis_service._pune_urban_gdf.to_crs(CRS_UTM43N)
poly_geom = pune_utm.geometry.iloc[0]
minx, miny, maxx, maxy = poly_geom.bounds
grid_size_meters = 1000.0

# Method A: prep(poly_geom)
t0 = time.time()
prepared_poly = prep(poly_geom)
x_coords = np.arange(minx, maxx, grid_size_meters)
y_coords = np.arange(miny, maxy, grid_size_meters)

grid_polys = []
cell_ids = []
cell_areas_sqkm = []
cell_counter = 1

for x in x_coords:
    for y in y_coords:
        cell_box = box(x, y, x + grid_size_meters, y + grid_size_meters)
        if prepared_poly.intersects(cell_box):
            clipped = cell_box.intersection(poly_geom)
            area_sqkm = round(clipped.area / 1000000.0, 3)
            if not clipped.is_empty and area_sqkm >= 0.05:
                grid_polys.append(clipped)
                cell_ids.append(f"PUN-GRID-{cell_counter:04d}")
                cell_areas_sqkm.append(area_sqkm)
                cell_counter += 1

t1 = time.time()
print(f"Prepared polygon grid clipping: {(t1 - t0)*1000:.2f}ms | Generated {len(grid_polys)} cells")

# Method B: cKDTree for station distances
stations_utm = gis_service._stations_gdf.to_crs(CRS_UTM43N)
grid_gdf_utm = gpd.GeoDataFrame({
    "cell_id": cell_ids,
    "cell_area_sqkm": cell_areas_sqkm,
    "geometry": grid_polys
}, crs=CRS_UTM43N)

t0 = time.time()
station_coords = np.column_stack([stations_utm.geometry.x, stations_utm.geometry.y])
tree = cKDTree(station_coords)
centroids = grid_gdf_utm.geometry.centroid
centroid_coords = np.column_stack([centroids.x, centroids.y])
dists, _ = tree.query(centroid_coords)
t1 = time.time()
print(f"cKDTree distance calculation for {len(grid_polys)} cells: {(t1 - t0)*1000:.2f}ms")
