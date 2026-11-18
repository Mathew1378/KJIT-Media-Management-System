'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Folder,
  ExternalLink,
  Copy,
  Check,
  PlusCircle,
  Film,
  Sparkles,
  User,
  Calendar,
  HardDrive,
} from 'lucide-react';
import GoogleDriveCard from '@/components/GoogleDriveCard';

interface EventOption {
  id: string;
  name: string;
  category: string;
  dateTime: string;
  status: string;
  driveFolderUrl?: string;
  driveFolderId?: string;
  driveFolderAddedBy?: string;
  driveFolderAddedAt?: string;
  mediaAssets?: any[];
}

export default function UploadMediaPage() {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [fileType, setFileType] = useState<'GEOTAGGED' | 'RAW' | 'FINAL_REEL'>('GEOTAGGED');
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [reelDescription, setReelDescription] = useState('');
  const [editorName, setEditorName] = useState('');

  // Geotag fields
  const [lat, setLat] = useState('13.0581');
  const [lng, setLng] = useState('77.6433');
  const [locationName, setLocationName] = useState('KJIT Main Campus, Bengaluru');

  // Google Drive Link fields
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [savingDriveLink, setSavingDriveLink] = useState(false);
  const [driveLinkMsg, setDriveLinkMsg] = useState('');

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchEvents = () => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          if (data.events.length > 0 && !selectedEventId) {
            setSelectedEventId(data.events[0].id);
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const activeEvent = events.find((e) => e.id === selectedEventId);

  useEffect(() => {
    if (activeEvent?.driveFolderUrl) {
      setDriveUrlInput(activeEvent.driveFolderUrl);
    } else {
      setDriveUrlInput('');
    }
  }, [selectedEventId, activeEvent]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 || !selectedEventId) {
      setError('Please select an event and at least one file to upload');
      return;
    }

    setUploading(true);
    setMsg('');
    setError('');

    try {
      let successCount = 0;

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('eventId', selectedEventId);
        formData.append('fileType', fileType);
        formData.append('caption', caption || `${file.name}`);

        if (fileType === 'GEOTAGGED') {
          formData.append(
            'geotagData',
            JSON.stringify({
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              locationName,
              photographer: photographer || 'Media Crew Member',
              timestamp: new Date().toLocaleString(),
            })
          );
        } else if (fileType === 'FINAL_REEL') {
          formData.append(
            'geotagData',
            JSON.stringify({
              editorName: editorName || 'Event Editor',
              reelDescription: reelDescription || 'Final Edited Reel Version',
              timestamp: new Date().toLocaleString(),
            })
          );
        }

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          successCount++;
        }
      }

      if (fileType === 'FINAL_REEL') {
        setMsg('Final Reel version uploaded successfully! Department approval chain initiated.');
      } else {
        setMsg(`Successfully uploaded ${successCount} ${fileType} asset(s) to Google Drive storage.`);
      }

      setFiles([]);
      setCaption('');
      setUploading(false);
      fetchEvents();
    } catch (err: any) {
      setError('Upload request error');
      setUploading(false);
    }
  };

  const handleSaveDriveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !driveUrlInput) return;

    setSavingDriveLink(true);
    setDriveLinkMsg('');

    try {
      const res = await fetch(`/api/events/${selectedEventId}/drive-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveFolderUrl: driveUrlInput }),
      });

      const data = await res.json();
      if (res.ok) {
        setDriveLinkMsg('Google Drive Folder Link saved successfully!');
        fetchEvents();
      } else {
        setError(data.error || 'Failed to save Drive link');
      }
      setSavingDriveLink(false);
    } catch (err) {
      setSavingDriveLink(false);
    }
  };

  if (!loading && events.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#0F2C59] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 font-serif">
            <UploadCloud className="w-6 h-6 text-[#0F2C59]" />
            Digital Media Workspace
          </h1>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xl">
          <UploadCloud className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-black text-slate-800">Your department hasn't registered any events yet</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Media uploads and Google Drive repository attachments require a registered department event.
          </p>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0F2C59] to-[#162E4D] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg hover:from-[#162E4D] hover:to-slate-900 transition-all font-sans"
          >
            <PlusCircle className="w-4 h-4" /> Register First Event
          </Link>
        </div>
      </div>
    );
  }

  // Filter media assets by category
  const eventMedia = activeEvent?.mediaAssets || [];
  const geotaggedMedia = eventMedia.filter((m) => m.fileType === 'GEOTAGGED');
  const rawMedia = eventMedia.filter((m) => m.fileType === 'RAW');
  const finalReelMedia = eventMedia.filter((m) => m.fileType === 'FINAL_REEL');

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-[#0F2C59] mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D4AF37]" /> Back to Dashboard Overview
        </Link>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-serif flex items-center gap-3">
          <UploadCloud className="w-8 h-8 text-[#0F2C59]" />
          Digital Media Workspace
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload Geotagged Photos, Raw Press Images, and Final Edited Reels, synced directly to Kristu Jayanti Google Drive cloud storage.
        </p>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* EVENT SELECTOR */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-7 space-y-3">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          Active Department Event Workspace <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:ring-2 focus:ring-[#0F2C59] focus:outline-none shadow-sm"
        >
          {events.map((evt) => (
            <option key={evt.id} value={evt.id}>
              {evt.name} ({new Date(evt.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}) — [{evt.status.replace(/_/g, ' ')}]
            </option>
          ))}
        </select>
      </div>

      {/* PROMINENT BRANDED GOOGLE DRIVE CARD */}
      {activeEvent && (
        <GoogleDriveCard
          driveFolderLink={activeEvent.driveFolderUrl}
          eventName={activeEvent.name}
          addedBy={activeEvent.driveFolderAddedBy || 'Media Team Operations'}
          date={activeEvent.driveFolderAddedAt ? new Date(activeEvent.driveFolderAddedAt).toLocaleDateString('en-IN') : 'Current Year'}
          status={activeEvent.driveFolderUrl ? 'Synced & Active' : 'Drive Link Pending'}
        />
      )}

      {/* GOOGLE DRIVE LINK ATTACHMENT FORM */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0F2C59] flex items-center justify-center font-bold">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Attach Google Drive Folder Link</h3>
            <p className="text-xs text-slate-500">Provide direct Google Drive URL for raw video recordings and multi-gigabyte media archives.</p>
          </div>
        </div>

        <form onSubmit={handleSaveDriveLink} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={driveUrlInput}
              onChange={(e) => setDriveUrlInput(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
            />
            <button
              type="submit"
              disabled={savingDriveLink}
              className="px-6 py-3 bg-gradient-to-r from-[#0F2C59] to-[#162E4D] hover:from-[#162E4D] hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all font-sans shrink-0"
            >
              {savingDriveLink ? 'Saving...' : 'Save Drive Link'}
            </button>
          </div>

          {driveLinkMsg && (
            <p className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {driveLinkMsg}
            </p>
          )}
        </form>
      </div>

      {/* 3 CATEGORIES UPLOAD FORM */}
      <form onSubmit={handleUpload} className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Upload Media Assets</h2>
            <p className="text-xs text-slate-500">Upload files under 1 of the 3 institutional media categories</p>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Drive v3 Auto Sync
          </span>
        </div>

        {/* 3 Category Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { type: 'GEOTAGGED', label: '1. GEOTAGGED PHOTOS', sub: 'Location GPS Metadata', path: '/GeoTagged' },
            { type: 'RAW', label: '2. RAW PHOTOS', sub: 'High-Res Press Images', path: '/RawPhotos' },
            { type: 'FINAL_REEL', label: '3. FINAL EDITED REEL', sub: 'Reel Highlight Version', path: '/FinalReel' },
          ].map((cat) => (
            <button
              key={cat.type}
              type="button"
              onClick={() => setFileType(cat.type as any)}
              className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                fileType === cat.type
                  ? 'bg-gradient-to-br from-[#0F2C59] to-[#162E4D] border-amber-400 text-white shadow-xl ring-2 ring-amber-400/40'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="text-xs font-black tracking-wider uppercase">{cat.label}</div>
              <div className={`text-[11px] mt-1 ${fileType === cat.type ? 'text-amber-200' : 'text-slate-500'}`}>
                {cat.sub}
              </div>
              <div className={`text-[10px] font-mono mt-2 ${fileType === cat.type ? 'text-slate-300' : 'text-slate-400'}`}>
                Folder: {cat.path}
              </div>
            </button>
          ))}
        </div>

        {/* Category Inputs */}
        {fileType === 'GEOTAGGED' && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" /> GeoTag Location & Photographer Metadata
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10.5px] font-extrabold text-slate-500 uppercase mb-1">Latitude</label>
                <input
                  type="text"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-extrabold text-slate-500 uppercase mb-1">Longitude</label>
                <input
                  type="text"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-extrabold text-slate-500 uppercase mb-1">Location Name</label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {fileType === 'FINAL_REEL' && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-4">
            <span className="text-xs font-black text-amber-950 flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-700" /> Final Reel Version & Editor Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10.5px] font-extrabold text-slate-700 uppercase mb-1">Editor Name</label>
                <input
                  type="text"
                  value={editorName}
                  onChange={(e) => setEditorName(e.target.value)}
                  placeholder="e.g. Rahul Varma (Video Editor)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-extrabold text-slate-700 uppercase mb-1">Version Description</label>
                <input
                  type="text"
                  value={reelDescription}
                  onChange={(e) => setReelDescription(e.target.value)}
                  placeholder="e.g. Final Version 2 with audio mix"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                />
              </div>
            </div>
            <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
              * Note: Uploading a new Final Reel version updates the event status to <strong>REEL SUBMITTED</strong> and triggers the 3-stage department approval chain (Program Coordinator &rarr; HOD &rarr; Dean).
            </p>
          </div>
        )}

        {/* File Input */}
        <div className="space-y-2">
          <label className="block text-xs font-black text-slate-800">
            Select {fileType} Files to Upload <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            multiple={fileType !== 'FINAL_REEL'}
            required
            onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            className="w-full text-xs text-slate-700 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#0F2C59] file:text-white hover:file:bg-[#162E4D] cursor-pointer border border-slate-300 rounded-2xl bg-slate-50 p-2"
          />
          {files.length > 0 && (
            <p className="text-xs text-slate-600 font-bold">
              Selected {files.length} file(s): {files.map((f) => f.name).join(', ')}
            </p>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-black text-slate-800 mb-1">
            Media Caption / Description (Optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-[#0F2C59] focus:outline-none"
            placeholder="e.g. Keynote Speaker Inaugural Address"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-[#0F2C59] to-[#162E4D] hover:from-[#162E4D] hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all font-sans flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading ? 'Uploading to Drive...' : `Upload ${files.length || 1} File(s) as ${fileType}`}
          </button>
        </div>
      </form>

      {/* EDITORIAL MEDIA GALLERIES SECTION */}
      <div className="space-y-8 pt-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 font-serif">
            Uploaded Media Asset Galleries ({activeEvent?.name || 'Selected Event'})
          </h2>
          <span className="text-xs font-bold text-slate-500">
            Total {eventMedia.length} Media Assets
          </span>
        </div>

        {/* SECTION 1: GEOTAGGED PHOTOS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rose-600" />
              1. GEOTAGGED PHOTOS ({geotaggedMedia.length})
            </h3>
            <span className="text-[10px] font-extrabold uppercase bg-rose-50 text-rose-800 px-3 py-1 rounded-full border border-rose-200">
              Press Release Ready
            </span>
          </div>

          {geotaggedMedia.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No geotagged photos uploaded yet for this event.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {geotaggedMedia.map((media) => (
                <div key={media.id} className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all space-y-3 p-3">
                  <div className="relative h-44 bg-slate-200 rounded-xl overflow-hidden">
                    <img src={media.fileUrl} alt={media.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>GeoTagged</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-black text-slate-900 truncate">{media.caption || 'Event Image'}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <User className="w-3 h-3 text-slate-400" /> {media.uploadedBy?.name || 'Media Member'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: RAW PHOTOS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              2. RAW PHOTOS ({rawMedia.length})
            </h3>
            <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
              High-Res Archive
            </span>
          </div>

          {rawMedia.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No raw photos uploaded yet for this event.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {rawMedia.map((media) => (
                <div key={media.id} className="group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all p-2 space-y-2">
                  <div className="h-36 bg-slate-200 rounded-xl overflow-hidden">
                    <img src={media.fileUrl} alt={media.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 truncate px-1">{media.caption || 'Raw Photo'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: FINAL EDITED REEL */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-600" />
              3. FINAL EDITED REEL ({finalReelMedia.length})
            </h3>
            <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              Approval Highlight Reel
            </span>
          </div>

          {finalReelMedia.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-medium">
              No final reel versions uploaded yet. Editor upload will initiate the 3-stage approval chain.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {finalReelMedia.map((media) => (
                <div key={media.id} className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      Reel Highlight Asset
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(media.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white">{media.caption || 'Final Reel Highlight'}</p>
                  <div className="pt-2 text-xs text-slate-300 font-medium">
                    Editor: <span className="font-bold text-amber-200">{media.uploadedBy?.name || 'Event Editor'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
