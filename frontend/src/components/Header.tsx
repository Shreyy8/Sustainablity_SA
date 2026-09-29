import React from 'react';
import { Role, Tenant } from '../types';

interface HeaderProps {
  currentTenant: Tenant;
  onSelectTenant: (tenant: Tenant) => void;
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  onNavigateHome: () => void;
  onToggleMobileNav?: () => void;
}

const ALL_TENANTS: Tenant[] = [
  'TATA SUSTAINABILITY TRUST :: FY 2025-26',
  'PRATHAM RURAL FOUNDATION',
  'RELIANCE FOUNDATION :: GUJARAT',
  'ADANI ACT FOUNDATION',
];

const ALL_ROLES: Role[] = [
  'Corporate Admin',
  'NGO Manager',
  'Field Worker',
  'Statutory Auditor',
];

export const Header: React.FC<HeaderProps> = ({
  currentTenant,
  onSelectTenant,
  currentRole,
  onSelectRole,
  onNavigateHome,
  onToggleMobileNav,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-[#0e0e0e] border-b border-[#444748] z-50 flex items-center justify-between px-3 md:px-4">
      {/* Brand & Workspace Zone */}
      <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="md:hidden text-[#c4c7c8] hover:text-white p-1"
            title="Toggle Menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-1 cursor-pointer select-none shrink-0"
        >
          <span className="font-code text-[11px] font-bold tracking-wider text-white uppercase">
            PLURIBUS
          </span>
          <span className="font-code text-[11px] text-[#8e9192]">//</span>
          <span className="font-code text-[11px] text-[#c4c7c8] uppercase tracking-wider hidden sm:inline">
            EVIDENCE VAULT
          </span>
        </div>
        <span className="font-code text-[11px] text-[#444748] hidden md:inline">::</span>
        {/* Workspace / Tenant Switcher */}
        <div className="relative group shrink min-w-0">
          <select
            value={currentTenant}
            onChange={(e) => onSelectTenant(e.target.value as Tenant)}
            className="bg-[#1b1b1b] text-white border border-[#444748] hover:border-[#8e9192] font-code text-[11px] px-2 py-0.5 focus:outline-none cursor-pointer max-w-[210px] sm:max-w-none truncate"
          >
            {ALL_TENANTS.map((t) => (
              <option key={t} value={t} className="bg-[#1b1b1b] text-white">
                WORKSPACE: {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role Selector & Profile Zone */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1 text-[11px] font-code text-[#8e9192] uppercase">
          <span>[ORG: {currentRole === 'NGO Manager' || currentRole === 'Field Worker' ? 'NGO_ENTITY' : currentRole === 'Statutory Auditor' ? 'AUDIT_FIRM' : 'CORPORATE'}]</span>
          <span className="text-[#444748]">|</span>
        </div>

        {/* Role Switcher */}
        <select
          value={currentRole}
          onChange={(e) => onSelectRole(e.target.value as Role)}
          className="bg-[#1b1b1b] text-white border border-[#444748] hover:border-[#8e9192] font-code text-[11px] px-2 py-0.5 focus:outline-none cursor-pointer uppercase font-medium"
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r} className="bg-[#1b1b1b] text-white">
              {r === 'Corporate Admin' ? 'ARJUN (CSR HEAD)' : r === 'Statutory Auditor' ? 'CA ARJUN MEHTA (AUDITOR)' : r === 'NGO Manager' ? 'MOHAN RAM (PRATHAM)' : 'POOJA (FIELD WORKER)'}
            </option>
          ))}
        </select>

        {/* User Icon Avatar */}
        <div 
          title={`Active Role: ${currentRole}`}
          className="w-7 h-7 bg-white text-[#2f3131] flex items-center justify-center shrink-0 font-code font-bold text-xs"
        >
          {currentRole === 'Corporate Admin' ? 'AH' : currentRole === 'Statutory Auditor' ? 'CA' : currentRole === 'NGO Manager' ? 'MR' : 'PM'}
        </div>
      </div>
    </header>
  );
};
