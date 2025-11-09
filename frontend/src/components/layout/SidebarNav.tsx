import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '@/lib/constants';

export const SidebarNav = () => (
  <nav className="sidebar-nav">
    {NAV_LINKS.map(({ label, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
      >
        <Icon size={18} />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);
