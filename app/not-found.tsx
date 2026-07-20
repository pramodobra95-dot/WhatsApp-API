/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070b14] min-h-screen text-center">
      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 font-mono text-sm mb-6">
        404
      </div>
      <h1 className="text-xl font-extrabold text-white mb-2">Workspace Route Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
        The requested path is invalid or currently assigned to an isolated sandboxed tenant partition.
      </p>
      <a
        href="/"
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
      >
        Return to Dashboard Hub
      </a>
    </div>
  );
}
