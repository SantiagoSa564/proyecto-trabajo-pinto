import React, { useState, useEffect } from 'react';
import {
  Activity,
  Terminal,
  ShieldAlert,
  Server,
  Network,
  Zap,
  RefreshCw,
  Cpu,
  Layers,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'overview' | 'matrix' | 'terminal' | 'incidents' | 'network';
  setActiveTab: (tab: 'overview' | 'matrix' | 'terminal' | 'incidents' | 'network') => void;
  activeCluster: string;
  setActiveCluster: (cluster: string) => void;
  isStreaming: boolean;
  setIsStreaming: (stream: boolean) => void;
  activeAlertsCount: number;
  openChaosModal: () => void;
  triggerManualRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeCluster,
  setActiveCluster,
  isStreaming,
  setIsStreaming,
  activeAlertsCount,
  openChaosModal,
  triggerManualRefresh
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const iso = now.toISOString().split('T')[1].slice(0, 12);
      setUtcTime(`${iso} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, []);

  const clusters = [
    { id: 'prod-cluster-us-east-1', label: 'us-east-1 (Primary Mesh)', status: 'nominal', latency: '0.8ms' },
    { id: 'prod-cluster-eu-west-1', label: 'eu-west-1 (Frankfurt Pod)', status: 'nominal', latency: '68ms' },
    { id: 'prod-cluster-ap-northeast-1', label: 'ap-northeast-1 (Tokyo Ring)', status: 'nominal', latency: '142ms' },
    { id: 'dr-failover-canary', label: 'us-west-2 (DR Shadow)', status: 'standby', latency: '34ms' }
  ];

  return (
    <header className="border-b border-[#1F2937] bg-[#090D16] sticky top-0 z-40 select-none">
      {/* Top Telemetry Strip */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-[#1F2937]/50 text-xs">
        {/* Left: Brand & Cluster Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#00FF9D] rounded-[1px] rotate-45 shadow-[0_0_8px_#00FF9D]" />
            <span className="font-mono text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>DEVPULSE</span>
              <span className="text-[#00FF9D] font-normal">::</span>
              <span className="text-[#849587] text-[11px] font-semibold tracking-wider">TELEMETRY_ENGINE</span>
            </span>
          </div>

          <span className="text-[#1F2937]">|</span>

          {/* Cluster Dropdown / Selector */}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Server className="w-3.5 h-3.5 text-[#06B6D4]" />
            <select
              value={activeCluster}
              onChange={(e) => setActiveCluster(e.target.value)}
              className="bg-[#0D1117] border border-[#1F2937] hover:border-[#374151] text-[#E5E7EB] rounded-[4px] px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-[#00FF9D] focus:shadow-[0_0_0_1px_#00FF9D]"
            >
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} [{c.latency}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: System Status Beacon Pill */}
        <div className="flex items-center gap-3">
          {activeAlertsCount > 0 ? (
            <div className="h-[20px] rounded-full px-2.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider bg-[#F59E0B]/12 text-[#F59E0B] border border-[#F59E0B]/30 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-beacon" />
              <span>{activeAlertsCount} ACTIVE ANOMALIES</span>
            </div>
          ) : (
            <div className="h-[20px] rounded-full px-2.5 flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/30 shadow-[0_0_8px_rgba(0,255,157,0.35)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-beacon" />
              <span>SYSTEMS NOMINAL</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 font-mono text-[11px] text-[#849587]">
            <span>KERN: <span className="text-[#dfe2ef]">6.8.0-41-sys</span></span>
            <span className="text-[#1F2937]">•</span>
            <span>UPTIME: <span className="text-[#00FF9D]">99.994%</span></span>
          </div>
        </div>

        {/* Right: UTC Clock & Live Frequency Toggle */}
        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] text-[#06B6D4] bg-[#0D1117] px-2 py-0.5 rounded-[4px] border border-[#1F2937]">
            {utcTime || '00:00:00.000 UTC'}
          </div>

          {/* Hardware-Style Toggle Switch */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-[#849587]">60Hz Stream</span>
            <button
              type="button"
              onClick={() => setIsStreaming(!isStreaming)}
              aria-label="Toggle live telemetry stream"
              className={`w-8 h-4 rounded-full relative transition-colors duration-200 cursor-pointer ${
                isStreaming
                  ? 'bg-[#06B6D4] shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                  : 'bg-[#1F2937]'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform duration-200 shadow-sm ${
                  isStreaming ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={triggerManualRefresh}
            title="Force Telemetry Poll"
            className="p-1 rounded-[4px] border border-[#1F2937] hover:border-[#374151] hover:bg-[#161B22] text-[#849587] hover:text-[#06B6D4] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Chaos Injection Button */}
          <button
            onClick={openChaosModal}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-medium rounded-[4px] bg-[#F43F5E]/12 border border-[#F43F5E] text-[#F43F5E] hover:bg-[#F43F5E]/20 transition shadow-[0_0_8px_rgba(244,63,94,0.25)]"
          >
            <Zap className="w-3 h-3 text-[#F43F5E]" />
            <span>CHAOS [⚡]</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation & Breadcrumb Actions */}
      <div className="px-4 py-1.5 flex items-center justify-between overflow-x-auto gap-4">
        <nav className="flex items-center space-x-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-all font-medium text-[12px] ${
              activeTab === 'overview'
                ? 'bg-[#161B22] border border-[#06B6D4] text-[#38BDF8] shadow-[0_0_12px_-2px_rgba(6,182,212,0.25)]'
                : 'text-[#849587] hover:text-[#dfe2ef] hover:bg-[#0D1117] border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CLUSTER OVERVIEW</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-all font-medium text-[12px] ${
              activeTab === 'matrix'
                ? 'bg-[#161B22] border border-[#06B6D4] text-[#38BDF8] shadow-[0_0_12px_-2px_rgba(6,182,212,0.25)]'
                : 'text-[#849587] hover:text-[#dfe2ef] hover:bg-[#0D1117] border border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>POD MATRIX</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-[#1F2937] text-[#849587]">
              24
            </span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-all font-medium text-[12px] ${
              activeTab === 'terminal'
                ? 'bg-[#161B22] border border-[#06B6D4] text-[#38BDF8] shadow-[0_0_12px_-2px_rgba(6,182,212,0.25)]'
                : 'text-[#849587] hover:text-[#dfe2ef] hover:bg-[#0D1117] border border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>LIVE TERMINAL & LOGS</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-all font-medium text-[12px] relative ${
              activeTab === 'incidents'
                ? 'bg-[#161B22] border border-[#06B6D4] text-[#38BDF8] shadow-[0_0_12px_-2px_rgba(6,182,212,0.25)]'
                : 'text-[#849587] hover:text-[#dfe2ef] hover:bg-[#0D1117] border border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>INCIDENTS</span>
            {activeAlertsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#F43F5E] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-all font-medium text-[12px] ${
              activeTab === 'network'
                ? 'bg-[#161B22] border border-[#06B6D4] text-[#38BDF8] shadow-[0_0_12px_-2px_rgba(6,182,212,0.25)]'
                : 'text-[#849587] hover:text-[#dfe2ef] hover:bg-[#0D1117] border border-transparent'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>NETWORK MESH</span>
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-[#849587] bg-[#0D1117] px-2.5 py-1 rounded-[4px] border border-[#1F2937]">
            <span className="w-2 h-2 rounded-full bg-[#00FF9D]" />
            <span>INGRESS: 42.8 Gbps</span>
            <span className="text-[#1F2937]">|</span>
            <span>EGRESS: 38.1 Gbps</span>
          </div>
        </div>
      </div>
    </header>
  );
};
