/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Smartphone, 
  RefreshCw, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Eye,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import { MetaTemplate } from "../types";

interface TemplatesProps {
  tenantId: string;
}

export default function Templates({ tenantId }: TemplatesProps) {
  const [templates, setTemplates] = useState<MetaTemplate[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<MetaTemplate | null>(null);

  // Form State
  const [tempName, setTempName] = useState("");
  const [tempCategory, setTempCategory] = useState<"MARKETING" | "UTILITY" | "AUTHENTICATION">("MARKETING");
  const [tempHeaderType, setTempHeaderType] = useState<"NONE" | "TEXT" | "IMAGE" | "DOCUMENT">("NONE");
  const [tempBodyText, setTempBodyText] = useState("");
  const [tempFooterText, setTempFooterText] = useState("");
  
  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedFileSize, setUploadedFileSize] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Button 1 State
  const [btn1Type, setBtn1Type] = useState<"NONE" | "QUICK_REPLY" | "URL">("NONE");
  const [btn1Text, setBtn1Text] = useState("");
  const [btn1Url, setBtn1Url] = useState("");

  // Button 2 State
  const [btn2Type, setBtn2Type] = useState<"NONE" | "QUICK_REPLY" | "URL">("NONE");
  const [btn2Text, setBtn2Text] = useState("");
  const [btn2Url, setBtn2Url] = useState("");

  const [toastMsg, setToastMsg] = useState("");

  const fetchTemplates = () => {
    if (!tenantId) return;
    fetch(`/api/templates/${tenantId}`)
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        if (data.length > 0 && !selectedPreview) {
          setSelectedPreview(data[0]);
        }
      });
  };

  useEffect(() => {
    fetchTemplates();
  }, [tenantId]);

  // Handle file drop & selection
  const handleFileChange = (file: File) => {
    if (!file) return;

    // Validate size (e.g., 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    // Validate mime type based on header selection
    if (tempHeaderType === "IMAGE") {
      if (!file.type.startsWith("image/") && !file.name.match(/\.(png|jpe?g)$/i)) {
        alert("Please upload a valid image file (JPEG or PNG).");
        return;
      }
    } else if (tempHeaderType === "DOCUMENT") {
      if (file.type !== "application/pdf" && !file.name.match(/\.pdf$/i)) {
        alert("Please upload a valid PDF document file.");
        return;
      }
    }

    setUploadedFile(file);
    setUploadedFileName(file.name);
    
    // Human-readable size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedFileSize(`${sizeInMB} MB`);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName || !tempBodyText) return;

    // Build buttons array if applicable
    const buttons = [];
    if (btn1Type !== "NONE" && btn1Text) {
      buttons.push({
        type: btn1Type,
        text: btn1Text,
        url: btn1Type === "URL" ? btn1Url : undefined
      });
    }
    if (btn2Type !== "NONE" && btn2Text) {
      buttons.push({
        type: btn2Type,
        text: btn2Text,
        url: btn2Type === "URL" ? btn2Url : undefined
      });
    }

    const payload = {
      name: tempName.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      category: tempCategory,
      language: "en_US",
      headerType: tempHeaderType,
      bodyText: tempBodyText,
      footerText: tempFooterText || undefined,
      buttons,
      mediaUrl: (tempHeaderType === "IMAGE" || tempHeaderType === "DOCUMENT") ? uploadedFileUrl : undefined,
      mediaName: (tempHeaderType === "IMAGE" || tempHeaderType === "DOCUMENT") ? uploadedFileName : undefined
    };

    fetch(`/api/templates/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(newT => {
        setTemplates(prev => [newT, ...prev]);
        setSelectedPreview(newT);
        
        // Reset state
        setTempName("");
        setTempBodyText("");
        setTempFooterText("");
        setBtn1Type("NONE");
        setBtn1Text("");
        setBtn1Url("");
        setBtn2Type("NONE");
        setBtn2Text("");
        setBtn2Url("");
        setUploadedFile(null);
        setUploadedFileUrl("");
        setUploadedFileName("");
        setUploadedFileSize("");
        setShowCreateForm(false);

        setToastMsg("Template submitted to Meta and APPROVED instantly inside sandbox!");
        setTimeout(() => setToastMsg(""), 5000);
      });
  };

  // Mock sync Meta account catalog
  const handleSyncMeta = () => {
    setToastMsg("Syncing templates catalog with Meta Business Manager...");
    setTimeout(() => {
      fetchTemplates();
      setToastMsg("Templates list synchronized successfully. 0 changes detected.");
      setTimeout(() => setToastMsg(""), 3000);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="mb-6 bg-teal-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg shadow-teal-600/10 transition animate-fade-in">
          <span className="text-xs font-mono font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toastMsg}
          </span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            WhatsApp Template Manager <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Meta HSM Approved</span>
          </h2>
          <p className="text-sm text-slate-500">Draft Highly Structured Messages (HSM) with variables. Meta approvals clear in &lt; 1 minute.</p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handleSyncMeta}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className="h-4 w-4" /> Sync Catalog
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition"
          >
            <Plus className="h-4 w-4" /> Create Template
          </button>
        </div>
      </div>

      {/* POPUP MODAL FOR TEMPLATE CREATION */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto transition-all animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" /> WhatsApp HSM Template Designer
              </h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl p-1"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal-600" /> HSM Template Designer
            </h4>

            <form onSubmit={handleSubmitTemplate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Template Name (lower_snake_case):</label>
                <input
                  type="text"
                  placeholder="e.g., seasonal_promo_flash"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Category:</label>
                  <select
                    value={tempCategory}
                    onChange={(e: any) => setTempCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="MARKETING">Marketing (Offers / Promos)</option>
                    <option value="UTILITY">Utility (Updates / Order Alerts)</option>
                    <option value="AUTHENTICATION">Authentication (Secure OTP Codes)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Media Header:</label>
                  <select
                    value={tempHeaderType}
                    onChange={(e: any) => {
                      setTempHeaderType(e.target.value);
                      setUploadedFile(null);
                      setUploadedFileUrl("");
                      setUploadedFileName("");
                      setUploadedFileSize("");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="NONE">None (Text-only)</option>
                    <option value="TEXT">Text Title Header</option>
                    <option value="IMAGE">Image Header Attachment (JPEG, PNG)</option>
                    <option value="DOCUMENT">PDF Document Attachment</option>
                  </select>
                </div>
              </div>

              {/* Media File Upload Area */}
              {(tempHeaderType === "IMAGE" || tempHeaderType === "DOCUMENT") && (
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide font-mono">
                    Upload {tempHeaderType === "IMAGE" ? "Header Image (JPEG/PNG)" : "PDF Document"}:
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                      isDragging
                        ? "border-teal-500 bg-teal-50/50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="file"
                      id="template-media-file"
                      className="hidden"
                      accept={tempHeaderType === "IMAGE" ? "image/jpeg,image/png" : "application/pdf"}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />
                    
                    <label htmlFor="template-media-file" className="cursor-pointer flex flex-col items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center mb-2">
                        <Upload className="h-5 w-5 text-teal-600 animate-pulse" />
                      </div>
                      
                      <p className="text-xs font-bold text-slate-700">
                        Drag and drop file here, or <span className="text-teal-600 hover:underline font-bold text-teal-600">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        {tempHeaderType === "IMAGE" ? "Supports PNG, JPEG up to 10MB" : "Supports PDF up to 10MB"}
                      </p>
                    </label>
                  </div>

                  {/* Uploaded File status bar */}
                  {uploadedFileName && (
                    <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {tempHeaderType === "IMAGE" ? (
                          uploadedFileUrl ? (
                            <img src={uploadedFileUrl} className="h-8 w-8 object-cover rounded-md border border-teal-200/50" alt="Preview" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="h-8 w-8 bg-teal-100 rounded-md flex items-center justify-center text-teal-600 shrink-0">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )
                        ) : (
                          <div className="h-8 w-8 bg-rose-100 rounded-md flex items-center justify-center text-rose-600 shrink-0 font-black text-[10px]">
                            PDF
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-800 truncate leading-snug">{uploadedFileName}</p>
                          <p className="text-[10px] text-slate-400 font-mono leading-none">{uploadedFileSize}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setUploadedFileUrl("");
                          setUploadedFileName("");
                          setUploadedFileSize("");
                        }}
                        className="text-[10px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold px-2.5 py-1 rounded-md transition shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Body Text Markup (Use variables like {"{{1}}"}, {"{{2}}"}):</label>
                <textarea
                  rows={4}
                  placeholder="Hi {{1}}, thank you for purchasing. Your item {{2}} is on its way!"
                  value={tempBodyText}
                  onChange={(e) => setTempBodyText(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Footer Text Disclaimer (Optional):</label>
                <input
                  type="text"
                  placeholder="Reply STOP to unsubscribe."
                  value={tempFooterText}
                  onChange={(e) => setTempFooterText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h5 className="text-xs font-bold text-slate-700 font-sans uppercase tracking-wider">Configure Interactive Buttons (Up to 2)</h5>
                
                {/* Button 1 Configuration */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 font-mono uppercase">Button 1:</span>
                    <div className="flex gap-1.5">
                      {(["NONE", "QUICK_REPLY", "URL"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setBtn1Type(type);
                            if (type === "NONE") {
                              setBtn1Text("");
                              setBtn1Url("");
                            }
                          }}
                          className={`text-[10px] py-1 px-2.5 rounded-md border font-semibold capitalize transition ${
                            btn1Type === type
                              ? "bg-teal-100 border-teal-300 text-teal-800"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {type === "NONE" ? "None" : type.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {btn1Type !== "NONE" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Button 1 Label (e.g. Click Here)"
                        value={btn1Text}
                        onChange={(e) => setBtn1Text(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      {btn1Type === "URL" && (
                        <input
                          type="url"
                          placeholder="Link URL (e.g. https://...)"
                          value={btn1Url}
                          onChange={(e) => setBtn1Url(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Button 2 Configuration */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 font-mono uppercase">Button 2:</span>
                    <div className="flex gap-1.5">
                      {(["NONE", "QUICK_REPLY", "URL"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setBtn2Type(type);
                            if (type === "NONE") {
                              setBtn2Text("");
                              setBtn2Url("");
                            }
                          }}
                          className={`text-[10px] py-1 px-2.5 rounded-md border font-semibold capitalize transition ${
                            btn2Type === type
                              ? "bg-teal-100 border-teal-300 text-teal-800"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {type === "NONE" ? "None" : type.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {btn2Type !== "NONE" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Button 2 Label (e.g. Support)"
                        value={btn2Text}
                        onChange={(e) => setBtn2Text(e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                      {btn2Type === "URL" && (
                        <input
                          type="url"
                          placeholder="Link URL (e.g. https://...)"
                          value={btn2Url}
                          onChange={(e) => setBtn2Url(e.target.value)}
                          required
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 py-2 px-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow transition"
                >
                  Submit for Meta Approval
                </button>
              </div>
            </form>
          </div>

          {/* REAL-TIME WHATSAPP PHONE PREVIEW */}
          <div className="flex justify-center items-start">
            <div className="w-80 bg-slate-900 rounded-[3rem] p-4.5 shadow-2xl border-4 border-slate-800 aspect-[9/18]">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 mx-auto rounded-b-xl mb-4" />

              <div className="bg-slate-950 h-[calc(100%-2rem)] rounded-[2rem] p-3 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-teal-500/5 pointer-events-none" />

                {/* WhatsApp Chat Header preview */}
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2 mb-3 z-10">
                  <div className="h-6 w-6 bg-teal-500/15 text-teal-400 rounded-full flex items-center justify-center font-bold text-[9px] uppercase">
                    A
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-white leading-none mb-0.5">Alpha Logistics Ltd</p>
                    <p className="text-[7px] text-teal-400 font-mono">Business Account</p>
                  </div>
                </div>

                {/* Live Message Bubble rendering */}
                <div className="flex-1 overflow-y-auto space-y-2.5 py-1 z-10 flex flex-col justify-end">
                  <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 max-w-[90%] text-[10px] space-y-1.5 shadow-md">
                    {tempHeaderType === "IMAGE" && (
                      uploadedFileUrl ? (
                        <div className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-700">
                          <img src={uploadedFileUrl} className="h-full w-full object-cover" alt="Header media preview" referrerPolicy="no-referrer" />
                        </div>
                      ) : (
                        <div className="h-20 bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-[9px] text-slate-400 font-mono p-2 text-center">
                          <Plus className="h-4 w-4 mb-1 text-slate-500 animate-pulse" />
                          <span>[No Image Attached Yet]</span>
                        </div>
                      )
                    )}
                    {tempHeaderType === "DOCUMENT" && (
                      uploadedFileName ? (
                        <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-2">
                          <div className="h-8 w-8 bg-red-500/15 rounded flex items-center justify-center shrink-0">
                            <span className="text-red-400 font-extrabold text-[10px]">PDF</span>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[9px] font-bold text-slate-200 truncate">{uploadedFileName}</p>
                            <p className="text-[7px] text-slate-400 font-mono mt-0.5">{uploadedFileSize || "Unknown size"}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-16 bg-slate-800 rounded-lg border border-slate-700 flex flex-col items-center justify-center text-[9px] text-slate-400 font-mono p-2 text-center">
                          <Plus className="h-4 w-4 mb-1 text-slate-500 animate-pulse" />
                          <span>[No PDF Document Attached]</span>
                        </div>
                      )
                    )}
                    {tempHeaderType === "TEXT" && (
                      <p className="font-bold text-white uppercase text-[8px] tracking-wide border-b border-slate-800 pb-1">
                        Shipping Dispatched Update
                      </p>
                    )}
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {tempBodyText || "Type in the editor to see real-time markup compilation..."}
                    </p>
                    {tempFooterText && (
                      <p className="text-[8px] text-slate-500 leading-none">{tempFooterText}</p>
                    )}

                    {/* Buttons container */}
                    {((btn1Type !== "NONE" && btn1Text) || (btn2Type !== "NONE" && btn2Text)) && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        {btn1Type !== "NONE" && btn1Text && (
                          <div className="bg-slate-950 hover:bg-slate-900 text-teal-400 text-[9px] font-bold py-1.5 rounded-lg border border-slate-800 flex items-center justify-center gap-1 cursor-pointer">
                            {btn1Type === "URL" && <ExternalLink className="h-3 w-3" />}
                            {btn1Text}
                          </div>
                        )}
                        {btn2Type !== "NONE" && btn2Text && (
                          <div className="bg-slate-950 hover:bg-slate-900 text-teal-400 text-[9px] font-bold py-1.5 rounded-lg border border-slate-800 flex items-center justify-center gap-1 cursor-pointer">
                            {btn2Type === "URL" && <ExternalLink className="h-3 w-3" />}
                            {btn2Text}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 h-9 rounded-xl border border-slate-800 flex items-center justify-between px-3 text-[9px] text-slate-500 z-10 mt-3 font-mono">
                  <span>Draft Preview Sandbox</span>
                  <Smartphone className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* TEMPLATES LIST CATALOG VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-bold text-slate-800">SaaS WhatsApp approved Templates Directory</span>
              </div>

              <div className="divide-y divide-slate-100">
                {templates.map((t) => {
                  const isActive = selectedPreview?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedPreview(t)}
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition flex items-center justify-between ${
                        isActive ? "bg-slate-50" : ""
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800 text-xs truncate max-w-[200px] font-mono">
                            {t.name}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full font-semibold">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[10px] truncate max-w-sm">
                          {t.bodyText}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold font-mono text-teal-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> APPROVED
                        </span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TEMPLATE DETAILS PREVIEW PANEL */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
            {selectedPreview ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">Approved Template Details</h5>
                    <h4 className="text-sm font-bold text-slate-800 mt-1 font-mono">{selectedPreview.name}</h4>
                  </div>
                  <Eye className="h-4 w-4 text-slate-400" />
                </div>

                <div className="space-y-3.5 text-xs">
                  {(selectedPreview.headerType === "IMAGE" || selectedPreview.headerType === "DOCUMENT") && (
                    <div>
                      <span className="text-slate-400 font-mono block text-[10px] uppercase">Attached Media Header</span>
                      {selectedPreview.headerType === "IMAGE" && (
                        selectedPreview.mediaUrl ? (
                          <div className="border border-slate-200 rounded-lg overflow-hidden max-w-[240px] mt-1 relative bg-slate-50">
                            <img src={selectedPreview.mediaUrl} className="max-h-24 object-contain mx-auto" alt="Template Header" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="border border-slate-200 border-dashed rounded-lg p-3 text-center text-[10px] text-slate-400 mt-1">
                            Generic placeholder image used
                          </div>
                        )
                      )}
                      {selectedPreview.headerType === "DOCUMENT" && (
                        <div className="bg-rose-50 border border-rose-100 rounded-lg p-2.5 flex items-center gap-2 max-w-[240px] mt-1">
                          <div className="h-8 w-8 bg-red-100 rounded flex items-center justify-center shrink-0">
                            <span className="text-red-600 font-extrabold text-[10px]">PDF</span>
                          </div>
                          <span className="text-[10px] text-slate-700 font-semibold truncate">
                            {selectedPreview.mediaName || "attached_document.pdf"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 font-mono block text-[10px] uppercase">Message HSM body markup</span>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-slate-700 leading-relaxed font-mono whitespace-pre-wrap mt-1">
                      {selectedPreview.bodyText}
                    </div>
                  </div>

                  {selectedPreview.footerText && (
                    <div>
                      <span className="text-slate-400 font-mono block text-[10px] uppercase">Footer disclaimer</span>
                      <p className="text-slate-500 font-sans mt-0.5">{selectedPreview.footerText}</p>
                    </div>
                  )}

                  {selectedPreview.buttons && selectedPreview.buttons.length > 0 && (
                    <div>
                      <span className="text-slate-400 font-mono block text-[10px] uppercase">Action Button links</span>
                      <div className="mt-1 space-y-1">
                        {selectedPreview.buttons.map((btn, i) => (
                          <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                            <span className="font-bold text-slate-700 font-mono text-[10px] capitalize">{btn.type.replace("_", " ")}:</span>
                            <span className="text-slate-500 font-semibold">{btn.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">Select any template to inspect specifications.</p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 mt-6">
              <span className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Template Sync Credentials</span>
              <p className="text-[11px] text-slate-600 font-sans">
                Meta Business IDs: <code className="font-mono bg-slate-50 px-1 border border-slate-100 rounded text-[9px]">waba_alpha_9281</code>
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
