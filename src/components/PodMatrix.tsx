import React, { useState } from 'react';
import { PodNode } from '../types/telemetry';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Cpu,
  HardDrive,
  ExternalLink,
  Plus,
  Play
} from 'lucide-react';

interface PodMatrixProps {
  pods: PodNode[];
  onSelectPod: (pod: PodNode) => void;
  onRestartPod: (podId: string) => void;
  onBulkRestartDegraded: () => void;
  onAddSimulatedPod: () => void;
}

export const PodMatrix: React.FC<PodMatrixProps> = ({
  pods,
  onSelectPod,
  onRestartPod,
  onBulkRestartDegraded,
  onAddSimulatedPod
}) => {
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'matrix' | 'dense'>('matrix');

  const namespaces = [
    'all',
    'core-ingress',
    'edge-cache',
    'auth-vault',
    'db-cluster',
    'inference-mesh',
    'telemetry-daemon'
  ];

  const filteredPods = pods.filter((pod) => {
    const matchesNs = selectedNamespace === 'all' || pod.namespace === selectedNamespace;
    const matchesStatus = selectedStatus === 'all' || pod.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      pod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesNs && matchesStatus && matchesSearch;
  });

  const runningCount = pods.filter((p) => p.status === 'running').length;
  const degradedCount = pods.filter((p) => p.status === 'degraded' || p.status === 'oom_killed').length;
  const throttledCount = pods.filter((p) => p.status === 'throttled').length;

  const getBorderColor = (status: PodNode['status']) => {
    switch (status) {
      case 'running':
        return '#00FF9D';
      case 'throttled':
        return '#F59E0B';
      case 'degraded':
      case 'oom_killed':
        return '#F43F5E';
      case 'restarting':
        return '#06B6D4';
      default:
        return '#00FF9D';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#0D1117] p-3 border border-[#1F2937] rounded-[4px]">
        {/* Search Input with >_ prefix */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#00FF9D] font-mono text-xs font-bold">
            &gt;_
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pod name, ID (e.g. ing-us1a-01), IP, or zone..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#090D16] border border-[#1F2937] focus:border-[#00FF9D] focus:shadow-[0_0_0_1px_#00FF9D] text-[#dfe2ef] placeholder-[#849587] text-xs font-mono rounded-[4px] focus:outline-none transition-all"
          />
        </div>

        {/* Status Quick Counters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Beacon Pills */}
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'running' ? 'all' : 'running')}
            className={`h-[22px] rounded-full px-2.5 flex items-center gap-1.5 font-mono text-[10px] uppercase font-semibold transition cursor-pointer ${
              selectedStatus === 'running'
                ? 'bg-[#00FF9D]/25 text-[#00FF9D] border border-[#00FF9D] shadow-[0_0_8px_rgba(0,255,157,0.4)]'
                : 'bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/30 hover:bg-[#00FF9D]/20'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-beacon" />
            <span>{runningCount} RUNNING</span>
          </button>

          {throttledCount > 0 && (
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'throttled' ? 'all' : 'throttled')}
              className={`h-[22px] rounded-full px-2.5 flex items-center gap-1.5 font-mono text-[10px] uppercase font-semibold transition cursor-pointer ${
                selectedStatus === 'throttled'
                  ? 'bg-[#F59E0B]/25 text-[#F59E0B] border border-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                  : 'bg-[#F59E0B]/12 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
              <span>{throttledCount} THROTTLED</span>
            </button>
          )}

          {degradedCount > 0 && (
            <button
              onClick={() => setSelectedStatus(selectedStatus === 'degraded' ? 'all' : 'degraded')}
              className={`h-[22px] rounded-full px-2.5 flex items-center gap-1.5 font-mono text-[10px] uppercase font-semibold transition cursor-pointer ${
                selectedStatus === 'degraded'
                  ? 'bg-[#F43F5E]/25 text-[#F43F5E] border border-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  : 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30 hover:bg-[#F43F5E]/20'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" />
              <span>{degradedCount} DEGRADED</span>
            </button>
          )}

          {/* Bulk Remediation Button if issues present */}
          {degradedCount > 0 && (
            <button
              onClick={onBulkRestartDegraded}
              className="px-2.5 py-1 text-[11px] font-mono rounded-[4px] bg-[#161B22] border border-[#F43F5E] hover:border-[#00FF9D] text-[#F43F5E] hover:text-[#00FF9D] transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>AUTO-RESYNC ({degradedCount})</span>
            </button>
          )}

          {/* Primary Cyber Action: Spawn Replicas */}
          <button
            onClick={onAddSimulatedPod}
            className="px-3 py-1 bg-[#00FF9D] hover:bg-[#00FF9D] text-[#090D16] font-bold text-xs rounded-[4px] transition duration-150 hover:shadow-[0_0_12px_rgba(0,255,157,0.5)] flex items-center gap-1.5 font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>SPAWN POD</span>
          </button>
        </div>
      </div>

      {/* Namespace Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono uppercase text-[#849587] mr-1">Namespace:</span>
        {namespaces.map((ns) => {
          const isActive = selectedNamespace === ns;
          return (
            <button
              key={ns}
              onClick={() => setSelectedNamespace(ns)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-[4px] transition border cursor-pointer ${
                isActive
                  ? 'bg-[#0D1117] border-[#06B6D4] text-[#38BDF8] shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-[#0D1117] border-[#1F2937] text-[#849587] hover:text-[#dfe2ef] hover:border-[#374151]'
              }`}
            >
              {ns}
            </button>
          );
        })}
      </div>

      {/* Pod Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {filteredPods.map((pod) => {
          const borderColor = getBorderColor(pod.status);
          const isHighCpu = pod.cpuUsage > 85;
          const isHighMem = pod.memUsage > 85;

          return (
            <div
              key={pod.id}
              onClick={() => onSelectPod(pod)}
              style={{ borderLeftColor: borderColor }}
              className="group relative bg-[#0D1117] border-y border-r border-[#1F2937] hover:border-[#374151] hover:bg-[#161B22] border-l-[3px] rounded-[4px] p-3 cursor-pointer transition-all duration-150 hover:shadow-[0_0_16px_-4px_rgba(6,182,212,0.18)]"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-white group-hover:text-[#06B6D4] transition truncate">
                      {pod.name}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#849587]">
                    {pod.id} • {pod.zone}
                  </div>
                </div>

                <span
                  className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-[2px] border"
                  style={{
                    color: borderColor,
                    backgroundColor: `${borderColor}18`,
                    borderColor: `${borderColor}40`
                  }}
                >
                  {pod.status}
                </span>
              </div>

              {/* Resource Bars */}
              <div className="space-y-1.5 my-2">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-[#849587] mb-0.5">
                    <span>CPU</span>
                    <span className={isHighCpu ? 'text-[#F43F5E] font-bold' : 'text-[#dfe2ef]'}>
                      {pod.cpuUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1F2937] h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${pod.cpuUsage}%`,
                        backgroundColor: isHighCpu ? '#F43F5E' : '#00FF9D'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-mono text-[#849587] mb-0.5">
                    <span>MEM</span>
                    <span className={isHighMem ? 'text-[#F43F5E] font-bold' : 'text-[#dfe2ef]'}>
                      {pod.memUsage}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1F2937] h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${pod.memUsage}%`,
                        backgroundColor: isHighMem ? '#F43F5E' : '#06B6D4'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-[#1F2937]/60 flex items-center justify-between text-[10px] font-mono text-[#849587]">
                <span>IP: {pod.ip}</span>
                <span className="flex items-center gap-1 group-hover:text-[#38BDF8] transition">
                  <span>INSPECT</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPods.length === 0 && (
        <div className="p-8 text-center bg-[#0D1117] border border-[#1F2937] rounded-[4px] font-mono text-xs text-[#849587]">
          No pods match current filters or search query &quot;{searchQuery}&quot;.
        </div>
      )}
    </div>
  );
};
