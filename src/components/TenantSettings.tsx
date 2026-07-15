/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Settings, Plus, Trash2, Tag, CheckCircle2, Sliders, Shield } from "lucide-react";

interface TenantSettingsProps {
  tenantId: string;
}

export interface CustomLabel {
  name: string;
  color: string; // Tailwind class background & text e.g., "bg-blue-100 text-blue-800"
}

export default function TenantSettings({ tenantId }: TenantSettingsProps) {
  const [labels, setLabels] = useState<CustomLabel[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-100 text-blue-800 border-blue-200");
  const [toastMsg, setToastMsg] = useState("");

  const DEFAULT_LABELS: CustomLabel[] = [
    { name: "VIP", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { name: "Support", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "Urgent", color: "bg-rose-100 text-rose-800 border-rose-200" },
    { name: "Logistics", color: "bg-amber-100 text-amber-800 border-amber-200" },
    { name: "Interested", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { name: "Follow-up", color: "bg-indigo-100 text-indigo-800 border-indigo-200" }
  ];

  const COLOR_PALETTES = [
    { label: "Blue Slate", value: "bg-blue-100 text-blue-800 border-blue-200" },
    { label: "Emerald Mint", value: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { label: "Rose Ruby", value: "bg-rose-100 text-rose-800 border-rose-200" },
    { label: "Amber Sun", value: "bg-amber-100 text-amber-800 border-amber-200" },
    { label: "Purple Orchid", value: "bg-purple-100 text-purple-800 border-purple-200" },
    { label: "Indigo Royal", value: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { label: "Teal Lagoon", value: "bg-teal-100 text-teal-800 border-teal-200" },
    { label: "Slate Carbon", value: "bg-slate-100 text-slate-700 border-slate-200" }
  ];

  useEffect(() => {
    const saved = localStorage.getItem(`bouuz_labels_${tenantId}`);
    if (saved) {
      try {
        setLabels(JSON.parse(saved));
      } catch (e) {
        setLabels(DEFAULT_LABELS);
      }
    } else {
      setLabels(DEFAULT_LABELS);
      localStorage.setItem(`bouuz_labels_${tenantId}`, JSON.stringify(DEFAULT_LABELS));
    }
  }, [tenantId]);

  const saveLabels = (updated: CustomLabel[]) => {
    setLabels(updated);
    localStorage.setItem(`bouuz_labels_${tenantId}`, JSON.stringify(updated));
    setToastMsg("Chat labels updated successfully!");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newLabelName.trim();
    if (!cleanName) return;

    if (labels.some(l => l.name.toLowerCase() === cleanName.toLowerCase())) {
      setToastMsg("Error: This label already exists!");
      setTimeout(() => setToastMsg(""), 3500);
      return;
    }

    const updated = [...labels, { name: cleanName, color: selectedColor }];
    saveLabels(updated);
    setNewLabelName("");
  };

  const handleDeleteLabel = (name: string) => {
    const updated = labels.filter(l => l.name !== name);
    saveLabels(updated);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast Feedback */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl p-4 flex items-center gap-3 shadow-xl transition-all duration-300 ${
          toastMsg.startsWith("Error") ? "bg-rose-600 text-white" : "bg-blue-600 text-white"
        }`}>
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-700" />
            <span>Tenant Workspace Panel</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
              Tenant Admin Mode
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Customize platform parameters, create WhatsApp CRM outcome tags, and tweak business rules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Form: Create label */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Tag className="h-4 w-4 text-blue-600" />
              <span>Provision Custom Output Tag</span>
            </h3>

            <form onSubmit={handleAddLabel} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Tag Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid Customer"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Select Visual Tag Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COLOR_PALETTES.map((color) => {
                    const isSelected = selectedColor === color.value;
                    return (
                      <button
                        type="button"
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`text-[10px] py-2 px-2.5 border rounded-xl text-center font-medium truncate transition ${
                          isSelected
                            ? "ring-2 ring-blue-600 border-transparent shadow-sm"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className={`px-2 py-0.5 rounded border ${color.value}`}>
                          {color.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Save Tag to Workspace
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Labels list */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                <span>Custom Workspace Outcome Labels</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {labels.length} Tags Configured
              </span>
            </h3>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              These outcome labels are loaded instantly into the Live Chat Inbox view for your WhatsApp Business agents. They can assign these labels to contacts during ongoing conversations based on the customer output.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {labels.map((lbl) => (
                <div
                  key={lbl.name}
                  className="bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <div>
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded border ${lbl.color}`}>
                        {lbl.name}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLabel(lbl.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Remove outcome label"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}

              {labels.length === 0 && (
                <div className="col-span-2 text-center py-12 border border-dashed border-slate-200 rounded-2xl">
                  <Tag className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400">No custom chat tags defined yet. Initialize your tags now.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
