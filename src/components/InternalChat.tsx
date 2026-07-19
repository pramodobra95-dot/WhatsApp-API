/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  Clock, 
  UserCheck, 
  RefreshCw, 
  Search,
  ChevronLeft,
  Briefcase,
  Paperclip,
  X
} from "lucide-react";
import { StaffMember } from "./StaffPermissions";

interface InternalChatProps {
  tenantId: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  internalChatEnabled: boolean;
}

interface InternalMessage {
  id: string;
  tenantId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  text: string;
  timestamp: string;
  mediaUrl?: string;
  mediaType?: string;
}

export default function InternalChat({ tenantId, currentUser, internalChatEnabled }: InternalChatProps) {
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string>("all"); // "all" for General Team, or staff member ID
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Attachment State
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; type: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Responsive state
  const [showChannelList, setShowChannelList] = useState(true);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        url: url
      });
    }
  };

  const clearAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fetchMessages = () => {
    if (!internalChatEnabled || !tenantId || tenantId === "undefined") return;
    
    fetch(`/api/internal-messages/${tenantId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Server status ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Response was not JSON");
      })
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load team messages:", err.message || err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // Load staff from localStorage to get live teammate listings
    const savedStaff = localStorage.getItem(`bouuz_staff_${tenantId}`);
    if (savedStaff) {
      try {
        setStaff(JSON.parse(savedStaff));
      } catch (e) {
        console.error("Error reading team:", e);
      }
    }

    fetchMessages();

    // Auto refresh team messages every 5 seconds for simulation responsiveness
    const timer = setInterval(fetchMessages, 5000);
    return () => clearInterval(timer);
  }, [tenantId, internalChatEnabled]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedReceiverId, showChannelList]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = inputText.trim();
    const hasFile = !!attachedFile;
    if ((!cleanText && !hasFile) || sending) return;

    setSending(true);
    fetch(`/api/internal-messages/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        receiverId: selectedReceiverId,
        text: cleanText || (attachedFile ? `Shared file: ${attachedFile.name}` : ""),
        mediaUrl: attachedFile ? attachedFile.url : undefined,
        mediaType: attachedFile ? (attachedFile.type.startsWith("image/") ? "image" : "document") : undefined
      })
    })
      .then(res => res.json())
      .then(newMsg => {
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        clearAttachedFile();
        setSending(false);
      })
      .catch(err => {
        console.error("Internal chat error:", err);
        setSending(false);
      });
  };

  if (!internalChatEnabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen text-center">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm max-w-md">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
            <Lock className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-sans font-extrabold text-slate-900 tracking-tight">Internal Collaboration Blocked</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            The Super Admin has disabled team collaboration chat permissions for your active tenant account. 
          </p>
          <div className="mt-6 bg-slate-50 rounded-xl p-3 border border-slate-200 text-[11px] text-slate-600 text-left font-mono">
            <strong>Requirement:</strong> Plan Wise activation starting from basic tier, controlled directly in the Super Admin Deck.
          </div>
        </div>
      </div>
    );
  }

  // Filter messages for current view (either "all" or direct private messages)
  const conversationMessages = messages.filter(m => {
    if (selectedReceiverId === "all") {
      return m.receiverId === "all";
    } else {
      // Private messages between current user and selected teammate
      return (m.senderId === currentUser.id && m.receiverId === selectedReceiverId) ||
             (m.senderId === selectedReceiverId && m.receiverId === currentUser.id);
    }
  });

  const selectedReceiverName = selectedReceiverId === "all" 
    ? "General Team Channel" 
    : staff.find(s => s.id === selectedReceiverId)?.name || "Teammate";

  const selectedReceiverRole = selectedReceiverId === "all"
    ? "All Agents & Managers"
    : staff.find(s => s.id === selectedReceiverId)?.role === "tenant_admin" ? "Talent Admin" : "Agent";

  const filteredStaff = staff.filter(s => 
    s.id !== currentUser.id &&
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex bg-slate-50 h-full overflow-hidden relative min-h-screen">
      
      {/* SIDEBAR: Channels / Users list */}
      <div className={`w-80 border-r border-slate-200 bg-white flex flex-col shrink-0 h-full transition-all duration-300 absolute inset-y-0 left-0 z-20 lg:relative ${
        showChannelList ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Team Collaboration Channels</span>
          </h3>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teammates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Scrollable Channels list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* General channel */}
          <button
            onClick={() => {
              setSelectedReceiverId("all");
              setShowChannelList(false);
            }}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition text-left cursor-pointer ${
              selectedReceiverId === "all" 
                ? "bg-blue-50 border border-blue-200 text-blue-900" 
                : "hover:bg-slate-50 text-slate-700 border border-transparent"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs truncate"># General Team Channel</div>
              <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">Discuss live customer actions</div>
            </div>
          </button>

          <div className="px-3 py-2">
            <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider font-mono">Teammates Direct Message</span>
          </div>

          {filteredStaff.map((member) => (
            <button
              key={member.id}
              onClick={() => {
                setSelectedReceiverId(member.id);
                setShowChannelList(false);
              }}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition text-left cursor-pointer ${
                selectedReceiverId === member.id 
                  ? "bg-blue-50 border border-blue-200 text-blue-900" 
                  : "hover:bg-slate-50 text-slate-700 border border-transparent"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs text-white ${
                member.role === "tenant_admin" ? "bg-yellow-500" : "bg-blue-600"
              }`}>
                {member.name[0]}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs truncate">{member.name}</div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5 uppercase">
                  <span className={`h-1.5 w-1.5 rounded-full bg-teal-500`} />
                  <span>{member.role === "tenant_admin" ? "Admin" : "Agent"}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT DISPLAY PANELS */}
      <div className="flex-1 flex flex-col h-full bg-white z-10 min-w-0">
        
        {/* Active Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              onClick={() => setShowChannelList(true)}
              className="lg:hidden p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg shrink-0 transition"
              title="View Channels"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-xs uppercase shrink-0">
              {selectedReceiverName[0]}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-extrabold text-slate-800 truncate leading-none mb-1">
                {selectedReceiverName}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                Role: {selectedReceiverRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMessages}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              title="Refresh Chat history"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-bold font-mono tracking-wider uppercase">
              No Meta API Cost
            </span>
          </div>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
          {conversationMessages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            const isSystem = m.senderRole === "system";

            return (
              <div
                key={m.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] space-y-1`}>
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isMe ? "justify-end" : "justify-start"}`}>
                    <span className="font-bold text-slate-600">{m.senderName}</span>
                    <span className="bg-slate-200 text-slate-500 font-mono text-[8px] px-1 rounded uppercase">
                      {m.senderRole === "tenant_admin" ? "Admin" : "Agent"}
                    </span>
                  </div>

                  <div
                    className={`rounded-xl p-3 shadow-sm text-xs leading-relaxed whitespace-pre-wrap ${
                      isMe
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                    }`}
                  >
                    {m.mediaUrl && (
                      <div className="mb-2 rounded overflow-hidden border border-slate-100 bg-slate-50/80 p-1 w-fit">
                        {m.mediaType === "image" ? (
                          <img
                            src={m.mediaUrl}
                            alt={m.text || "Attachment"}
                            className="max-w-full max-h-48 rounded object-cover cursor-pointer hover:opacity-90 transition"
                            referrerPolicy="no-referrer"
                            onClick={() => window.open(m.mediaUrl, "_blank")}
                          />
                        ) : (
                          <a
                            href={m.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 font-medium py-1 px-1.5"
                          >
                            <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                            <span className="underline truncate max-w-[180px]">
                              Download File
                            </span>
                          </a>
                        )}
                      </div>
                    )}
                    <p>{m.text}</p>
                    <span className={`block text-[9px] mt-1.5 text-right opacity-60 font-mono`}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {conversationMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
              <h5 className="font-bold text-slate-600 text-sm">Quiet Channel</h5>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                Say hello to your teammates or admins to initiate instant business discussions.
              </p>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Reply composing panel */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {attachedFile && (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 animate-fadeIn">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
                  <span className="text-[10px] text-slate-400">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={clearAttachedFile}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-rose-600 transition"
                  title="Clear attachment"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl border shrink-0 transition ${
                  attachedFile 
                    ? "bg-blue-50 border-blue-300 text-blue-600" 
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
                }`}
                title="Add Attachment"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Send message to ${selectedReceiverName}...`}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />

              <button
                type="submit"
                disabled={sending || (!inputText.trim() && !attachedFile)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white p-2.5 rounded-xl shrink-0 self-end transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}
