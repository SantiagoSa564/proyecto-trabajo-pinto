import React from 'react';
import { X, Zap, AlertTriangle, ShieldCheck, Flame, ServerCrash } from 'lucide-react';

interface ChaosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectChaos: (scenario: 'wal_lag' | 'cfs_throttle' | 'oom_kill' | 'az_loss' | 'reset') => void;
}

export const ChaosModal: React.FC<ChaosModalProps> = ({
  isOpen,
  onClose,
  onInjectChaos
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#0D1117] border border-[#F43F5E] rounded-[8px] p-5 shadow-[0_12px_32px_-8px_#000000,0_0_20px_rgba(244,63,94,0.3)]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-[#F43F5E]/20 text-[#F43F5E]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white tracking-tight">
                CHAOS ENGINEERING INJECTION SUITE
              </h3>
              <p className="text-[11px] font-mono text-[#849587]">
                Simulate production failures to test auto-healing & telemetry response
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#849587] hover:text-white rounded-[4px] hover:bg-[#161B22]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chaos Options */}
        <div className="space-y-2.5 my-4">
          <button
            onClick={() => {
              onInjectChaos('wal_lag');
              onClose();
            }}
            className="w-full p-3 text-left rounded-[4px] bg-[#090D16] border border-[#1F2937] hover:border-[#F59E0B] hover:bg-[#161B22] transition group"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#F59E0B] mb-0.5">
              <span>SPIKE DB WAL REPLICATION LAG (P1)</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] font-mono text-[#849587]">
              Forces 1,420ms lag on `pg-us1c-replica`, triggering incident queue & replica alert.
            </p>
          </button>

          <button
            onClick={() => {
              onInjectChaos('cfs_throttle');
              onClose();
            }}
            className="w-full p-3 text-left rounded-[4px] bg-[#090D16] border border-[#1F2937] hover:border-[#F43F5E] hover:bg-[#161B22] transition group"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#F43F5E] mb-0.5">
              <span>CFS CPU SATURATION ON ENVOY INGRESS (P2)</span>
              <Flame className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] font-mono text-[#849587]">
              Saturates `ing-us1b-02` CPU to 96% and triggers CFS bandwidth throttle warnings.
            </p>
          </button>

          <button
            onClick={() => {
              onInjectChaos('oom_kill');
              onClose();
            }}
            className="w-full p-3 text-left rounded-[4px] bg-[#090D16] border border-[#1F2937] hover:border-[#F43F5E] hover:bg-[#161B22] transition group"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#F43F5E] mb-0.5">
              <span>SIMULATE TENSOR OOM CRASH & RESTART (P0)</span>
              <ServerCrash className="w-3.5 h-3.5" />
            </div>
            <p className="text-[11px] font-mono text-[#849587]">
              Exceeds cgroup memory watermark on inference-mesh and forces immediate container exit.
            </p>
          </button>

          <button
            onClick={() => {
              onInjectChaos('reset');
              onClose();
            }}
            className="w-full p-3 text-left rounded-[4px] bg-[#00FF9D]/10 border border-[#00FF9D]/40 hover:bg-[#00FF9D]/20 transition group"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-[#00FF9D] mb-0.5">
              <span>RESET ALL TO 100% NOMINAL STATE</span>
              <ShieldCheck className="w-4 h-4 text-[#00FF9D]" />
            </div>
            <p className="text-[11px] font-mono text-[#849587]">
              Evacuate synthetic alarms, restart degraded pods, and restore baseline telemetry.
            </p>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1F2937] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-[4px] bg-[#161B22] border border-[#374151] hover:border-[#849587] text-[#dfe2ef] font-mono text-xs transition"
          >
            CANCEL
          </button>
        </div>

      </div>
    </div>
  );
};
