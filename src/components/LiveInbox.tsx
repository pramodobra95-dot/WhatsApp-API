/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { 
  Search, 
  Filter, 
  Send, 
  Smile, 
  Paperclip, 
  UserPlus, 
  Tag, 
  Sparkles, 
  MessageSquare, 
  User, 
  CheckCheck, 
  Check, 
  MoreVertical, 
  Bot, 
  HelpCircle,
  FileText,
  Clock,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Info,
  Loader2,
  ChevronLeft,
  X
} from "lucide-react";
import { Chat, Message } from "../types";

interface LiveInboxProps {
  tenantId: string;
}

export default function LiveInbox({ tenantId }: LiveInboxProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<string>("all");
  const [availableLabels, setAvailableLabels] = useState<any[]>([]);

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; type: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ sentiment: string; intent: string; summary: string } | null>(null);
  const [suggestedReply, setSuggestedReply] = useState("");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [analyzingThread, setAnalyzingThread] = useState(false);

  // Manual Add Customer Form States
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustInitialMsg, setNewCustInitialMsg] = useState("");
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

  // Private note toggle
  const [isPrivateNote, setIsPrivateNote] = useState(false);

  // Responsive sidebar detail state
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Scroll ref
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Fetch chats for tenant
  const fetchChats = () => {
    if (!tenantId) return;
    fetch(`/api/chats/${tenantId}`)
      .then(res => res.json())
      .then(data => {
        setChats(data);
        if (data.length > 0 && !selectedChat) {
          if (window.innerWidth >= 768) {
            setSelectedChat(data[0]);
          }
        }
      })
      .catch(err => console.error("Error fetching chats:", err));
  };

  const handleCreateManualChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    setSubmittingCustomer(true);
    fetch(`/api/chats/${tenantId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: newCustName,
        customerPhone: newCustPhone,
        initialMessage: newCustInitialMsg
      })
    })
      .then(res => res.json())
      .then(newChat => {
        // Refresh chats list and select the newly created chat
        fetch(`/api/chats/${tenantId}`)
          .then(res => res.json())
          .then(data => {
            setChats(data);
            const foundChat = data.find((c: any) => c.customerPhone === newCustPhone) || newChat;
            setSelectedChat(foundChat);
          });
        
        // Reset state
        setNewCustName("");
        setNewCustPhone("");
        setNewCustInitialMsg("");
        setShowAddCustomerModal(false);
        setSubmittingCustomer(false);
      })
      .catch(err => {
        console.error("Error creating manual chat:", err);
        setSubmittingCustomer(false);
      });
  };

  useEffect(() => {
    fetchChats();

    // Load custom workspace outcome labels configured by Tenant Admin
    const saved = localStorage.getItem(`bouuz_labels_${tenantId}`);
    if (saved) {
      try {
        setAvailableLabels(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading custom labels:", e);
      }
    } else {
      const DEFAULT_LABELS = [
        { name: "VIP", color: "bg-purple-100 text-purple-800 border-purple-200" },
        { name: "Support", color: "bg-blue-100 text-blue-800 border-blue-200" },
        { name: "Urgent", color: "bg-rose-100 text-rose-800 border-rose-200" },
        { name: "Logistics", color: "bg-amber-100 text-amber-800 border-amber-200" },
        { name: "Interested", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
        { name: "Follow-up", color: "bg-indigo-100 text-indigo-800 border-indigo-200" }
      ];
      setAvailableLabels(DEFAULT_LABELS);
      localStorage.setItem(`bouuz_labels_${tenantId}`, JSON.stringify(DEFAULT_LABELS));
    }
  }, [tenantId]);

  // Toggle label on chat dynamically as per agent selection
  const toggleChatLabel = (chatId: string, labelName: string) => {
    if (!selectedChat) return;
    const isAdding = !selectedChat.labels.includes(labelName);
    const newLabels = isAdding
      ? [...selectedChat.labels, labelName]
      : selectedChat.labels.filter(l => l !== labelName);

    fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labels: newLabels })
    })
      .then(res => res.json())
      .then(updated => {
        setSelectedChat(updated);
        setChats(prev => prev.map(c => c.id === updated.id ? updated : c));
      })
      .catch(err => console.error("Error updating labels:", err));
  };

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

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      fetch(`/api/chats/messages/${selectedChat.id}`)
        .then(res => res.json())
        .then(data => {
          setMessages(data);
          scrollToBottom();
          // Reset AI state
          setSuggestedReply("");
          setAiAnalysis({
            sentiment: selectedChat.sentiment,
            intent: selectedChat.intent || "Not analyzed yet",
            summary: selectedChat.summary || "No automated summary drafted yet."
          });
        })
        .catch(err => console.error("Error fetching messages:", err));
    }
  }, [selectedChat]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasText = !!inputText.trim();
    const hasFile = !!attachedFile;
    if ((!hasText && !hasFile) || !selectedChat) return;

    const payload = {
      chatId: selectedChat.id,
      text: inputText.trim() || (attachedFile ? `Attached File: ${attachedFile.name}` : ""),
      sender: isPrivateNote ? "system" : "agent",
      senderName: isPrivateNote ? "Private Note" : "Agent Alice",
      mediaUrl: attachedFile ? attachedFile.url : undefined,
      mediaType: attachedFile ? (attachedFile.type.startsWith("image/") ? "image" : "document") : undefined
    };

    fetch("/api/chats/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(newMsg => {
        setMessages(prev => [...prev, newMsg]);
        setInputText("");
        clearAttachedFile();
        scrollToBottom();
        
        // Update local chats list
        setChats(prev => prev.map(c => {
          if (c.id === selectedChat.id) {
            return {
              ...c,
              lastMessageText: payload.text,
              lastMessageTime: newMsg.timestamp
            };
          }
          return c;
        }));
      })
      .catch(err => console.error("Error sending message:", err));
  };

  // Call Gemini for Intelligent Reply Suggestion
  const generateAiReply = () => {
    if (!selectedChat || messages.length === 0) return;
    setAiGenerating(true);
    
    // Pass last messages to API
    fetch("/api/gemini/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map(m => ({ sender: m.sender, text: m.text })),
        tone: selectedTone,
        knowledgeBase: "Alpha logistics dispatch shipping cutoffs are 4pm EST. Overnight delivery takes 12-24 hours max. Refunds can be claimed on the checkout client portal if shipping is delayed over 48 hours."
      })
    })
      .then(res => res.json())
      .then(data => {
        setSuggestedReply(data.replyText);
        setAiGenerating(false);
      })
      .catch(err => {
        console.error("AI Reply generation failed:", err);
        setAiGenerating(false);
      });
  };

  // Call Gemini to analyze intent and draft conversational summary
  const runAiAnalysis = () => {
    if (!selectedChat || messages.length === 0) return;
    setAnalyzingThread(true);

    fetch("/api/gemini/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map(m => ({ senderName: m.senderName, sender: m.sender, text: m.text }))
      })
    })
      .then(res => res.json())
      .then(data => {
        setAiAnalysis(data);
        
        // Update local chat info
        setSelectedChat(prev => prev ? {
          ...prev,
          sentiment: data.sentiment,
          intent: data.intent,
          summary: data.summary
        } : null);

        setChats(prev => prev.map(c => {
          if (c.id === selectedChat.id) {
            return {
              ...c,
              sentiment: data.sentiment,
              intent: data.intent,
              summary: data.summary
            };
          }
          return c;
        }));

        setAnalyzingThread(false);
      })
      .catch(err => {
        console.error("Analysis failed:", err);
        setAnalyzingThread(false);
      });
  };

  // Filter chats based on search & tags
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          chat.customerPhone.includes(searchTerm) ||
                          chat.lastMessageText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLabel = selectedLabelFilter === "all" || chat.labels.includes(selectedLabelFilter);
    return matchesSearch && matchesLabel;
  });

  // Assign chat to Agent
  const assignToMe = () => {
    if (!selectedChat) return;
    fetch(`/api/chats/${selectedChat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: "user-agent-1" })
    })
      .then(res => res.json())
      .then(updated => {
        setSelectedChat(updated);
        setChats(prev => prev.map(c => c.id === updated.id ? updated : c));
      });
  };

  // Resolve chat
  const resolveChat = () => {
    if (!selectedChat) return;
    fetch(`/api/chats/${selectedChat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" })
    })
      .then(res => res.json())
      .then(updated => {
        setSelectedChat(updated);
        setChats(prev => prev.map(c => c.id === updated.id ? updated : c));
      });
  };

  // Append preset templates
  const useTemplate = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="flex-1 flex h-screen bg-slate-100 overflow-hidden relative">
      
      {/* LEFT PANEL: Chat List directory */}
      <div className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 ${selectedChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>Conversations</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 py-0.5 px-2 rounded-full font-mono font-bold">
                {filteredChats.length}
              </span>
            </h3>
            <button
              onClick={() => setShowAddCustomerModal(true)}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-sm transition shrink-0"
              title="Add New Customer & Chat"
            >
              <UserPlus className="h-3 w-3" />
              <span>Add Cust</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats, name, text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedLabelFilter("all")}
              className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 transition ${
                selectedLabelFilter === "all"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {availableLabels.map((lbl) => (
              <button
                key={lbl.name}
                onClick={() => setSelectedLabelFilter(lbl.name)}
                className={`text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 transition ${
                  selectedLabelFilter === lbl.name
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {lbl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chats scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredChats.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No active chats match your query.</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isSelected = selectedChat?.id === chat.id;
              
              // Sentiment colors
              const sentimentIcon = {
                positive: <ThumbsUp className="h-3 w-3 text-teal-500" />,
                neutral: <Meh className="h-3 w-3 text-slate-400" />,
                negative: <ThumbsDown className="h-3 w-3 text-rose-500" />
              }[chat.sentiment] || <Meh className="h-3 w-3 text-slate-400" />;

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition relative ${
                    isSelected ? "bg-slate-50 border-l-4 border-emerald-500" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-slate-800 text-xs truncate max-w-[130px]">
                      {chat.customerName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mb-2">
                    {chat.lastMessageText}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 overflow-hidden">
                      {chat.labels.map(l => (
                        <span key={l} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/50">
                          {l}
                        </span>
                      ))}
                      {chat.intent && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono truncate max-w-[80px]">
                          {chat.intent.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {sentimentIcon}
                      {chat.unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MIDDLE PANEL: Active Chat Logs */}
      <div className={`flex-1 bg-slate-50 flex flex-col h-full min-w-0 ${selectedChat ? "flex" : "hidden md:flex"}`}>
        {selectedChat ? (
          <>
            {/* Thread Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg shrink-0 transition"
                  title="Back to chats"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs uppercase shrink-0">
                  {selectedChat.customerName[0]}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-slate-800 truncate leading-none mb-1">
                    {selectedChat.customerName}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">{selectedChat.customerPhone}</p>
                </div>
              </div>

              {/* Thread action menu */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="flex items-center gap-1.5 p-1.5 md:py-1.5 md:px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg shrink-0 transition cursor-pointer text-xs font-semibold"
                  title="Toggle AI Insights & Outcome Tags"
                >
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="hidden md:inline">AI Copilot & Tags</span>
                </button>
                {!selectedChat.assignedTo ? (
                  <button
                    onClick={assignToMe}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 transition"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Claim Thread
                  </button>
                ) : (
                  <div className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Assigned
                  </div>
                )}

                <button
                  onClick={resolveChat}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Conversation Log Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]">
              {messages.map((m) => {
                const isCustomer = m.sender === "customer";
                const isPrivate = m.sender === "system";
                
                if (isPrivate) {
                  return (
                    <div key={m.id} className="flex justify-center my-2 w-full">
                      <div className="bg-amber-50 border border-amber-200/60 rounded-lg p-3 text-xs text-amber-800 max-w-lg shadow-sm w-full">
                        <p className="font-semibold mb-1 flex items-center gap-1.5 text-amber-900">
                          <Clock className="h-3.5 w-3.5 text-amber-500" /> Internal Staff Note:
                        </p>
                        {m.mediaUrl && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-amber-200/50 bg-amber-100/30 p-1 w-fit">
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
                                className="flex items-center gap-1.5 text-[11px] text-amber-900 hover:underline font-medium py-1 px-1.5"
                              >
                                <Paperclip className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                                <span className="underline truncate max-w-[180px]">
                                  Download File
                                </span>
                              </a>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-xl p-3.5 shadow-sm relative ${
                        isCustomer
                          ? "bg-white text-slate-800 rounded-tl-none border border-slate-200/60"
                          : "bg-emerald-500 text-white rounded-tr-none"
                      }`}
                    >
                      <p className="font-bold opacity-60 text-[10px] mb-1">{m.senderName}</p>
                      {m.mediaUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-slate-100 bg-slate-50/80 p-1 w-fit">
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
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      <div className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 ${isCustomer ? "text-slate-400" : "text-emerald-100"}`}>
                        <span>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {!isCustomer && (
                          m.status === "read" ? <CheckCheck className="h-3 w-3 text-emerald-200" /> : <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            {/* Reply Input Panel */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-inner">
              
              {/* Quick Preset Templates selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-100 mb-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider shrink-0 mr-2">
                  Canned Meta Templates:
                </span>
                <button
                  onClick={() => useTemplate("Hi {{customer_name}}, thank you for reaching out! We are preparing your order details right now.")}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 py-1 px-2 rounded-md border border-slate-200 truncate shrink-0 max-w-[150px]"
                >
                  Greeting Intro
                </button>
                <button
                  onClick={() => useTemplate("We have dispatched your shipment tracking code: {{tracking_id}}. You can inspect updates live here: {{url_link}}")}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 py-1 px-2 rounded-md border border-slate-200 truncate shrink-0 max-w-[150px]"
                >
                  Shipping Tracking Code
                </button>
                <button
                  onClick={() => useTemplate("Our office hours are Mon-Fri 9AM-5PM EST. Our virtual bot handles emergency requests.")}
                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 py-1 px-2 rounded-md border border-slate-200 truncate shrink-0 max-w-[150px]"
                >
                  Office Timing Info
                </button>
              </div>

              {/* Main message composing form */}
              <form onSubmit={handleSendMessage} className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPrivateNote(!isPrivateNote)}
                      className={`text-xs py-1 px-2.5 rounded font-medium border transition ${
                        isPrivateNote
                          ? "bg-amber-100 border-amber-300 text-amber-800 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {isPrivateNote ? "📝 Internal Private Note" : "✉️ WhatsApp Reply Mode"}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {isPrivateNote ? "Visible only to teammates" : "Will deliver to customer WhatsApp"}
                  </span>
                </div>

                {attachedFile && (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 animate-fadeIn">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
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

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2.5 rounded-lg border shrink-0 transition ${
                      attachedFile 
                        ? "bg-emerald-50 border-emerald-300 text-emerald-600" 
                        : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600"
                    }`}
                    title="Add Attachment"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <textarea
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isPrivateNote ? "Compose internal comment / staff discussion thread..." : "Type custom WhatsApp text, inject variables like {{1}}..."}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans"
                  />

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg shrink-0 self-end transition"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-16 w-16 text-slate-300 mb-4 animate-pulse" />
            <h4 className="text-base font-bold text-slate-700">Inbox Idle</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select an active customer chat thread from the left menu bar to claim the session or read incoming logs.
            </p>
          </div>
        )}
      </div>

      {/* RIGHT PANEL: AI Copilot Assistant Panel */}
      {showRightPanel && selectedChat && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity" onClick={() => setShowRightPanel(false)} />
      )}

      {selectedChat && (
        <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 overflow-y-auto p-4 space-y-6 shadow-2xl transition-all duration-300 ${showRightPanel ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>AI Copilot & Tags</span>
            </span>
            <button 
              onClick={() => setShowRightPanel(false)} 
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Done
            </button>
          </div>

          {/* Active Outcome Labels Selection Widget */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-emerald-600" />
              <span>Assign Outcome Tags</span>
            </h5>
            <p className="text-[10px] text-slate-400 font-sans">
              Set output label dynamically as per customer feedback. Customize these labels in Tenant settings.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableLabels.map((lbl) => {
                const isSelected = selectedChat.labels.includes(lbl.name);
                return (
                  <button
                    key={lbl.name}
                    type="button"
                    onClick={() => toggleChatLabel(selectedChat.id, lbl.name)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded border transition ${
                      isSelected
                        ? lbl.color + " ring-1 ring-emerald-500"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {lbl.name} {isSelected ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-3.5 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-500" /> AI Gemini Copilot
            </h4>

            {/* Conversation Insights (Summary/Sentiment) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 text-white shadow-sm space-y-3.5 relative overflow-hidden">
              <div className="absolute right-0 top-0 text-slate-800/20 translate-x-3 -translate-y-3">
                <Bot className="h-24 w-24" />
              </div>

              <div>
                <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-wider uppercase block mb-1">Sentiment Category</span>
                <div className="flex items-center gap-2">
                  <span className="capitalize text-xs font-bold font-sans">
                    {aiAnalysis?.sentiment || "neutral"}
                  </span>
                  {aiAnalysis?.sentiment === "positive" && <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />}
                  {aiAnalysis?.sentiment === "neutral" && <Meh className="h-3.5 w-3.5 text-slate-400" />}
                  {aiAnalysis?.sentiment === "negative" && <ThumbsDown className="h-3.5 w-3.5 text-rose-400" />}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-wider uppercase block mb-1">Intent Classified</span>
                <span className="text-xs font-mono font-bold bg-slate-800/70 border border-slate-700 px-2 py-0.5 rounded text-slate-200 block truncate">
                  {aiAnalysis?.intent || "Not processed"}
                </span>
              </div>

              <div>
                <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-wider uppercase block mb-1">One-Sentence Summary</span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans italic">
                  "{aiAnalysis?.summary || "No active context analyzed yet."}"
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-mono">Run Gemini 3.5 analyze:</span>
                <button
                  type="button"
                  onClick={runAiAnalysis}
                  disabled={analyzingThread}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded transition shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {analyzingThread ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Analyze Thread
                </button>
              </div>
            </div>
          </div>

          {/* AI REPLY SUGGESTER (Auto drafting with tone tuning) */}
          <div className="border-t border-slate-100 pt-4">
            <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
              <Bot className="h-4 w-4 text-emerald-600" /> Draft Reply Suggestions
            </h5>

            <div className="space-y-3">
              {/* Tone tuning selector */}
              <div>
                <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">
                  Drafting Tone Target:
                </label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="helpful and professional">Helpful & Professional</option>
                  <option value="warm and friendly">Warm & Friendly</option>
                  <option value="persuasive sales">Sales Pitch</option>
                  <option value="apologetic shipping delays">Apologetic (Delay Incident)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={generateAiReply}
                disabled={aiGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Drafting draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" /> Auto-Draft Smart Reply
                  </>
                )}
              </button>

              {suggestedReply && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3.5 space-y-2">
                  <span className="text-[9px] font-bold text-purple-700 uppercase font-mono tracking-wider block">
                    Copilot Suggestion:
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                    "{suggestedReply}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setInputText(suggestedReply);
                      setSuggestedReply("");
                    }}
                    className="text-[10px] bg-white border border-purple-200 hover:bg-purple-100 text-purple-800 font-bold px-2 py-1 rounded transition block w-full text-center"
                  >
                    Apply to Input Composer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick FAQ / Policy Helper Widget */}
          <div className="border-t border-slate-100 pt-4 bg-slate-50 p-3 rounded-lg border border-slate-200/50">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1 font-mono">
              <Info className="h-3.5 w-3.5 text-slate-400" /> Internal Policy Guide:
            </h5>
            <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4 font-sans">
              <li>Check order logs using track IDs.</li>
              <li>Always obtain approval before scheduling refund actions.</li>
              <li>Transfer to Super Admins for license modifications.</li>
            </ul>
          </div>
        </div>
      )}

      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-teal-400" /> Manually Add Customer & Chat
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateManualChat} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Customer Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ramesh Kumar"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Mobile Phone (including country code):</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., +919876543210"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide mb-1">Initial Outbound Message (optional):</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Hello, we received your shipment request."
                  value={newCustInitialMsg}
                  onChange={e => setNewCustInitialMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2.5 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCustomer}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition flex items-center gap-1"
                >
                  {submittingCustomer ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Open Session
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
