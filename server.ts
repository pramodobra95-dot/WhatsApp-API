/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Tenant, 
  WhatsAppPhoneNumber, 
  Contact, 
  Chat, 
  Message, 
  Campaign, 
  MetaTemplate, 
  AuditLog, 
  Chatbot, 
  Deal 
} from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || "dummy-key";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Mock Database State (in-memory) to simulate a full database
const TENANTS: Tenant[] = [
  { id: "tenant-alpha", name: "Alpha Logistics Inc", domain: "alpha.logistics.com", plan: "pro" as const, status: "active" as const, createdAt: "2026-01-10", whatsappLimit: 100000, aiCredits: 5000, aiUsed: 1240, phoneNumbersCount: 2, maxUsersCount: 15, internalChatEnabled: true },
  { id: "tenant-beta", name: "Beta Retail Co", domain: "beta.shop.com", plan: "growth" as const, status: "active" as const, createdAt: "2026-02-15", whatsappLimit: 10000, aiCredits: 1000, aiUsed: 950, phoneNumbersCount: 1, maxUsersCount: 5, internalChatEnabled: false },
  { id: "tenant-gamma", name: "Gamma Health Clinic", domain: "gamma.health.org", plan: "enterprise" as const, status: "active" as const, createdAt: "2026-03-01", whatsappLimit: 500000, aiCredits: 20000, aiUsed: 4320, phoneNumbersCount: 3, maxUsersCount: 50, internalChatEnabled: true },
  { id: "tenant-delta", name: "Delta Real Estate", domain: "delta.realestate.com", plan: "growth" as const, status: "suspended" as const, createdAt: "2026-04-12", whatsappLimit: 10000, aiCredits: 1000, aiUsed: 220, phoneNumbersCount: 1, maxUsersCount: 5, internalChatEnabled: false }
];

const PHONE_NUMBERS: WhatsAppPhoneNumber[] = [
  { id: "phone-1", tenantId: "tenant-alpha", phoneNumber: "+15550199", displayPhoneNumber: "+1 (555) 019-9900", verifiedName: "Alpha Support", status: "connected" as const, qualityRating: "green" as const, limitCategory: "tier2" as const },
  { id: "phone-2", tenantId: "tenant-alpha", phoneNumber: "+15550188", displayPhoneNumber: "+1 (555) 018-8811", verifiedName: "Alpha Notifications", status: "connected" as const, qualityRating: "green" as const, limitCategory: "tier1" as const },
  { id: "phone-3", tenantId: "tenant-beta", phoneNumber: "+15550277", displayPhoneNumber: "+1 (555) 027-7722", verifiedName: "Beta Shop Hub", status: "connected" as const, qualityRating: "yellow" as const, limitCategory: "tier1" as const },
  { id: "phone-4", tenantId: "tenant-gamma", phoneNumber: "+15550366", displayPhoneNumber: "+1 (555) 036-6633", verifiedName: "Gamma Clinic Main", status: "connected" as const, qualityRating: "green" as const, limitCategory: "tier3" as const }
];

const CONTACTS: Contact[] = [
  { id: "c-1", tenantId: "tenant-alpha", name: "David Miller", phoneNumber: "+14155552671", email: "david.m@example.com", tags: ["VIP", "Enterprise"], customFields: { "CompanySize": "500+", "Region": "West" }, createdAt: "2026-05-12", segments: ["High Value"] },
  { id: "c-2", tenantId: "tenant-alpha", name: "Sarah Connor", phoneNumber: "+14155558912", email: "sarah.c@sky.net", tags: ["Support", "Urgent"], customFields: { "Industry": "Defense", "Region": "West" }, createdAt: "2026-06-01", segments: ["Urgent Queries"] },
  { id: "c-3", tenantId: "tenant-alpha", name: "John Doe", phoneNumber: "+12125551234", email: "john.doe@gmail.com", tags: ["Lead"], customFields: { "Source": "Facebook Ads", "Region": "East" }, createdAt: "2026-07-01", segments: ["New Leads"] },
  { id: "c-4", tenantId: "tenant-beta", name: "Alice Jenkins", phoneNumber: "+13125559876", email: "alice.j@retail.com", tags: ["Loyalty Member"], customFields: { "LTV": "$450" }, createdAt: "2026-06-15", segments: ["VIP Customer"] }
];

const CHATS: Chat[] = [
  { id: "chat-1", tenantId: "tenant-alpha", customerName: "David Miller", customerPhone: "+14155552671", assignedTo: "user-agent-1", status: "open" as const, labels: ["VIP", "Logistics"], lastMessageText: "I haven't received my tracking link yet, please assist.", lastMessageTime: "2026-07-14T08:15:00-07:00", unreadCount: 1, sentiment: "negative" as const, intent: "shipping_issue", summary: "Customer is complaining about a missing tracking link for an active order." },
  { id: "chat-2", tenantId: "tenant-alpha", customerName: "Sarah Connor", customerPhone: "+14155558912", assignedTo: "user-manager-1", status: "open" as const, labels: ["Urgent"], lastMessageText: "Our systems are fully operational now, thanks for the update.", lastMessageTime: "2026-07-14T08:00:00-07:00", unreadCount: 0, sentiment: "positive" as const, intent: "appreciation", summary: "Client acknowledged success of incident resolution." },
  { id: "chat-3", tenantId: "tenant-alpha", customerName: "John Doe", customerPhone: "+12125551234", assignedTo: undefined, status: "open" as const, labels: [], lastMessageText: "Hello, I am interested in your pricing packages.", lastMessageTime: "2026-07-14T07:30:00-07:00", unreadCount: 0, sentiment: "neutral" as const, intent: "pricing_inquiry", summary: "Prospect inquiring about pricing plans and details." }
];

