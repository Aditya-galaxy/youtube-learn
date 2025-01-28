import React, {useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation} from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import VideoModal from '../VideoModal';
import Trending from '../Trending';
import History from '../History';
import Library from '../Library';
import { useAppContext } from '@/Helper/Context';
import Home from '../Home';

export default function App() {
  const [activeRoute, setActiveRoute] = useState('/');
  const sidebarRef = useRef<HTMLElement>(null);
  const { videos } = useAppContext();

  const handleNavigation = (path: string) => {
    setActiveRoute(path);
  };

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    if (sidebarElement) {
      sidebarElement.focus();
    }
  }, [activeRoute]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar ref={sidebarRef} activeRoute={activeRoute} onNavigation={handleNavigation} />
          <main className="flex-1 ml-36 pt-16 pr-1 relative">
            <Routes>
              <Route path="/" element={<Home/>} />
                <Route path="/trending" element={<Trending />}/>
                <Route path="/library" element={<Library />}/>
                <Route path="/history" element={<History />}/>
              </Routes>
          </main>
        </div>
        <VideoModal />
      </div>
    </Router>
  );
}