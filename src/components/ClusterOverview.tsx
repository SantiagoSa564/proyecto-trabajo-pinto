import React from 'react';
import { ClusterMetrics, IncidentAlert, PodNode } from '../types/telemetry';
import { MetricCard } from './MetricCard';
import { Sparkline } from './Sparkline';
import {
  Activity,
  Layers,
  Cpu,
  HardDrive,
  ShieldAlert,
  ArrowUpRight,
  Zap,
  Globe,
  Radio,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ClusterOverviewProps {
  metrics: ClusterMetrics;
  qpsHistory: number[];
  latencyHistory: number[];
  cpuHistory: number[];
  memHistory: number[];
  pods: PodNode[];
  alerts: IncidentAlert[];
  onSelectPod: (pod: PodNode) => void;
  onNavigateToTab: (tab: 'matrix' | 'terminal' | 'incidents' | 'network') => void;
}

export const ClusterOverview: React.FC<ClusterOverviewProps> = ({
  metrics,
  qpsHistory,
  latencyHistory,
  cpuHistory,
  memHistory,
  pods,
  alerts,
  onSelectPod,
  onNavigateToTab
}) => {
  const healthyCount = pods.filter((p) => p.status === 'running').length;
  const degradedCount = pods.filter((p) => p.status === 'degraded' || p.status === 'oom_killed').length;
  const throttledCount = pods.filter((p) => p.status === 'throttled').length;

  return (
    <div className="space-y-4">
      {/* 6-Card High-Density Telemetry Matrix Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5">
        <MetricCard
          label="THROUGHPUT"
          sublabel="QPS"
          value={metrics.totalQps.toLocaleString()}
          unit="req/s"
          history={qpsHistory}
          color="#00FF9D"
          delta={{ value: '3.8%', isUp: true, isPositiveGood: true }}
          footnote="eBPF socket capture"
        />

        <MetricCard
          label="P95 LATENCY"
          sublabel="INGRESS"
          value={metrics.p95Latency.toFixed(1)}
          unit="ms"
          history={latencyHistory}
          color={metrics.p95Latency > 20 ? '#F59E0B' : '#06B6D4'}
          delta={{ value: '0.4ms', isUp: false, isPositiveGood: true }}
          footnote={`P99: ${metrics.p99Latency.toFixed(1)}ms`}
        />

        <MetricCard
          label="ERROR RATE"
          sublabel="5XX"
          value={metrics.errorRate.toFixed(3)}
          unit="%"
          history={latencyHistory.map((v) => v * 0.001)}
          color={metrics.errorRate > 0.05 ? '#F43F5E' : '#00FF9D'}
          delta={{ value: '0.002%', isUp: false, isPositiveGood: true }}
          footnote="Target SLA: <0.050%"
        />

        <MetricCard
          label="CPU LOAD"
          sublabel="96 CORES"
          value={metrics.cpuLoad.toFixed(1)}
          unit="%"
          history={cpuHistory}
          color={metrics.cpuLoad > 80 ? '#F43F5E' : '#00FF9D'}
          delta={{ value: '2.1%', isUp: true, isPositiveGood: false }}
          footnote="CFS throttles: 1"
        />

        <MetricCard
          label="MEMORY RSS"
          sublabel="RAM"
          value={metrics.memLoad.toFixed(1)}
          unit="%"
          history={memHistory}
          color={metrics.memLoad > 85 ? '#F43F5E' : '#06B6D4'}
          delta={{ value: '0.8%', isUp: true, isPositiveGood: false }}
          footnote="320GB / 468GB allocated"
        />

        <MetricCard
          label="ACTIVE PODS"
          sublabel="HEALTH"
          value={`${healthyCount}/${pods.length}`}
          unit="pods"
          history={[22, 23, 23, 24, 24, pods.length]}
          color={degradedCount > 0 ? '#F43F5E' : throttledCount > 0 ? '#F59E0B' : '#00FF9D'}
          footnote={degradedCount > 0 ? `${degradedCount} degraded node(s)` : '100% nominal mesh'}
          onClick={() => onNavigateToTab('matrix')}
        />
      </div>

      {/* Main Dual-Column Telemetry Surface (Level 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column (8 cols): Real-Time Dual-Stream Waveform & Pod Grid */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Real-time Streaming SVG Chart Card */}
          <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#849587]">
                    TELEMETRY OSCILLOSCOPE // REAL-TIME INGRESS QPS & LATENCY
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-beacon" />
                </div>
                <div className="text-xs font-mono text-[#849587] mt-0.5">
                  Rolling 30-sample sliding telemetry buffer (60Hz sample rate)
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#00FF9D]" />
                  <span className="text-[#dfe2ef]">Throughput ({metrics.totalQps} QPS)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-[#06B6D4]" />
                  <span className="text-[#dfe2ef]">P95 ({metrics.p95Latency.toFixed(1)}ms)</span>
                </div>
              </div>
            </div>

            {/* SVG Dual Waveform Stream */}
            <div className="h-44 w-full bg-[#090D16] border border-[#1F2937] rounded-[4px] p-2 relative overflow-hidden flex flex-col justify-between">
              {/* Grid Lines */}
              <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40" />

              {/* Top readout */}
              <div className="relative z-10 flex justify-between text-[10px] font-mono text-[#849587]">
                <span>HIGH: 48,000 QPS</span>
                <span>P99: {metrics.p99Latency.toFixed(1)} ms</span>
              </div>

              {/* Sparkline Visual Overlay */}
              <div className="relative z-10 w-full h-28 my-auto flex items-center">
                <div className="w-full relative">
                  <Sparkline
                    data={qpsHistory}
                    color="#00FF9D"
                    height={70}
                    width={560}
                    showFill={true}
                  />
                  <div className="absolute inset-0 opacity-80 pointer-events-none">
                    <Sparkline
                      data={latencyHistory.map((v) => v * 1000)}
                      color="#06B6D4"
                      height={70}
                      width={560}
                      showFill={false}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom timeline indicators */}
              <div className="relative z-10 flex justify-between text-[10px] font-mono text-[#849587] border-t border-[#1F2937]/50 pt-1">
                <span>-60s</span>
                <span>-45s</span>
                <span>-30s</span>
                <span>-15s</span>
                <span className="text-[#00FF9D]">NOW (LIVE)</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Node Pods Matrix Preview */}
          <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">
                  CONTAINER POD MATRIX ({pods.length} NODES)
                </span>
              </div>

              <button
                onClick={() => onNavigateToTab('matrix')}
                className="text-xs font-mono text-[#06B6D4] hover:text-[#38BDF8] flex items-center gap-1 transition"
              >
                <span>OPEN FULL MESH VIEW</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Pod Matrix Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {pods.map((pod) => {
                const isHealthy = pod.status === 'running';
                const isThrottled = pod.status === 'throttled';
                const isDegraded = pod.status === 'degraded' || pod.status === 'oom_killed';

                const color = isHealthy
                  ? '#00FF9D'
                  : isThrottled
                  ? '#F59E0B'
                  : '#F43F5E';

                return (
                  <div
                    key={pod.id}
                    onClick={() => onSelectPod(pod)}
                    title={`${pod.name} (${pod.id})\nStatus: ${pod.status}\nCPU: ${pod.cpuUsage}% | MEM: ${pod.memUsage}%\nClick to inspect`}
                    className="group bg-[#090D16] border border-[#1F2937] hover:border-[#374151] p-2 rounded-[4px] cursor-pointer transition hover:bg-[#161B22] flex flex-col justify-between h-18"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[9px] font-mono text-[#849587]">
                        {pod.zone.split('-')[2]}
                      </span>
                    </div>

                    <div className="font-mono text-[10px] font-bold text-white truncate group-hover:text-[#06B6D4]">
                      {pod.id}
                    </div>

                    <div className="flex justify-between text-[9px] font-mono text-[#849587]">
                      <span>{pod.cpuUsage}%</span>
                      <span>{pod.memUsage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Active Incidents Triage & Regional Distribution */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Active Incidents Card */}
          <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3.5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1F2937]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#F43F5E]" />
                <span className="text-xs font-mono font-bold text-white tracking-tight">
                  ACTIVE ANOMALIES ({alerts.filter((a) => a.status === 'active').length})
                </span>
              </div>

              <button
                onClick={() => onNavigateToTab('incidents')}
                className="text-[11px] font-mono text-[#06B6D4] hover:underline"
              >
                TRIAGE QUEUE &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onNavigateToTab('incidents')}
                  className={`p-2.5 rounded-[4px] bg-[#090D16] border transition cursor-pointer hover:bg-[#161B22] ${
                    alert.severity === 'P0'
                      ? 'border-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                      : alert.severity === 'P1'
                      ? 'border-[#F59E0B]/50'
                      : 'border-[#1F2937]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-[2px] ${
                        alert.severity === 'P0'
                          ? 'bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/40'
                          : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-[#849587]">
                      {alert.timestamp}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-semibold text-white truncate">
                    {alert.title}
                  </div>

                  <div className="text-[10px] font-mono text-[#849587] mt-1 truncate">
                    {alert.service}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Traffic & WAN Distribution */}
          <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3.5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1F2937]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-xs font-mono font-bold text-white tracking-tight">
                  GLOBAL TRAFFIC INGRESS
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#00FF9D]">BGP ANYCAST</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-[#dfe2ef] mb-1">
                  <span>US-East (N. Virginia)</span>
                  <span className="text-[#00FF9D] font-bold">62% (26.5k QPS)</span>
                </div>
                <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00FF9D] h-full" style={{ width: '62%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#dfe2ef] mb-1">
                  <span>EU-Central (Frankfurt)</span>
                  <span className="text-[#06B6D4] font-bold">24% (10.2k QPS)</span>
                </div>
                <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#06B6D4] h-full" style={{ width: '24%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[#dfe2ef] mb-1">
                  <span>APAC-East (Tokyo Ring)</span>
                  <span className="text-[#38BDF8] font-bold">14% (6.1k QPS)</span>
                </div>
                <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#38BDF8] h-full" style={{ width: '14%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Fast SRE CLI Quick Action */}
          <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3 text-xs font-mono">
            <div className="text-[10px] font-mono text-[#849587] uppercase mb-1.5">
              Live Terminal Quick Access
            </div>
            <button
              onClick={() => onNavigateToTab('terminal')}
              className="w-full py-2 px-3 rounded-[4px] bg-[#161B22] border border-[#374151] hover:border-[#06B6D4] text-[#E5E7EB] hover:text-[#38BDF8] transition flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-[#00FF9D] font-bold">&gt;_</span>
                <span>OPEN LOG STREAM [TTY01]</span>
              </span>
              <span className="text-[10px] text-[#849587]">hotkey: ~</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
