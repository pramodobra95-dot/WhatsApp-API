/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tenant, WhatsAppPhoneNumber, Contact, Chat, Message, Campaign, MetaTemplate, Chatbot, Deal, AuditLog } from "../types";

// Setup Initial Mock Data (replicating server.ts data structure)
const INITIAL_TENANTS: Tenant[] = [
  { id: "tenant-alpha", name: "Alpha Logistics Inc", domain: "alpha.logistics.com", plan: "pro", status: "active", createdAt: "2026-01-10", whatsappLimit: 100000, aiCredits: 5000, aiUsed: 1240, phoneNumbersCount: 2, maxUsersCount: 15, internalChatEnabled: true, allowedFeatures: ["live_inbox", "internal_chat", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing", "open_api"] },
  { id: "tenant-beta", name: "Beta Retail Co", domain: "beta.shop.com", plan: "growth", status: "active", createdAt: "2026-02-15", whatsappLimit: 10000, aiCredits: 1000, aiUsed: 950, phoneNumbersCount: 1, maxUsersCount: 5, internalChatEnabled: false, allowedFeatures: ["live_inbox", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation"] },
  { id: "tenant-gamma", name: "Gamma Health Clinic", domain: "gamma.health.org", plan: "enterprise", status: "active", createdAt: "2026-03-01", whatsappLimit: 500000, aiCredits: 20000, aiUsed: 4320, phoneNumbersCount: 3, maxUsersCount: 50, internalChatEnabled: true, allowedFeatures: ["live_inbox", "internal_chat", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing", "open_api"] },
  { id: "tenant-delta", name: "Delta Real Estate", domain: "delta.realestate.com", plan: "growth", status: "suspended", createdAt: "2026-04-12", whatsappLimit: 10000, aiCredits: 1000, aiUsed: 220, phoneNumbersCount: 1, maxUsersCount: 5, internalChatEnabled: false, allowedFeatures: ["live_inbox", "message_router", "campaigns", "templates", "chatbot_builder"] }
];

const INITIAL_PHONE_NUMBERS: WhatsAppPhoneNumber[] = [
  { id: "phone-1", tenantId: "tenant-alpha", phoneNumber: "+15550199", displayPhoneNumber: "+1 (555) 019-9900", verifiedName: "Alpha Support", status: "connected", qualityRating: "green", limitCategory: "tier2" },
  { id: "phone-2", tenantId: "tenant-alpha", phoneNumber: "+15550188", displayPhoneNumber: "+1 (555) 018-8811", verifiedName: "Alpha Notifications", status: "connected", qualityRating: "green", limitCategory: "tier1" },
  { id: "phone-3", tenantId: "tenant-beta", phoneNumber: "+15550277", displayPhoneNumber: "+1 (555) 027-7722", verifiedName: "Beta Shop Hub", status: "connected", qualityRating: "yellow", limitCategory: "tier1" },
  { id: "phone-4", tenantId: "tenant-gamma", phoneNumber: "+15550366", displayPhoneNumber: "+1 (555) 036-6633", verifiedName: "Gamma Clinic Main", status: "connected", qualityRating: "green", limitCategory: "tier3" }
];

const INITIAL_CONTACTS: Contact[] = [
  { id: "c-1", tenantId: "tenant-alpha", name: "David Miller", phoneNumber: "+14155552671", email: "david.m@example.com", tags: ["VIP", "Enterprise"], customFields: { "CompanySize": "500+", "Region": "West" }, createdAt: "2026-05-12", segments: ["High Value"] },
  { id: "c-2", tenantId: "tenant-alpha", name: "Sarah Connor", phoneNumber: "+14155558912", email: "sarah.c@sky.net", tags: ["Support", "Urgent"], customFields: { "Industry": "Defense", "Region": "West" }, createdAt: "2026-06-01", segments: ["Urgent Queries"] },
  { id: "c-3", tenantId: "tenant-alpha", name: "John Doe", phoneNumber: "+12125551234", email: "john.doe@gmail.com", tags: ["Lead"], customFields: { "Source": "Facebook Ads", "Region": "East" }, createdAt: "2026-07-01", segments: ["New Leads"] },
  { id: "c-4", tenantId: "tenant-beta", name: "Alice Jenkins", phoneNumber: "+13125559876", email: "alice.j@retail.com", tags: ["Loyalty Member"], customFields: { "LTV": "$450" }, createdAt: "2026-06-15", segments: ["VIP Customer"] }
];

const INITIAL_CHATS: Chat[] = [
  { id: "chat-1", tenantId: "tenant-alpha", customerName: "David Miller", customerPhone: "+14155552671", assignedTo: "user-agent-1", status: "open", labels: ["VIP", "Logistics"], lastMessageText: "I haven't received my tracking link yet, please assist.", lastMessageTime: "2026-07-14T08:15:00-07:00", unreadCount: 1, sentiment: "negative", intent: "shipping_issue", summary: "Customer is complaining about a missing tracking link for an active order." },
  { id: "chat-2", tenantId: "tenant-alpha", customerName: "Sarah Connor", customerPhone: "+14155558912", assignedTo: "user-manager-1", status: "open", labels: ["Urgent"], lastMessageText: "Our systems are fully operational now, thanks for the update.", lastMessageTime: "2026-07-14T08:00:00-07:00", unreadCount: 0, sentiment: "positive", intent: "appreciation", summary: "Client acknowledged success of incident resolution." },
  { id: "chat-3", tenantId: "tenant-alpha", customerName: "John Doe", customerPhone: "+12125551234", assignedTo: undefined, status: "open", labels: [], lastMessageText: "Hello, I am interested in your pricing packages.", lastMessageTime: "2026-07-14T07:30:00-07:00", unreadCount: 0, sentiment: "neutral", intent: "pricing_inquiry", summary: "Prospect inquiring about pricing plans and details." }
];

const INITIAL_MESSAGES: Message[] = [
  { id: "m-1", chatId: "chat-1", sender: "customer", senderName: "David Miller", text: "Hello team, I paid for overnight express but the tracking says pending.", status: "read", timestamp: "2026-07-14T08:10:00-07:00" },
  { id: "m-2", chatId: "chat-1", sender: "agent", senderName: "Agent Alice", text: "Hi David, I am looking up your order ID now.", status: "read", timestamp: "2026-07-14T08:12:00-07:00" },
  { id: "m-3", chatId: "chat-1", sender: "customer", senderName: "David Miller", text: "I haven't received my tracking link yet, please assist.", status: "delivered", timestamp: "2026-07-14T08:15:00-07:00" },
  { id: "m-4", chatId: "chat-2", sender: "customer", senderName: "Sarah Connor", text: "Are there any service delays today?", status: "read", timestamp: "2026-07-14T07:45:00-07:00" },
  { id: "m-5", chatId: "chat-2", sender: "agent", senderName: "Agent Bob", text: "No delays reported. All lines are running smoothly.", status: "read", timestamp: "2026-07-14T07:50:00-07:00" },
  { id: "m-6", chatId: "chat-2", sender: "customer", senderName: "Sarah Connor", text: "Our systems are fully operational now, thanks for the update.", status: "read", timestamp: "2026-07-14T08:00:00-07:00" },
  { id: "m-7", chatId: "chat-3", sender: "customer", senderName: "John Doe", text: "Hello, I am interested in your pricing packages.", status: "read", timestamp: "2026-07-14T07:30:00-07:00" }
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: "camp-1", tenantId: "tenant-alpha", name: "E-Commerce Re-engagement July", templateId: "temp-marketing-1", segmentId: "seg-inactive", status: "completed", sentCount: 1420, deliveredCount: 1402, readCount: 1105, clickedCount: 342, failedCount: 18, createdAt: "2026-07-01" },
  { id: "camp-2", tenantId: "tenant-alpha", name: "VIP Early Access Sale", templateId: "temp-marketing-2", segmentId: "seg-vip", status: "scheduled", scheduledTime: "2026-07-20T09:00:00Z", sentCount: 0, deliveredCount: 0, readCount: 0, clickedCount: 0, failedCount: 0, createdAt: "2026-07-12" },
  { id: "camp-3", tenantId: "tenant-beta", name: "Store Opening Invitation", templateId: "temp-marketing-beta", segmentId: "seg-beta-all", status: "completed", sentCount: 450, deliveredCount: 440, readCount: 390, clickedCount: 95, failedCount: 10, createdAt: "2026-06-20" }
];

const INITIAL_TEMPLATES: MetaTemplate[] = [
  { id: "temp-marketing-1", tenantId: "tenant-alpha", name: "delivery_update_v2", category: "MARKETING", language: "en", status: "APPROVED", headerType: "IMAGE", bodyText: "Hi {{1}}, your order {{2}} has been dispatched! Track your parcel here: {{3}}", footerText: "Alpha Logistics Solutions", buttons: [{ type: "URL", text: "Track Order", url: "https://track.alpha.com/{{3}}" }] },
  { id: "temp-marketing-2", tenantId: "tenant-alpha", name: "seasonal_offer_discount", category: "MARKETING", language: "en_US", status: "APPROVED", headerType: "NONE", bodyText: "Hey {{1}}, check out our summer clearance sale with up to 40% OFF. Use coupon {{2}}.", footerText: "Alpha Deals Team", buttons: [{ type: "QUICK_REPLY", text: "Opt In" }, { type: "QUICK_REPLY", text: "Stop Messages" }] },
  { id: "temp-auth-1", tenantId: "tenant-alpha", name: "one_time_otp_code", category: "AUTHENTICATION", language: "en", status: "APPROVED", headerType: "NONE", bodyText: "Your secure login passcode is {{1}}. It expires in 5 minutes.", footerText: "Alpha Secur", buttons: [] }
];

const INITIAL_CHATBOTS: Chatbot[] = [
  {
    id: "bot-1",
    tenantId: "tenant-alpha",
    name: "Standard AI Greeting & Routing",
    status: "active",
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

const INITIAL_DEALS: Deal[] = [
  { id: "deal-1", tenantId: "tenant-alpha", contactName: "David Miller", title: "Bulk Freight Contract 150 Units", value: 12500, stage: "negotiation", createdAt: "2026-06-20" },
  { id: "deal-2", tenantId: "tenant-alpha", contactName: "John Doe", title: "Enterprise Pilot Licensing", value: 4800, stage: "lead", createdAt: "2026-07-01" },
  { id: "deal-3", tenantId: "tenant-beta", contactName: "Alice Jenkins", title: "Holiday Retail Stock Purchase", value: 950, stage: "won", createdAt: "2026-06-18" }
];

const INITIAL_AUTOMATIONS = [
  { id: "auto-1", tenantId: "tenant-alpha", name: "New Lead Onboarding Auto-Reply", trigger: "contact_created", status: "active", stepsCount: 2 },
  { id: "auto-2", tenantId: "tenant-alpha", name: "Abandoned Cart Retargeting", trigger: "custom_webhook_event", status: "active", stepsCount: 3 }
];

const INITIAL_ROUTING_RULES = [
  { id: "rule-1", tenantId: "tenant-alpha", name: "Support Ticket Escalator", isActive: true, type: "keyword", conditionValue: "help, support, ticket, issue, problem, error, bug, broken", targetDestination: "Support Group" },
  { id: "rule-2", tenantId: "tenant-alpha", name: "Sales Conversion Route", isActive: true, type: "keyword", conditionValue: "price, pricing, cost, quote, demo, buy, discount, enterprise", targetDestination: "Sales Group" },
  { id: "rule-3", tenantId: "tenant-alpha", name: "Negative Frustration Dispatch", isActive: true, type: "sentiment", conditionValue: "negative", targetDestination: "Manager Jessica" },
  { id: "rule-4", tenantId: "tenant-alpha", name: "Round Robin Office Fallback", isActive: true, type: "round_robin", conditionValue: "", targetDestination: "Support Group" }
];

// Helper to get/set item from localStorage
function getDBItem<T>(key: string, defaultVal: T): T {
  const data = localStorage.getItem(`bouuz_db_${key}`);
  if (!data) {
    localStorage.setItem(`bouuz_db_${key}`, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return defaultVal;
  }
}

function saveDBItem<T>(key: string, val: T): void {
  localStorage.setItem(`bouuz_db_${key}`, JSON.stringify(val));
}

// In-Memory Fallback Interceptor
export function handleMockFetch(url: string, init?: RequestInit): Response {
  const method = init?.method?.toUpperCase() || "GET";
  
  // URL matching & parsing
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;

  // Response helper
  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  };

  // 1. GET /api/admin/tenants
  if (path === "/api/admin/tenants" && method === "GET") {
    const tenants = getDBItem<Tenant[]>("tenants", INITIAL_TENANTS);
    return jsonResponse(tenants);
  }

  // 2. POST /api/admin/tenants
  if (path === "/api/admin/tenants" && method === "POST") {
    const tenants = getDBItem<Tenant[]>("tenants", INITIAL_TENANTS);
    const body = JSON.parse(init?.body as string || "{}");
    const newTenant: Tenant = {
      id: `tenant-${(body.name || "").toLowerCase().replace(/[^a-z0-9]/g, "-") || Math.random().toString(36).substr(2, 9)}`,
      name: body.name || "Unnamed Tenant",
      domain: body.domain || "tenant.domain.com",
      plan: body.plan || "growth",
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      whatsappLimit: body.whatsappLimit ? parseInt(body.whatsappLimit) : 10000,
      aiCredits: body.aiCredits ? parseInt(body.aiCredits) : 1000,
      aiUsed: 0,
      phoneNumbersCount: 0,
      maxUsersCount: body.maxUsersCount ? parseInt(body.maxUsersCount) : (body.plan === "enterprise" ? 50 : body.plan === "pro" ? 15 : 5),
      internalChatEnabled: body.internalChatEnabled !== undefined ? body.internalChatEnabled : true,
      allowedFeatures: body.allowedFeatures || ["live_inbox", "internal_chat", "message_router", "campaigns", "templates", "chatbot_builder", "crm", "flows_automation", "billing", "open_api"]
    };
    tenants.push(newTenant);
    saveDBItem("tenants", tenants);

    // Add audit log entry
    const auditLogs = getDBItem<any[]>("audit_logs", []);
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      tenantId: newTenant.id,
      userId: "super-admin-root",
      userName: "Super Admin",
      action: "WORKSPACE_CREATED",
      details: `Provisioned new workspace '${newTenant.name}' with plan '${newTenant.plan}'`,
      ipAddress: "127.0.0.1",
      timestamp: new Date().toISOString()
    });
    saveDBItem("audit_logs", auditLogs);

    return jsonResponse(newTenant, 201);
  }

  // 3. GET /api/tenants/:tenantId/dashboard
  const dashboardMatch = path.match(/\/api\/tenants\/([^/]+)\/dashboard/);
  if (dashboardMatch && method === "GET") {
    const tenantId = dashboardMatch[1];
    const tenants = getDBItem<Tenant[]>("tenants", INITIAL_TENANTS);
    const tenant = tenants.find(t => t.id === tenantId) || tenants[0];
    
    const phoneNumbers = getDBItem<WhatsAppPhoneNumber[]>("phone_numbers", INITIAL_PHONE_NUMBERS).filter(p => p.tenantId === tenantId);
    const contacts = getDBItem<Contact[]>("contacts", INITIAL_CONTACTS).filter(c => c.tenantId === tenantId);
    const chats = getDBItem<Chat[]>("chats", INITIAL_CHATS).filter(c => c.tenantId === tenantId);
    const campaigns = getDBItem<Campaign[]>("campaigns", INITIAL_CAMPAIGNS).filter(c => c.tenantId === tenantId);
    const templates = getDBItem<MetaTemplate[]>("templates", INITIAL_TEMPLATES).filter(t => t.tenantId === tenantId);
    const chatbots = getDBItem<Chatbot[]>("chatbots", INITIAL_CHATBOTS).filter(b => b.tenantId === tenantId);
    const deals = getDBItem<Deal[]>("deals", INITIAL_DEALS).filter(d => d.tenantId === tenantId);
    const automations = getDBItem<any[]>("automations", INITIAL_AUTOMATIONS).filter(a => a.tenantId === tenantId);

    const data = {
      tenant,
      phoneNumbers,
      contactsCount: contacts.length,
      chatsCount: chats.length,
      campaignsCount: campaigns.length,
      templatesCount: templates.length,
      chatbotActive: chatbots.some(b => b.status === "active"),
      dealsCount: deals.length,
      automationsCount: automations.length
    };
    return jsonResponse(data);
  }

  // 4. GET /api/chats/:tenantId
  const chatsMatch = path.match(/\/api\/chats\/([^/]+)$/);
  if (chatsMatch && method === "GET") {
    const tenantId = chatsMatch[1];
    const chats = getDBItem<Chat[]>("chats", INITIAL_CHATS).filter(c => c.tenantId === tenantId);
    return jsonResponse(chats);
  }

  // 5. GET /api/chats/messages/:chatId
  const messagesMatch = path.match(/\/api\/chats\/messages\/([^/]+)$/);
  if (messagesMatch && method === "GET") {
    const chatId = messagesMatch[1];
    const messages = getDBItem<Message[]>("messages", INITIAL_MESSAGES).filter(m => m.chatId === chatId);
    return jsonResponse(messages);
  }

  // 6. POST /api/chats/messages
  if (path === "/api/chats/messages" && method === "POST") {
    const body = JSON.parse(init?.body as string || "{}");
    const messages = getDBItem<Message[]>("messages", INITIAL_MESSAGES);
    const newMessage: Message = {
      id: `m-${Math.random().toString(36).substr(2, 9)}`,
      chatId: body.chatId,
      sender: body.sender || "agent",
      senderName: body.senderName || "System Agent",
      text: body.text || "",
      status: "sent",
      timestamp: new Date().toISOString()
    };
    messages.push(newMessage);
    saveDBItem("messages", messages);

    // Update the last message in Chats list
    const chats = getDBItem<Chat[]>("chats", INITIAL_CHATS);
    const chatIndex = chats.findIndex(c => c.id === body.chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].lastMessageText = body.text;
      chats[chatIndex].lastMessageTime = new Date().toISOString();
      chats[chatIndex].unreadCount = 0;
      saveDBItem("chats", chats);
    }

    return jsonResponse(newMessage, 201);
  }

  // 7. GET /api/contacts/:tenantId
  const contactsMatch = path.match(/\/api\/contacts\/([^/]+)$/);
  if (contactsMatch && method === "GET") {
    const tenantId = contactsMatch[1];
    const contacts = getDBItem<Contact[]>("contacts", INITIAL_CONTACTS).filter(c => c.tenantId === tenantId);
    return jsonResponse(contacts);
  }

  // 8. POST /api/contacts/:tenantId
  const contactsPostMatch = path.match(/\/api\/contacts\/([^/]+)$/);
  if (contactsPostMatch && method === "POST") {
    const tenantId = contactsPostMatch[1];
    const body = JSON.parse(init?.body as string || "{}");
    const contacts = getDBItem<Contact[]>("contacts", INITIAL_CONTACTS);
    const newContact: Contact = {
      id: `c-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      name: body.name || "New Contact",
      phoneNumber: body.phoneNumber || "+12345678",
      email: body.email || "",
      tags: body.tags || [],
      customFields: body.customFields || {},
      createdAt: new Date().toISOString().split("T")[0],
      segments: body.segments || []
    };
    contacts.push(newContact);
    saveDBItem("contacts", contacts);
    return jsonResponse(newContact, 201);
  }

  // 9. GET /api/campaigns/:tenantId
  const campaignsMatch = path.match(/\/api\/campaigns\/([^/]+)$/);
  if (campaignsMatch && method === "GET") {
    const tenantId = campaignsMatch[1];
    const campaigns = getDBItem<Campaign[]>("campaigns", INITIAL_CAMPAIGNS).filter(c => c.tenantId === tenantId);
    return jsonResponse(campaigns);
  }

  // 10. POST /api/campaigns/:tenantId
  const campaignsPostMatch = path.match(/\/api\/campaigns\/([^/]+)$/);
  if (campaignsPostMatch && method === "POST") {
    const tenantId = campaignsPostMatch[1];
    const body = JSON.parse(init?.body as string || "{}");
    const campaigns = getDBItem<Campaign[]>("campaigns", INITIAL_CAMPAIGNS);
    const newCampaign: Campaign = {
      id: `camp-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      name: body.name || "Untitled Campaign",
      templateId: body.templateId || "temp-marketing-1",
      segmentId: body.segmentId || "all",
      status: body.scheduledTime ? "scheduled" : "completed",
      scheduledTime: body.scheduledTime,
      sentCount: body.scheduledTime ? 0 : 500,
      deliveredCount: body.scheduledTime ? 0 : 495,
      readCount: body.scheduledTime ? 0 : 410,
      clickedCount: body.scheduledTime ? 0 : 80,
      failedCount: body.scheduledTime ? 0 : 5,
      createdAt: new Date().toISOString().split("T")[0]
    };
    campaigns.push(newCampaign);
    saveDBItem("campaigns", campaigns);
    return jsonResponse(newCampaign, 201);
  }

  // 11. GET /api/templates/:tenantId
  const templatesMatch = path.match(/\/api\/templates\/([^/]+)$/);
  if (templatesMatch && method === "GET") {
    const tenantId = templatesMatch[1];
    const templates = getDBItem<MetaTemplate[]>("templates", INITIAL_TEMPLATES).filter(t => t.tenantId === tenantId);
    return jsonResponse(templates);
  }

  // 12. POST /api/templates/:tenantId
  const templatesPostMatch = path.match(/\/api\/templates\/([^/]+)$/);
  if (templatesPostMatch && method === "POST") {
    const tenantId = templatesPostMatch[1];
    const body = JSON.parse(init?.body as string || "{}");
    const templates = getDBItem<MetaTemplate[]>("templates", INITIAL_TEMPLATES);
    const newTemplate: MetaTemplate = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      name: body.name || "new_template",
      category: body.category || "MARKETING",
      language: body.language || "en",
      status: "APPROVED",
      headerType: body.headerType || "NONE",
      bodyText: body.bodyText || "Hello {{1}}",
      footerText: body.footerText || "",
      buttons: body.buttons || []
    };
    templates.push(newTemplate);
    saveDBItem("templates", templates);
    return jsonResponse(newTemplate, 201);
  }

  // 13. GET /api/chatbots/:tenantId
  const chatbotsMatch = path.match(/\/api\/chatbots\/([^/]+)$/);
  if (chatbotsMatch && method === "GET") {
    const tenantId = chatbotsMatch[1];
    const chatbots = getDBItem<Chatbot[]>("chatbots", INITIAL_CHATBOTS).filter(c => c.tenantId === tenantId);
    return jsonResponse(chatbots);
  }

  // 14. POST /api/chatbots/:tenantId
  const chatbotsPostMatch = path.match(/\/api\/chatbots\/([^/]+)$/);
  if (chatbotsPostMatch && method === "POST") {
    const tenantId = chatbotsPostMatch[1];
    const body = JSON.parse(init?.body as string || "{}");
    const chatbots = getDBItem<Chatbot[]>("chatbots", INITIAL_CHATBOTS);
    const newChatbot: Chatbot = {
      id: `bot-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      name: body.name || "New Autonomous Node",
      status: "active",
      nodes: body.nodes || [],
      edges: body.edges || [],
      updatedAt: new Date().toISOString()
    };
    chatbots.push(newChatbot);
    saveDBItem("chatbots", chatbots);
    return jsonResponse(newChatbot, 201);
  }

  // 15. PUT /api/chatbots/:tenantId/:id
  const chatbotsPutMatch = path.match(/\/api\/chatbots\/([^/]+)\/([^/]+)$/);
  if (chatbotsPutMatch && method === "PUT") {
    const tenantId = chatbotsPutMatch[1];
    const id = chatbotsPutMatch[2];
    const body = JSON.parse(init?.body as string || "{}");
    const chatbots = getDBItem<Chatbot[]>("chatbots", INITIAL_CHATBOTS);
    const index = chatbots.findIndex(c => c.id === id && c.tenantId === tenantId);
    if (index !== -1) {
      chatbots[index] = {
        ...chatbots[index],
        ...body,
        updatedAt: new Date().toISOString()
      };
      saveDBItem("chatbots", chatbots);
      return jsonResponse(chatbots[index]);
    }
    return jsonResponse({ error: "Chatbot not found" }, 404);
  }

  // 16. GET /api/deals/:tenantId
  const dealsMatch = path.match(/\/api\/deals\/([^/]+)$/);
  if (dealsMatch && method === "GET") {
    const tenantId = dealsMatch[1];
    const deals = getDBItem<Deal[]>("deals", INITIAL_DEALS).filter(d => d.tenantId === tenantId);
    return jsonResponse(deals);
  }

  // 17. POST /api/deals/:tenantId
  const dealsPostMatch = path.match(/\/api\/deals\/([^/]+)$/);
  if (dealsPostMatch && method === "POST") {
    const tenantId = dealsPostMatch[1];
    const body = JSON.parse(init?.body as string || "{}");
    const deals = getDBItem<Deal[]>("deals", INITIAL_DEALS);
    const newDeal: Deal = {
      id: `deal-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      contactName: body.contactName || "New Lead",
      title: body.title || "Enterprise Deal",
      value: Number(body.value) || 0,
      stage: body.stage || "lead",
      createdAt: new Date().toISOString().split("T")[0]
    };
    deals.push(newDeal);
    saveDBItem("deals", deals);
    return jsonResponse(newDeal, 201);
  }

  // 18. PUT /api/deals/:tenantId/:id
  const dealsPutMatch = path.match(/\/api\/deals\/([^/]+)\/([^/]+)$/);
  if (dealsPutMatch && method === "PUT") {
    const tenantId = dealsPutMatch[1];
    const id = dealsPutMatch[2];
    const body = JSON.parse(init?.body as string || "{}");
    const deals = getDBItem<Deal[]>("deals", INITIAL_DEALS);
    const index = deals.findIndex(d => d.id === id && d.tenantId === tenantId);
    if (index !== -1) {
      deals[index] = {
        ...deals[index],
        ...body
      };
      saveDBItem("deals", deals);
      return jsonResponse(deals[index]);
    }
    return jsonResponse({ error: "Deal not found" }, 404);
  }

  // 19. GET /api/routing-rules/:tenantId
  const rulesMatch = path.match(/\/api\/routing-rules\/([^/]+)$/);
  if (rulesMatch && method === "GET") {
    const tenantId = rulesMatch[1];
    const rules = getDBItem<any[]>("routing_rules", INITIAL_ROUTING_RULES).filter(r => r.tenantId === tenantId);
    return jsonResponse(rules);
  }

  // 20. POST /api/routing-rules/:tenantId
  const rulesPostMatch = path.match(/\/api\/routing-rules\/([^/]+)$/);
  if (rulesPostMatch && method === "POST") {
    const tenantId = rulesPostMatch[1];
    const body = JSON.parse(init?.body as string || "{}");
    const rules = getDBItem<any[]>("routing_rules", INITIAL_ROUTING_RULES);
    const newRule = {
      id: `rule-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      name: body.name || "New Route Rule",
      isActive: true,
      type: body.type || "keyword",
      conditionValue: body.conditionValue || "",
      targetDestination: body.targetDestination || "Support Group"
    };
    rules.push(newRule);
    saveDBItem("routing_rules", rules);
    return jsonResponse(newRule, 201);
  }

  // 21. DELETE /api/routing-rules/:ruleId
  const rulesDeleteMatch = path.match(/\/api\/routing-rules\/([^/]+)$/);
  if (rulesDeleteMatch && method === "DELETE") {
    const ruleId = rulesDeleteMatch[1];
    const rules = getDBItem<any[]>("routing_rules", INITIAL_ROUTING_RULES);
    const updated = rules.filter(r => r.id !== ruleId);
    saveDBItem("routing_rules", updated);
    return jsonResponse({ success: true });
  }

  // 22. GET /api/internal-messages/:tenantId
  const internalMatch = path.match(/\/api\/internal-messages\/([^/]+)$/);
  if (internalMatch && method === "GET") {
    const tenantId = internalMatch[1];
    const internalMsgs = getDBItem<any[]>("internal_messages", [
      { id: "im-1", tenantId: "tenant-alpha", senderId: "user-admin-1", senderName: "Jessica Lopez", role: "tenant_admin", text: "Team, we have a high priority VIP freight lead in live inbox right now.", timestamp: "2026-07-14T08:05:00Z" },
      { id: "im-2", tenantId: "tenant-alpha", senderId: "user-agent-1", senderName: "Rohan Sharma", role: "agent", text: "Got it! Claiming the session and initiating conversation.", timestamp: "2026-07-14T08:06:00Z" }
    ]).filter(m => m.tenantId === tenantId);
    return jsonResponse(internalMsgs);
  }

  // 23. POST /api/internal-messages/:tenantId
  const internalPostMatch = path.match(/\/api\/internal-messages\/([^/]+)$/);
  if (internalPostMatch && method === "POST") {
    const tenantId = internalPostMatch[1];
    const body = JSON.parse(init?.body as string || "{}");
    const internalMsgs = getDBItem<any[]>("internal_messages", []);
    const newMsg = {
      id: `im-${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      senderId: body.senderId || "agent",
      senderName: body.senderName || "System Staff",
      role: body.role || "agent",
      text: body.text || "",
      timestamp: new Date().toISOString()
    };
    internalMsgs.push(newMsg);
    saveDBItem("internal_messages", internalMsgs);
    return jsonResponse(newMsg, 201);
  }

  // 24. GET /api/webhooks/logs
  if (path === "/api/webhooks/logs" && method === "GET") {
    const logs = getDBItem<any[]>("webhook_logs", [
      { id: "wl-1", timestamp: "2026-07-14T08:15:00-07:00", event: "messages.inbound", direction: "inbound", status: "success", payload: `{"sender": "+14155552671", "text": "I haven't received my tracking link yet..."}` },
      { id: "wl-2", timestamp: "2026-07-14T08:12:00-07:00", event: "messages.outbound", direction: "outbound", status: "success", payload: `{"recipient": "+14155552671", "text": "Hi David, I am looking up your order ID now."}` }
    ]);
    return jsonResponse(logs);
  }

  // 25. POST /api/gemini/reply
  if (path === "/api/gemini/reply" && method === "POST") {
    const body = JSON.parse(init?.body as string || "{}");
    const msgLower = (body.message || "").toLowerCase();
    let reply = "Hello! Thanks for your inquiry. WATI Enterprise AI assistant is analyzing your requirements. A support specialist will be in touch shortly.";
    let category = "General Support";
    let intent = "general_inquiry";
    let score = "Medium intent detected";

    if (msgLower.includes("price") || msgLower.includes("cost") || msgLower.includes("budget") || msgLower.includes("plan")) {
      reply = "Our pricing starts at $49/month for Growth, up to $299/month for Enterprise which includes 50,000 complimentary WhatsApp messages. Would you like a sales manager to draft a personalized quote?";
      category = "Sales Inquiry";
      intent = "pricing_inquiry";
    } else if (msgLower.includes("delivery") || msgLower.includes("track") || msgLower.includes("order") || msgLower.includes("shipment")) {
      reply = "I understand you need delivery details. Let me check the database. Please provide your Order ID, or we will query matching database records instantly.";
      category = "Logistics";
      intent = "shipping_issue";
    }

    return jsonResponse({
      draft: reply,
      metadata: {
        category,
        sentiment: "neutral",
        intent,
        complianceScore: 98.4,
        confidenceLevel: 94.2,
        bantSummary: score
      }
    });
  }

  // 26. POST /api/gemini/faq
  if (path === "/api/gemini/faq" && method === "POST") {
    return jsonResponse({
      reply: "Based on our documentation: To configure your WhatsApp Business API through Meta Cloud Platform, navigates to the custom labels tab, configure a Meta Phone ID, and insert a Meta Permanent Access Token. We isolate tenant schemas automatically.",
      tokensUsed: 420
    });
  }

  // 27. GET /api/system/stats
  if (path === "/api/system/stats" && method === "GET") {
    const tenants = getDBItem<Tenant[]>("tenants", INITIAL_TENANTS);
    const campaigns = getDBItem<Campaign[]>("campaigns", INITIAL_CAMPAIGNS);
    const auditLogs = getDBItem<any[]>("audit_logs", []);
    const phoneNumbers = getDBItem<WhatsAppPhoneNumber[]>("phone_numbers", INITIAL_PHONE_NUMBERS);
    return jsonResponse({
      totalTenants: tenants.length,
      activeTenantsCount: tenants.filter(t => t.status === "active").length,
      planDistribution: {
        growth: tenants.filter(t => t.plan === "growth").length,
        pro: tenants.filter(t => t.plan === "pro").length,
        enterprise: tenants.filter(t => t.plan === "enterprise").length,
      },
      totalCampaigns: campaigns.length,
      auditLogsCount: auditLogs.length,
      whatsappNumbersCount: phoneNumbers.length
    });
  }

  // 28. GET /api/admin/audit-logs
  if (path === "/api/admin/audit-logs" && method === "GET") {
    const auditLogs = getDBItem<any[]>("audit_logs", [
      {
        id: "log-initial-1",
        tenantId: "tenant-alpha",
        userId: "super-admin-root",
        userName: "Super Admin",
        action: "PLATFORM_INIT",
        details: "BouuZ Multi-Tenant Sandbox successfully initialized.",
        ipAddress: "127.0.0.1",
        timestamp: new Date().toISOString()
      }
    ]);
    return jsonResponse(auditLogs);
  }

  // 29. PATCH /api/admin/tenants/:id
  const adminTenantPatchMatch = path.match(/\/api\/admin\/tenants\/([^/]+)$/);
  if (adminTenantPatchMatch && method === "PATCH") {
    const tenantId = adminTenantPatchMatch[1];
    const tenants = getDBItem<Tenant[]>("tenants", INITIAL_TENANTS);
    const tenantIndex = tenants.findIndex(t => t.id === tenantId);
    if (tenantIndex === -1) {
      return jsonResponse({ error: "Tenant not found" }, 404);
    }
    
    const body = JSON.parse(init?.body as string || "{}");
    const tenant = tenants[tenantIndex];
    
    if (body.status !== undefined) tenant.status = body.status;
    if (body.plan !== undefined) {
      tenant.plan = body.plan;
      if (body.maxUsersCount === undefined) {
        tenant.maxUsersCount = body.plan === "enterprise" ? 50 : body.plan === "pro" ? 15 : 5;
      }
    }
    if (body.whatsappLimit !== undefined) tenant.whatsappLimit = body.whatsappLimit;
    if (body.aiCredits !== undefined) tenant.aiCredits = body.aiCredits;
    if (body.maxUsersCount !== undefined) tenant.maxUsersCount = parseInt(body.maxUsersCount);
    if (body.internalChatEnabled !== undefined) tenant.internalChatEnabled = body.internalChatEnabled;
    if (body.allowedFeatures !== undefined) tenant.allowedFeatures = body.allowedFeatures;
    
    tenants[tenantIndex] = tenant;
    saveDBItem("tenants", tenants);

    // Also add audit log entry for this update
    const auditLogs = getDBItem<any[]>("audit_logs", []);
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      tenantId: tenant.id,
      userId: "super-admin-root",
      userName: "Super Admin",
      action: "WORKSPACE_UPDATED",
      details: `Updated configuration of workspace '${tenant.name}'`,
      ipAddress: "127.0.0.1",
      timestamp: new Date().toISOString()
    });
    saveDBItem("audit_logs", auditLogs);
    
    return jsonResponse(tenant);
  }

  // Fallback 404 for unknown API
  return jsonResponse({ error: `Not found: ${method} ${path}` }, 404);
}

// Override globally in client-side environment
export function applyMockFetchPatch(): void {
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  
  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    
    // Only intercept requests destined for '/api/' endpoint
    if (urlString.includes("/api/")) {
      try {
        if (!originalFetch) {
          return handleMockFetch(urlString, init);
        }
        // Attempt to call the real backend first
        const response = await originalFetch(input, init);
        
        const contentType = response.headers.get("content-type") || "";
        // If 404 on API, or if returning HTML (which means SPA router returned index.html fallback),
        // fallback to client mock database
        if (response.status === 404 || contentType.includes("text/html")) {
          console.log(`[Proxy Intercept ${response.status} / HTML] Falling back to client-side database mock for ${urlString}`);
          return handleMockFetch(urlString, init);
        }
        
        return response;
      } catch (err) {
        // If server is not running or network error occurs (like on Vercel)
        console.log(`[Proxy Intercept Network Error] Falling back to client-side database mock for ${urlString}`);
        return handleMockFetch(urlString, init);
      }
    }
    
    // Pass through non-API requests
    if (originalFetch) {
      return originalFetch(input, init);
    }
    return new Response("Not found", { status: 404 });
  };

  try {
    // Try to define on Window.prototype first (often where the getter sits)
    Object.defineProperty(Window.prototype, "fetch", {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
    console.log("window.fetch patched successfully via Window.prototype!");
  } catch (err) {
    console.warn("Failed to patch Window.prototype.fetch:", err);
    try {
      // Try to define on window itself
      Object.defineProperty(window, "fetch", {
        value: customFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
      console.log("window.fetch patched successfully via window Object.defineProperty!");
    } catch (err2) {
      console.warn("Failed to patch window.fetch via Object.defineProperty:", err2);
      try {
        // Last resort: direct assignment
        (window as any).fetch = customFetch;
        console.log("window.fetch patched successfully via direct assignment!");
      } catch (err3) {
        console.error("Direct assignment to window.fetch failed completely:", err3);
      }
    }
  }
}
