"use client";

import React from "react";
import Image from "next/image";

const username = process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME;

const BuyMeACoffee = () => {
  // Without this guard the button opened buymeacoffee.com/undefined whenever
  // the environment variable was not set.
  if (!username) return null;

  return (
    <div className="mt-12">
      <a
        href={`https://www.buymeacoffee.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-1 rounded-lg bg-purple-500 px-2 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
      >
        <Image src="/coffee.svg" alt="" width={20} height={16} />
        <span>
          <span className="opacity-90">Buy me a</span> Coffee
        </span>
      </a>
    </div>
  );
};

export default BuyMeACoffee;
