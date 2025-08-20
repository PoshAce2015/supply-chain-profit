import { useState, useEffect } from "react";
import HeaderAlertsButton from "./HeaderAlertsButton"
import UserMenu from "./UserMenu"

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header
      data-testid="app-header"
      data-role="app-header"
      className="app-header header-gradient relative w-full"
    >
      <div className="w-full">
        <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="header-content flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm transition-transform duration-200 hover:scale-110 cursor-pointer" title="Supply Chain & Profit Platform">
              📈
            </span>
            <div className="flex flex-col">
              <h1 className="text-white tracking-tight font-semibold">Supply Chain & Profit</h1>
              <span className="text-white/70 text-xs">Analytics & Optimization Platform</span>
            </div>
          </div>
          
          {/* Center: Current Time */}
          <div className="hidden md:flex items-center">
            <div className="text-center text-white/80">
              <div className="text-sm font-medium">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-xs text-white/60">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
            </div>
          </div>
          
          <div className="header-actions flex items-center gap-3">
            <HeaderAlertsButton />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
