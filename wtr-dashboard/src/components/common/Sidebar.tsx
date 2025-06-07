import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import {
  FaAngleDown, FaAngleRight, FaHome, FaChartLine, FaChartPie,
  FaBroadcastTower, FaBookOpen, FaInfoCircle
} from 'react-icons/fa';

interface NavItem {
  path: string;
  name: string;
  icon?: JSX.Element;
  subItems?: NavItem[];
}

// Define actual paths for sub-items as well, if they are meant to be navigable
const navItems: NavItem[] = [
  { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
  {
    path: '/on-chain', name: 'On-chain Analysis', icon: <FaChartLine />,
    subItems: [
      { path: '/on-chain/macro-indicators', name: 'Macro Indicators' },
      { path: '/on-chain/exchange-flows', name: 'Exchange Flows' },
      { path: '/on-chain/whale-tracking', name: 'Whale Tracking' },
    ]
  },
  {
    path: '/derivatives', name: 'Derivatives Analysis', icon: <FaChartPie />,
    subItems: [
      { path: '/derivatives/futures-analysis', name: 'Futures Analysis' },
      { path: '/derivatives/options-analysis', name: 'Options Analysis' },
    ]
  },
  { path: '/signals', name: 'Trading Signals', icon: <FaBroadcastTower /> },
  { path: '/research', name: 'Research', icon: <FaBookOpen /> },
  { path: '/about', name: 'About WTR', icon: <FaInfoCircle /> },
  // { path: '/login', name: 'Login' /* icon: <FaSignInAlt /> */ }, // Login is usually separate
];

const Sidebar: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (name: string) => {
    setExpandedSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

    const renderNavItems = (items: NavItem[], isSubMenu: boolean = false) => {
      return items.map((item) => (
        <li
          key={item.name}
          className={`${isSubMenu ? 'sidebar-sub-nav-item' : 'sidebar-nav-item'} ${item.subItems ? 'has-sub-items' : ''}`}
        >
          {item.subItems ? (
            <>
              <div className={`sidebar-nav-link-container ${expandedSections[item.name] ? 'expanded' : ''}`}>
                <NavLink
                  to={item.path}
                  end // Ensures NavLink is only active for this exact path
                  className={({ isActive }) =>
                    `sidebar-nav-link nav-link-text-icon ${isActive ? 'active' : ''}`
                  }
                >
                  {item.icon && <span className="nav-icon">{item.icon}</span>}
                  <span className="nav-text">{item.name}</span>
                </NavLink>
                <span
                  className="expand-icon-button"
                  onClick={() => toggleSection(item.name)}
                  role="button"
                  aria-expanded={expandedSections[item.name]}
                  aria-controls={`submenu-${item.name.replace(/\s+/g, '-')}`}
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSection(item.name); }}
                >
                  {expandedSections[item.name] ? <FaAngleDown /> : <FaAngleRight />}
                </span>
              </div>
              <ul className={`sidebar-sub-nav-list ${expandedSections[item.name] ? 'is-open' : ''}`} id={`submenu-${item.name.replace(/\s+/g, '-')}`}>
                {renderNavItems(item.subItems, true)}
              </ul>
            </>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              <span className="nav-text">{item.name}</span>
            </NavLink>
          )}
        </li>
      ));
    };

  return (
    <aside className="sidebar">
      <div className="sidebar-sticky-content"> {/* Added for potential sticky header/footer within sidebar */}
        <div className="sidebar-header">
          {/* The main Logo component is now in the MainHeader,
              This could be a smaller logo or title if needed, or removed.
              For now, let's assume main logo is in header only.
          */}
          <h3>Navigation</h3>
        </div>
        <ul className="sidebar-nav-list">
          {renderNavItems(navItems)}
        </ul>
      </div>
      {/* Optional: Sidebar footer for settings, logout etc. */}
      {/* <div className="sidebar-footer">Footer</div> */}
    </aside>
  );
};

export default Sidebar;
