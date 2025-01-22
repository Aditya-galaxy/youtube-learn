import React, { use } from 'react'
import { Menu, Search, Bell, User } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { AppContext } from '../Helper/Context'
import { useContext } from 'react'
import { ModeToggle } from './ModeToggle'


const Navbar = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("AppContext is null");
    }
    const { handleSearch, searchQuery, setSearchQuery } = context;
    return (
        <>
      <nav className="fixed top-0 left-0 right-0 h-16  z-50 px-4 bg-black">
        <div className="flex items-center justify-between h-full max-w-[2500px] mx-auto">
          <div className="flex items-center gap-0">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold font-serif text-red-500">YouTube Learn</h1>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
            <div className="flex items-center">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="rounded-l-xl rounded-r-none"
              />
              <Button variant="outline" className="rounded-l-none rounded-r-xl">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            </form>
            
            <div className="flex items-center gap-2">
            {/* <ModeToggle />  Other theme not set yet*/}
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
          </nav>
      </>
  )
}

export default Navbar