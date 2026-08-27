import React, { useState } from 'react';
import { useAlerts } from './hooks/useAlerts';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AlertDetail } from './pages/AlertDetail';
import { SystemHealth } from './pages/SystemHealth';
import { ChatWithAI } from './components/ChatWithAI';
import { ThreatAlert } from './types/alert';

export function App() {
  const {
    alerts,
    allAlerts,
    bots,
    throughputHistory,
    selectedSeverity,
    setSelectedSeverity,
    searchQuery,
    setSearchQuery,
    mode,
    setMode,
    updateAlertStatus,
    refreshData,
  } = useAlerts();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'health'>('dashboard');
  const [selectedAlert, setSelectedAlert] = useState<ThreatAlert | null>(null);

  const unreadCriticalCount = allAlerts.filter(
    (a) => a.severity === 'CRITICAL' && a.status === 'NEW'
  ).length;

  const handleSelectAlert = (alert: ThreatAlert) => {
    setSelectedAlert(alert);
  };

  const handleBackToDashboard = () => {
    setSelectedAlert(null);
  };

  return (
    <div className="min-h-screen bg-cyber-950 text-slate-100 flex flex-col font-sans cyber-grid">
      {/* Top Persistent Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSelectedAlert(null);
        }}
        mode={mode}
        onModeChange={setMode}
        unreadAlertCount={unreadCriticalCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-6">
        {selectedAlert ? (
          <AlertDetail
            alert={selectedAlert}
            onBack={handleBackToDashboard}
            onUpdateStatus={(alertId, status) => {
              updateAlertStatus(alertId, status);
              setSelectedAlert((prev) => (prev ? { ...prev, status } : null));
            }}
          />
        ) : activeTab === 'dashboard' ? (
          <Dashboard
            alerts={alerts}
            allAlerts={allAlerts}
            throughputHistory={throughputHistory}
            selectedSeverity={selectedSeverity}
            onSelectSeverity={setSelectedSeverity}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectAlert={handleSelectAlert}
            onUpdateStatus={updateAlertStatus}
          />
        ) : (
          <SystemHealth bots={bots} onRefresh={refreshData} />
        )}
      </main>

      {/* Embedded AI SOC Analyst Assistant */}
      <ChatWithAI alerts={allAlerts} selectedAlert={selectedAlert} />

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-800/90 py-4 px-4 text-center text-xs font-mono text-slate-500">
        AI-Powered Cyber Threat Detection System &bull; Multi-Vector Threat Intelligence &bull;
        Polygon Amoy Immutable Ledger
      </footer>
    </div>
  );
}

export default App;
