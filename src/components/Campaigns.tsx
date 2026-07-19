/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  Send, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  BarChart2, 
  Users, 
  Upload, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Search
} from "lucide-react";
import { Campaign, Contact, MetaTemplate } from "../types";

interface CampaignsProps {
  tenantId: string;
}

export default function Campaigns({ tenantId }: CampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  
  // Create Campaign States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campName, setCampName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [campSchedule, setCampSchedule] = useState("");

  // Create Contact States
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTags, setContactTags] = useState("");

  // CSV Sim State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchData = () => {
    if (!tenantId) return;
    // Fetch campaigns
    fetch(`/api/campaigns/${tenantId}`)
      .then(res => res.json())
      .then(setCampaigns);

    // Fetch contacts
    fetch(`/api/contacts/${tenantId}`)
      .then(res => res.json())
      .then(setContacts);

    // Fetch templates
    fetch(`/api/templates/${tenantId}`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
        }
      });
  };

  useEffect(() => {
    fetchData();
  }, [tenantId]);

  // Create Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName) return;

    fetch(`/api/campaigns/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: campName,
        templateId: selectedTemplateId,
        scheduledTime: campSchedule || undefined
      })
    })
      .then(res => res.json())
      .then(newCamp => {
        setCampaigns(prev => [newCamp, ...prev]);
        setCampName("");
        setCampSchedule("");
        setShowCreateModal(false);
        setStatusMessage("Campaign created and scheduled successfully!");
        setTimeout(() => setStatusMessage(""), 4000);
      });
  };

  // Create Contact manually
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    fetch(`/api/contacts/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: contactName,
        phoneNumber: contactPhone,
        email: contactEmail || undefined,
        tags: contactTags ? contactTags.split(",").map(t => t.trim()) : [],
        customFields: { "Source": "Manual SaaS Entry" }
      })
    })
      .then(res => res.json())
      .then(newContact => {
        setContacts(prev => [newContact, ...prev]);
        setContactName("");
        setContactPhone("");
        setContactEmail("");
        setContactTags("");
        setStatusMessage("Contact added to broadcast directory.");
        setTimeout(() => setStatusMessage(""), 4000);
      });
  };

  // CSV Drag/Upload Simulation
  const handleCsvSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setCsvFile(files[0]);
    setIsUploading(true);

    // Simulate parse
    setTimeout(() => {
      // Inject simulated contacts
      const batchContacts = [
        { id: `c-csv1-${Date.now()}`, tenantId, name: "Robert Downey", phoneNumber: "+1555110292", email: "rdj@marvel.com", tags: ["CSV-Import", "Lead"], customFields: { "LeadScore": "High" }, createdAt: "2026-07-14", segments: ["High Value"] },
        { id: `c-csv2-${Date.now()}`, tenantId, name: "Chris Evans", phoneNumber: "+1555029311", email: "cap@marvel.com", tags: ["CSV-Import", "VIP"], customFields: { "Region": "Midwest" }, createdAt: "2026-07-14", segments: ["VIP Customer"] },
        { id: `c-csv3-${Date.now()}`, tenantId, name: "Scarlett Johansson", phoneNumber: "+1555938421", email: "scarlett@widow.net", tags: ["CSV-Import"], customFields: { "Industry": "PR" }, createdAt: "2026-07-14", segments: [] }
      ];

      batchContacts.forEach(bc => {
        fetch(`/api/contacts/${tenantId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bc)
        });
      });

      setContacts(prev => [...batchContacts, ...prev]);
      setIsUploading(false);
      setCsvFile(null);
      setStatusMessage("CSV Parsed. Added 3 premium contacts to broadcast database.");
      setTimeout(() => setStatusMessage(""), 5000);
    }, 1500);
  };

  // Export Contacts to simulated download CSV
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Phone,Email,Tags"].join(",") + "\n"
      + contacts.map(c => `"${c.name}","${c.phoneNumber}","${c.email || ""}","${c.tags.join(";")}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whatsapp_contacts_export_${tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast Notification Banner */}
      {statusMessage && (
        <div className="mb-6 bg-teal-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg shadow-teal-600/10">
          <span className="text-xs font-mono font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {statusMessage}
          </span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Broadcast Campaigns <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Bulk Engine</span>
          </h2>
          <p className="text-sm text-slate-500">Design, template sync, scheduling, and Meta Cloud API delivery analytics tracking.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4" /> Draft Campaign
          </button>
        </div>
      </div>

      {/* Grid: Left Column Campaigns List, Right Column Contact List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIVE BROADCASTS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-indigo-500" /> Active Bulk Broadcasting Campaigns
              </h4>
              <button onClick={fetchData} className="text-slate-400 hover:text-slate-600">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Send className="h-10 w-10 mx-auto mb-2 opacity-30 animate-pulse" />
                  <p className="text-xs font-mono">No bulk broadcasting campaigns drafted yet.</p>
                </div>
              ) : (
                campaigns.map((camp) => {
                  const total = camp.sentCount || 100;
                  const deliverRate = camp.sentCount > 0 ? Math.round((camp.deliveredCount / total) * 100) : 0;
                  const readRate = camp.sentCount > 0 ? Math.round((camp.readCount / total) * 100) : 0;
                  const clickRate = camp.sentCount > 0 ? Math.round((camp.clickedCount / total) * 100) : 0;

                  return (
                    <div key={camp.id} className="p-6 hover:bg-slate-50 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div>
                          <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {camp.name}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Created: {camp.createdAt} | Template ID: {camp.templateId}
                          </p>
                        </div>

                        <span className={`self-start inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono ${
                          camp.status === "completed" ? "bg-teal-100 text-teal-800" :
                          camp.status === "scheduled" ? "bg-indigo-100 text-indigo-800" :
                          "bg-slate-100 text-slate-700"
                        }`}>
                          {camp.status.toUpperCase()}
                        </span>
                      </div>

                      {camp.status === "scheduled" ? (
                        <div className="bg-slate-100/70 border border-slate-200/50 p-3 rounded-lg flex items-center gap-2 text-xs text-slate-600">
                          <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>Scheduled for release on: <strong className="font-mono">{new Date(camp.scheduledTime || "").toLocaleString()}</strong></span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                          <div className="text-center">
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Sent</p>
                            <span className="text-base font-extrabold text-slate-800 font-mono">{camp.sentCount}</span>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Delivered</p>
                            <span className="text-base font-extrabold text-slate-800 font-mono">{deliverRate}%</span>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Read</p>
                            <span className="text-base font-extrabold text-indigo-600 font-mono">{readRate}%</span>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Click Ratio</p>
                            <span className="text-base font-extrabold text-teal-600 font-mono">{clickRate}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTACTS DIRECTORY AND CSV IMPORT */}
        <div className="space-y-6">
          
          {/* CSV Uploader Simulator Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-teal-600" /> WhatsApp CSV Broadcast Import
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Drag & drop standard CSV phone list. Columns parsed: <code className="font-mono bg-slate-100 text-slate-700 px-1 rounded">Name</code>, <code className="font-mono bg-slate-100 text-slate-700 px-1 rounded">Phone</code>, <code className="font-mono bg-slate-100 text-slate-700 px-1 rounded">Email</code>.
            </p>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvSimulation}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-1.5 justify-center py-2">
                  <RefreshCw className="h-6 w-6 text-teal-600 animate-spin" />
                  <span className="text-xs font-mono font-medium text-slate-600">Extracting recipient records...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <Upload className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-600">Select or Drag CSV file</span>
                  <span className="text-[10px] text-slate-400 font-mono">Maximum 50,000 lines (Meta Limit)</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-500" /> Add Single Contact Record
            </h4>
            
            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Full Name (e.g. John Doe)"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="WhatsApp Number (with country code)"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  placeholder="Email ID (Optional)"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={contactTags}
                  onChange={(e) => setContactTags(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg transition"
              >
                Add Recipient
              </button>
            </form>
          </div>

          {/* Contacts Table directory widget */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-500" /> Contacts Database ({contacts.length})
              </span>
              <button
                onClick={handleExportCSV}
                className="text-[10px] border border-slate-200 hover:bg-slate-50 py-1 px-2.5 rounded font-mono font-medium flex items-center gap-1 text-slate-600 transition"
              >
                <Download className="h-3 w-3" /> Export List
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
              {contacts.map((c) => (
                <div key={c.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate leading-none mb-0.5">{c.name}</p>
                    <p className="text-[10px] font-mono text-slate-500">{c.phoneNumber}</p>
                  </div>
                  <div className="flex gap-1">
                    {c.tags.slice(0, 1).map(t => (
                      <span key={t} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL FORM */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative">
            <h4 className="text-base font-bold text-slate-900 mb-2">Draft WhatsApp Broadcast</h4>
            <p className="text-xs text-slate-400 mb-4">Set up a high-converting bulk campaign using pre-approved Meta message templates.</p>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Campaign Display Name:</label>
                <input
                  type="text"
                  placeholder="e.g., Summer Early Access Promo"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Approved Template Link:</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Schedule Send (Optional):</label>
                <input
                  type="datetime-local"
                  value={campSchedule}
                  onChange={(e) => setCampSchedule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <span className="text-[9px] text-slate-400 mt-1 block">Leave blank to launch immediately (simulates instant broadcast).</span>
              </div>

              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 py-2 px-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow transition"
                >
                  Queue Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
