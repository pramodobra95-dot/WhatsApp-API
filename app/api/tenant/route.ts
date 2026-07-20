/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || "tenant-alpha";
  
  return NextResponse.json({
    id: tenantId,
    name: "Alpha Logistics Inc",
    status: "active",
    plan: "pro"
  });
}
