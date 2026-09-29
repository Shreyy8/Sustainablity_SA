import React from 'react';
import { NavRoute } from '../types';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  pendingTriageCount?: number;
}

interface NavItem {
  id: NavRoute;
  label: string;
  badge?: string;
  badgeAlert?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  pendingTriageCount = 3,
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: '01 // OVERVIEW' },
    { id: 'grants', label: '02 // GRANTS & SITES' },
    { id: 'capture', label: '03 // FIELD CAPTURE' },
    {
      id: 'triage',
      label: '04 // TRIAGE INBOX',
      badge: `[0${pendingTriageCount}]`,
      badgeAlert: true,
    },
    { id: 'search', label: '05 // HYBRID SEARCH' },
    { id: 'comparisons', label: '06 // COMPARISONS' },
    { id: 'reports', label: '07 // AUDIT REPORTS' },
    { id: 'stories', label: '08 // STORY STUDIO' },
    { id: 'setup', label: '09 // SETUP & GEOFENCES' },
  ];

  const handleItemClick = (id: NavRoute) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-12 bottom-0 w-72 bg-[#0e0e0e] border-r border-[#444748] z-40 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Section Header */}
          <div className="px-3 py-2 border-b border-[#444748] bg-[#1b1b1b] flex items-center justify-between">
            <span className="font-code text-[11px] uppercase tracking-widest text-[#8e9192]">
              NAVIGATION LEDGER
            </span>
            <span className="font-code text-[11px] text-[#8e9192]">SEC-135</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive =
                currentRoute === item.id ||
                (item.id === 'grants' && currentRoute === 'evidence');

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 border-b border-[#444748] font-code text-[11px] transition-none cursor-pointer ${
                    isActive
                      ? 'bg-[#1f1f1f] text-white border-l-2 border-white font-bold'
                      : 'text-[#c4c7c8] hover:bg-[#1f1f1f] hover:text-white'
                  }`}
                >
                  <span className="tracking-wide uppercase">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={`px-1 text-[11px] font-bold ${
                        item.badgeAlert
                          ? 'bg-[#bb0112] text-white border border-[#ffb4ab]'
                          : 'bg-[#353535] text-[#e2e2e2]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <span className="text-[#8e9192]">-&gt;</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Ledger Status */}
        <div className="p-3 border-t border-[#444748] bg-[#0e0e0e]">
          <div className="flex flex-col gap-1 font-code text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-[#8e9192]">MCA_NODE:</span>
              <span className="text-white font-medium">ONLINE :: 200 OK</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#8e9192]">HASH_VERIFY:</span>
              <span className="text-white font-bold">SHA-256 / VALID</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[#353535] text-[#8e9192]">
              <span>LEDGER SYNC:</span>
              <span className="text-[#ffb4ab]">BLOCK #61984210</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
