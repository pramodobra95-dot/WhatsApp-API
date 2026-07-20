/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from "next/server";
import { processMetaWebhook, MetaWebhookPayload } from "../../../../services/metaWebhook";

/**
 * GET - Handles the Meta Webhook Verification Handshake
 * URL format: /api/meta/webhook?hub.mode=subscribe&hub.verify_token=my_secure_token&hub.challenge=11223344
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const systemVerifyToken = process.env.META_VERIFY_TOKEN || "verify_token_default_secure";

    if (mode && token) {
      if (mode === "subscribe" && token === systemVerifyToken) {
        console.log("Meta Cloud API webhook handshake validated successfully.");
        // Returns the raw challenge code back to Meta as a plain text string
        return new NextResponse(challenge, {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      } else {
        console.warn("Meta Webhook verification failed. Tokens mismatched.");
        return NextResponse.json({ error: "Forbidden: Verification token mismatched." }, { status: 403 });
      }
    }
    
    return NextResponse.json({ error: "Bad Request: Mode or Verification token not specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Meta Webhook verification exception:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST - Receives incoming customer event messages, delivery receipts, and updates
 */
export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as MetaWebhookPayload;
    console.log("Received WhatsApp Cloud API payload event:", JSON.stringify(payload));

    // Access active memory state referenced globally inside the environment.
    // In a real Next.js application, this maps to Prisma/Mongoose databases.
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
    
    if (result.success) {
      return NextResponse.json({ status: "success", processed: result.processedEvents }, { status: 200 });
    } else {
      return NextResponse.json({ status: "skipped", reason: result.reason }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Meta Webhook parsing exception:", error);
    return NextResponse.json({ error: "Failed to parse webhook payload." }, { status: 500 });
  }
}
