/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "super_admin" | "tenant_admin" | "manager" | "agent" | "viewer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
  status: "active" | "invited" | "suspended";
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: "growth" | "pro" | "enterprise";
  status: "active" | "suspended" | "pending";
  createdAt: string;
  whatsappLimit: number;
  aiCredits: number;
  aiUsed: number;
  phoneNumbersCount: number;
  maxUsersCount: number;
  internalChatEnabled: boolean;
  allowedFeatures?: string[];
}

export interface WhatsAppPhoneNumber {
  id: string;
  tenantId: string;
  phoneNumber: string;
  displayPhoneNumber: string;
  verifiedName: string;
  status: "connected" | "disconnected" | "pending";
  qualityRating: "green" | "yellow" | "red"; // high, medium, low quality
  limitCategory: "tier1" | "tier2" | "tier3" | "unlimited"; // e.g., 1K, 10K, 100K messages/day
}

export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  tags: string[];
  customFields: Record<string, string>;
  createdAt: string;
  segments: string[];
}

export interface Message {
  id: string;
  chatId: string;
  sender: "customer" | "agent" | "bot" | "system";
  senderName: string;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "document" | "audio" | "video";
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  noteId?: string; // If this is an internal comment/note
}

export interface Chat {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  assignedTo?: string; // User ID of agent
  status: "open" | "snoozed" | "resolved";
  labels: string[];
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  sentiment: "positive" | "neutral" | "negative";
  intent?: string;
  summary?: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  templateId: string;
  segmentId: string;
  status: "draft" | "scheduled" | "sending" | "completed" | "failed";
  scheduledTime?: string;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  clickedCount: number;
  failedCount: number;
  createdAt: string;
}

export interface MetaTemplate {
  id: string;
  tenantId: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  headerType: "NONE" | "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
  bodyText: string;
  footerText?: string;
  buttons: Array<{ type: "QUICK_REPLY" | "URL" | "PHONE"; text: string; url?: string }>;
  mediaUrl?: string;
  mediaName?: string;
}

// Visual Chatbot Builder types
export type NodeType = "trigger" | "message" | "buttons" | "condition" | "delay" | "human_handover" | "api_call";

export interface BotNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    title: string;
    description?: string;
    text?: string;
    delaySeconds?: number;
    buttons?: string[];
    conditionKey?: string;
    conditionValue?: string;
    apiUrl?: string;
    apiMethod?: string;
    apiResponseKey?: string;
    assigneeId?: string;
  };
}

export interface BotEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface Chatbot {
  id: string;
  tenantId: string;
  name: string;
  status: "active" | "inactive";
  nodes: BotNode[];
  edges: BotEdge[];
  updatedAt: string;
}

// CRM types
export interface Deal {
  id: string;
  tenantId: string;
  contactId?: string;
  contactName: string;
  title: string;
  value: number;
  stage: "lead" | "followup" | "contacted" | "pending" | "closed" | "proposal" | "negotiation" | "won" | "lost";
  createdAt: string;
  assignedTo?: string;
  assignedToName?: string;
}

export interface AuditLog {
  id: string;
  tenantId?: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// Message Routing types
export interface RoutingRule {
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  type: "keyword" | "random" | "round_robin" | "sentiment" | "time_based";
  conditionValue: string; // comma-separated keywords, sentiment type, hours, etc.
  targetDestination: string; // Agent Alice, Agent Bob, Support Group, Sales Group, AI Chatbot
}

export interface TenantMetaConfig {
  tenantId: string;
  appId: string;
  appSecret: string;
  systemUserToken: string;
  webhookVerifyToken: string;
  webhookUrl: string;
  isConfigured: boolean;
}


