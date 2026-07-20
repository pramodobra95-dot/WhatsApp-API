/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Authenticate credentials securely server-side
    if (email === "admin@bouuz.com" && password === "admin123") {
      return NextResponse.json({
        user: {
          id: "super-admin-root",
          email: "admin@bouuz.com",
          name: "BouuZ Super Admin",
          role: "super_admin",
          tenantId: "tenant-alpha"
        },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdXBlci1hZG1pbi1yb290IiwidXNlcl9yb2xlIiwidGVuYW50X2lkIjoidGVuYW50LWFscGhhIn0"
      });
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
