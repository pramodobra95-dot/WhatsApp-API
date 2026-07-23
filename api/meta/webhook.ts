/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { processMetaWebhook } from "../../services/metaWebhook.js";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET: Meta Webhook Verification Handshake
  if (req.method === "GET") {
    const mode = req.query?.["hub.mode"] || req.query?.["mode"];
    const token = req.query?.["hub.verify_token"] || req.query?.["verify_token"];
    const challenge = req.query?.["hub.challenge"] || req.query?.["challenge"];

    const systemVerifyToken = process.env.META_VERIFY_TOKEN || "verify_token_default_secure";

    if (mode && token) {
      if (mode === "subscribe" && token === systemVerifyToken) {
        console.log("Vercel Webhook: Meta Cloud API handshake validated successfully.");
        res.setHeader("Content-Type", "text/plain");
        return res.status(200).send(challenge);
      } else {
        console.warn(`Vercel Webhook: Token mismatch. Received: ${token}, Expected: ${systemVerifyToken}`);
        return res.status(403).json({ error: "Forbidden: Verification token mismatched." });
      }
    }

    return res.status(400).json({
      error: "Bad Request: Mode or Verification token not specified.",
      instruction: "Meta Webhook requires hub.mode=subscribe and hub.verify_token parameters in GET request."
    });
  }

  // POST: Receiving incoming events from WhatsApp Cloud API
  if (req.method === "POST") {
    try {
      const payload = req.body;
      console.log("Vercel Webhook: Received WhatsApp payload:", JSON.stringify(payload));

      const database = (global as any).__mock_database || {
        phoneNumbers: [],
        tenants: [],
        contacts: [],
        chats: [],
        messages: [],
        auditLogs: [],
        webhookLogs: []
      };

      const result = await processMetaWebhook(payload, database);
      return res.status(200).json({ status: "success", processed: result.processedEvents });
    } catch (err: any) {
      console.error("Vercel Webhook parsing error:", err);
      return res.status(500).json({ error: "Failed to parse webhook payload." });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
