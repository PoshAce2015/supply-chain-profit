import HeaderAlertsButton from "./HeaderAlertsButton"
import UserMenu from "./UserMenu"

export default function Header() {
  return (
    <header
      data-testid="app-header"
      data-role="app-header"
      className="app-header header-gradient relative w-full"
    >
      <div className="w-full">
        <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="header-content flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">📈</span>
            <div className="flex flex-col">
              <h1 className="text-white tracking-tight">Supply Chain & Profit</h1>
              <span className="text-white/70 text-xs">Analytics & Optimization Platform</span>
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
