export type PodStatus = 'running' | 'degraded' | 'throttled' | 'oom_killed' | 'restarting';

export interface PodNode {
  id: string;
  name: string;
  namespace: 'core-ingress' | 'edge-cache' | 'auth-vault' | 'db-cluster' | 'inference-mesh' | 'telemetry-daemon';
  zone: 'us-east-1a' | 'us-east-1b' | 'us-east-1c';
  ip: string;
  status: PodStatus;
  cpuUsage: number; // percentage (0 - 100)
  memUsage: number; // percentage (0 - 100)
  restarts: number;
  uptime: string;
  threads: number;
  iops: number;
  image: string;
  lastHeartbeat: string;
}

export interface MetricSparklinePoint {
  time: string;
  value: number;
}

export interface ClusterMetrics {
  totalQps: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  cpuLoad: number;
  memLoad: number;
  activeSockets: number;
  networkInGbps: number;
  networkOutGbps: number;
  healthyPods: number;
  totalPods: number;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'DEBUG';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  podId: string;
  message: string;
  ip?: string;
  latencyMs?: number;
}

export interface IncidentAlert {
  id: string;
  title: string;
  severity: 'P0' | 'P1' | 'P2';
  service: string;
  zone: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'mitigated' | 'silenced';
  impactDescription: string;
  suggestedRunbook: string;
  assignedEngineer?: string;
}

export interface NetworkZoneLatency {
  fromZone: string;
  toZone: string;
  latencyMs: number;
  packetLoss: number;
  bandwidthUsageGbps: number;
  status: 'optimal' | 'elevated' | 'congested';
}
