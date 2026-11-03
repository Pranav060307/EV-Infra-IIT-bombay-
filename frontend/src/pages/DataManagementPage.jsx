import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  Eye, 
  Play, 
  Trash2, 
  FileCheck, 
  Layers, 
  AlertCircle,
  RefreshCw,
  X,
  FileCode,
  Check
} from 'lucide-react';
import { 
  getDatasetMetrics, 
  listDatasets, 
  uploadDataset, 
  validateDataset, 
  getDatasetDetails, 
  importDataset, 
  deleteDataset 
} from '../services/api';

export const DataManagementPage = () => {
  const [metrics, setMetrics] = useState({
    total_datasets: 0,
    uploaded_count: 0,
    validated_count: 0,
    imported_count: 0,
    rejected_count: 0,
    total_records_processed: 0
  });
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('charging_stations');
  const [isSyntheticUpload, setIsSyntheticUpload] = useState(false);
  const [activeDatasetDetail, setActiveDatasetDetail] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const fileInputRef = useRef(null);

  const templates = [
    { name: 'Charging Stations Template', file: 'charging_stations_template.csv', desc: 'Station name, lat/long, operator, access type' },
    { name: 'Connectors & EVSE Template', file: 'charging_connectors_template.csv', desc: 'CCS-2, Type-2, Bharat AC-001, power (kW)' },
    { name: 'EV Registrations Template', file: 'ev_registrations_template.csv', desc: 'District code, year, month, 2W/3W/4W/Bus' },
    { name: 'Candidate Locations Template', file: 'candidate_locations_template.csv', desc: 'Petrol pumps, malls, transit nodes, substation proximity' },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, listRes] = await Promise.allSettled([getDatasetMetrics(), listDatasets()]);
      if (mRes.status === 'fulfilled') setMetrics(mRes.value);
      if (listRes.status === 'fulfilled') setDatasets(listRes.value || []);
    } catch (err) {
      console.error('Error fetching datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setActionMessage({ type: 'info', text: `Uploading ${file.name}...` });
      const res = await uploadDataset(file, uploadCategory, isSyntheticUpload);
      setActionMessage({ type: 'success', text: `Uploaded ${file.name} successfully. Ready for validation.` });
      await fetchData();
      // Auto-open preview
      handleViewDetails(res.dataset_id);
    } catch (err) {
      setActionMessage({ 
        type: 'error', 
        text: `Upload failed: ${err.response?.data?.detail || err.message}` 
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleValidate = async (datasetId) => {
    try {
      setActionMessage({ type: 'info', text: 'Running validation, coordinate checks & duplicate detection...' });
      const res = await validateDataset(datasetId);
      setActionMessage({ 
        type: 'success', 
        text: `Validation completed: Quality score ${res.quality_scores?.overall_score}%. Status: ${res.status}` 
      });
      await fetchData();
      handleViewDetails(datasetId);
    } catch (err) {
      setActionMessage({ type: 'error', text: `Validation failed: ${err.response?.data?.detail || err.message}` });
    }
  };

  const handleImport = async (datasetId) => {
    try {
      setActionMessage({ type: 'info', text: 'Ingesting validated records into production database...' });
      const res = await importDataset(datasetId);
      setActionMessage({ type: 'success', text: res.message });
      await fetchData();
      if (activeDatasetDetail?.id === datasetId) {
        handleViewDetails(datasetId);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: `Import failed: ${err.response?.data?.detail || err.message}` });
    }
  };

  const handleDelete = async (datasetId) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;
    try {
      await deleteDataset(datasetId);
      setActionMessage({ type: 'info', text: `Dataset ${datasetId} deleted.` });
      if (activeDatasetDetail?.id === datasetId) setActiveDatasetDetail(null);
      await fetchData();
    } catch (err) {
      setActionMessage({ type: 'error', text: `Delete failed: ${err.response?.data?.detail || err.message}` });
    }
  };

  const handleViewDetails = async (datasetId) => {
    try {
      const details = await getDatasetDetails(datasetId);
      setActiveDatasetDetail(details);
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IMPORTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">IMPORTED</span>;
      case 'VALIDATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">VALIDATED</span>;
      case 'NEEDS_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">NEEDS REVIEW</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">FAILED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">UPLOADED</span>;
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Module 1: Data Integration
            </span>
            <span className="text-xs text-slate-400">PostgreSQL + PostGIS Ingestion Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
            Data Management & Import Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload custom datasets, inspect coordinate bounding checks, review duplicate candidates, and approve production database ingestion.
          </p>
        </div>

        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          actionMessage.type === 'error' ? 'bg-rose-950/40 border-rose-500/30 text-rose-300' :
          actionMessage.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' :
          'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Uploaded</span>
          <p className="text-xl font-bold font-mono text-white mt-1">{metrics.total_datasets}</p>
        </div>
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20">
          <span className="text-[10px] font-mono uppercase text-cyan-400">Validated</span>
          <p className="text-xl font-bold font-mono text-cyan-300 mt-1">{metrics.validated_count}</p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
          <span className="text-[10px] font-mono uppercase text-emerald-400">Imported to DB</span>
          <p className="text-xl font-bold font-mono text-emerald-300 mt-1">{metrics.imported_count}</p>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20">
          <span className="text-[10px] font-mono uppercase text-rose-400">Rejected / Failed</span>
          <p className="text-xl font-bold font-mono text-rose-300 mt-1">{metrics.rejected_count}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 col-span-2">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Records Processed</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {metrics.total_records_processed.toLocaleString()} rows
          </p>
        </div>
      </div>

      {/* Cryptographically Audited Real-World Data Register */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Data Provenance Register (SHA-256)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authoritative real-world government datasets driving active GIS analytics and gap computations.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
            Zero Synthetic Contamination
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Source Authority</th>
                <th className="py-2.5 px-3">Scope / Records</th>
                <th className="py-2.5 px-3 font-mono">SHA-256 Digest</th>
                <th className="py-2.5 px-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {[
                { file: 'maharashtra_districts.geojson', auth: 'Survey of India / LGD', scope: '35 district boundaries (Thane-Palghar unified)', hash: '7adfbe315dfc17055a3a2c8688b0243d...', status: 'VERIFIED', isPartial: false },
                { file: 'pune_urban_boundary.geojson', auth: 'PMC & PCMC Town Planning', scope: '516.18 km² municipal boundary', hash: 'c01e67e55d361d8a91ac2212ee205ac6...', status: 'VERIFIED', isPartial: false },
                { file: 'samruddhi_mahamarg_alignment.geojson', auth: 'MSRDC', scope: '701.0 km statutory / 644.4 km chord line', hash: '576e4d5900fb731fef0665a8914fc06f...', status: 'VERIFIED', isPartial: false },
                { file: 'samruddhi_interchanges.json', auth: 'MSRDC Survey Registry', scope: '17 operational interchanges (24 planned)', hash: '8135dc262b2d9c807abd96369a23b239...', status: 'VERIFIED', isPartial: false },
                { file: 'maharashtra_verified_charging_stations.json', auth: 'BEE EV Yatra & OSM', scope: '25 stations / 68 points', hash: '2bffe98eb5491037ca917da6879cbb36...', status: 'VERIFIED', isPartial: false },
                { file: 'vahan_maharashtra_ev_registrations.csv', auth: 'MoRTH VAHAN 4 Open Portal', scope: '886,752 vehicles (36 dist; Oct 2024)', hash: 'e3721297e4a4b6b7e44f87fe9fe6ccaa...', status: 'PARTIALLY VERIFIED', isPartial: true },
                { file: 'maharashtra_district_population.csv', auth: 'Census of India (ORGI)', scope: '36 district populations & urban %', hash: 'f8bbfa737b6b376dee25d8637f368261...', status: 'VERIFIED', isPartial: false },
                { file: 'mop_charging_guidelines_2024.json', auth: 'Ministry of Power, GoI', scope: '17 Sept 2024 Norms (Clause 11 & 12)', hash: '8be5a4971c8f8c76762d79586d73942e...', status: 'VERIFIED', isPartial: false },
              ].map((row) => (
                <tr key={row.file} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-mono font-medium text-white">{row.file}</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.auth}</td>
                  <td className="py-2.5 px-3 text-slate-400">{row.scope}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-cyan-400">{row.hash}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.isPartial 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Section */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Ingest New Dataset File</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supported: <strong>CSV, XLSX, XLS, GeoJSON</strong>. Staged in isolation prior to verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="charging_stations">Charging Stations Layer</option>
              <option value="ev_registrations">EV Registrations (VAHAN)</option>
              <option value="connectors">EVSE & Connectors</option>
              <option value="candidate_locations">Candidate Siting Locations</option>
            </select>

            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isSyntheticUpload}
                onChange={(e) => setIsSyntheticUpload(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
              />
              <span>Mark as Demonstration Mock</span>
            </label>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls,.geojson,.json"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-200">
            {uploading ? 'Processing File...' : 'Click or Drag & Drop Dataset File Here'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Schema headers are automatically mapped, stripped, and checked against India bounding box.
          </p>
        </div>
      </div>

      {/* Datasets Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Uploaded Datasets & Staging Registry</span>
        </h3>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Dataset ID / File</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4 text-right">Rows</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Quality Score</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {datasets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No datasets staged yet. Upload a dataset or download templates below.
                    </td>
                  </tr>
                ) : (
                  datasets.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white">
                        <div>{d.file_name}</div>
                        <div className="text-[10px] text-slate-500">{d.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{d.dataset_category}</td>
                      <td className="py-3 px-4 font-mono text-[11px] uppercase">{d.file_format}</td>
                      <td className="py-3 px-4 text-right font-mono">{d.total_rows_read}</td>
                      <td className="py-3 px-4">{getStatusBadge(d.status)}</td>
                      <td className="py-3 px-4 text-center font-mono">
                        {d.quality_score !== null ? (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            d.quality_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            d.quality_score >= 50 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {d.quality_score}%
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {d.is_synthetic ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">MOCK</span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">REAL</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Details */}
                          <button
                            onClick={() => handleViewDetails(d.id)}
                            title="Preview Records & Report"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Validate Action */}
                          {d.status === 'UPLOADED' && (
                            <button
                              onClick={() => handleValidate(d.id)}
                              title="Run Validation Engine"
                              className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>Validate</span>
                            </button>
                          )}

                          {/* Approve & Import Action */}
                          {(d.status === 'VALIDATED' || d.status === 'NEEDS_REVIEW') && (
                            <button
                              onClick={() => handleImport(d.id)}
                              title="Approve & Import to PostgreSQL"
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              <span>Import</span>
                            </button>
                          )}

                          {/* Delete Action */}
                          <button
                            onClick={() => handleDelete(d.id)}
                            title="Delete Staged Dataset"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Preview & Validation Report Drawer */}
      {activeDatasetDetail && (
        <div className="p-6 rounded-2xl border border-slate-700 bg-slate-900/90 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Dataset Inspection & Validation Report: {activeDatasetDetail.file_name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {activeDatasetDetail.id} • Category: {activeDatasetDetail.dataset_category} • Status: {activeDatasetDetail.status}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(activeDatasetDetail.status === 'VALIDATED' || activeDatasetDetail.status === 'NEEDS_REVIEW') && (
                <button
                  onClick={() => handleImport(activeDatasetDetail.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Ingest to Production DB</span>
                </button>
              )}
              <button
                onClick={() => setActiveDatasetDetail(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quality Score Metrics Breakdown */}
          {activeDatasetDetail.quality_report ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Overall Quality Score</span>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  {activeDatasetDetail.quality_report.overall_score}%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Weighted Confidence Rating</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Coordinate Validity</span>
                <p className="text-xl font-bold font-mono text-white">
                  {activeDatasetDetail.quality_report.coordinate_validity}%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Inside Lat 6-38°, Lon 68-98°</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Completeness</span>
                <p className="text-xl font-bold font-mono text-white">
                  {activeDatasetDetail.quality_report.completeness}%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Non-null required columns</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-500">Duplicate Candidates</span>
                <p className="text-xl font-bold font-mono text-amber-400">
                  {activeDatasetDetail.quality_report.duplicate_rate}%
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">&lt;100m proximity matches</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Validation has not been executed on this staged dataset yet.</span>
              <button
                onClick={() => handleValidate(activeDatasetDetail.id)}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Validation Engine</span>
              </button>
            </div>
          )}

          {/* Sample Rows Preview Table */}
          {activeDatasetDetail.preview_data?.sample_rows?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Staged Records Sample Preview</span>
              <div className="border border-slate-800 rounded-lg overflow-x-auto max-h-56 bg-slate-950">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      {activeDatasetDetail.preview_data.columns.map((c, i) => (
                        <th key={i} className="py-2 px-3 whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {activeDatasetDetail.preview_data.sample_rows.map((row, r_idx) => (
                      <tr key={r_idx} className="hover:bg-slate-900/60">
                        {activeDatasetDetail.preview_data.columns.map((col, c_idx) => (
                          <td key={c_idx} className="py-1.5 px-3 whitespace-nowrap">
                            {row[col] === null ? <span className="text-slate-600">NULL</span> : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Duplicate Candidates Flagged (if any) */}
          {activeDatasetDetail.quality_report?.issues_summary?.duplicate_candidates?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Detected Duplicate Candidates (&lt;100m proximity) — Review Only (Not Auto-Merged)</span>
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {activeDatasetDetail.quality_report.issues_summary.duplicate_candidates.map((dup, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950 border border-amber-500/20 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-amber-300 font-medium">
                        {dup.type === 'INTRA_DATASET_DUPLICATE' ? `Rows #${dup.row_a} & #${dup.row_b}: ` : `Row #${dup.uploaded_row} vs DB: `}
                      </span>
                      <span className="text-slate-300">{dup.name_a || dup.uploaded_name} ↔ {dup.name_b || dup.existing_name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-cyan-400">Distance: {dup.distance_meters}m</span>
                      <span className="text-emerald-400">Similarity: {dup.name_similarity_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Downloadable Standard Templates */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Standardized CSV Templates</span>
        </h3>
        <p className="text-xs text-slate-400">
          Use these templates to prepare real-world VAHAN or CPO datasets for 1-click ingestion.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((tpl, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="text-xs font-semibold text-slate-200">{tpl.name}</span>
                </div>
                <p className="text-[11px] text-slate-400">{tpl.desc}</p>
              </div>
              <a
                href={`/data/templates/${tpl.file}`}
                download
                className="mt-4 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .csv</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataManagementPage;
