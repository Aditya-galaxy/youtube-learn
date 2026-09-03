"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const Logo = () => (
  <Link href="/" className="group flex items-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700">
      <Sparkles className="h-4 w-4 text-white transition-transform group-hover:scale-110" />
    </div>
    <span className="text-lg font-semibold text-foreground">YTLearn</span>
  </Link>
);

export default Logo;
