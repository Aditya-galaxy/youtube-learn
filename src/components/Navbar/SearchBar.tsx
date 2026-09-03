"use client";

import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

/**
 * Search is a pure URL navigation now. It used to call the context's
 * `handleSearch` (firing a request) *and* push to /search, where the results
 * page fired the same request again — two to three YouTube calls per submit.
 */
const SearchBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  // Keeps the field in step with back/forward navigation, and clears it when
  // the user leaves the search page.
  useEffect(() => {
    setQuery(searchParams?.get("q") ?? "");
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClear = () => {
    setQuery("");
    router.push("/");
  };

  return (
    <div className="hidden flex-1 max-w-xl md:flex">
      <form onSubmit={handleSubmit} role="search" className="flex w-full items-center gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search educational videos"
            placeholder="Search for courses, tutorials, and educational content..."
            className="w-full pl-10 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          className="bg-purple-500 text-white hover:bg-purple-600"
          disabled={!query.trim()}
        >
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;
