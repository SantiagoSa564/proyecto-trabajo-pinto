import React, { useState } from 'react';
import { PodNode } from '../types/telemetry';
import {
  X,
  Cpu,
  HardDrive,
  Clock,
  Terminal,
  AlertTriangle,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Server,
  Activity,
  FileCode,
  ShieldCheck
} from 'lucide-react';
import { Sparkline } from './Sparkline';

interface PodDetailModalProps {
  pod: PodNode | null;
  onClose: () => void;
  onRestartPod: (podId: string) => void;
  onKillPod: (podId: string) => void;
}

export const PodDetailModal: React.FC<PodDetailModalProps> = ({
  pod,
  onClose,
  onRestartPod,
  onKillPod
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'logs' | 'env'>('metrics');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!pod) return null;

  const handleRestart = () => {
    setActionFeedback('Initiating SIGTERM graceful rollout...');
    setTimeout(() => {
      onRestartPod(pod.id);
      setActionFeedback('Pod restarted successfully.');
      setTimeout(() => setActionFeedback(null), 2500);
    }, 600);
  };

  const handleKill = () => {
    setActionFeedback('Issuing SIGKILL to container cgroup...');
    setTimeout(() => {
      onKillPod(pod.id);
      setActionFeedback('Container terminated.');
      setTimeout(() => setActionFeedback(null), 2500);
    }, 600);
  };

  const statusColor =
    pod.status === 'running'
      ? '#00FF9D'
      : pod.status === 'throttled'
      ? '#F59E0B'
      : '#F43F5E';

  const mockCpuHistory = [
    pod.cpuUsage - 12,
    pod.cpuUsage - 8,
    pod.cpuUsage + 4,
    pod.cpuUsage - 2,
    pod.cpuUsage + 6,
    pod.cpuUsage
  ].map((v) => Math.max(5, Math.min(99, v)));

  const mockMemHistory = [
    pod.memUsage - 2,
    pod.memUsage - 1,
    pod.memUsage + 3,
    pod.memUsage + 2,
    pod.memUsage + 4,
    pod.memUsage
  ].map((v) => Math.max(10, Math.min(99, v)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      {/* Modal Surface Level 3 */}
      <div className="relative w-full max-w-2xl bg-[#0D1117] border border-[#374151] rounded-[8px] shadow-[0_12px_32px_-8px_#000000,0_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="p-4 border-b border-[#1F2937] flex items-center justify-between bg-[#090D16]">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: statusColor,
                boxShadow: `0 0 10px ${statusColor}`
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-white tracking-tight">
                  {pod.name}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#161B22] border border-[#1F2937] text-[#06B6D4]">
                  {pod.id}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#849587] mt-0.5">
                <span>NS: <span className="text-[#dfe2ef]">{pod.namespace}</span></span>
                <span>ZONE: <span className="text-[#dfe2ef]">{pod.zone}</span></span>
                <span>IP: <span className="text-[#06B6D4]">{pod.ip}</span></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-[#849587] hover:text-white hover:bg-[#161B22] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action feedback toast */}
        {actionFeedback && (
          <div className="px-4 py-2 bg-[#161B22] border-b border-[#06B6D4]/40 font-mono text-xs text-[#06B6D4] flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Tab Strip */}
        <div className="px-4 border-b border-[#1F2937] flex gap-4 bg-[#0a0e17] text-xs font-mono">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2.5 border-b-2 font-medium transition ${
              activeTab === 'metrics'
                ? 'border-[#00FF9D] text-[#00FF9D]'
                : 'border-transparent text-[#849587] hover:text-[#dfe2ef]'
            }`}
          >
            LIVE TELEMETRY
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 border-b-2 font-medium transition ${
              activeTab === 'logs'
                ? 'border-[#00FF9D] text-[#00FF9D]'
                : 'border-transparent text-[#849587] hover:text-[#dfe2ef]'
            }`}
          >
            STDOUT / STDERR
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`py-2.5 border-b-2 font-medium transition ${
              activeTab === 'env'
                ? 'border-[#00FF9D] text-[#00FF9D]'
                : 'border-transparent text-[#849587] hover:text-[#dfe2ef]'
            }`}
          >
            ENV & CGROUPS
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'metrics' && (
            <>
              {/* Gauges & Sparklines Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#090D16] border border-[#1F2937] rounded-[4px]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#849587] mb-1">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#00FF9D]" />
                      CPU CORE ALLOCATION
                    </span>
                    <span className="text-white font-bold">{pod.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pod.cpuUsage}%`,
                        backgroundColor: pod.cpuUsage > 85 ? '#F43F5E' : '#00FF9D'
                      }}
                    />
                  </div>
                  <Sparkline data={mockCpuHistory} color={pod.cpuUsage > 85 ? '#F43F5E' : '#00FF9D'} width={240} height={32} />
                </div>

                <div className="p-3 bg-[#090D16] border border-[#1F2937] rounded-[4px]">
                  <div className="flex items-center justify-between text-xs font-mono text-[#849587] mb-1">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-[#06B6D4]" />
                      RSS MEMORY FOOTPRINT
                    </span>
                    <span className="text-white font-bold">{pod.memUsage}%</span>
                  </div>
                  <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pod.memUsage}%`,
                        backgroundColor: pod.memUsage > 85 ? '#F43F5E' : '#06B6D4'
                      }}
                    />
                  </div>
                  <Sparkline data={mockMemHistory} color={pod.memUsage > 85 ? '#F43F5E' : '#06B6D4'} width={240} height={32} />
                </div>
              </div>

              {/* Diagnostic Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-[#090D16] p-2.5 rounded-[4px] border border-[#1F2937]">
                  <div className="text-[10px] text-[#849587] uppercase">Container Image</div>
                  <div className="text-white font-medium truncate mt-0.5" title={pod.image}>
                    {pod.image}
                  </div>
                </div>

                <div className="bg-[#090D16] p-2.5 rounded-[4px] border border-[#1F2937]">
                  <div className="text-[10px] text-[#849587] uppercase">Uptime Clock</div>
                  <div className="text-white font-medium mt-0.5">{pod.uptime}</div>
                </div>

                <div className="bg-[#090D16] p-2.5 rounded-[4px] border border-[#1F2937]">
                  <div className="text-[10px] text-[#849587] uppercase">Active Threads</div>
                  <div className="text-white font-medium mt-0.5">{pod.threads} thr</div>
                </div>

                <div className="bg-[#090D16] p-2.5 rounded-[4px] border border-[#1F2937]">
                  <div className="text-[10px] text-[#849587] uppercase">Storage IOPS</div>
                  <div className="text-white font-medium mt-0.5">
                    {pod.iops.toLocaleString()} ops/s
                  </div>
                </div>
              </div>

              {/* Heartbeat Status Notice */}
              <div className="bg-[#161B22] p-3 rounded-[4px] border border-[#1F2937] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00FF9D]" />
                  <span>Kubelet Daemon Probe: <span className="text-[#00FF9D]">PASS (HTTP 200 /healthz)</span></span>
                </div>
                <span className="text-[#849587]">Echo: {pod.lastHeartbeat}</span>
              </div>
            </>
          )}

          {activeTab === 'logs' && (
            <div className="bg-[#090D16] border border-[#1F2937] rounded-[4px] p-3 font-mono text-[11px] space-y-1.5 max-h-64 overflow-y-auto">
              <div className="text-[#849587] mb-2 border-b border-[#1F2937] pb-1">
                -- BEGIN LIVE STDOUT STREAM ({pod.name}) --
              </div>
              <div className="text-[#dfe2ef]">
                <span className="text-[#06B6D4]">12:47:01.120</span> [INFO] worker_pool initialized with {pod.threads} execution coroutines
              </div>
              <div className="text-[#dfe2ef]">
                <span className="text-[#06B6D4]">12:47:03.490</span> [INFO] epoll socket listener bound to {pod.ip}:8080 (TCP_NODELAY active)
              </div>
              {pod.cpuUsage > 80 && (
                <div className="text-[#F59E0B]">
                  <span className="text-[#06B6D4]">12:47:05.110</span> [WARN] CFS scheduler quota saturated: process throttling triggered (94%)
                </div>
              )}
              {pod.memUsage > 85 && (
                <div className="text-[#F43F5E]">
                  <span className="text-[#06B6D4]">12:47:06.840</span> [ERROR] Memory watermark approaching cgroup hard limit: OOM killer guard armed
                </div>
              )}
              <div className="text-[#dfe2ef]">
                <span className="text-[#06B6D4]">12:47:08.200</span> [INFO] Ready for client traffic. TLS handshake latency p99: 1.4ms
              </div>
            </div>
          )}

          {activeTab === 'env' && (
            <div className="bg-[#090D16] border border-[#1F2937] rounded-[4px] p-3 font-mono text-[11px] space-y-1">
              <div className="flex justify-between py-1 border-b border-[#1F2937]/50">
                <span className="text-[#849587]">POD_NAME:</span>
                <span className="text-white">{pod.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2937]/50">
                <span className="text-[#849587]">POD_NAMESPACE:</span>
                <span className="text-[#00FF9D]">{pod.namespace}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2937]/50">
                <span className="text-[#849587]">NODE_AVAILABILITY_ZONE:</span>
                <span className="text-white">{pod.zone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1F2937]/50">
                <span className="text-[#849587]">CGROUP_MEMORY_LIMIT:</span>
                <span className="text-[#06B6D4]">16384MiB</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#849587]">CGROUP_CPU_QUOTA:</span>
                <span className="text-[#06B6D4]">4000m (4 vCPU)</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#090D16] border-t border-[#1F2937] flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-mono text-[#849587]">
            Restarts: <span className="text-white">{pod.restarts}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Secondary Terminal Action */}
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-[4px] bg-[#161B22] border border-[#374151] hover:border-[#06B6D4] text-[#E5E7EB] hover:text-[#38BDF8] font-mono text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ROLLOUT RESTART</span>
            </button>

            {/* Destructive Kill Command */}
            <button
              onClick={handleKill}
              className="px-3 py-1.5 rounded-[4px] bg-[#F43F5E]/12 border border-[#F43F5E] text-[#F43F5E] hover:bg-[#F43F5E]/25 font-mono text-xs font-medium flex items-center gap-1.5 transition shadow-[0_0_8px_rgba(244,63,94,0.3)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>TERMINATE (SIGKILL)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
