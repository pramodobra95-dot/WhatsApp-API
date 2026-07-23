/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Message, Chat, Contact } from "../types/index.js";

// In-memory databases referenced from the server core state to log incoming messages
// In a production SQL/NoSQL environment, this delegates directly to Prisma/Drizzle/Mongoose/Supabase.
export interface MetaWebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata?: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: "text" | "image" | "document" | "audio" | "video";
          text?: { body: string };
          image?: { mime_type: string; sha256: string; id: string };
          document?: { mime_type: string; sha256: string; id: string; filename: string };
        }>;
        statuses?: Array<{
          id: string;
          status: "sent" | "delivered" | "read" | "failed";
          recipient_id: string;
          timestamp: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

/**
 * Handles incoming Meta WhatsApp Webhook payloads in a secure, server-side context.
 * Performs multi-tenant resolution using the phone_number_id from changes metadata.
 */
export async function processMetaWebhook(
  payload: MetaWebhookPayload,
  database: {
    phoneNumbers: any[];
    tenants: any[];
    contacts: any[];
    chats: any[];
    messages: any[];
    auditLogs: any[];
    webhookLogs: any[];
  }
) {
  // Always log incoming payload for audit tracing
  database.webhookLogs.unshift({
    id: `web-meta-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: "meta_payload_received",
    payload: JSON.stringify(payload),
    status: "success"
  });

  if (payload.object !== "whatsapp_business_account" || !payload.entry) {
    return { success: false, reason: "Unsupported or malformed webhook object source." };
  }

  let processedCount = 0;

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;

      const val = change.value;
      const phoneId = val.metadata?.phone_number_id;

      if (!phoneId) continue;

      // PART 3 — MULTI TENANT READY:
      // Locate the tenant associated with this phone_number_id
      const registeredPhone = database.phoneNumbers.find(p => p.id === phoneId || p.phoneNumber === val.metadata?.display_phone_number);
      const tenantId = registeredPhone ? registeredPhone.tenantId : "tenant-alpha"; // Default fallback to preserve system flow

      const tenant = database.tenants.find(t => t.id === tenantId);
      if (!tenant) continue;

      // 1. Process Messages (Incoming Chats)
      if (val.messages && val.messages.length > 0) {
        for (const msg of val.messages) {
          const fromPhone = msg.from;
          const bodyText = msg.text?.body || `[Sent Media: ${msg.type}]`;
          const contactInfo = val.contacts?.find(c => c.wa_id === fromPhone);
          const customerName = contactInfo?.profile?.name || `Customer ${fromPhone}`;

          // Find or create Contact in tenant's domain
          let contact = database.contacts.find(c => c.tenantId === tenantId && c.phoneNumber === fromPhone);
          if (!contact) {
            contact = {
              id: `c-meta-${Date.now()}`,
              tenantId,
              name: customerName,
              phoneNumber: fromPhone,
              tags: ["Meta Inbound"],
              customFields: { "Source": "WhatsApp Cloud API" },
              createdAt: new Date().toISOString().split("T")[0],
              segments: ["Inbound Leads"]
            };
            database.contacts.push(contact);
          }

          // Find or create active Chat conversation
          let chat = database.chats.find(c => c.tenantId === tenantId && c.customerPhone === fromPhone);
          if (!chat) {
            chat = {
              id: `chat-meta-${Date.now()}`,
              tenantId,
              customerName: contact.name,
              customerPhone: fromPhone,
              status: "open",
              labels: ["Auto Routed"],
              lastMessageText: bodyText,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 1,
              sentiment: "neutral"
            };
            database.chats.push(chat);
          } else {
            chat.lastMessageText = bodyText;
            chat.lastMessageTime = new Date().toISOString();
            chat.unreadCount += 1;
          }

          // Append to message list
          const newMessage: Message = {
            id: msg.id || `m-meta-${Date.now()}`,
            chatId: chat.id,
            sender: "customer",
            senderName: contact.name,
            text: bodyText,
            status: "delivered",
            timestamp: new Date().toISOString()
          };
          database.messages.push(newMessage);

          // Add to Audit Log
          database.auditLogs.unshift({
            id: `log-webhook-${Date.now()}`,
            tenantId,
            userId: "meta-webhook-worker",
            userName: "Meta Webhook Routing Worker",
            action: "MESSAGE_RECEIVED_WEBHOOK",
            details: `Processed incoming WhatsApp message from ${fromPhone} on system phone ${val.metadata?.display_phone_number}`,
            ipAddress: "127.0.0.1",
            timestamp: new Date().toISOString()
          });

          processedCount++;
        }
      }

      // 2. Process Statuses (Message Deliveries, Reads, Sent, Failures)
      if (val.statuses && val.statuses.length > 0) {
        for (const status of val.statuses) {
          // Track and update status of outgoing messages in our local database
          const existingMsg = database.messages.find(m => m.id === status.id);
          if (existingMsg) {
            existingMsg.status = status.status;
          }

          database.auditLogs.unshift({
            id: `log-status-${Date.now()}`,
            tenantId,
            userId: "meta-webhook-worker",
            userName: "Meta Webhook Routing Worker",
            action: "MESSAGE_STATUS_UPDATE",
            details: `Message ID ${status.id} updated to status '${status.status}' for customer ${status.recipient_id}`,
            ipAddress: "127.0.0.1",
            timestamp: new Date().toISOString()
          });

          processedCount++;
        }
      }
    }
  }

  return { success: true, processedEvents: processedCount };
}
