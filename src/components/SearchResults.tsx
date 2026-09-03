"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Hero from "./Hero/Hero";

/**
 * Search is driven entirely by the `q` search param, so a results page can be
 * linked to, reloaded and shared. The previous version mirrored the query into
 * React context from an effect that also depended on the context updater, which
 * re-fired on every response.
 */
const SearchResults: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q")?.trim() ?? "";

  return (
    <Hero
      title={query ? `Search results for "${query}"` : "Recommended Videos"}
      query={query}
    />
  );
};

export default SearchResults;
