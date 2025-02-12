import React from 'react';
import Link from 'next/link';
import { Sparkles, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-white/70 hover:text-white hover:bg-white/5"
        onClick={() => navigate('/profile')}
      >
        <Menu className="w-5 h-5" />
      </Button>
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white transform group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-lg font-semibold text-white">YTLearn</span>
      </Link>
    </div>
  );
};

export default Logo;