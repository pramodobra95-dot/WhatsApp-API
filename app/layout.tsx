/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import "../src/index.css";

export const metadata = {
  title: "BouuZ AI - Autonomous WhatsApp CRM & Lead Qualification Node",
  description: "Enterprise SaaS platform providing autonomous BANT customer qualification, multi-tenant workspace routing, and compliance-ready Meta Cloud API integration channels.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#070b14]">
      <body className="h-full font-sans antialiased text-slate-200">
        <div id="root" className="min-h-full flex flex-col justify-between">
          {children}
        </div>
      </body>
    </html>
  );
}
