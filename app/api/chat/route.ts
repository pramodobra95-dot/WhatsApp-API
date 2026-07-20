/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || "tenant-alpha";
  
  // Return the lists of chats associated with the active tenant partition
  return NextResponse.json({
    tenantId,
    chatsCount: 3,
    status: "active"
  });
}
