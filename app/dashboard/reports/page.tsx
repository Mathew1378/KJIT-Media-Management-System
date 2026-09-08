'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  ShieldAlert,
  Upload,
  FileText,
  FileCode,
  AlertTriangle,
  X,
  Eye,
  PlusCircle,
} from 'lucide-react';
import { REPORT_FORMATS, ReportFormatConfig, ReportFieldConfig } from '@/lib/reports/reportTemplates';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface EventData {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  venue: string;
  expectedAudience: string;
  chiefGuest: string;
  createdBy: { name: string; email: string };
  mediaAssets: { id: string; fileName: string; fileId: string; fileType: string; caption: string }[];
}

export default function ReportGeneratorPage() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';

  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId);
  const [selectedFormatId, setSelectedFormatId] = useState<string>('Format1_Standard');
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  // Dynamic Form Field Values state: Record<fieldId, value>
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  // Dynamic Table Data state: Record<fieldId, rowArray>
  const [tableValues, setTableValues] = useState<Record<string, any[]>>({});
  // Selected Photos state: array of { fileId, fileName, caption }
  const [selectedPhotos, setSelectedPhotos] = useState<{ fileId: string; fileName: string; caption: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [msg, setMsg] = useState('');

  // Import Participant List Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importTargetFieldId, setImportTargetFieldId] = useState<string>('');
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [hasDuplicates, setHasDuplicates] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);

  const reportPrintRef = useRef<HTMLDivElement>(null);

  // Active format config object
  const currentFormat: ReportFormatConfig =
    REPORT_FORMATS.find((f) => f.id === selectedFormatId) || REPORT_FORMATS[0];

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.permissions) setUserPermissions(data.permissions);
        if (data.user) setUserRole(data.user.role);
      });

    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          if (!selectedEventId && data.events.length > 0) {
            setSelectedEventId(data.events[0].id);
          }
        }
        setLoading(false);
      });
  }, []);

  const activeEvent = events.find((e) => e.id === selectedEventId);

  // When active event or active format changes, auto-fill pre-populated fields
  useEffect(() => {
    if (!activeEvent || !currentFormat) return;

    const initialValues: Record<string, any> = {};
    const initialTables: Record<string, any[]> = {};

    currentFormat.fields.forEach((field) => {
      if (field.type === 'table') {
        initialTables[field.id] = [];
      } else if (field.autoFillKey) {
        if (field.autoFillKey === 'name') initialValues[field.id] = activeEvent.name;
        if (field.autoFillKey === 'category') initialValues[field.id] = activeEvent.category;
        if (field.autoFillKey === 'dateTime')
          initialValues[field.id] = new Date(activeEvent.dateTime).toLocaleString();
        if (field.autoFillKey === 'venue') initialValues[field.id] = activeEvent.venue;
        if (field.autoFillKey === 'expectedAudience') initialValues[field.id] = activeEvent.expectedAudience;
        if (field.autoFillKey === 'chiefGuest') initialValues[field.id] = activeEvent.chiefGuest || 'N/A';
        if (field.autoFillKey === 'createdByName') initialValues[field.id] = activeEvent.createdBy?.name || '';
      } else {
        initialValues[field.id] = '';
      }
    });

    setFormValues(initialValues);
    setTableValues(initialTables);

    // Auto-populate photos from event media assets
    if (activeEvent.mediaAssets && activeEvent.mediaAssets.length > 0) {
      setSelectedPhotos(
        activeEvent.mediaAssets.map((asset) => ({
          fileId: asset.fileId,
          fileName: asset.fileName,
          caption: asset.caption || `${activeEvent.name} photograph`,
        }))
      );
    } else {
      setSelectedPhotos([]);
    }
  }, [selectedEventId, selectedFormatId, activeEvent]);

  if (!loading && (userRole === 'ADMIN' || !userPermissions.includes('reports:generate'))) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 text-center">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-black text-slate-900">Restricted Access</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Academic Report Generation is strictly reserved for Faculty members. Your role ({userRole}) does not have permission to generate, view, edit, or export academic reports.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-kjit-navy text-white text-xs font-bold rounded-xl shadow"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Change Request 8: Report Builder Empty State when no events exist
  if (!loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="no-print">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-kjit-navy mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
            Dynamic Academic Report Generator
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Create an event first before generating a report</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no registered department events. Select or register an event first to build and export academic reports.
          </p>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-kjit-navy text-white text-xs font-bold rounded-xl shadow hover:bg-kjit-blue transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Register First Event
          </Link>
        </div>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const addTableRow = (fieldId: string, cols: any[]) => {
    const newRow: Record<string, any> = {};
    cols?.forEach((col) => {
      newRow[col.key] = '';
    });
    setTableValues((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), newRow],
    }));
  };

  const removeTableRow = (fieldId: string, rowIdx: number) => {
    setTableValues((prev) => ({
      ...prev,
      [fieldId]: (prev[fieldId] || []).filter((_, i) => i !== rowIdx),
    }));
  };

  const updateTableCell = (fieldId: string, rowIdx: number, colKey: string, val: any) => {
    const updated = [...(tableValues[fieldId] || [])];
    if (updated[rowIdx]) {
      updated[rowIdx][colKey] = val;
      setTableValues((prev) => ({ ...prev, [fieldId]: updated }));
    }
  };

  const handleSaveReport = async () => {
    if (!selectedEventId) return;
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          formatType: selectedFormatId,
          reportData: {
            formValues,
            tableValues,
            photos: selectedPhotos,
          },
        }),
      });

      if (res.ok) {
        setMsg('Academic report saved to system database successfully!');
      }
      setSaving(false);
    } catch (e) {
      setSaving(false);
    }
  };

  // CHANGE REQUEST 3 — Export / Print Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!reportPrintRef.current) return;
    setExportingPdf(true);

    try {
      const element = reportPrintRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `${currentFormat.id}_${activeEvent?.name ? activeEvent.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Report'}.pdf`;
      pdf.save(fileName);
      setExportingPdf(false);
    } catch (err) {
      console.error('PDF Export Error:', err);
      setExportingPdf(false);
    }
  };

  const handleExportWord = () => {
    if (!reportPrintRef.current) return;
    setExportingWord(true);

    try {
      const contentHtml = reportPrintRef.current.innerHTML;

      const fullDocumentHtml = `
        <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${currentFormat.name}</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForCustomXml/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; line-height: 1.5; padding: 20pt; }
            h1, h2, h3, h4 { color: #0f2c59; font-weight: bold; }
            table { border-collapse: collapse; width: 100%; margin-top: 10pt; margin-bottom: 10pt; }
            th { background-color: #f1f5f9; border: 1pt solid #cbd5e1; padding: 6pt; text-align: left; font-size: 10pt; font-weight: bold; }
            td { border: 1pt solid #cbd5e1; padding: 6pt; text-align: left; font-size: 10pt; }
            .header-title { font-size: 18pt; text-align: center; color: #0f2c59; text-transform: uppercase; font-weight: bold; }
            .header-sub { font-size: 10pt; text-align: center; color: #b8860b; text-transform: uppercase; font-weight: bold; }
            .header-address { font-size: 9pt; text-align: center; color: #64748b; }
            .signature-block { margin-top: 50pt; width: 100%; }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', fullDocumentHtml], {
        type: 'application/msword',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentFormat.id}_${activeEvent?.name ? activeEvent.name.replace(/[^a-zA-Z0-9]/g, '_') : 'Report'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportingWord(false);
    } catch (err) {
      console.error('Word Export Error:', err);
      setExportingWord(false);
    }
  };

  // CHANGE REQUEST 4 — Student List Import (Excel & Word)
  const openImportModal = (fieldId: string) => {
    setImportTargetFieldId(fieldId);
    setImportedRows([]);
    setHasDuplicates(false);
    setDuplicateCount(0);
    setImportModalOpen(true);
  };

  const processImportedData = (rawRows: any[]) => {
    const fieldConfig = currentFormat.fields.find((f) => f.id === importTargetFieldId);
    const columns = fieldConfig?.tableColumns || [];

    const mapped = rawRows.map((row, idx) => {
      const mappedRow: Record<string, any> = { slNo: idx + 1 };

      columns.forEach((col) => {
        const keyLower = col.key.toLowerCase();
        const labelLower = col.label.toLowerCase();

        // Match column keys dynamically
        let matchVal = '';
        Object.keys(row).forEach((k) => {
          const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (
            kClean.includes('reg') ||
            kClean.includes('roll') ||
            kClean.includes('id')
          ) {
            if (col.key === 'regNo' || col.key === 'paperId' || col.key === 'slNo') matchVal = row[k];
          } else if (
            kClean.includes('name') ||
            kClean.includes('student') ||
            kClean.includes('participant')
          ) {
            if (col.key === 'name' || col.key === 'winnerName' || col.key === 'authors') matchVal = row[k];
          } else if (
            kClean.includes('dept') ||
            kClean.includes('class') ||
            kClean.includes('sec') ||
            kClean.includes('org') ||
            kClean.includes('college')
          ) {
            if (
              col.key === 'dept' ||
              col.key === 'class' ||
              col.key === 'college' ||
              col.key === 'institution'
            )
              matchVal = row[k];
          } else if (kClean.includes('desig') || kClean.includes('role')) {
            if (col.key === 'designation') matchVal = row[k];
          } else if (kClean === col.key.toLowerCase()) {
            matchVal = row[k];
          }
        });

        mappedRow[col.key] = matchVal !== undefined ? String(matchVal) : '';
      });

      return mappedRow;
    });

    // Check for duplicate regNo / roll numbers
    const existing = tableValues[importTargetFieldId] || [];
    const existingIds = new Set(existing.map((r) => String(r.regNo || r.slNo || '').toLowerCase().trim()).filter(Boolean));
    let dupes = 0;

    mapped.forEach((r) => {
      const rId = String(r.regNo || r.slNo || '').toLowerCase().trim();
      if (rId && existingIds.has(rId)) {
        dupes++;
      }
    });

    setHasDuplicates(dupes > 0);
    setDuplicateCount(dupes);
    setImportedRows(mapped);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processImportedData(data);
      } catch (err) {
        alert('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleWordImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        // Parse HTML table elements
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const rows = Array.from(doc.querySelectorAll('tr'));

        if (rows.length < 2) {
          alert('No tabular participant data found in Word document.');
          return;
        }

        const headers = Array.from(rows[0].querySelectorAll('th, td')).map((c) =>
          c.textContent?.trim() || ''
        );
        const dataRows: any[] = [];

        for (let i = 1; i < rows.length; i++) {
          const cells = Array.from(rows[i].querySelectorAll('td')).map((c) =>
            c.textContent?.trim() || ''
          );
          if (cells.length === 0) continue;
          const obj: Record<string, string> = {};
          headers.forEach((h, hIdx) => {
            obj[h || `Column_${hIdx + 1}`] = cells[hIdx] || '';
          });
          dataRows.push(obj);
        }

        processImportedData(dataRows);
      } catch (err) {
        alert('Failed to extract table data from Word document.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = (mode: 'SKIP' | 'REPLACE' | 'MERGE') => {
    const currentList = tableValues[importTargetFieldId] || [];

    if (mode === 'SKIP') {
      const existingIds = new Set(currentList.map((r) => String(r.regNo || '').toLowerCase().trim()).filter(Boolean));
      const filteredNew = importedRows.filter((r) => {
        const rId = String(r.regNo || '').toLowerCase().trim();
        return !rId || !existingIds.has(rId);
      });
      setTableValues((prev) => ({
        ...prev,
        [importTargetFieldId]: [...currentList, ...filteredNew],
      }));
    } else if (mode === 'REPLACE') {
      setTableValues((prev) => ({
        ...prev,
        [importTargetFieldId]: importedRows,
      }));
    } else {
      // MERGE / APPEND
      setTableValues((prev) => ({
        ...prev,
        [importTargetFieldId]: [...currentList, ...importedRows],
      }));
    }

    setImportModalOpen(false);
    setImportedRows([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="no-print">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-kjit-navy mb-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
          Dynamic Academic Report Generator
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select an academic report format (Format 1-8). Form fields dynamically re-render based on template configuration.
        </p>
      </div>

      {msg && (
        <div className="no-print bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Select Event for Report
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({new Date(evt.dateTime).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Select Academic Report Format (1 of 8 Formats)
            </label>
            <select
              value={selectedFormatId}
              onChange={(e) => setSelectedFormatId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-none text-emerald-900"
            >
              {REPORT_FORMATS.map((fmt) => (
                <option key={fmt.id} value={fmt.id}>
                  {fmt.name} [{fmt.category}]
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>{currentFormat.description}</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveReport}
              disabled={saving}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              {saving ? 'Saving...' : 'Save Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Form Editor */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 text-emerald-900 flex items-center justify-between">
          <span>Dynamic Report Form Editor — [{currentFormat.name}]</span>
          <span className="text-xs text-slate-400 font-normal">Auto-filled data editable</span>
        </h2>

        <div className="space-y-5">
          {currentFormat.fields.map((field: ReportFieldConfig) => {
            const isReq = field.required;

            if (field.type === 'text') {
              return (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {field.label}{' '}
                    {isReq ? (
                      <span className="text-red-500 font-bold">* Required</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(Optional)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formValues[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  />
                </div>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {field.label}{' '}
                    {isReq ? (
                      <span className="text-red-500 font-bold">* Required</span>
                    ) : (
                      <span className="text-slate-400 font-normal">(Optional)</span>
                    )}
                  </label>
                  <textarea
                    rows={4}
                    value={formValues[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder || ''}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                  />
                </div>
              );
            }

            if (field.type === 'table') {
              const rows = tableValues[field.id] || [];
              return (
                <div key={field.id} className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <label className="block text-xs font-bold text-slate-700">
                      {field.label}{' '}
                      {isReq ? (
                        <span className="text-red-500 font-bold">* Required</span>
                      ) : (
                        <span className="text-slate-400 font-normal">(Optional)</span>
                      )}
                    </label>

                    {/* CHANGE REQUEST 4 — Import Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openImportModal(field.id)}
                        className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600" /> Import Student List (Excel / Word)
                      </button>

                      <button
                        type="button"
                        onClick={() => addTableRow(field.id, field.tableColumns || [])}
                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Manual Row
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          {field.tableColumns?.map((col) => (
                            <th key={col.key} className="p-2.5">
                              {col.label}
                            </th>
                          ))}
                          <th className="p-2.5 w-10 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={(field.tableColumns?.length || 0) + 1}
                              className="p-6 text-center text-xs text-slate-400 font-medium"
                            >
                              No participants added yet. Click <strong>Import Student List</strong> or <strong>Add Manual Row</strong>.
                            </td>
                          </tr>
                        ) : (
                          rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {field.tableColumns?.map((col) => (
                                <td key={col.key} className="p-2">
                                  <input
                                    type="text"
                                    value={row[col.key] || ''}
                                    onChange={(e) =>
                                      updateTableCell(field.id, rIdx, col.key, e.target.value)
                                    }
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                                  />
                                </td>
                              ))}
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeTableRow(field.id, rIdx)}
                                  className="text-slate-400 hover:text-red-600 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            if (field.type === 'photos') {
              return (
                <div key={field.id} className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    {field.label} (Auto-attached from Event Media)
                  </label>
                  {selectedPhotos.length === 0 ? (
                    <p className="text-xs text-slate-400">No photos attached for this event yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedPhotos.map((photo, pIdx) => (
                        <div
                          key={photo.fileId}
                          className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2"
                        >
                          <div className="font-bold text-slate-800 truncate">{photo.fileName}</div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">
                              Photo Caption
                            </label>
                            <input
                              type="text"
                              value={photo.caption}
                              onChange={(e) => {
                                const updated = [...selectedPhotos];
                                updated[pIdx].caption = e.target.value;
                                setSelectedPhotos(updated);
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* CHANGE REQUEST 3 — Report Preview & Dedicated Toolbar */}
      <div className="space-y-4">
        {/* Dedicated Report Toolbar outside printable container */}
        <div className="no-print bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Academic Report Preview Document</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSaveReport}
              disabled={saving}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              {saving ? 'Saving...' : 'Save Report'}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-kjit-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-kjit-gold" /> Print Report
            </button>

            <button
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> {exportingPdf ? 'Exporting PDF...' : 'Export PDF'}
            </button>

            <button
              onClick={handleExportWord}
              disabled={exportingWord}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> {exportingWord ? 'Exporting Word...' : 'Export Word (.docx)'}
            </button>
          </div>
        </div>

        {/* Official KJIT Academic Report Output Document Preview (Print Area) */}
        <div
          ref={reportPrintRef}
          id="report-preview-container"
          className="print-area bg-white border border-slate-300 rounded-2xl p-8 sm:p-12 shadow-xl space-y-8 text-slate-900"
        >
          {/* Official Institutional Header */}
          <div className="text-center border-b-2 border-[#0F2C59] pb-6 space-y-2 relative">
            <div className="flex items-center justify-center gap-4 mb-2">
              {/* Official Seal Emblem Vector */}
              <div className="w-14 h-14 rounded-full bg-[#0F2C59] border-2 border-[#D4AF37] p-1 shrink-0 overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="90 2" />
                  <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M50 15 L50 25 M35 20 L40 28 M65 20 L60 28 M25 32 L33 37 M75 32 L67 37" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
                  <polygon points="50,22 72,31 50,38 28,31" fill="#D4AF37" />
                  <polygon points="45,36 50,38 55,36 55,43 45,43" fill="#D4AF37" />
                  <path d="M26 48 C 36 44, 46 47, 50 51 C 54 47, 64 44, 74 48 L 74 65 C 64 61, 54 64, 50 67 C 46 64, 36 61, 26 65 Z" fill="#FFFFFF" stroke="#162E4D" strokeWidth="1.5" />
                  <line x1="50" y1="51" x2="50" y2="67" stroke="#162E4D" strokeWidth="1.5" />
                  <path d="M 22 74 Q 50 82 78 74 L 75 79 Q 50 87 25 79 Z" fill="#D4AF37" />
                  <path d="M 20 68 C 22 78, 38 88, 50 88 C 62 88, 78 78, 80 68" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              <div className="text-left">
                <div className="text-2xl font-serif font-black tracking-tight text-[#0F2C59] uppercase leading-none">
                  Kristu Jayanti University
                </div>
                <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B89628] mt-1">
                  (Deemed to be University) • UGC Autonomous • NAAC A++
                </div>
                <div className="text-[9.5px] text-slate-600 font-semibold mt-0.5">
                  KRISTU JAYANTI INSTITUTE OF TECHNOLOGY • School of Computer Science & Technology
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-sans border-t border-slate-100 pt-2 flex items-center justify-between px-4">
              <span>K. Narayanapura, Kothanur P.O., Bengaluru - 560077</span>
              <span>Academic Year: <strong>2026-2027</strong></span>
            </div>

            <div className="pt-3 text-base sm:text-lg font-serif font-black text-[#0F2C59] uppercase tracking-wide border-t-2 border-amber-400 max-w-xl mx-auto mt-2">
              {currentFormat.name}
            </div>
          </div>

          {/* Form Fields rendered in template order */}
          <div className="space-y-6 text-xs leading-relaxed">
            {currentFormat.fields.map((field) => {
              if (field.type === 'table') {
                const rows = tableValues[field.id] || [];
                return (
                  <div key={field.id} className="space-y-2 pt-2">
                    <h4 className="font-extrabold text-[#0F2C59] text-xs uppercase tracking-wider border-b border-slate-300 pb-1">
                      {field.label}
                    </h4>
                    <table className="w-full text-left border-collapse border border-slate-300">
                      <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                        <tr>
                          {field.tableColumns?.map((col) => (
                            <th key={col.key} className="border border-slate-300 p-2">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={field.tableColumns?.length || 1}
                              className="border border-slate-300 p-3 text-center text-slate-400 italic"
                            >
                              No participants recorded.
                            </td>
                          </tr>
                        ) : (
                          rows.map((r, i) => (
                            <tr key={i} className="border-b border-slate-200">
                              {field.tableColumns?.map((col) => (
                                <td key={col.key} className="border border-slate-300 p-2 font-medium">
                                  {r[col.key] || 'N/A'}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              }

              if (field.type === 'photos') {
                return (
                  <div key={field.id} className="space-y-3 pt-4 border-t border-slate-200">
                    <h4 className="font-extrabold text-[#0F2C59] text-xs uppercase tracking-wider">
                      {field.label}
                    </h4>
                    {selectedPhotos.length === 0 ? (
                      <p className="text-slate-400 italic">No photographs attached.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {selectedPhotos.map((photo) => (
                          <div
                            key={photo.fileId}
                            className="border border-slate-300 p-3 rounded-xl text-center space-y-2 bg-slate-50"
                          >
                            <div className="h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs">
                              [ATTACHED PRESS PHOTO: {photo.fileName}]
                            </div>
                            <p className="text-[11px] font-bold text-slate-800 italic">
                              "{photo.caption}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const val = formValues[field.id];
              if (!val && !field.required) return null;

              return (
                <div key={field.id} className="space-y-1">
                  <span className="font-extrabold text-[#0F2C59] uppercase text-[11px] block">
                    {field.label}:
                  </span>
                  <div className="text-slate-800 font-medium whitespace-pre-wrap bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                    {val || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Institutional Signature Block */}
          <div className="pt-16 border-t-2 border-slate-300 flex items-center justify-between text-xs font-bold text-slate-800">
            <div className="text-center space-y-1">
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <div className="font-black text-[#0F2C59]">Prepared by</div>
              <div className="text-[10px] text-slate-500 font-normal">Faculty Event Coordinator</div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <div className="font-black text-[#0F2C59]">Verified & Approved by</div>
              <div className="text-[10px] text-slate-500 font-normal">Head of Department / Dean</div>
            </div>
          </div>
        </div>
      </div>

      {/* CHANGE REQUEST 4 — Student List Import Modal */}
      {importModalOpen && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                Import Participant / Student List
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Upload an Excel sheet (.xlsx / .xls) or Word document (.docx) containing participant data.
                Columns such as <strong>Roll Number / Reg No</strong>, <strong>Student Name</strong>, and <strong>Class / Department</strong> will be auto-mapped.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-4 text-center cursor-pointer block transition-colors">
                  <FileSpreadsheet className="w-7 h-7 text-emerald-600 mx-auto mb-1" />
                  <span className="font-bold text-emerald-900 block">Import Excel Sheet</span>
                  <span className="text-[10px] text-slate-500">.xlsx or .xls format</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleExcelImport}
                    className="hidden"
                  />
                </label>

                <label className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 rounded-xl p-4 text-center cursor-pointer block transition-colors">
                  <FileText className="w-7 h-7 text-blue-600 mx-auto mb-1" />
                  <span className="font-bold text-blue-900 block">Import Word Document</span>
                  <span className="text-[10px] text-slate-500">.docx format containing table</span>
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleWordImport}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Duplicate Roll Number Warning */}
              {hasDuplicates && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl space-y-2">
                  <div className="font-bold flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Duplicate Roll Number / Participant Warning</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    Found {duplicateCount} student roll number(s) that already exist in your participant list. Select how to handle duplicate records:
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => confirmImport('SKIP')}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] rounded-lg shadow-sm"
                    >
                      Skip Duplicates
                    </button>
                    <button
                      onClick={() => confirmImport('REPLACE')}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px] rounded-lg shadow-sm"
                    >
                      Replace Existing
                    </button>
                    <button
                      onClick={() => confirmImport('MERGE')}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg shadow-sm"
                    >
                      Merge / Append All
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Extracted Table */}
              {importedRows.length > 0 && (
                <div className="space-y-2 flex-1 overflow-hidden">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Extracted Participants Preview ({importedRows.length} Rows)</span>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-y-auto max-h-48">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-600">
                        <tr>
                          {Object.keys(importedRows[0]).map((k) => (
                            <th key={k} className="p-2 border-b border-slate-200">
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedRows.map((r, i) => (
                          <tr key={i}>
                            {Object.keys(r).map((k) => (
                              <td key={k} className="p-2 text-[11px]">
                                {r[k]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!hasDuplicates && (
                    <div className="pt-3 flex justify-end gap-2">
                      <button
                        onClick={() => setImportModalOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => confirmImport('MERGE')}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow"
                      >
                        Import {importedRows.length} Participants
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
