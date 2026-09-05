"use client";

import React from "react";

// Public Buy Me a Coffee handle. Not a secret, so it ships as a default rather
// than a required environment variable — the button would otherwise be missing
// on any deployment where the variable was never set.
const DEFAULT_USERNAME = "aditya.galaxy";

const username =
  process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME || DEFAULT_USERNAME;

const BuyMeACoffee = () => (
  <a
    href={`https://buymeacoffee.com/${username}`}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-6 block rounded-full border border-border px-4 py-2.5 text-center text-sm tracking-tightish text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
  >
    Buy me a coffee
  </a>
);

export default BuyMeACoffee;
