/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Key, 
  Webhook, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Send, 
  Database, 
  HelpCircle, 
  Code, 
  ShieldAlert, 
  BookOpen, 
  Play, 
  Globe, 
  Activity, 
  CheckCircle2 
} from "lucide-react";

interface OpenApiSettingsProps {
  tenantId: string;
}

interface OpenApiConfig {
  tenantId: string;
  apiKey: string;
  webhookUrl: string;
  webhookSecret: string;
  isEnabled: boolean;
  events: string[];
}

export default function OpenApiSettings({ tenantId }: OpenApiSettingsProps) {
  const [config, setConfig] = useState<OpenApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [rollingKey, setRollingKey] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState<"credentials" | "sandbox" | "docs">("credentials");
  const [toastMsg, setToastMsg] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [revealKey, setRevealKey] = useState(false);

  // Webhook form states
  const [webhookUrlInput, setWebhookUrlInput] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [webhookResult, setWebhookResult] = useState<any>(null);

  // Sandbox form states
  const [sandboxEndpoint, setSandboxEndpoint] = useState<"get_chats" | "get_contacts" | "create_contact" | "send_message">("get_chats");
  const [sandboxResponse, setSandboxResponse] = useState<string>("");
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // Sandbox inputs
  const [sandboxContactName, setSandboxContactName] = useState("Acme Corp CRM");
  const [sandboxContactPhone, setSandboxContactPhone] = useState("+15551234567");
  const [sandboxContactEmail, setSandboxContactEmail] = useState("crm-leads@acme.com");
  const [sandboxMsgPhone, setSandboxMsgPhone] = useState("+14155552671");
  const [sandboxMsgText, setSandboxMsgText] = useState("Greetings! Your booking is successfully verified.");

  // Load API Config
  useEffect(() => {
    fetchConfig();
  }, [tenantId]);

  const fetchConfig = () => {
    setLoading(true);
    fetch(`/api/tenants/${tenantId}/open-api`)
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setWebhookUrlInput(data.webhookUrl || "");
        setWebhookEnabled(data.isEnabled || false);
        setSelectedEvents(data.events || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load OpenAPI configuration:", err);
        setLoading(false);
      });
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRollApiKey = () => {
    if (!window.confirm("Are you sure you want to roll your API key? All applications currently using this secret token will be immediately disconnected.")) {
      return;
    }
    setRollingKey(true);
    fetch(`/api/tenants/${tenantId}/open-api/key`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        setConfig(prev => prev ? { ...prev, apiKey: data.apiKey, isEnabled: data.isEnabled } : null);
        showToast("Secure API Key regenerated successfully.");
        setRollingKey(false);
      })
      .catch(err => {
        console.error(err);
        setRollingKey(false);
      });
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebhook(true);
    fetch(`/api/tenants/${tenantId}/open-api/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        webhookUrl: webhookUrlInput,
        isEnabled: webhookEnabled,
        events: selectedEvents
      })
    })
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        showToast("Webhook endpoint settings updated successfully.");
        setSavingWebhook(false);
      })
      .catch(err => {
        console.error(err);
        setSavingWebhook(false);
      });
  };

  const handleTestWebhook = () => {
    if (!webhookUrlInput) {
      alert("Please configure a webhook destination URL first.");
      return;
    }
    setTestingWebhook(true);
    setWebhookResult(null);

    fetch(`/api/tenants/${tenantId}/open-api/test-webhook`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        setWebhookResult(data);
        setTestingWebhook(false);
      })
      .catch(err => {
        console.error(err);
        setTestingWebhook(false);
      });
  };

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(prev => prev.filter(e => e !== event));
    } else {
      setSelectedEvents(prev => [...prev, event]);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 4000);
  };

  // Run Developer API Sandbox query
  const handleExecuteSandbox = () => {
    if (!config || !config.apiKey) {
      alert("You must generate an API key before trying the sandbox environment.");
      return;
    }

    setSandboxLoading(true);
    setSandboxResponse("");

    let url = "";
    let method = "GET";
    let bodyObj: any = null;

    switch (sandboxEndpoint) {
      case "get_chats":
        url = "/api/v1/chats";
        method = "GET";
        break;
      case "get_contacts":
        url = "/api/v1/contacts";
        method = "GET";
        break;
      case "create_contact":
        url = "/api/v1/contacts";
        method = "POST";
        bodyObj = {
          name: sandboxContactName,
          phoneNumber: sandboxContactPhone,
          email: sandboxContactEmail,
          tags: ["api-sync", "crm-imported"],
          customFields: {
            SyncSource: "BouuZ Developer Portal Sandbox"
          }
        };
        break;
      case "send_message":
        url = "/api/v1/messages/send";
        method = "POST";
        bodyObj = {
          recipientPhone: sandboxMsgPhone,
          text: sandboxMsgText
        };
        break;
    }

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      ...(bodyObj ? { body: JSON.stringify(bodyObj) } : {})
    })
      .then(async res => {
        const json = await res.json();
        setSandboxResponse(JSON.stringify(json, null, 2));
        setSandboxLoading(false);
      })
      .catch(err => {
        setSandboxResponse(JSON.stringify({ error: err.message || "Failed sandbox request" }, null, 2));
        setSandboxLoading(false);
      });
  };

  const allAvailableEvents = [
    { id: "message.received", name: "Inbound Customer Message", desc: "Triggered whenever a hot customer sends a WhatsApp text or media" },
    { id: "message.sent", name: "Outbound Agent/Bot Dispatch", desc: "Triggered whenever a template, bot auto-reply, or manual chat goes out" },
    { id: "contact.created", name: "Contact Synchronized", desc: "Triggered whenever a custom lead or metadata profile is logged" },
    { id: "deal.staged", name: "CRM Deal Staged Update", desc: "Triggered whenever a sales pipeline deal shifts stages" }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mb-3" />
        <p className="text-xs font-mono text-slate-500">Loading open API sandbox environment...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 min-h-screen font-sans text-slate-900">
      
      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 transition animate-slide-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Code className="h-6 w-6 text-blue-600" /> Open API & CRM Integrations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build custom webhooks, extract JSON databases, and dispatch WhatsApp automations securely from any external platform.
          </p>
        </div>
        
        {/* Tab navigation */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition flex items-center gap-1.5 ${
              activeTab === "credentials" 
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Key className="h-3.5 w-3.5" /> Key & Webhooks
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition flex items-center gap-1.5 ${
              activeTab === "sandbox" 
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" /> API Sandbox
          </button>
          <button
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition flex items-center gap-1.5 ${
              activeTab === "docs" 
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Documentation
          </button>
        </div>
      </div>

      {/* TAB 1: CREDENTIALS & WEBHOOKS */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* API SECRET GENERATION */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none">Secret Authorization Token</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Bearer key for programmatic authentication</p>
                </div>
              </div>

              {config?.apiKey ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center justify-between gap-3">
                    <div className="font-mono text-xs text-slate-800 tracking-wide overflow-x-auto select-all max-w-[80%]">
                      {revealKey ? config.apiKey : "sk_live_••••••••••••••••••••••••" + config.apiKey.substring(config.apiKey.length - 4)}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setRevealKey(!revealKey)}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded cursor-pointer transition"
                      >
                        {revealKey ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleCopy(config.apiKey, "apiKey")}
                        className="p-1.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition"
                        title="Copy to clipboard"
                      >
                        {copiedField === "apiKey" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-[11px] text-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium leading-none">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> API Channel Operational & Connected
                    </span>
                    <span className="font-mono text-[9px] bg-emerald-100/80 px-1.5 py-0.5 rounded font-bold uppercase">v1.0 Live</span>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 leading-tight">
                      Roll your key if you suspect it is compromised. This rolls the live cryptographic signature.
                    </div>
                    <button
                      onClick={handleRollApiKey}
                      disabled={rollingKey}
                      className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-lg hover:bg-rose-100 hover:text-rose-700 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {rollingKey ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Roll Token
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    You have not provisioned an API Token for external application integrations yet. Click below to instantly generate a secure, isolated credentials block.
                  </div>
                  <button
                    onClick={handleRollApiKey}
                    disabled={rollingKey}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-lg shadow-sm shadow-blue-500/10 cursor-pointer transition disabled:opacity-50"
                  >
                    {rollingKey ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />} Generate Secret API Key
                  </button>
                </div>
              )}
            </div>

            {/* QUICK START WEBHOOK CODES */}
            <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-5 shadow-lg shadow-slate-950/20">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <Terminal className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-mono font-bold text-white tracking-widest uppercase">Quick Start Code Integration</h3>
              </div>
              <div className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                Connect external CRMs (like HubSpot, Zoho, Salesforce) using custom integrations:
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                <pre className="text-[10px] font-mono text-emerald-400 leading-normal">
{`curl -X GET "http://localhost:3000/api/v1/chats" \\
  -H "Authorization: Bearer ${config?.apiKey || "sk_live_your_token_here"}" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-3 pt-2.5 border-t border-slate-800/60">
                <span>SDK Supported: Axios, Curl, Fetch, Python requests</span>
                <span className="text-sky-400">RESTful compliant</span>
              </div>
            </div>
          </div>

          {/* WEBHOOK OUTBOUND SETUP */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSaveWebhook} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center">
                    <Webhook className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-none">Real-Time Webhook Deliveries</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Stream events to external endpoints</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={webhookEnabled}
                    onChange={(e) => setWebhookEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-1.5 text-[10px] font-bold text-slate-600">{webhookEnabled ? "Enabled" : "Disabled"}</span>
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Webhook Target Endpoint URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://your-crm-server.com/hooks/bouuz"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testingWebhook || !webhookUrlInput}
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 font-bold text-[10px] px-3 rounded-lg transition shrink-0 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {testingWebhook ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3 text-sky-500" />} Test Link
                  </button>
                </div>
                <span className="text-[9px] text-slate-400 leading-none mt-1.5 block">
                  Ensure this endpoint accepts HTTP <strong className="font-mono font-bold">POST</strong> requests.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Payload Verification Secret</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-600 truncate max-w-[80%]">
                    {config?.webhookSecret || "whsec_••••••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(config?.webhookSecret || "", "webhookSecret")}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 transition"
                  >
                    {copiedField === "webhookSecret" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 block">
                  Sent in the HTTP header <code className="font-mono bg-slate-100 px-1 rounded text-[9px] text-slate-600 font-bold">X-BouuZ-Signature</code> to verify packet integrity.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Subscribed Event Triggers</label>
                <div className="border border-slate-150 rounded-lg divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
                  {allAvailableEvents.map((evt) => {
                    const isChecked = selectedEvents.includes(evt.id);
                    return (
                      <div key={evt.id} className="p-2.5 flex items-start gap-2.5 hover:bg-slate-100/40 transition">
                        <input
                          type="checkbox"
                          id={`evt-${evt.id}`}
                          checked={isChecked}
                          onChange={() => toggleEvent(evt.id)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor={`evt-${evt.id}`} className="flex flex-col cursor-pointer select-none">
                          <span className="text-[11px] font-bold text-slate-700 leading-tight">{evt.name}</span>
                          <span className="text-[9px] text-slate-400 leading-tight mt-0.5">{evt.desc}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingWebhook}
                  className="bg-slate-900 text-white font-semibold text-xs py-2 px-4 rounded-lg shadow-sm hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingWebhook ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Webhook className="h-3.5 w-3.5 text-sky-400" />} Save Webhook Configuration
                </button>
              </div>

              {/* LIVE TESTING OUTPUT BOX */}
              {webhookResult && (
                <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-55 animate-fade-in">
                  <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-600">Simulated Outbound Log</span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      webhookResult.success && webhookResult.statusCode === 200 
                        ? "bg-emerald-100 text-emerald-800" 
                        : webhookResult.simulatedFallback 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-rose-100 text-rose-800"
                    }`}>
                      {webhookResult.simulatedFallback 
                        ? "Simulated Ok" 
                        : `HTTP ${webhookResult.statusCode || "Fail"}`}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 font-mono text-[10px] text-slate-300 space-y-2 overflow-x-auto">
                    {webhookResult.success ? (
                      <div>
                        <p className="text-emerald-400">✔ Outbound payload successfully accepted by destination server.</p>
                        <p className="text-slate-500 mt-1">Response Body:</p>
                        <pre className="text-[9px] bg-slate-900 p-1.5 rounded border border-slate-800 text-slate-300 mt-1">
                          {webhookResult.responseBody || "(Empty response)"}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <p className="text-rose-400">✗ Real connection attempt failed or timed out: {webhookResult.error}</p>
                        <p className="text-slate-400 mt-1">BouuZ Webhook Simulation Engine activated. Deliverable JSON packet payload structure:</p>
                        <pre className="text-[9px] bg-slate-900 p-1.5 rounded border border-slate-800 text-emerald-400 mt-1">
                          {JSON.stringify(webhookResult.simulationPayload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE SANDBOX */}
      {activeTab === "sandbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SANDBOX CONTROLS */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-none">Interactive Sandbox Console</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Test real-time operations on this workspace's database</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">Select Endpoint API Route</label>
                <div className="space-y-1.5">
                  {[
                    { id: "get_chats", method: "GET", path: "/api/v1/chats", label: "Retrieve Inbox Conversations" },
                    { id: "get_contacts", method: "GET", path: "/api/v1/contacts", label: "List Active Contacts Directory" },
                    { id: "create_contact", method: "POST", path: "/api/v1/contacts", label: "Create or Update Contact Lead" },
                    { id: "send_message", method: "POST", path: "/api/v1/messages/send", label: "Programmatically Dispatch Message" }
                  ].map((route) => (
                    <label
                      key={route.id}
                      onClick={() => setSandboxEndpoint(route.id as any)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer select-none transition ${
                        sandboxEndpoint === route.id
                          ? "bg-blue-50 border-blue-200 text-blue-900 font-medium"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold">{route.label}</span>
                        <span className="font-mono text-[9px] text-slate-400 mt-0.5">{route.path}</span>
                      </div>
                      <span className={`font-mono font-bold text-[9px] px-1.5 py-0.5 rounded shrink-0 ${
                        route.method === "GET" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                      }`}>
                        {route.method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* DYNAMIC ENDPOINT INPUTS */}
              {sandboxEndpoint === "create_contact" && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5 animate-fade-in">
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">Request Body Payload Params</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold">Contact Name</label>
                      <input
                        type="text"
                        value={sandboxContactName}
                        onChange={(e) => setSandboxContactName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold">Phone Number</label>
                      <input
                        type="text"
                        value={sandboxContactPhone}
                        onChange={(e) => setSandboxContactPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-bold">Email Address</label>
                    <input
                      type="email"
                      value={sandboxContactEmail}
                      onChange={(e) => setSandboxContactEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {sandboxEndpoint === "send_message" && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2.5 animate-fade-in">
                  <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1 mb-2">Message Payload Params</h4>
                  <div>
                    <label className="text-[9px] text-slate-500 font-bold">Recipient Phone Number</label>
                    <input
                      type="text"
                      value={sandboxMsgPhone}
                      onChange={(e) => setSandboxMsgPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-mono"
                    />
                    <span className="text-[8px] text-slate-400">Ensure this fits a simulated phone index</span>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 font-bold">Message Text Block</label>
                    <textarea
                      rows={2}
                      value={sandboxMsgText}
                      onChange={(e) => setSandboxMsgText(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={handleExecuteSandbox}
                disabled={sandboxLoading || !config?.apiKey}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-semibold text-xs py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {sandboxLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                Execute Sandbox HTTP Request
              </button>
              {!config?.apiKey && (
                <p className="text-[9px] text-rose-500 font-medium text-center mt-1.5">
                  * Generate an API authorization token first on the credentials page.
                </p>
              )}
            </div>
          </div>

          {/* SANDBOX RESPONSE LOGS */}
          <div className="lg:col-span-7 flex flex-col h-[520px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-sky-400">LIVE API SANDBOX OUTPUT TERMINAL</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                <span className="w-2 h-2 rounded-full bg-slate-800"></span>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950 space-y-3">
              {sandboxResponse ? (
                <div className="space-y-2">
                  <div className="text-[10px] text-slate-500 border-b border-slate-850 pb-1.5 flex items-center justify-between">
                    <span>HTTP/1.1 200 OK</span>
                    <span>Content-Type: application/json</span>
                  </div>
                  <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] leading-relaxed">
                    {sandboxResponse}
                  </pre>
                </div>
              ) : sandboxLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <RefreshCw className="h-6 w-6 text-sky-400 animate-spin mb-2" />
                  <span className="text-[10px] animate-pulse">Dispatched query to server sandbox port 3000...</span>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 max-w-sm mx-auto p-4">
                  <Terminal className="h-10 w-10 text-slate-850 mb-3" />
                  <h4 className="text-[11px] font-bold text-slate-500">Awaiting Request Dispatch</h4>
                  <p className="text-[9px] mt-1 leading-normal">
                    Select a REST method on the left panel, customize properties, and click dispatch to witness real database transactions mapped in real-time.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: DOCUMENTATION */}
      {activeTab === "docs" && (
        <div className="space-y-6 max-w-4xl">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-blue-600" /> API Authentication
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              All REST API requests require standard HTTP Bearer token authentication. Send your custom secret token in the header of each request. Webhook validation requires inspecting the signature token.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 font-mono text-[10px] text-slate-300">
              <p className="text-slate-500">// Example headers authorization format</p>
              <p className="mt-1 text-slate-200">
                <strong className="text-sky-400 font-bold">Authorization:</strong> Bearer {config?.apiKey || "sk_live_your_token_here"}
              </p>
            </div>
          </div>

          {/* DOCUMENTATION CARDS */}
          {[
            {
              method: "GET",
              path: "/api/v1/chats",
              title: "List Conversations Inbox",
              desc: "Allows external systems to extract the real-time list of all chat conversations. Great for custom dashboard syncing and analytics reporting.",
              reqBody: null,
              resBody: {
                object: "list",
                count: 1,
                data: [
                  {
                    id: "chat-1",
                    customerName: "David Miller",
                    customerPhone: "+14155552671",
                    status: "open",
                    lastMessageText: "Where is my container shipment tracking ID?",
                    sentiment: "negative"
                  }
                ]
              }
            },
            {
              method: "GET",
              path: "/api/v1/contacts",
              title: "List Contacts Directory",
              desc: "Retrieve a flat registry of all segmented contacts associated with this workspace, including tags and key-value properties.",
              reqBody: null,
              resBody: {
                object: "list",
                count: 1,
                data: [
                  {
                    id: "c-1",
                    name: "David Miller",
                    phoneNumber: "+14155552671",
                    email: "david.m@example.com",
                    tags: ["VIP", "Enterprise"]
                  }
                ]
              }
            },
            {
              method: "POST",
              path: "/api/v1/contacts",
              title: "Sync / Save Contact Lead",
              desc: "Instantly create a new contact or upsert an existing contact profile using their unique phone index identifier. Automatically merges metadata tags.",
              reqBody: {
                name: "Jessica Alba",
                phoneNumber: "+14155551122",
                email: "jessica@retail-box.org",
                tags: ["Wholesale-Lead", "E-commerce"],
                customFields: {
                  CompanySize: "100-500",
                  ReferralCode: "OPEN_API_CRM"
                }
              },
              resBody: {
                object: "contact",
                status: "synced",
                data: {
                  id: "c-109283",
                  name: "Jessica Alba",
                  phoneNumber: "+14155551122",
                  tags: ["Wholesale-Lead", "E-commerce"],
                  customFields: {
                    CompanySize: "100-500",
                    ReferralCode: "OPEN_API_CRM"
                  },
                  createdAt: "2026-07-17"
                }
              }
            },
            {
              method: "POST",
              path: "/api/v1/messages/send",
              title: "Dispatch Programmatic Message",
              desc: "Queue and send automated text notifications or responses immediately to a WhatsApp phone index. If an active conversation doesn't exist, one will be registered automatically.",
              reqBody: {
                recipientPhone: "+14155552671",
                text: "Alert: Your order #29381 has left our delivery warehouse. ETA: 2 days."
              },
              resBody: {
                object: "message",
                status: "queued",
                data: {
                  id: "msg-129381023",
                  chatId: "chat-1",
                  sender: "agent",
                  senderName: "Developer API (Automated)",
                  text: "Alert: Your order #29381 has left our delivery warehouse. ETA: 2 days.",
                  status: "sent",
                  timestamp: "2026-07-17T09:00:00Z"
                }
              }
            }
          ].map((doc, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                    doc.method === "GET" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-purple-100 text-purple-800 border border-purple-200"
                  }`}>
                    {doc.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-800">{doc.path}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-600 sm:text-right uppercase tracking-wider">{doc.title}</h4>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{doc.desc}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {doc.reqBody ? (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Sample Request Payload</span>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[9px] text-slate-300 overflow-x-auto max-h-[180px]">
                      <pre>{JSON.stringify(doc.reqBody, null, 2)}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Request Query Requirements</span>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[10px] text-slate-500 leading-relaxed h-[130px] flex items-center">
                      This endpoint accepts generic HTTP {doc.method} parameters and returns lists wrapped in JSON objects. Set headers properly.
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Sample Response Output (JSON)</span>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[9px] text-emerald-400 overflow-x-auto max-h-[180px]">
                    <pre>{JSON.stringify(doc.resBody, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}