const MESSAGES: Message[] = [
  { id: "m-1", chatId: "chat-1", sender: "customer" as const, senderName: "David Miller", text: "Hello team, I paid for overnight express but the tracking says pending.", status: "read" as const, timestamp: "2026-07-14T08:10:00-07:00" },
  { id: "m-2", chatId: "chat-1", sender: "agent" as const, senderName: "Agent Alice", text: "Hi David, I am looking up your order ID now.", status: "read" as const, timestamp: "2026-07-14T08:12:00-07:00" },
  { id: "m-3", chatId: "chat-1", sender: "customer" as const, senderName: "David Miller", text: "I haven't received my tracking link yet, please assist.", status: "delivered" as const, timestamp: "2026-07-14T08:15:00-07:00" },
  { id: "m-4", chatId: "chat-2", sender: "customer" as const, senderName: "Sarah Connor", text: "Are there any service delays today?", status: "read" as const, timestamp: "2026-07-14T07:45:00-07:00" },
  { id: "m-5", chatId: "chat-2", sender: "agent" as const, senderName: "Agent Bob", text: "No delays reported. All lines are running smoothly.", status: "read" as const, timestamp: "2026-07-14T07:50:00-07:00" },
  { id: "m-6", chatId: "chat-2", sender: "customer" as const, senderName: "Sarah Connor", text: "Our systems are fully operational now, thanks for the update.", status: "read" as const, timestamp: "2026-07-14T08:00:00-07:00" },
  { id: "m-7", chatId: "chat-3", sender: "customer" as const, senderName: "John Doe", text: "Hello, I am interested in your pricing packages.", status: "read" as const, timestamp: "2026-07-14T07:30:00-07:00" }
];

const CAMPAIGNS: Campaign[] = [
  { id: "camp-1", tenantId: "tenant-alpha", name: "E-Commerce Re-engagement July", templateId: "temp-marketing-1", segmentId: "seg-inactive", status: "completed" as const, sentCount: 1420, deliveredCount: 1402, readCount: 1105, clickedCount: 342, failedCount: 18, createdAt: "2026-07-01" },
  { id: "camp-2", tenantId: "tenant-alpha", name: "VIP Early Access Sale", templateId: "temp-marketing-2", segmentId: "seg-vip", status: "scheduled" as const, scheduledTime: "2026-07-20T09:00:00Z", sentCount: 0, deliveredCount: 0, readCount: 0, clickedCount: 0, failedCount: 0, createdAt: "2026-07-12" },
  { id: "camp-3", tenantId: "tenant-beta", name: "Store Opening Invitation", templateId: "temp-marketing-beta", segmentId: "seg-beta-all", status: "completed" as const, sentCount: 450, deliveredCount: 440, readCount: 390, clickedCount: 95, failedCount: 10, createdAt: "2026-06-20" }
];

const META_TEMPLATES: MetaTemplate[] = [
  { id: "temp-marketing-1", tenantId: "tenant-alpha", name: "delivery_update_v2", category: "MARKETING" as const, language: "en", status: "APPROVED" as const, headerType: "IMAGE" as const, bodyText: "Hi {{1}}, your order {{2}} has been dispatched! Track your parcel here: {{3}}", footerText: "Alpha Logistics Solutions", buttons: [{ type: "URL" as const, text: "Track Order", url: "https://track.alpha.com/{{3}}" }] },
  { id: "temp-marketing-2", tenantId: "tenant-alpha", name: "seasonal_offer_discount", category: "MARKETING" as const, language: "en_US", status: "APPROVED" as const, headerType: "NONE" as const, bodyText: "Hey {{1}}, check out our summer clearance sale with up to 40% OFF. Use coupon {{2}}.", footerText: "Alpha Deals Team", buttons: [{ type: "QUICK_REPLY" as const, text: "Opt In" }, { type: "QUICK_REPLY" as const, text: "Stop Messages" }] },
  { id: "temp-auth-1", tenantId: "tenant-alpha", name: "one_time_otp_code", category: "AUTHENTICATION" as const, language: "en", status: "APPROVED" as const, headerType: "NONE" as const, bodyText: "Your secure login passcode is {{1}}. It expires in 5 minutes.", footerText: "Alpha Secur", buttons: [] }
];

const AUDIT_LOGS: AuditLog[] = [
  { id: "log-1", tenantId: "tenant-alpha", userId: "user-admin-1", userName: "Admin Alice", action: "TEMPLATE_CREATED", details: "Created marketing template 'delivery_update_v2'", ipAddress: "198.51.100.42", timestamp: "2026-07-12T10:45:00Z" },
  { id: "log-2", tenantId: "tenant-alpha", userId: "user-admin-1", userName: "Admin Alice", action: "CAMPAIGN_SCHEDULED", details: "Scheduled campaign 'VIP Early Access Sale' for 2026-07-20", ipAddress: "198.51.100.42", timestamp: "2026-07-12T11:00:00Z" },
  { id: "log-3", tenantId: "tenant-beta", userId: "user-beta-admin", userName: "Beta Admin", action: "WHATSAPP_CONNECT", details: "Connected WhatsApp Phone +15550277 via Embedded Signup", ipAddress: "203.0.113.15", timestamp: "2026-06-15T14:22:00Z" }
];

