import React, { useState } from 'react';
import { NavRoute, Role, Tenant, ProjectSite, EvidenceAsset, TriageItem, BeforeAfterPair, StoryReel } from './types';
import {
  INITIAL_SITES,
  INITIAL_ASSETS,
  INITIAL_TRIAGE_ITEMS,
  INITIAL_BEFORE_AFTER_PAIRS,
  INITIAL_STORIES,
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './views/OverviewDashboard';
import { FieldCapturePWA } from './views/FieldCapturePWA';
import { ProjectDetailView } from './views/ProjectDetailView';
import { HybridSearchView } from './views/HybridSearchView';
import { EvidenceDetailView } from './views/EvidenceDetailView';
import { BeforeAfterStudio } from './views/BeforeAfterStudio';
import { TriageInboxView } from './views/TriageInboxView';
import { ReportBuilderView } from './views/ReportBuilderView';
import { StoryReelStudio } from './views/StoryReelStudio';
import { ProjectSetupView } from './views/ProjectSetupView';
import { CertificateModal } from './components/CertificateModal';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('overview');
  const [currentTenant, setCurrentTenant] = useState<Tenant>('TATA SUSTAINABILITY TRUST :: FY 2025-26');
  const [currentRole, setCurrentRole] = useState<Role>('Corporate Admin');
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);

  // Core Data States
  const [sites, setSites] = useState<ProjectSite[]>(INITIAL_SITES);
  const [selectedSite, setSelectedSite] = useState<ProjectSite>(INITIAL_SITES[0]);
  const [assets, setAssets] = useState<EvidenceAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<EvidenceAsset>(INITIAL_ASSETS[0]);
  const [triageItems, setTriageItems] = useState<TriageItem[]>(INITIAL_TRIAGE_ITEMS);
  const [pairs, setPairs] = useState<BeforeAfterPair[]>(INITIAL_BEFORE_AFTER_PAIRS);
  const [stories, setStories] = useState<StoryReel[]>(INITIAL_STORIES);

  // Modal State
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState<boolean>(false);

  // Handlers
  const handleSelectSite = (site: ProjectSite) => {
    setSelectedSite(site);
    setCurrentRoute('grants');
  };

  const handleSelectAsset = (asset: EvidenceAsset) => {
    setSelectedAsset(asset);
    setCurrentRoute('evidence');
  };

  const handleAssetCaptured = (newAsset: EvidenceAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
  };

  const handleAddSite = (newSite: ProjectSite) => {
    setSites((prev) => [newSite, ...prev]);
    setSelectedSite(newSite);
  };

  const handleAdjudicate = (
    itemId: string,
    decision: 'FRAUD_REJECTED' | 'LEGITIMATE_DUPLICATE' | 'REASSIGNED'
  ) => {
    setTriageItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, adjudicationState: decision } : item
      )
    );
  };

  const handleAddPairToReport = (pairId: string) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === pairId ? { ...p, reportAdded: !p.reportAdded } : p))
    );
  };

  const pendingTriageCount = triageItems.filter(
    (item) => !item.adjudicationState || item.adjudicationState === 'PENDING'
  ).length;

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex flex-col font-sans select-none">
      {/* Top Application Header */}
      <Header
        currentTenant={currentTenant}
        onSelectTenant={setCurrentTenant}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onNavigateHome={() => setCurrentRoute('overview')}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
      />

      {/* Navigation Ledger Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={(route) => setCurrentRoute(route)}
        isOpenMobile={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        pendingTriageCount={pendingTriageCount}
      />

      {/* Main View Area Offset by Sidebar (pl-0 md:pl-72) and Header (pt-12) */}
      <div className="md:pl-72 flex-1 pt-12 flex flex-col">
        <main className="flex-1 w-full bg-[#131313]">
          {/* S2: Corporate Portfolio Dashboard */}
          {currentRoute === 'overview' && (
            <OverviewDashboard
              sites={sites}
              onSelectSite={handleSelectSite}
              onNavigateToTriage={() => setCurrentRoute('triage')}
              onNavigateToCapture={() => setCurrentRoute('capture')}
            />
          )}

          {/* S3: Project Detail View */}
          {currentRoute === 'grants' && (
            <ProjectDetailView
              site={selectedSite}
              allSites={sites}
              assets={assets}
              onSelectAsset={handleSelectAsset}
              onNavigateToCapture={() => setCurrentRoute('capture')}
              onBackToOverview={() => setCurrentRoute('overview')}
            />
          )}

          {/* S1: Field Capture PWA */}
          {currentRoute === 'capture' && (
            <FieldCapturePWA
              sites={sites}
              onAssetCaptured={handleAssetCaptured}
              onNavigateToQueue={() => setCurrentRoute('triage')}
            />
          )}

          {/* S7: Review Inbox / Triage */}
          {currentRoute === 'triage' && (
            <TriageInboxView
              items={triageItems}
              onAdjudicate={handleAdjudicate}
            />
          )}

          {/* S4: Hybrid Search UI */}
          {currentRoute === 'search' && (
            <HybridSearchView
              assets={assets}
              onSelectAsset={handleSelectAsset}
            />
          )}

          {/* S6: Before/After Studio */}
          {currentRoute === 'comparisons' && (
            <BeforeAfterStudio
              pairs={pairs}
              onAddPairToReport={handleAddPairToReport}
            />
          )}

          {/* S8: Report Builder & Preview */}
          {currentRoute === 'reports' && (
            <ReportBuilderView
              assets={assets}
              onInspectAsset={(assetId) => {
                const found = assets.find((a) => a.id === assetId || a.shortId === assetId.replace('AST-', ''));
                if (found) {
                  setSelectedAsset(found);
                  setCurrentRoute('evidence');
                }
              }}
            />
          )}

          {/* S5: Evidence Page & Lineage DAG */}
          {currentRoute === 'evidence' && (
            <EvidenceDetailView
              asset={selectedAsset}
              onOpenCertificateModal={() => setIsCertificateModalOpen(true)}
              onBack={() => setCurrentRoute('grants')}
            />
          )}

          {/* S9: Story & Reel Studio */}
          {currentRoute === 'stories' && (
            <StoryReelStudio initialStory={stories[0]} />
          )}

          {/* S10: Project & Site Setup */}
          {currentRoute === 'setup' && (
            <ProjectSetupView
              sites={sites}
              onAddSite={handleAddSite}
              onSelectSite={handleSelectSite}
            />
          )}
        </main>
      </div>

      {/* Signed Evidence Certificate Modal */}
      {isCertificateModalOpen && (
        <CertificateModal
          asset={selectedAsset}
          onClose={() => setIsCertificateModalOpen(false)}
        />
      )}
    </div>
  );
}
