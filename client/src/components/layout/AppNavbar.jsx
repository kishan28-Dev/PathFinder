import { Menu } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';

export default function AppNavbar({ onMenuClick, title }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      </div>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
