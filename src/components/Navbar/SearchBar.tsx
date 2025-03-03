"use client"
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAppContext } from '../../Helper/Context';
import { useRouter, useSearchParams } from 'next/navigation';

const SearchBar = () => {
  const { handleSearch, clearSearch } = useAppContext();
  const [localQuery, setLocalQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize local query from URL params
  useEffect(() => {
    if (searchParams) {
      const queryParam = searchParams.get('q');
      if (queryParam) {
        setLocalQuery(queryParam);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localQuery.trim()) {
      handleClear();
      return;
    }

    const encodedQuery = encodeURIComponent(localQuery.trim());
    await handleSearch(localQuery.trim());
    router.push(`/search?q=${encodedQuery}`);
  };

  const handleClear = () => {
    setLocalQuery('');
    clearSearch();
    router.push('/');
  };

  return (
    <div className="hidden md:flex flex-1 max-w-xl mx-4">
      <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search for courses, tutorials, and educational content..."
            className="w-full pl-10 border-white/10 bg-white/5 focus:bg-white/10 hover:bg-white/8 text-white placeholder:text-white/40"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              ×
            </button>
          )}
        </div>
        <Button 
          type="submit"
          variant="secondary"
          className="bg-purple-500 hover:bg-purple-600 text-white border-0"
          disabled={!localQuery.trim()}
        >
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;