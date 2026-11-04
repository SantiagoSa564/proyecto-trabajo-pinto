import React, { useState } from 'react';
import { IncidentAlert } from '../types/telemetry';
import {
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sliders,
  VolumeX,
  Wrench,
  Activity,
  Plus
} from 'lucide-react';

interface IncidentTriageProps {
  alerts: IncidentAlert[];
  onAcknowledgeAlert: (id: string) => void;
  onMitigateAlert: (id: string) => void;
  onSilenceAlert: (id: string) => void;
  onAddManualIncident: (incident: IncidentAlert) => void;
}

export const IncidentTriage: React.FC<IncidentTriageProps> = ({
  alerts,
  onAcknowledgeAlert,
  onMitigateAlert,
  onSilenceAlert,
  onAddManualIncident
}) => {
  const [cpuThreshold, setCpuThreshold] = useState<number>(85);
  const [memThreshold, setMemThreshold] = useState<number>(90);
  const [latencyThreshold, setLatencyThreshold] = useState<number>(50);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'investigating' | 'mitigated'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(
    (a) => selectedFilter === 'all' || a.status === selectedFilter
  );

  const handleMitigateWithFeedback = (alert: IncidentAlert) => {
    setFeedback(`Executing runbook for ${alert.id}: scaling replica pool & resyncing WAL buffers...`);
    setTimeout(() => {
      onMitigateAlert(alert.id);
      setFeedback(`Incident ${alert.id} resolved: status transitioned to MITIGATED.`);
      setTimeout(() => setFeedback(null), 3000);
    }, 800);
  };

  const getSeverityBadge = (sev: IncidentAlert['severity']) => {
    switch (sev) {
      case 'P0':
        return 'bg-[#F43F5E]/20 text-[#F43F5E] border-[#F43F5E] shadow-[0_0_8px_rgba(244,63,94,0.4)]';
      case 'P1':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      case 'P2':
        return 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]';
      default:
        return 'bg-[#1F2937] text-white border-[#374151]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Alert Threshold Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Active Alert Metric Box */}
        <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#849587] tracking-wider mb-1">
              Active Triage Queue
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-white">
                {alerts.filter((a) => a.status === 'active' || a.status === 'investigating').length}
              </span>
              <span className="font-mono text-xs text-[#F43F5E]">
                UNRESOLVED ANOMALIES
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1F2937] text-[11px] font-mono text-[#849587] flex items-center justify-between">
            <span>SLA Impact Window</span>
            <span className="text-[#00FF9D]">Within MTTR (avg 4.2m)</span>
          </div>
        </div>

        {/* Dynamic Threshold Sliders */}
        <div className="lg:col-span-2 bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-[#849587] tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#06B6D4]" />
              DYNAMIC ALERT THRESHOLD CONTROLLER
            </span>
            <span className="text-[10px] font-mono text-[#00FF9D]">
              AUTO-EVALUATION ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CPU Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-[#dfe2ef] mb-1">
                <span className="text-[#849587]">CPU Core Ceiling:</span>
                <span className="text-[#06B6D4] font-bold">{cpuThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                value={cpuThreshold}
                onChange={(e) => setCpuThreshold(Number(e.target.value))}
                className="w-full accent-[#06B6D4] bg-[#1F2937] h-1.5 rounded-full cursor-pointer"
              />
            </div>

            {/* Memory Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-[#dfe2ef] mb-1">
                <span className="text-[#849587]">Mem OOM Limit:</span>
                <span className="text-[#F59E0B] font-bold">{memThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={memThreshold}
                onChange={(e) => setMemThreshold(Number(e.target.value))}
                className="w-full accent-[#F59E0B] bg-[#1F2937] h-1.5 rounded-full cursor-pointer"
              />
            </div>

            {/* Latency Slider */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-[#dfe2ef] mb-1">
                <span className="text-[#849587]">P99 Latency Limit:</span>
                <span className="text-[#F43F5E] font-bold">{latencyThreshold}ms</span>
              </div>
              <input
                type="range"
                min="10"
                max="250"
                value={latencyThreshold}
                onChange={(e) => setLatencyThreshold(Number(e.target.value))}
                className="w-full accent-[#F43F5E] bg-[#1F2937] h-1.5 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action feedback toast */}
      {feedback && (
        <div className="p-3 bg-[#161B22] border border-[#00FF9D]/40 font-mono text-xs text-[#00FF9D] flex items-center gap-2 rounded-[4px] shadow-[0_0_12px_rgba(0,255,157,0.2)]">
          <Activity className="w-4 h-4 animate-spin text-[#00FF9D]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filter Chips Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase text-[#849587] mr-1">Status:</span>
          {(['all', 'active', 'investigating', 'mitigated'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedFilter(st)}
              className={`px-2.5 py-1 text-[11px] font-mono uppercase rounded-[4px] border transition cursor-pointer ${
                selectedFilter === st
                  ? 'bg-[#0D1117] border-[#06B6D4] text-[#38BDF8] shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                  : 'bg-[#0D1117] border-[#1F2937] text-[#849587] hover:text-[#dfe2ef]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onAddManualIncident({
              id: `INC-${Math.floor(8000 + Math.random() * 1999)}`,
              title: 'Canary build telemetry divergence on mesh gateway',
              severity: 'P2',
              service: 'core-ingress / canary-router-01',
              zone: 'us-east-1a',
              timestamp: 'just now',
              status: 'active',
              impactDescription: 'Synthetic health checks report 3% latency variation across canary routes.',
              suggestedRunbook: 'runbook://ingress/canary-drain.md',
              assignedEngineer: 'sre-canary-bot'
            });
          }}
          className="px-2.5 py-1 text-xs font-mono rounded-[4px] bg-[#161B22] border border-[#1F2937] hover:border-[#00FF9D] text-[#849587] hover:text-[#00FF9D] transition flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>SIMULATE NEW ALERT</span>
        </button>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isResolved = alert.status === 'mitigated';
          const isSilenced = alert.status === 'silenced';

          return (
            <div
              key={alert.id}
              className={`bg-[#0D1117] border rounded-[4px] p-4 transition-all ${
                alert.severity === 'P0'
                  ? 'border-[#F43F5E] shadow-[0_0_12px_rgba(244,63,94,0.18)]'
                  : alert.severity === 'P1'
                  ? 'border-[#F59E0B]/60'
                  : 'border-[#1F2937]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {/* Severity Badge */}
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-[2px] border ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>

                  <span className="font-mono text-sm font-bold text-white">
                    {alert.id}
                  </span>

                  <span className="text-xs font-mono text-[#849587]">
                    • {alert.service} ({alert.zone})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-[#849587] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {alert.timestamp}
                  </span>

                  <span
                    className={`uppercase px-2 py-0.5 rounded-[2px] text-[10px] font-bold border ${
                      alert.status === 'active'
                        ? 'bg-[#F43F5E]/15 text-[#F43F5E] border-[#F43F5E]/30'
                        : alert.status === 'investigating'
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                        : alert.status === 'mitigated'
                        ? 'bg-[#00FF9D]/15 text-[#00FF9D] border-[#00FF9D]/30'
                        : 'bg-[#1F2937] text-[#849587] border-[#374151]'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>

              {/* Title & Impact Description */}
              <div className="mb-3">
                <h4 className="font-mono text-xs font-semibold text-[#dfe2ef] mb-1">
                  {alert.title}
                </h4>
                <p className="font-mono text-xs text-[#849587] leading-relaxed">
                  {alert.impactDescription}
                </p>
              </div>

              {/* Runbook & Actions Strip */}
              <div className="pt-3 border-t border-[#1F2937] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#06B6D4]">
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{alert.suggestedRunbook}</span>
                </div>

                <div className="flex items-center gap-2">
                  {!isResolved && (
                    <>
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-2.5 py-1 rounded-[4px] bg-[#161B22] border border-[#374151] hover:border-[#06B6D4] text-[#E5E7EB] hover:text-[#38BDF8] transition"
                      >
                        ACKNOWLEDGE
                      </button>

                      <button
                        onClick={() => onSilenceAlert(alert.id)}
                        className="px-2.5 py-1 rounded-[4px] bg-[#161B22] border border-[#374151] hover:border-[#F59E0B] text-[#849587] hover:text-[#F59E0B] transition flex items-center gap-1"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>SILENCE 15M</span>
                      </button>

                      {/* Primary Cyber Action: Execute Runbook */}
                      <button
                        onClick={() => handleMitigateWithFeedback(alert)}
                        className="px-3 py-1 rounded-[4px] bg-[#00FF9D] hover:bg-[#00FF9D] text-[#090D16] font-bold transition hover:shadow-[0_0_12px_rgba(0,255,157,0.5)] flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>EXECUTE RUNBOOK</span>
                      </button>
                    </>
                  )}

                  {isResolved && (
                    <span className="text-[#00FF9D] flex items-center gap-1 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      ANOMALY MITIGATED & CLOSED
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-8 text-center bg-[#0D1117] border border-[#1F2937] rounded-[4px] font-mono text-xs text-[#00FF9D]">
            All incidents in this category are nominal. Zero pending active pages.
          </div>
        )}
      </div>
    </div>
  );
};