const CHATBOTS: Chatbot[] = [
  {
    id: "bot-1",
    tenantId: "tenant-alpha",
    name: "Standard AI Greeting & Routing",
    status: "active" as const,
    nodes: [
      { id: "node-1", type: "trigger", position: { x: 50, y: 150 }, data: { title: "Keyword Trigger", text: "Any incoming text containing 'hello', 'hi', 'pricing' or 'support'" } },
      { id: "node-2", type: "message", position: { x: 280, y: 150 }, data: { title: "Greeting Message", text: "Hello! Thank you for contacting Alpha. How can we help you today? Please tap an option below:" } },
      { id: "node-3", type: "buttons", position: { x: 510, y: 100 }, data: { title: "Choice Menu", buttons: ["📦 Delivery Query", "💳 Sales Pricing", "👨 Agent Transfer"] } },
      { id: "node-4", type: "condition", position: { x: 740, y: 120 }, data: { title: "Check Choice" } },
      { id: "node-5", type: "api_call", position: { x: 970, y: 50 }, data: { title: "Fetch Shipment Info", apiUrl: "https://api.alpha.com/shipments/status", apiMethod: "GET" } },
      { id: "node-6", type: "human_handover", position: { x: 970, y: 220 }, data: { title: "Route to Agent", assigneeId: "user-agent-1" } }
    ],
    edges: [
      { id: "edge-1", source: "node-1", target: "node-2" },
      { id: "edge-2", source: "node-2", target: "node-3" },
      { id: "edge-3", source: "node-3", target: "node-4" },
      { id: "edge-4", source: "node-4", target: "node-5" },
      { id: "edge-5", source: "node-4", target: "node-6" }
    ],
    updatedAt: "2026-07-13T16:40:00Z"
  }
];

const DEALS: Deal[] = [
  { id: "deal-1", tenantId: "tenant-alpha", contactName: "David Miller", title: "Bulk Freight Contract 150 Units", value: 12500, stage: "negotiation" as const, createdAt: "2026-06-20" },
  { id: "deal-2", tenantId: "tenant-alpha", contactName: "John Doe", title: "Enterprise Pilot Licensing", value: 4800, stage: "lead" as const, createdAt: "2026-07-01" },
  { id: "deal-3", tenantId: "tenant-beta", contactName: "Alice Jenkins", title: "Holiday Retail Stock Purchase", value: 950, stage: "won" as const, createdAt: "2026-06-18" }
];

const AUTOMATIONS = [
  { id: "auto-1", tenantId: "tenant-alpha", name: "New Lead Onboarding Auto-Reply", trigger: "contact_created", status: "active", stepsCount: 2 },
  { id: "auto-2", tenantId: "tenant-alpha", name: "Abandoned Cart Retargeting", trigger: "custom_webhook_event", status: "active", stepsCount: 3 }
];

const ROUTING_RULES: Array<{
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  type: "keyword" | "random" | "round_robin" | "sentiment" | "time_based";
  conditionValue: string;
  targetDestination: string;
}> = [
  { id: "rule-1", tenantId: "tenant-alpha", name: "Support Ticket Escalator", isActive: true, type: "keyword", conditionValue: "help, support, ticket, issue, problem, error, bug, broken", targetDestination: "Support Group" },
  { id: "rule-2", tenantId: "tenant-alpha", name: "Sales Conversion Route", isActive: true, type: "keyword", conditionValue: "price, pricing, cost, quote, demo, buy, discount, enterprise", targetDestination: "Sales Group" },
  { id: "rule-3", tenantId: "tenant-alpha", name: "Negative Frustration Dispatch", isActive: true, type: "sentiment", conditionValue: "negative", targetDestination: "Manager Jessica" },
  { id: "rule-4", tenantId: "tenant-alpha", name: "Round Robin Office Fallback", isActive: true, type: "round_robin", conditionValue: "", targetDestination: "Support Group" }
];


// 1. WEBHOOK LOGS (Meta WhatsApp API delivery callbacks)
const WEBHOOK_LOGS: Array<{ id: string; timestamp: string; type: string; payload: string; status: "success" | "error" }> = [
  { id: "web-1", timestamp: "2026-07-14T08:15:00Z", type: "messages_received", payload: `{"object":"whatsapp_business_account","entry":[{"id":"9284241","changes":[{"value":{"messaging_product":"whatsapp","metadata":{"display_phone_number":"+15550199","phone_number_id":"phone-1"},"contacts":[{"profile":{"name":"David Miller"},"wa_id":"14155552671"}],"messages":[{"from":"14155552671","id":"wamid.HBgLMTQxNTU1NTI2NzEVAgARGBI5OUNBMTY0N","timestamp":"1784016900","text":{"body":"I haven't received my tracking link yet, please assist."},"type":"text"}]},"field":"messages"}]}]}`, status: "success" },
  { id: "web-2", timestamp: "2026-07-14T08:10:00Z", type: "message_status_sent", payload: `{"messaging_product":"whatsapp","status":"sent","recipient_id":"14155552671","message_id":"wamid.HBgLMTQxNTU1NTI2NzEVAgA..."}`, status: "success" }
];

