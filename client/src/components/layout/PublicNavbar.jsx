import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Compass, Menu, X } from 'lucide-react';
import Button from '../common/Button';

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Compass className="h-4.5 w-4.5" />
          </span>
          CareerPath AI
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900">How It Works</a>
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900">Features</a>
          <a href="#careers" className="text-sm font-medium text-slate-600 hover:text-slate-900">Careers</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <SignedOut>
            <Button variant="ghost" size="sm" onClick={() => navigate('/sign-in')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/sign-up')}>Get Started</Button>
          </SignedOut>
          <SignedIn>
            <Button size="sm" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#how-it-works" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">How It Works</a>
            <a href="#features" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">Features</a>
            <a href="#careers" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">Careers</a>
            <div className="flex gap-3 pt-2">
              <SignedOut>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate('/sign-in')}>Sign In</Button>
                <Button size="sm" className="flex-1" onClick={() => navigate('/sign-up')}>Get Started</Button>
              </SignedOut>
              <SignedIn>
                <Button size="sm" className="flex-1" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              </SignedIn>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
