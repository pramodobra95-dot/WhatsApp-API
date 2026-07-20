/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Client System Exception:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070b14] min-h-screen text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6">
        ⚠
      </div>
      <h1 className="text-xl font-extrabold text-white mb-2">Workspace Execution Error</h1>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
        An error occurred while loading this module. Secure local tenant isolation states remain protected.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
        >
          Retry Load
        </button>
        <a
          href="/"
          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
