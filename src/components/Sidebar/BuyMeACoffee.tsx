"use client";

import React from "react";

const username = process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME;

const BuyMeACoffee = () => {
  if (!username) return null;

  return (
    <a
      href={`https://buymeacoffee.com/${username}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 block rounded-full border border-border px-4 py-2.5 text-center text-sm tracking-tightish text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
    >
      Buy me a coffee
    </a>
  );
};

export default BuyMeACoffee;