// --- API ENDPOINTS ---

// Fetch app metadata and schema details
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKeysLoaded: {
      gemini: apiKey !== "dummy-key",
    }
  });
});

// Admin System Stats
app.get("/api/system/stats", (req, res) => {
  res.json({
    totalTenants: TENANTS.length,
    activeTenantsCount: TENANTS.filter(t => t.status === "active").length,
    planDistribution: {
      growth: TENANTS.filter(t => t.plan === "growth").length,
      pro: TENANTS.filter(t => t.plan === "pro").length,
      enterprise: TENANTS.filter(t => t.plan === "enterprise").length,
    },
    totalCampaigns: CAMPAIGNS.length,
    auditLogsCount: AUDIT_LOGS.length,
    whatsappNumbersCount: PHONE_NUMBERS.length
  });
});

// Get data for a selected tenant (Multi-Tenant context mock database read)
app.get("/api/tenants/:tenantId/dashboard", (req, res) => {
  const { tenantId } = req.params;
  const tenant = TENANTS.find(t => t.id === tenantId);
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found" });
  }

  const phoneNumbers = PHONE_NUMBERS.filter(p => p.tenantId === tenantId);
  const contacts = CONTACTS.filter(c => c.tenantId === tenantId);
  const chats = CHATS.filter(c => c.tenantId === tenantId);
  const campaigns = CAMPAIGNS.filter(c => c.tenantId === tenantId);
  const templates = META_TEMPLATES.filter(t => t.tenantId === tenantId);
  const chatbots = CHATBOTS.filter(b => b.tenantId === tenantId);
  const deals = DEALS.filter(d => d.tenantId === tenantId);
  const automations = AUTOMATIONS.filter(a => a.tenantId === tenantId);

  res.json({
    tenant,
    phoneNumbers,
    contactsCount: contacts.length,
    chatsCount: chats.length,
    campaignsCount: campaigns.length,
    templatesCount: templates.length,
    chatbotActive: chatbots.some(b => b.status === "active"),
    dealsCount: deals.length,
    automationsCount: automations.length,
    aiCreditsLeft: tenant.aiCredits - tenant.aiUsed
  });
});

// Create and Manage Tenants (Super Admin view)
app.get("/api/admin/tenants", (req, res) => {
  res.json(TENANTS);
});

