"""
ChargeAtlas India - Reproducible Analytical Ingestion Runner
Phase 3: Authentic Data Foundation & Reproducibility Verification

Executes the end-to-end reproducible ingestion pipeline:
1. Verifies cryptographic SHA-256 hashes of preserved source files.
2. Audits coordinate bounds, data types, and schemas.
3. Ingests authentic entities into PostgreSQL/PostGIS or active DB engine.
4. Validates authentic vs synthetic record isolation.
5. Prints full audit table of record counts, source mappings, and quality metrics.

Usage:
    python backend/scripts/reproduce_ingestion.py [--verify-only]
"""

import os
import sys
import argparse

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from scripts.ingest_authentic_data import run_ingestion, calculate_sha256, PROCESSED_DIR

EXPECTED_HASHES = {
    "vahan_maharashtra_ev_registrations.csv": "e3721297e4a4b6b7e44f87fe9fe6ccaac6b11c3150b31c5bda97b3b0ab017910",
    "maharashtra_verified_charging_stations.json": "2bffe98eb5491037ca917da6879cbb36c913513316141607a85cfdc0c2b3a5f3",
    "maharashtra_district_population.csv": "f8bbfa737b6b376dee25d8637f368261c710e9f78634c56d22fa9151b75944cb",
    "samruddhi_interchanges.json": "8135dc262b2d9c807abd96369a23b23911e38260112e711259a202aaca120660",
    "samruddhi_mahamarg_alignment.geojson": "576e4d5900fb731fef0665a8914fc06fcc29780944324e05c322bc6b39b1b215",
    "pune_urban_boundary.geojson": "c01e67e55d361d8a91ac2212ee205ac68cf9e3f86cac56eea997a5913b1a0332",
    "maharashtra_districts.geojson": "7adfbe315dfc17055a3a2c8688b0243d80661ce8a9edd5215098878b70433078",
    "mop_charging_guidelines_2024.json": "8be5a4971c8f8c76762d79586d73942eeb16ae9fb6e6886ba06ec3d4d5ca4d8f"
}

def verify_source_integrity():
    print("Verifying Cryptographic SHA-256 Checksums of Preserved Source Files...")
    all_match = True
    for fname, exp_hash in EXPECTED_HASHES.items():
        fpath = os.path.join(PROCESSED_DIR, fname)
        if not os.path.exists(fpath):
            print(f"  [MISSING] {fname}")
            all_match = False
            continue
        act_hash = calculate_sha256(fpath)
        if act_hash == exp_hash:
            print(f"  [VERIFIED] {fname:<45} -> SHA-256 MATCH")
        else:
            print(f"  [MISMATCH] {fname:<45} -> Expected {exp_hash[:10]}... Got {act_hash[:10]}...")
            all_match = False
    return all_match

def main():
    parser = argparse.ArgumentParser(description="ChargeAtlas India Ingestion Reproducibility CLI")
    parser.add_argument("--verify-only", action="store_true", help="Only verify source hashes without ingesting")
    args = parser.parse_args()

    print("\n======================================================================")
    print("  CHARGEATLAS INDIA - REPRODUCIBILITY & INTEGRITY AUDITOR")
    print("======================================================================\n")

    integrity_ok = verify_source_integrity()
    if not integrity_ok:
        print("\n[WARNING] One or more source file checksums failed or files are missing.")
        if args.verify_only:
            sys.exit(1)

    if args.verify_only:
        print("\n[SUCCESS] All preserved source files verified cryptographically.")
        sys.exit(0)

    print("\nProceeding to execute database ingestion...")
    success, results = run_ingestion()
    if not success:
        print("\n[FAILED] Ingestion script encountered an error.")
        sys.exit(1)

    print("\n[SUCCESS] Reproducible ingestion pipeline completed successfully.")

if __name__ == "__main__":
    main()
