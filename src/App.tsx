import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PodNode,
  ClusterMetrics,
  LogEntry,
  IncidentAlert,
  NetworkZoneLatency
} from './types/telemetry';
import {
  INITIAL_PODS,
  INITIAL_ALERTS,
  INITIAL_LOGS,
  NETWORK_LATENCIES
} from './data/mockCluster';
import { Header } from './components/Header';
import { ClusterOverview } from './components/ClusterOverview';
import { PodMatrix } from './components/PodMatrix';
import { TerminalConsole } from './components/TerminalConsole';
import { IncidentTriage } from './components/IncidentTriage';
import { NetworkMesh } from './components/NetworkMesh';
import { PodDetailModal } from './components/PodDetailModal';
import { ChaosModal } from './components/ChaosModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'terminal' | 'incidents' | 'network'>('overview');
  const [activeCluster, setActiveCluster] = useState<string>('prod-cluster-us-east-1');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Core Data States
  const [pods, setPods] = useState<PodNode[]>(INITIAL_PODS);
  const [alerts, setAlerts] = useState<IncidentAlert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [selectedPod, setSelectedPod] = useState<PodNode | null>(null);
  const [isChaosOpen, setIsChaosOpen] = useState<boolean>(false);

  // Sparkline Histories
  const [qpsHistory, setQpsHistory] = useState<number[]>([
    41200, 41800, 42100, 42050, 42400, 42850, 43100, 42900, 42850
  ]);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([
    4.2, 4.4, 4.3, 4.6, 4.8, 4.5, 4.9, 4.7, 4.8
  ]);
  const [cpuHistory, setCpuHistory] = useState<number[]>([
    51.2, 52.0, 52.8, 53.4, 54.1, 53.9, 54.2
  ]);
  const [memHistory, setMemHistory] = useState<number[]>([
    67.8, 68.0, 68.1, 68.2, 68.4, 68.3, 68.4
  ]);

  const [metrics, setMetrics] = useState<ClusterMetrics>({
    totalQps: 42850,
    p50Latency: 1.2,
    p95Latency: 4.8,
    p99Latency: 14.2,
    errorRate: 0.012,
    cpuLoad: 54.2,
    memLoad: 68.4,
    activeSockets: 18420,
    networkInGbps: 42.8,
    networkOutGbps: 38.1,
    healthyPods: INITIAL_PODS.filter((p) => p.status === 'running').length,
    totalPods: INITIAL_PODS.length
  });

  // Global hotkey: ~ to jump to terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          setActiveTab((prev) => (prev === 'terminal' ? 'overview' : 'terminal'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Telemetry Streaming Simulator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // 1. Oscillate Metrics smoothly
      const qpsJitter = Math.floor(Math.random() * 800 - 380);
      const newQps = Math.max(38000, Math.min(48000, metrics.totalQps + qpsJitter));

      const latJitter = (Math.random() * 0.4 - 0.19);
      const newLatency = Math.max(2.8, Math.min(12.0, parseFloat((metrics.p95Latency + latJitter).toFixed(1))));

      const cpuJitter = (Math.random() * 0.6 - 0.28);
      const newCpu = Math.max(35, Math.min(88, parseFloat((metrics.cpuLoad + cpuJitter).toFixed(1))));

      const memJitter = (Math.random() * 0.2 - 0.09);
      const newMem = Math.max(50, Math.min(92, parseFloat((metrics.memLoad + memJitter).toFixed(1))));

      setMetrics((prev) => ({
        ...prev,
        totalQps: newQps,
        p95Latency: newLatency,
        p99Latency: parseFloat((newLatency * 2.8).toFixed(1)),
        cpuLoad: newCpu,
        memLoad: newMem,
        activeSockets: Math.floor(prev.activeSockets + (Math.random() * 40 - 20))
      }));

      // Update Sparkline histories (retain last 20 samples)
      setQpsHistory((prev) => [...prev.slice(-19), newQps]);
      setLatencyHistory((prev) => [...prev.slice(-19), newLatency]);
      setCpuHistory((prev) => [...prev.slice(-19), newCpu]);
      setMemHistory((prev) => [...prev.slice(-19), newMem]);

      // 2. Pod resource micro-jitter
      setPods((prev) =>
        prev.map((pod) => {
          if (pod.status === 'restarting') return pod;
          const cpuDelta = Math.floor(Math.random() * 5 - 2);
          const newPodCpu = Math.max(5, Math.min(98, pod.cpuUsage + cpuDelta));
          return {
            ...pod,
            cpuUsage: newPodCpu,
            lastHeartbeat: '0.1s ago'
          };
        })
      );

      // 3. Emit realistic streaming telemetry logs periodically
      if (Math.random() > 0.4) {
        const sampleSources = [
          'envoy-ingress-proxy-01',
          'dragonfly-cache-node-02',
          'vllm-tensor-engine-03',
          'vault-core-kms-02',
          'otel-collector-agent-01',
          'cilium-bpf-router'
        ];
        const sampleMessages = [
          'TCP keep-alive window verified for upstream CIDR 10.244.0.0/16',
          'eBPF tracepoint: trace_sched_switch latency < 4 microseconds',
          'Cache writeback pipeline synchronized 1,200 dirty blocks to disk',
          'Batched tensor computation completed in 18.2ms (KV cache utilization: 64%)',
          'HTTP/2 round-trip latency p50 1.1ms, p99 4.2ms to edge gateway',
          'Prometheus remote_write buffer flushed 32,400 samples successfully'
        ];

        const src = sampleSources[Math.floor(Math.random() * sampleSources.length)];
        const msg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

        const newEntry: LogEntry = {
          id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: timeStr,
          level: 'INFO',
          source: src,
          podId: 'sys-daemon',
          message: msg,
          ip: `10.244.${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 200) + 10}`,
          latencyMs: parseFloat((Math.random() * 3 + 0.4).toFixed(1))
        };

        setLogs((prev) => [...prev.slice(-99), newEntry]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isStreaming, metrics]);

  // Restart Pod Handler
  const handleRestartPod = (podId: string) => {
    setPods((prev) =>
      prev.map((p) => {
        if (p.id === podId) {
          return {
            ...p,
            status: 'running',
            restarts: p.restarts + 1,
            cpuUsage: 25,
            memUsage: Math.max(30, p.memUsage - 20)
          };
        }
        return p;
      })
    );

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs((prev) => [
      ...prev,
      {
        id: `log-restart-${Date.now()}`,
        timestamp: timeStr,
        level: 'INFO',
        source: 'kubelet-scheduler',
        podId,
        message: `Pod ${podId} restart successful. Container image reloaded. Ready for ingress.`,
        latencyMs: 1.0
      }
    ]);
  };

  // Terminate / Kill Pod Handler
  const handleKillPod = (podId: string) => {
    setPods((prev) =>
      prev.map((p) => {
        if (p.id === podId) {
          return {
            ...p,
            status: 'oom_killed',
            cpuUsage: 0,
            memUsage: 0
          };
        }
        return p;
      })
    );

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setLogs((prev) => [
      ...prev,
      {
        id: `log-kill-${Date.now()}`,
        timestamp: timeStr,
        level: 'FATAL',
        source: 'kernel-oom-reaper',
        podId,
        message: `Process terminated by SIGKILL on cgroup ${podId}. Evacuating active sockets.`,
        latencyMs: 0.1
      }
    ]);
  };

  // Bulk restart degraded pods
  const handleBulkRestartDegraded = () => {
    setPods((prev) =>
      prev.map((p) => {
        if (p.status === 'degraded' || p.status === 'oom_killed' || p.status === 'throttled') {
          return {
            ...p,
            status: 'running',
            restarts: p.restarts + 1,
            cpuUsage: 45,
            memUsage: 55
          };
        }
        return p;
      })
    );

    // Resolve associated alerts
    setAlerts((prev) =>
      prev.map((a) => ({
        ...a,
        status: 'mitigated'
      }))
    );
  };

  // Add simulated pod
  const handleAddSimulatedPod = () => {
    const count = pods.length + 1;
    const newPod: PodNode = {
      id: `rep-us1a-${String(count).padStart(2, '0')}`,
      name: `replica-worker-pod-${count}`,
      namespace: 'core-ingress',
      zone: 'us-east-1a',
      ip: `10.244.1.${120 + count}`,
      status: 'running',
      cpuUsage: 32,
      memUsage: 44,
      restarts: 0,
      uptime: '1m 20s',
      threads: 64,
      iops: 11000,
      image: 'worker-mesh/envoy:v1.31',
      lastHeartbeat: '0.1s ago'
    };

    setPods((prev) => [...prev, newPod]);
  };

  // Chaos Injection Runner
  const handleInjectChaos = (scenario: 'wal_lag' | 'cfs_throttle' | 'oom_kill' | 'az_loss' | 'reset') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

    if (scenario === 'reset') {
      setPods(INITIAL_PODS.map((p) => ({ ...p, status: 'running', cpuUsage: 42, memUsage: 55 })));
      setAlerts(INITIAL_ALERTS.map((a) => ({ ...a, status: 'mitigated' })));
      setLogs((prev) => [
        ...prev,
        {
          id: `log-chaos-reset-${Date.now()}`,
          timestamp: timeStr,
          level: 'INFO',
          source: 'chaos-daemon',
          podId: 'chaos-agent',
          message: 'All synthetic faults cleared. Cluster returned to 100% nominal state.'
        }
      ]);
      return;
    }

    if (scenario === 'wal_lag') {
      setPods((prev) =>
        prev.map((p) => (p.id === 'pg-us1c-replica' ? { ...p, status: 'degraded', cpuUsage: 96, memUsage: 94 } : p))
      );
      setAlerts((prev) => [
        {
          id: `INC-${Math.floor(9000 + Math.random() * 900)}`,
          title: 'PostgreSQL WAL replication lag spike on secondary replica (CHAOS_INJECTED)',
          severity: 'P1',
          service: 'db-cluster / pg-us1c-replica',
          zone: 'us-east-1c',
          timestamp: 'just now',
          status: 'active',
          impactDescription: 'Synthetic replication delay triggered. Secondary read queries redirected to primary master.',
          suggestedRunbook: 'runbook://db/flush-wal-buffers-and-resync.md'
        },
        ...prev
      ]);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-chaos-${Date.now()}`,
          timestamp: timeStr,
          level: 'ERROR',
          source: 'chaos-daemon',
          podId: 'pg-us1c-replica',
          message: 'CHAOS FAULT: Injected 1,420ms delay on WAL streaming buffer.'
        }
      ]);
    } else if (scenario === 'cfs_throttle') {
      setPods((prev) =>
        prev.map((p) => (p.id === 'ing-us1b-02' ? { ...p, status: 'throttled', cpuUsage: 98, memUsage: 89 } : p))
      );
      setAlerts((prev) => [
        {
          id: `INC-${Math.floor(9000 + Math.random() * 900)}`,
          title: 'CFS CPU saturation on envoy ingress (CHAOS_INJECTED)',
          severity: 'P2',
          service: 'core-ingress / ing-us1b-02',
          zone: 'us-east-1b',
          timestamp: 'just now',
          status: 'active',
          impactDescription: 'CFS bandwidth throttle saturated at 98% cgroup quota.',
          suggestedRunbook: 'runbook://ingress/hpa-scale-up-replicas.md'
        },
        ...prev
      ]);
    } else if (scenario === 'oom_kill') {
      setPods((prev) =>
        prev.map((p) => (p.id === 'inf-us1b-01' ? { ...p, status: 'oom_killed', cpuUsage: 0, memUsage: 0 } : p))
      );
      setAlerts((prev) => [
        {
          id: `INC-${Math.floor(9000 + Math.random() * 900)}`,
          title: 'Tensor inference container died with OOMKilled exit code 137',
          severity: 'P0',
          service: 'inference-mesh / inf-us1b-01',
          zone: 'us-east-1b',
          timestamp: 'just now',
          status: 'active',
          impactDescription: 'Host kernel reaped container process after RSS memory exceeded 16GiB quota.',
          suggestedRunbook: 'runbook://inference/restart-and-increase-kv-cache.md'
        },
        ...prev
      ]);
    }
  };

  // Interactive CLI command execution engine
  const handleExecuteCommand = (input: string): string => {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const arg1 = parts[1];
    const arg2 = parts[2];

    switch (cmd) {
      case 'help':
        return [
          'AVAILABLE TELEMETRY CLI COMMANDS:',
          '  status                  Display comprehensive cluster health overview',
          '  top                     Show highest resource-consuming pods',
          '  pods [namespace]        List active container pods in cluster',
          '  kill <pod_id>           Send SIGKILL to container cgroup',
          '  restart <pod_id>        Perform graceful rollout restart',
          '  scale <count>           Spawn additional simulated worker pods',
          '  bench                   Run synthetic QPS and p99 benchmark probe',
          '  sysinfo                 Kernel, cgroup v2, architecture and eBPF state',
          '  chaos                   Open chaos engineering injection suite',
          '  clear                   Clear terminal command history buffer'
        ].join('\n');

      case 'status':
        return [
          `Cluster:           ${activeCluster}`,
          `Status:            ${alerts.filter((a) => a.status === 'active').length === 0 ? 'NOMINAL' : 'ANOMALY DETECTED'}`,
          `Throughput:        ${metrics.totalQps.toLocaleString()} QPS`,
          `Ingress P95:       ${metrics.p95Latency.toFixed(1)} ms`,
          `Ingress P99:       ${metrics.p99Latency.toFixed(1)} ms`,
          `Error Rate:        ${metrics.errorRate.toFixed(3)}%`,
          `Active Pods:       ${pods.filter((p) => p.status === 'running').length} / ${pods.length}`,
          `Active Alerts:     ${alerts.filter((a) => a.status === 'active').length} active`
        ].join('\n');

      case 'top': {
        const sorted = [...pods].sort((a, b) => b.cpuUsage - a.cpuUsage).slice(0, 5);
        return [
          'TOP RESOURCE-CONSUMING PODS:',
          'POD_ID           NAME                          CPU%   MEM%   IOPS',
          ...sorted.map(
            (p) =>
              `${p.id.padEnd(16)} ${p.name.slice(0, 28).padEnd(29)} ${String(p.cpuUsage).padStart(4)}%  ${String(
                p.memUsage
              ).padStart(4)}%  ${String(p.iops).padStart(6)}`
          )
        ].join('\n');
      }

      case 'pods': {
        const nsFilter = arg1;
        const matching = nsFilter ? pods.filter((p) => p.namespace === nsFilter) : pods;
        return [
          `CONTAINER PODS LIST (${matching.length} matching):`,
          'ID               NAMESPACE         ZONE        IP             STATUS',
          ...matching.map(
            (p) =>
              `${p.id.padEnd(16)} ${p.namespace.padEnd(17)} ${p.zone.padEnd(11)} ${p.ip.padEnd(14)} ${p.status}`
          )
        ].join('\n');
      }

      case 'kill': {
        if (!arg1) return 'Error: Missing argument. Usage: kill <pod_id>';
        const target = pods.find((p) => p.id === arg1 || p.name === arg1);
        if (!target) return `Error: Pod '${arg1}' not found in cluster.`;
        handleKillPod(target.id);
        return `SUCCESS: SIGKILL delivered to ${target.id} (${target.ip}). Cgroup destroyed.`;
      }

      case 'restart': {
        if (!arg1) return 'Error: Missing argument. Usage: restart <pod_id>';
        const target = pods.find((p) => p.id === arg1 || p.name === arg1);
        if (!target) return `Error: Pod '${arg1}' not found in cluster.`;
        handleRestartPod(target.id);
        return `SUCCESS: Graceful restart initiated for ${target.id}. Pod status restored to running.`;
      }

      case 'scale': {
        const count = parseInt(arg1 || '1', 10);
        for (let i = 0; i < count; i++) {
          handleAddSimulatedPod();
        }
        return `Scaled deployment: added ${count} simulated worker pod(s). Total pods now ${pods.length + count}.`;
      }

      case 'bench':
        return [
          'RUNNING SYNTHETIC LOAD BENCHMARK (10,000 requests / 100 workers)...',
          'Results:',
          '  Throughput:      44,820 req/sec',
          '  Min Latency:     0.42 ms',
          '  p50 Latency:     1.18 ms',
          '  p95 Latency:     4.21 ms',
          '  p99 Latency:     11.84 ms',
          '  Zero 5xx dropouts recorded.'
        ].join('\n');

      case 'sysinfo':
        return [
          'Kernel Release:    Linux 6.8.0-41-generic #41-Ubuntu SMP x86_64',
          'Cgroup Driver:     systemd / cgroup v2 (controllers: cpu, memory, io, pids)',
          'eBPF JIT:          enabled (net.core.bpf_jit_enable = 1)',
          'Network Stack:     eBPF TC-Direct + Cilium WireGuard Overlay',
          'Active Interface:  eth0 (100 Gbps Mellanox ConnectX-6 Dx)'
        ].join('\n');

      case 'chaos':
        setIsChaosOpen(true);
        return 'Opening Chaos Engineering Injection suite...';

      default:
        return `Command not recognized: '${cmd}'. Type 'help' to view available commands.`;
    }
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'active' || a.status === 'investigating').length;

  return (
    <div className="min-h-screen bg-[#090D16] text-[#dfe2ef] font-sans antialiased selection:bg-[#00FF9D]/20 selection:text-[#00FF9D]">
      {/* DevPulse Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeCluster={activeCluster}
        setActiveCluster={setActiveCluster}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        activeAlertsCount={activeAlertsCount}
        openChaosModal={() => setIsChaosOpen(true)}
        triggerManualRefresh={() => {
          setMetrics((prev) => ({
            ...prev,
            totalQps: Math.floor(prev.totalQps + (Math.random() * 400 - 200))
          }));
        }}
      />

      {/* Main Content Body */}
      <main className="max-w-[1720px] mx-auto p-3 sm:p-4 lg:p-5">
        {activeTab === 'overview' && (
          <ClusterOverview
            metrics={metrics}
            qpsHistory={qpsHistory}
            latencyHistory={latencyHistory}
            cpuHistory={cpuHistory}
            memHistory={memHistory}
            pods={pods}
            alerts={alerts}
            onSelectPod={(pod) => setSelectedPod(pod)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'matrix' && (
          <PodMatrix
            pods={pods}
            onSelectPod={(pod) => setSelectedPod(pod)}
            onRestartPod={handleRestartPod}
            onBulkRestartDegraded={handleBulkRestartDegraded}
            onAddSimulatedPod={handleAddSimulatedPod}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalConsole
            logs={logs}
            pods={pods}
            onClearLogs={() => setLogs([])}
            onExecuteCommand={handleExecuteCommand}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentTriage
            alerts={alerts}
            onAcknowledgeAlert={(id) => {
              setAlerts((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: 'investigating' } : a))
              );
            }}
            onMitigateAlert={(id) => {
              setAlerts((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: 'mitigated' } : a))
              );
            }}
            onSilenceAlert={(id) => {
              setAlerts((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: 'silenced' } : a))
              );
            }}
            onAddManualIncident={(inc) => {
              setAlerts((prev) => [inc, ...prev]);
            }}
          />
        )}

        {activeTab === 'network' && (
          <NetworkMesh latencies={NETWORK_LATENCIES} />
        )}
      </main>

      {/* Pod Diagnostic Drawer / Modal */}
      <PodDetailModal
        pod={selectedPod}
        onClose={() => setSelectedPod(null)}
        onRestartPod={handleRestartPod}
        onKillPod={handleKillPod}
      />

      {/* Chaos Engineering Injection Modal */}
      <ChaosModal
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        onInjectChaos={handleInjectChaos}
      />
    </div>
  );
}
