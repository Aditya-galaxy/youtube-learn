import React from 'react'
import { Home, TrendingUp, Library, History } from 'lucide-react'
import { Button } from '../components/ui/button'

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 h-full w-48 bg-black">
        <nav className="p-2 space-y-1">
          {[
            { icon: Home, label: 'Home' },
            { icon: TrendingUp, label: 'Trending' },
            { icon: Library, label: 'Library' },
            { icon: History, label: 'History' }
          ].map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>
      </aside>
  )
}

export default Sidebar