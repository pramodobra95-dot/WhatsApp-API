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
  qualityRating: "green" | "yellow" | "red";
  limitCategory: "tier1" | "tier2" | "tier3" | "unlimited";
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
  noteId?: string;
}

export interface Chat {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  assignedTo?: string;
  status: "open" | "snoozed" | "resolved";
  labels: string[];
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  sentiment: "positive" | "neutral" | "negative";
  intent?: string;
  summary?: string;
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
