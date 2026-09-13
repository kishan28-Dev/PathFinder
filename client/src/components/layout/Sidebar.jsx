import { NavLink } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  ClipboardList,
  Map,
  BookOpen,
  TrendingUp,
  MessageCircle,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assessment', label: 'Assessment', icon: ClipboardList },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/mentor', label: 'AI Mentor', icon: MessageCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ onNavigate }) {
  const { profile } = useProfile();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Compass className="h-4.5 w-4.5" />
        </span>
        <span className="text-base font-bold text-slate-900">CareerPath AI</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}

        {profile?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            Admin
          </NavLink>
        )}
      </nav>

      {profile?.streak?.current > 0 && (
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-xl bg-brand-50 px-3 py-2.5 text-xs font-medium text-brand-700">
            🔥 {profile.streak.current}-day learning streak
          </div>
        </div>
      )}
    </div>
  );
}