app.post("/api/admin/tenants", (req, res) => {
  const { name, domain, plan, whatsappLimit, aiCredits, maxUsersCount, internalChatEnabled } = req.body;
  if (!name || !domain) {
    return res.status(400).json({ error: "Name and Domain are required fields" });
  }
  const defaultMaxUsers = plan === "enterprise" ? 50 : plan === "pro" ? 15 : 5;
  const newTenant = {
    id: `tenant-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    name,
    domain,
    plan: plan || "growth",
    status: "active" as const,
    createdAt: new Date().toISOString().split("T")[0],
    whatsappLimit: whatsappLimit || 10000,
    aiCredits: aiCredits || 1000,
    aiUsed: 0,
    phoneNumbersCount: 0,
    maxUsersCount: maxUsersCount !== undefined ? parseInt(maxUsersCount) : defaultMaxUsers,
    internalChatEnabled: internalChatEnabled !== false
  };
  TENANTS.push(newTenant);
  res.status(201).json(newTenant);
});

app.patch("/api/admin/tenants/:id", (req, res) => {
  const tenant = TENANTS.find(t => t.id === req.params.id);
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  
  if (req.body.status !== undefined) tenant.status = req.body.status;
  if (req.body.plan !== undefined) {
    tenant.plan = req.body.plan;
    if (req.body.maxUsersCount === undefined) {
      tenant.maxUsersCount = req.body.plan === "enterprise" ? 50 : req.body.plan === "pro" ? 15 : 5;
    }
  }
  if (req.body.whatsappLimit !== undefined) tenant.whatsappLimit = req.body.whatsappLimit;
  if (req.body.aiCredits !== undefined) tenant.aiCredits = req.body.aiCredits;
  if (req.body.maxUsersCount !== undefined) tenant.maxUsersCount = parseInt(req.body.maxUsersCount);
  if (req.body.internalChatEnabled !== undefined) tenant.internalChatEnabled = req.body.internalChatEnabled;

  res.json(tenant);
});

// --- INTERNAL CHAT ENDPOINTS ---
interface InternalMessage {
  id: string;
  tenantId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string; // user ID or "all" for general group
  text: string;
  timestamp: string;
}

const INTERNAL_MESSAGES: InternalMessage[] = [
  {
    id: "int-1",
    tenantId: "tenant-alpha",
    senderId: "user-admin-1",
    senderName: "Jessica Lopez (Talent Admin)",
    senderRole: "tenant_admin",
    receiverId: "all",
    text: "Welcome to our team's internal collaboration workspace! Let's use this to discuss incoming hot leads.",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "int-2",
    tenantId: "tenant-alpha",
    senderId: "user-agent-1",
    senderName: "Rohan Sharma (Talent)",
    senderRole: "agent",
    receiverId: "all",
    text: "Got it, Jessica. Working on claiming the inbound shipments now.",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

app.get("/api/internal-messages/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  const filtered = INTERNAL_MESSAGES.filter(m => m.tenantId === tenantId);
  res.json(filtered);
});

app.post("/api/internal-messages/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  const { senderId, senderName, senderRole, receiverId, text } = req.body;

  if (!senderId || !senderName || !receiverId || !text) {
    return res.status(400).json({ error: "Missing required sender, receiver, or text fields" });
  }

  const newMessage: InternalMessage = {
    id: `int-${Date.now()}`,
    tenantId,
    senderId,
    senderName,
    senderRole: senderRole || "agent",
    receiverId,
    text,
    timestamp: new Date().toISOString()
  };

  INTERNAL_MESSAGES.push(newMessage);
  res.status(201).json(newMessage);
});

// Live Chat API Endpoints
app.get("/api/chats/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  const filtered = CHATS.filter(c => c.tenantId === tenantId);
  res.json(filtered);
});

app.get("/api/chats/messages/:chatId", (req, res) => {
  const { chatId } = req.params;
  const filtered = MESSAGES.filter(m => m.chatId === chatId);
  res.json(filtered);
});

app.post("/api/chats/messages", (req, res) => {
  const { chatId, text, sender, senderName, mediaUrl, mediaType } = req.body;
  if (!chatId || !text) {
    return res.status(400).json({ error: "chatId and text are required" });
  }

  // Create message
  const newMsg = {
    id: `m-${Date.now()}`,
    chatId,
    sender: sender || "agent",
    senderName: senderName || "Agent Alice",
    text,
    mediaUrl,
    mediaType,
    status: "sent" as const,
    timestamp: new Date().toISOString()
  };
  MESSAGES.push(newMsg);

  // Update corresponding Chat's last text
  const chat = CHATS.find(c => c.id === chatId);
  if (chat) {
    chat.lastMessageText = text;
    chat.lastMessageTime = newMsg.timestamp;
    if (sender === "customer") {
      chat.unreadCount += 1;
    }
  }

  res.status(201).json(newMsg);
});

// Update chat properties (labels, assignee, status)
app.patch("/api/chats/:chatId", (req, res) => {
  const chat = CHATS.find(c => c.id === req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  if (req.body.status) chat.status = req.body.status;
  if (req.body.assignedTo !== undefined) chat.assignedTo = req.body.assignedTo;
  if (req.body.labels) chat.labels = req.body.labels;

  res.json(chat);
});

// Webhook simulation / Incoming Message endpoint
app.post("/api/webhooks/whatsapp", async (req, res) => {
  const { from, name, text, phoneNumberId } = req.body;
  if (!from || !text) {
    return res.status(400).json({ error: "Missing required fields 'from' and 'text'" });
  }

  // Find or Create contact
  let contact = CONTACTS.find(c => c.phoneNumber === from);
  if (!contact) {
    contact = {
      id: `c-${Date.now()}`,
      tenantId: "tenant-alpha", // default to Alpha for simulation demo
      name: name || "WhatsApp Guest",
      phoneNumber: from,
      tags: ["New Inbound"],
      customFields: {},
      createdAt: new Date().toISOString().split("T")[0],
      segments: ["New Leads"]
    };
    CONTACTS.push(contact);
  }

  // Find or Create chat
  let chat = CHATS.find(c => c.customerPhone === from);
  if (!chat) {
    chat = {
      id: `chat-${Date.now()}`,
      tenantId: contact.tenantId,
      customerName: contact.name,
      customerPhone: from,
      status: "open",
      labels: [],
      lastMessageText: text,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 1,
      sentiment: "neutral",
    };
    CHATS.push(chat);
  } else {
    chat.lastMessageText = text;
    chat.lastMessageTime = new Date().toISOString();
    chat.unreadCount += 1;
  }

  // Add message
  const newMsg = {
    id: `m-${Date.now()}`,
    chatId: chat.id,
    sender: "customer" as const,
    senderName: contact.name,
    text,
    status: "delivered" as const,
    timestamp: new Date().toISOString()
  };
  MESSAGES.push(newMsg);

  // Log Webhook Call
  WEBHOOK_LOGS.unshift({
    id: `web-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: "incoming_message",
    payload: JSON.stringify({ from, name, text, phoneNumberId }),
    status: "success"
  });

  res.status(200).json({
    status: "received",
    chatId: chat.id,
    messageId: newMsg.id
  });
});

app.get("/api/webhooks/logs", (req, res) => {
  res.json(WEBHOOK_LOGS.slice(0, 50));
});

// --- GOOGLE GEMINI AI ASSISTANT ENDPOINTS ---

