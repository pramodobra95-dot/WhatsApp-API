/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { 
  Bot, 
  Plus, 
  Settings, 
  Database, 
  UserSquare, 
  ArrowRight, 
  Play, 
  Save, 
  RefreshCw, 
  Cpu, 
  HelpCircle,
  Clock,
  Code,
  CheckCircle2,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { Chatbot, BotNode } from "../types";

interface ChatbotBuilderProps {
  tenantId: string;
}

export default function ChatbotBuilder({ tenantId }: ChatbotBuilderProps) {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [activeBot, setActiveBot] = useState<Chatbot | null>(null);
  const [selectedNode, setSelectedNode] = useState<BotNode | null>(null);
  
  // New node form states
  const [showNodeCreator, setShowNodeCreator] = useState(false);
  const [newNodeType, setNewNodeType] = useState<BotNode["type"]>("message");
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeText, setNewNodeText] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const [simulatorChat, setSimulatorChat] = useState<Array<{ sender: "user" | "bot" | "agent"; text: string }>>([
    { sender: "bot", text: "Alpha Bot Online. Type 'hello' to trigger." }
  ]);
  const [simInput, setSimInput] = useState("");

  const fetchBots = () => {
    fetch(`/api/chatbots/${tenantId}`)
      .then(res => res.json())
      .then(data => {
        setBots(data);
        if (data.length > 0) {
          setActiveBot(data[0]);
          if (data[0].nodes.length > 0) {
            setSelectedNode(data[0].nodes[0]);
          }
        }
      });
  };

  useEffect(() => {
    fetchBots();
  }, [tenantId]);

  // Update node property details in memory
  const handleUpdateNodeDetails = (updatedNode: BotNode) => {
    if (!activeBot) return;
    const updatedNodes = activeBot.nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    const updatedBot = { ...activeBot, nodes: updatedNodes };
    setActiveBot(updatedBot);
    setSelectedNode(updatedNode);
  };

  // Save Bot updates to mock backend
  const handleSaveBot = () => {
    if (!activeBot) return;
    fetch(`/api/chatbots/${tenantId}/${activeBot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activeBot)
    })
      .then(res => res.json())
      .then(updated => {
        setActiveBot(updated);
        setToastMessage("Visual Bot Flow compiled and published to live WhatsApp routing gateway!");
        setTimeout(() => setToastMessage(""), 4000);
      });
  };

  // Add virtual node to canvas
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBot || !newNodeTitle) return;

    const newNode: BotNode = {
      id: `node-${Date.now()}`,
      type: newNodeType,
      position: { x: 300, y: 100 + activeBot.nodes.length * 60 },
      data: {
        title: newNodeTitle,
        text: newNodeText || undefined,
        buttons: newNodeType === "buttons" ? ["Choice A", "Choice B"] : undefined
      }
    };

    const updatedNodes = [...activeBot.nodes, newNode];
    
    // Connect previous last node to new node automatically inside sandbox
    const updatedEdges = [...activeBot.edges];
    if (activeBot.nodes.length > 0) {
      const sourceNode = activeBot.nodes[activeBot.nodes.length - 1];
      updatedEdges.push({
        id: `edge-${Date.now()}`,
        source: sourceNode.id,
        target: newNode.id
      });
    }

    const updatedBot = {
      ...activeBot,
      nodes: updatedNodes,
      edges: updatedEdges
    };

    setActiveBot(updatedBot);
    setSelectedNode(newNode);
    setNewNodeTitle("");
    setNewNodeText("");
    setShowNodeCreator(false);
  };

  // Toggle Bot Status
  const toggleBotStatus = () => {
    if (!activeBot) return;
    const nextStatus = activeBot.status === "active" ? "inactive" : "active";
    fetch(`/api/chatbots/${tenantId}/${activeBot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(updated => {
        setActiveBot(updated);
        setToastMessage(`Bot turned ${nextStatus.toUpperCase()} successfully!`);
        setTimeout(() => setToastMessage(""), 3000);
      });
  };

  // Simulate user sending message to the Bot flow
  const handleSimulatorInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simInput.trim() || !activeBot) return;

    const userText = simInput.trim().toLowerCase();
    const nextHistory = [...simulatorChat, { sender: "user" as const, text: simInput }];
    setSimulatorChat(nextHistory);
    setSimInput("");

    // Simulate bot parsing nodes sequence
    setTimeout(() => {
      if (userText === "hello" || userText === "hi") {
        const greetingNode = activeBot.nodes.find(n => n.type === "message");
        setSimulatorChat(prev => [...prev, { sender: "bot" as const, text: greetingNode?.data.text || "Hello! Welcome to our automated line." }]);
      } else if (userText.includes("agent") || userText.includes("transfer")) {
        const handoverNode = activeBot.nodes.find(n => n.type === "human_handover");
        setSimulatorChat(prev => [...prev, { sender: "bot" as const, text: `⚠️ Human Handover requested. Routing thread to live queue queue...` }]);
      } else {
        setSimulatorChat(prev => [...prev, { sender: "bot" as const, text: "I didn't quite catch that. Type 'hello' to start greeting flow, or 'agent' to transfer to support staff." }]);
      }
    }, 800);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8 min-h-screen">
      
      {/* Toast Notice */}
      {toastMessage && (
        <div className="mb-6 bg-teal-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg shadow-teal-600/10 transition animate-fade-in">
          <span className="text-xs font-mono font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {toastMessage}
          </span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Visual Chatbot Builder <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">Nodes Canvas</span>
          </h2>
          <p className="text-sm text-slate-500">Design automated interactive menu sequences, delays, dynamic API calls and Human Handover.</p>
        </div>
        
        {activeBot && (
          <div className="flex gap-2.5">
            <button
              onClick={toggleBotStatus}
              className={`text-xs font-bold py-2.5 px-4 rounded-lg shadow border transition ${
                activeBot.status === "active"
                  ? "bg-rose-100 border-rose-200 text-rose-800 hover:bg-rose-200"
                  : "bg-teal-100 border-teal-200 text-teal-800 hover:bg-teal-200"
              }`}
            >
              {activeBot.status === "active" ? "⚠️ Disable Automation" : "⚡ Turn Bot Active"}
            </button>

            <button
              onClick={handleSaveBot}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow transition"
            >
              <Save className="h-4 w-4" /> Publish Flow
            </button>
          </div>
        )}
      </div>

      {activeBot ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* CANVAS COLUMN: 2 Cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-700">{activeBot.name}</span>
                </div>
                <button
                  onClick={() => setShowNodeCreator(true)}
                  className="flex items-center gap-1 text-[10px] bg-purple-100 hover:bg-purple-200 text-purple-800 py-1 px-2.5 rounded font-bold font-mono transition"
                >
                  <Plus className="h-3 w-3" /> Append Trigger Node
                </button>
              </div>

              {/* Dynamic visual grid canvas rendering */}
              <div className="flex-1 overflow-auto p-6 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] relative space-y-6">
                
                {activeBot.nodes.map((node, i) => {
                  const isSelected = selectedNode?.id === node.id;
                  
                  // Color indicators based on node type
                  const nodeColors = {
                    trigger: "border-teal-500 bg-teal-50 text-teal-900",
                    message: "border-purple-500 bg-purple-50 text-purple-900",
                    buttons: "border-indigo-500 bg-indigo-50 text-indigo-900",
                    condition: "border-amber-500 bg-amber-50 text-amber-900",
                    delay: "border-slate-500 bg-slate-50 text-slate-900",
                    human_handover: "border-rose-500 bg-rose-50 text-rose-900",
                    api_call: "border-blue-500 bg-blue-50 text-blue-900"
                  }[node.type] || "border-slate-200 bg-white";

                  return (
                    <div key={node.id} className="flex flex-col items-center">
                      <div
                        onClick={() => setSelectedNode(node)}
                        className={`w-72 p-4 border-2 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition relative ${nodeColors} ${
                          isSelected ? "ring-2 ring-purple-600 ring-offset-2" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-bold font-mono uppercase opacity-75">{node.type}</span>
                          <span className="text-[9px] bg-white px-1.5 py-0.5 rounded font-bold border border-slate-200/50">Node #{i+1}</span>
                        </div>
                        <h5 className="text-xs font-bold truncate">{node.data.title}</h5>
                        {node.data.text && (
                          <p className="text-[10px] text-slate-500 truncate mt-1 italic">
                            "{node.data.text}"
                          </p>
                        )}
                      </div>

                      {/* Connective arrows */}
                      {i < activeBot.nodes.length - 1 && (
                        <div className="py-2 flex flex-col items-center">
                          <div className="h-6 w-0.5 bg-slate-300" />
                          <ArrowRight className="h-3 w-3 text-slate-400 rotate-90" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* NODE CONFIGURATION PANEL */}
          <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm h-[600px] flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[9px] font-bold text-purple-600 font-mono uppercase block">Node Inspector</span>
                  <h4 className="text-sm font-bold text-slate-800 capitalize mt-0.5">{selectedNode.type} Node Details</h4>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">Title Descriptor:</label>
                    <input
                      type="text"
                      value={selectedNode.data.title}
                      onChange={(e) => handleUpdateNodeDetails({
                        ...selectedNode,
                        data: { ...selectedNode.data, title: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>

                  {/* Body text if applicable */}
                  {(selectedNode.type === "message" || selectedNode.type === "buttons") && (
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">WhatsApp Response Text:</label>
                      <textarea
                        rows={4}
                        value={selectedNode.data.text || ""}
                        onChange={(e) => handleUpdateNodeDetails({
                          ...selectedNode,
                          data: { ...selectedNode.data, text: e.target.value }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 focus:outline-none resize-none font-sans"
                      />
                    </div>
                  )}

                  {/* API endpoint if applicable */}
                  {selectedNode.type === "api_call" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">Target Endpoint Link:</label>
                        <input
                          type="text"
                          value={selectedNode.data.apiUrl || ""}
                          onChange={(e) => handleUpdateNodeDetails({
                            ...selectedNode,
                            data: { ...selectedNode.data, apiUrl: e.target.value }
                          })}
                          placeholder="https://api.crm.com/shipment"
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">HTTP Method:</label>
                        <select
                          value={selectedNode.data.apiMethod || "GET"}
                          onChange={(e) => handleUpdateNodeDetails({
                            ...selectedNode,
                            data: { ...selectedNode.data, apiMethod: e.target.value }
                          })}
                          className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Human Handover assignee */}
                  {selectedNode.type === "human_handover" && (
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">Assign Thread to Live Queue:</label>
                      <select
                        value={selectedNode.data.assigneeId || "unassigned"}
                        onChange={(e) => handleUpdateNodeDetails({
                          ...selectedNode,
                          data: { ...selectedNode.data, assigneeId: e.target.value }
                        })}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700"
                      >
                        <option value="user-agent-1">Agent Alice (Customer Support)</option>
                        <option value="user-manager-1">Manager Bob (Escalation Pool)</option>
                        <option value="unassigned">Keep Unassigned (Shared Queue)</option>
                      </select>
                    </div>
                  )}

                  {/* Delay timer */}
                  {selectedNode.type === "delay" && (
                    <div>
                      <label className="block text-[10px] text-slate-400 font-mono uppercase tracking-wide mb-1">Timer Wait delay:</label>
                      <input
                        type="number"
                        value={selectedNode.data.delaySeconds || 5}
                        onChange={(e) => handleUpdateNodeDetails({
                          ...selectedNode,
                          data: { ...selectedNode.data, delaySeconds: parseInt(e.target.value) || 5 }
                        })}
                        className="w-24 bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 font-mono"
                      /> <span className="text-slate-500 font-sans ml-1">Seconds</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Click any visual node card on the canvas to configure variables.</p>
              </div>
            )}

            <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400">
              <span className="font-mono block uppercase mb-1">Canvas Analytics</span>
              <p>Completed connectors: <strong className="text-slate-600">{activeBot.edges.length} edges</strong></p>
            </div>
          </div>

          {/* WHATSAPP CHAT SIMULATOR SANDBOX SCREEN */}
          <div className="bg-slate-900 rounded-[2rem] p-3 shadow-2xl border-4 border-slate-800 flex flex-col justify-between h-[600px] text-white">
            <div className="p-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-xl flex items-center gap-2 mb-3 shrink-0">
              <div className="h-6 w-6 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center font-bold text-[9px] uppercase border border-purple-500/20">
                B
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-bold truncate">Visual Bot Simulator</p>
                <p className="text-[7px] text-purple-400 font-mono">Sandbox Client Terminal</p>
              </div>
            </div>

            {/* Chat screen */}
            <div className="flex-1 overflow-y-auto space-y-2 p-1 text-[10px]">
              {simulatorChat.map((chat, i) => (
                <div key={i} className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-2.5 rounded-lg max-w-[85%] ${
                    chat.sender === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-800 text-slate-200 border border-slate-700"
                  }`}>
                    <p className="whitespace-pre-wrap">{chat.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Text composer */}
            <form onSubmit={handleSimulatorInput} className="mt-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex gap-1 shrink-0">
              <input
                type="text"
                placeholder="Type 'hello' or 'agent'..."
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                className="flex-1 bg-transparent text-[11px] text-white focus:outline-none px-2 py-1 placeholder-slate-600"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-1.5 rounded-lg shrink-0">
                <Play className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-slate-400">
          <Bot className="h-12 w-12 mx-auto mb-3 animate-bounce" />
          <p className="text-sm font-mono">Loading chatbot designer database...</p>
        </div>
      )}

      {/* CREATE NODE MODAL DIALOG */}
      {showNodeCreator && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl relative">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Append Bot Trigger Node</h4>
            <p className="text-xs text-slate-400 mb-4">Extend your automated response workflow path inside the visual workspace.</p>

            <form onSubmit={handleAddNode} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Node Logic Action:</label>
                <select
                  value={newNodeType}
                  onChange={(e: any) => setNewNodeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="message">WhatsApp Message Text</option>
                  <option value="buttons">Interactions Buttons List</option>
                  <option value="delay">Timer Wait Delay</option>
                  <option value="human_handover">Support Agent Handover</option>
                  <option value="api_call">Integrate CRM API Call</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Node Label Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Intro Promo Text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none"
                />
              </div>

              {(newNodeType === "message" || newNodeType === "buttons") && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1 font-mono">Response Message:</label>
                  <textarea
                    rows={3}
                    placeholder="Type what WhatsApp users will receive..."
                    value={newNodeText}
                    onChange={(e) => setNewNodeText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none resize-none"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNodeCreator(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-1.5 px-4 rounded-lg shadow transition"
                >
                  Insert Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
