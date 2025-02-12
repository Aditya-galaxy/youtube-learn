import React, {useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import VideoModal from '../VideoModal';
import Trending from '../../pages/Trending';
import History from '../../pages/History';
import Library from '../../pages/Library';
import { useAppContext } from '@/Helper/Context';
import Home from '../../pages/Home';
import SavedPage from '../../pages/SavedPage';
import SettingsPage from '../../pages/SettingsPage';
import PlansPage from '@/components/PlansPage/PlansPage';
import AccountPage from '@/components/Account/Account';
import SearchResults from '../SearchResults';

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
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar ref={sidebarRef} activeRoute={activeRoute} onNavigation={handleNavigation} />
          <main className="flex-1 ml-40 pt-16 pr-1 relative">
              <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/trending" element={<Trending />}/>
                <Route path="/library" element={<Library />}/>
              b <Route path="/history" element={<History />} />
                <Route path="/saved" element={<SavedPage/>} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/profile" element={<AccountPage />} />
                <Route path="/search" element={<SearchResults />}/>
              </Routes>
          </main>
        </div>
        <VideoModal />
      </div>
    </BrowserRouter>
  );
}