// AI analysis: Intent Detection, Sentiment Analysis, Auto Summary
app.post("/api/gemini/analyze", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  if (apiKey === "dummy-key") {
    // Return mock response when API key is missing
    return res.json({
      sentiment: "neutral",
      intent: "general_inquiry",
      summary: "Customer requested pricing models. Agent is checking details."
    });
  }

  try {
    const formattedHistory = messages
      .slice(-10) // analyze the last 10 messages
      .map(m => `${m.senderName} (${m.sender}): ${m.text}`)
      .join("\n");

    const prompt = `Analyze this live customer WhatsApp conversation thread.
Detect the sentiment (MUST choose strictly one of "positive", "neutral", "negative").
Detect the customer's intent in a short snake_case phrase (e.g. "delivery_query", "pricing_inquiry", "escalation", "general_greeting").
Generate a neat, professional one-sentence summary of the conversation.

Format the output strictly as a JSON object with keys: "sentiment", "intent", "summary".

Conversation history:
${formattedHistory}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, description: "Must be positive, neutral, or negative" },
            intent: { type: Type.STRING, description: "Snake case intent category" },
            summary: { type: Type.STRING, description: "A highly informative, human-readable summary" }
          },
          required: ["sentiment", "intent", "summary"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini Analyze Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze chat using Gemini" });
  }
});

// AI Copilot Smart Suggest Reply
app.post("/api/gemini/reply", async (req, res) => {
  const { messages, tone, knowledgeBase } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages list is required for generating context" });
  }

  if (apiKey === "dummy-key") {
    return res.json({
      replyText: `Hello! Let me assist you. Based on our policies, we usually process delivery queries within 2 hours. Is there anything else you need? (Tone: ${tone || "professional"})`
    });
  }

  try {
    const formattedHistory = messages
      .slice(-8)
      .map(m => `${m.sender}: ${m.text}`)
      .join("\n");

    const kbSection = knowledgeBase ? `Knowledge Base Context:\n${knowledgeBase}` : "";

    const prompt = `You are a helpful customer support agent for Alpha Logistics/WhatsApp Business SaaS.
Analyze the customer's recent query. Draft a polished, highly accurate reply.
Tone target: ${tone || "helpful and professional"}.
${kbSection}

Conversation Context:
${formattedHistory}

Draft a message. Be concise, respectful, and direct. Do NOT use markdown links, only plain text appropriate for a WhatsApp message.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ replyText: response.text?.trim() });
  } catch (error: any) {
    console.error("Gemini Reply Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// FAQ Generation from uploaded text
app.post("/api/gemini/faq", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text context is required" });

  if (apiKey === "dummy-key") {
    return res.json({
      faqs: [
        { question: "How long does shipping take?", answer: "Standard shipping takes 3-5 days; premium express takes 24 hours." },
        { question: "Where is my parcel ID?", answer: "The parcel tracking ID can be found in your email invoice or WhatsApp confirmation update." }
      ]
    });
  }

  try {
    const prompt = `From the following reference document, extract 3 typical customer FAQ questions and write crisp, direct replies suitable for quick automated answers.

Reference Document:
${text}

Return JSON representation strictly formatted as an array of objects with keys "question" and "answer".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          }
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "[]");
    res.json({ faqs: parsedResult });
  } catch (error: any) {
    console.error("FAQ Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD list retrieval helpers
app.get("/api/contacts/:tenantId", (req, res) => {
  res.json(CONTACTS.filter(c => c.tenantId === req.params.tenantId));
});

app.post("/api/contacts/:tenantId", (req, res) => {
  const { name, phoneNumber, email, tags, customFields } = req.body;
  const newC = {
    id: `c-${Date.now()}`,
    tenantId: req.params.tenantId,
    name,
    phoneNumber,
    email,
    tags: tags || [],
    customFields: customFields || {},
    createdAt: new Date().toISOString().split("T")[0],
    segments: []
  };
  CONTACTS.push(newC);
  res.status(201).json(newC);
});

app.get("/api/campaigns/:tenantId", (req, res) => {
  res.json(CAMPAIGNS.filter(c => c.tenantId === req.params.tenantId));
});

app.post("/api/campaigns/:tenantId", (req, res) => {
  const { name, templateId, scheduledTime } = req.body;
  const newCamp = {
    id: `camp-${Date.now()}`,
    tenantId: req.params.tenantId,
    name,
    templateId,
    segmentId: "all-imported",
    status: scheduledTime ? ("scheduled" as const) : ("draft" as const),
    scheduledTime,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    clickedCount: 0,
    failedCount: 0,
    createdAt: new Date().toISOString().split("T")[0]
  };
  CAMPAIGNS.push(newCamp);
  res.status(201).json(newCamp);
});

app.get("/api/templates/:tenantId", (req, res) => {
  res.json(META_TEMPLATES.filter(t => t.tenantId === req.params.tenantId));
});

app.post("/api/templates/:tenantId", (req, res) => {
  const { name, category, language, headerType, bodyText, footerText, buttons, mediaUrl, mediaName } = req.body;
  const newT = {
    id: `temp-${Date.now()}`,
    tenantId: req.params.tenantId,
    name,
    category,
    language,
    status: "APPROVED" as const, // auto-approve mock Meta response
    headerType: headerType || "NONE",
    bodyText,
    footerText,
    buttons: buttons || [],
    mediaUrl,
    mediaName
  };
  META_TEMPLATES.push(newT);
  res.status(201).json(newT);
});

app.get("/api/chatbots/:tenantId", (req, res) => {
  res.json(CHATBOTS.filter(b => b.tenantId === req.params.tenantId));
});

app.post("/api/chatbots/:tenantId", (req, res) => {
  const { name, nodes, edges } = req.body;
  const newBot = {
    id: `bot-${Date.now()}`,
    tenantId: req.params.tenantId,
    name,
    status: "inactive" as const,
    nodes: nodes || [],
    edges: edges || [],
    updatedAt: new Date().toISOString()
  };
  CHATBOTS.push(newBot);
  res.status(201).json(newBot);
});

app.put("/api/chatbots/:tenantId/:id", (req, res) => {
  const bot = CHATBOTS.find(b => b.id === req.params.id && b.tenantId === req.params.tenantId);
  if (!bot) return res.status(404).json({ error: "Bot not found" });

  if (req.body.name) bot.name = req.body.name;
  if (req.body.nodes) bot.nodes = req.body.nodes;
  if (req.body.edges) bot.edges = req.body.edges;
  if (req.body.status) bot.status = req.body.status;
  bot.updatedAt = new Date().toISOString();

  res.json(bot);
});

app.get("/api/deals/:tenantId", (req, res) => {
  res.json(DEALS.filter(d => d.tenantId === req.params.tenantId));
});

app.post("/api/deals/:tenantId", (req, res) => {
  const { title, value, stage, contactId, contactName } = req.body;
  const newDeal = {
    id: `deal-${Date.now()}`,
    tenantId: req.params.tenantId,
    contactId: contactId || "c-1",
    contactName: contactName || "David Miller",
    title,
    value: parseFloat(value) || 0,
    stage: stage || "lead",
    createdAt: new Date().toISOString().split("T")[0]
  };
  DEALS.push(newDeal);
  res.status(201).json(newDeal);
});

app.put("/api/deals/:tenantId/:id", (req, res) => {
  const deal = DEALS.find(d => d.id === req.params.id && d.tenantId === req.params.tenantId);
  if (!deal) return res.status(404).json({ error: "Deal not found" });

  if (req.body.stage) deal.stage = req.body.stage;
  if (req.body.value !== undefined) deal.value = req.body.value;
  if (req.body.title) deal.title = req.body.title;

  res.json(deal);
});

// CREATE manual chat (add customer manually by mobile number and chat with them)
app.post("/api/chats/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  const { customerName, customerPhone, initialMessage } = req.body;

  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: "customerName and customerPhone are required" });
  }

  // Check if a chat already exists for this phone number and tenant
  let existingChat = CHATS.find(c => c.tenantId === tenantId && c.customerPhone === customerPhone);

  if (existingChat) {
    existingChat.status = "open"; // reopen
    if (initialMessage) {
      const newMsg = {
        id: `m-${Date.now()}`,
        chatId: existingChat.id,
        sender: "agent" as const,
        senderName: "Agent Alice",
        text: initialMessage,
        status: "read" as const,
        timestamp: new Date().toISOString()
      };
      MESSAGES.push(newMsg);
      existingChat.lastMessageText = initialMessage;
      existingChat.lastMessageTime = newMsg.timestamp;
    }
    return res.json(existingChat);
  }

  const chatId = `chat-${Date.now()}`;
  const newChat = {
    id: chatId,
    tenantId,
    customerName,
    customerPhone,
    assignedTo: "user-agent-1",
    status: "open" as const,
    labels: ["Manual"],
    lastMessageText: initialMessage || "Manual session started",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    sentiment: "neutral" as const,
    intent: "manual_creation",
    summary: "Manually initiated by Agent."
  };

  CHATS.push(newChat);

  // Initial message
  const newMsg = {
    id: `m-${Date.now()}`,
    chatId,
    sender: initialMessage ? ("agent" as const) : ("system" as const),
    senderName: initialMessage ? "Agent Alice" : "System",
    text: initialMessage || "Manual session initiated by Agent.",
    status: "read" as const,
    timestamp: new Date().toISOString()
  };
  MESSAGES.push(newMsg);

  // Add contact to CONTACTS if missing
  const contactExists = CONTACTS.some(c => c.tenantId === tenantId && c.phoneNumber === customerPhone);
  if (!contactExists) {
    CONTACTS.push({
      id: `c-${Date.now()}`,
      tenantId,
      name: customerName,
      phoneNumber: customerPhone,
      email: "",
      tags: ["Manual"],
      customFields: {},
      createdAt: new Date().toISOString().split("T")[0],
      segments: []
    });
  }

  res.status(201).json(newChat);
});

// GET Message Routing Rules for Tenant
app.get("/api/routing-rules/:tenantId", (req, res) => {
  const rules = ROUTING_RULES.filter(r => r.tenantId === req.params.tenantId);
  res.json(rules);
});

// POST New Routing Rule
app.post("/api/routing-rules/:tenantId", (req, res) => {
  const { tenantId } = req.params;
  const { name, type, conditionValue, targetDestination, isActive } = req.body;

  if (!name || !type || !targetDestination) {
    return res.status(400).json({ error: "name, type, and targetDestination are required" });
  }

  const newRule = {
    id: `rule-${Date.now()}`,
    tenantId,
    name,
    isActive: isActive !== false,
    type,
    conditionValue: conditionValue || "",
    targetDestination
  };

  ROUTING_RULES.push(newRule);
  res.status(201).json(newRule);
});

// PATCH Routing Rule (Toggle active status or update details)
app.patch("/api/routing-rules/:ruleId", (req, res) => {
  const rule = ROUTING_RULES.find(r => r.id === req.params.ruleId);
  if (!rule) return res.status(404).json({ error: "Routing rule not found" });

  if (req.body.name !== undefined) rule.name = req.body.name;
  if (req.body.isActive !== undefined) rule.isActive = req.body.isActive;
  if (req.body.type !== undefined) rule.type = req.body.type;
  if (req.body.conditionValue !== undefined) rule.conditionValue = req.body.conditionValue;
  if (req.body.targetDestination !== undefined) rule.targetDestination = req.body.targetDestination;

  res.json(rule);
});

// DELETE Routing Rule
app.delete("/api/routing-rules/:ruleId", (req, res) => {
  const index = ROUTING_RULES.findIndex(r => r.id === req.params.ruleId);
  if (index === -1) return res.status(404).json({ error: "Routing rule not found" });

  ROUTING_RULES.splice(index, 1);
  res.json({ success: true });
});

// POST Simulate Routing Rule Engine
app.post("/api/routing-rules/simulate/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  const { customerName, customerPhone, messageText } = req.body;

  if (!customerName || !customerPhone || !messageText) {
    return res.status(400).json({ error: "customerName, customerPhone and messageText are required" });
  }

  const activeRules = ROUTING_RULES.filter(r => r.tenantId === tenantId && r.isActive);
  const traceSteps: Array<{ ruleName: string; type: string; matched: boolean; reason: string }> = [];
  let matchedRule = null;
  let assignedAgent = "user-agent-1"; // fallback

  // Simple local sentiment heuristic
  let textSentiment: "positive" | "negative" | "neutral" = "neutral";
  const negativeWords = ["bad", "refund", "broken", "angry", "worst", "error", "late", "poor", "frustrated", "cancel", "fail"];
  const positiveWords = ["thanks", "thank", "good", "great", "awesome", "perfect", "appreciate", "love", "excel"];

  const textLower = messageText.toLowerCase();
  if (negativeWords.some(w => textLower.includes(w))) {
    textSentiment = "negative";
  } else if (positiveWords.some(w => textLower.includes(w))) {
    textSentiment = "positive";
  }

  // Evaluate rules in sequence
  for (const rule of activeRules) {
    let matched = false;
    let reason = "";

    if (rule.type === "keyword") {
      const keywords = rule.conditionValue.split(",").map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
      const matchedKw = keywords.find(kw => textLower.includes(kw));
      if (matchedKw) {
        matched = true;
        reason = `Matched keyword "${matchedKw}" from trigger list [${keywords.join(", ")}]`;
      } else {
        reason = `None of keywords [${keywords.join(", ")}] present in text`;
      }
    } else if (rule.type === "sentiment") {
      if (textSentiment === rule.conditionValue.toLowerCase()) {
        matched = true;
        reason = `Detected sentiment "${textSentiment}" matches condition "${rule.conditionValue}"`;
      } else {
        reason = `Detected sentiment "${textSentiment}" does not match condition "${rule.conditionValue}"`;
      }
    } else if (rule.type === "round_robin" || rule.type === "random") {
      matched = true;
      reason = `Rule type "${rule.type}" unconditionally matches and balances traffic`;
    } else if (rule.type === "time_based") {
      // Simulate off hours routing rule
      matched = true;
      reason = `Simulated off-hours rule matches automatically`;
    }

    traceSteps.push({
      ruleName: rule.name,
      type: rule.type,
      matched,
      reason
    });

    if (matched) {
      matchedRule = rule;
      break;
    }
  }

  const destination = matchedRule ? matchedRule.targetDestination : "General Inbox Queue";
  
  // Set assigned agent string based on target
  if (destination.includes("Alice")) assignedAgent = "user-agent-1";
  else if (destination.includes("Bob")) assignedAgent = "user-agent-2";
  else if (destination.includes("Jessica")) assignedAgent = "user-manager-1";
  else assignedAgent = "unassigned";

  // Create the actual live chat in DB so user can see it instantly!
  const chatId = `chat-sim-${Date.now()}`;
  const newChat = {
    id: chatId,
    tenantId,
    customerName,
    customerPhone,
    assignedTo: assignedAgent === "unassigned" ? undefined : assignedAgent,
    status: "open" as const,
    labels: ["Routed", destination.replace(" Group", "")],
    lastMessageText: messageText,
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
    sentiment: textSentiment,
    intent: matchedRule ? matchedRule.name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "general_routing",
    summary: `Automatically routed via rule: "${matchedRule ? matchedRule.name : "Fallback route"}". Target: ${destination}`
  };

  CHATS.push(newChat);

  // Save the simulated incoming customer message
  MESSAGES.push({
    id: `m-sim-cust-${Date.now()}`,
    chatId,
    sender: "customer",
    senderName: customerName,
    text: messageText,
    status: "delivered",
    timestamp: new Date().toISOString()
  });

  // Also push a system notice detailing the routing
  MESSAGES.push({
    id: `m-sim-sys-${Date.now()}`,
    chatId,
    sender: "system",
    senderName: "Router Bot",
    text: `System: Routed incoming message to [${destination}] via rule "${matchedRule ? matchedRule.name : "Default Fallback"}"`,
    status: "read",
    timestamp: new Date().toISOString()
  });

  // Create CONTACT as well if not exists
  const contactExists = CONTACTS.some(c => c.tenantId === tenantId && c.phoneNumber === customerPhone);
  if (!contactExists) {
    CONTACTS.push({
      id: `c-sim-${Date.now()}`,
      tenantId,
      name: customerName,
      phoneNumber: customerPhone,
      email: "",
      tags: ["Routed"],
      customFields: {},
      createdAt: new Date().toISOString().split("T")[0],
      segments: []
    });
  }

  res.json({
    success: true,
    matchedRule,
    destination,
    sentiment: textSentiment,
    traceSteps,
    chatId
  });
});


// Vite Middleware for integrated dev setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise WhatsApp Server running on http://localhost:${PORT}`);
  });
}

startServer();
