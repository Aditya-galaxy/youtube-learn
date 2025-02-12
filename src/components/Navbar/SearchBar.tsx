import React from 'react';
import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAppContext } from '../../Helper/Context';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { handleSearch, searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="hidden md:flex flex-1 max-w-xl mx-4">
      <form onSubmit={(e) => {
        e.preventDefault();
        navigate('/search');
        handleSearch(e);
      }} className="w-full flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, tutorials, and more..."
            className="w-full pl-10 border-white/10 bg-white/5 focus:bg-white/10 hover:bg-white/8 text-white placeholder:text-white/40"
          />
        </div>
        <Button 
          type="submit"
          variant="secondary"
          className="bg-purple-500 hover:bg-purple-600 text-white border-0"
        >
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchBar;