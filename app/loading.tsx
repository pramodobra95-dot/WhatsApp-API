/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#070b14] min-h-screen">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-16 h-16 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
        <div className="w-12 h-12 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-xs text-emerald-400 font-mono font-bold tracking-widest uppercase mt-6 animate-pulse">
        Initializing Workspace Node...
      </p>
    </div>
  );
}
