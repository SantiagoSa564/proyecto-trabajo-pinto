import React, { useState } from 'react';
import { NetworkZoneLatency } from '../types/telemetry';
import {
  Network,
  Radio,
  Wifi,
  Zap,
  Shield,
  Activity,
  ArrowRightLeft,
  Server
} from 'lucide-react';
import { Sparkline } from './Sparkline';

interface NetworkMeshProps {
  latencies: NetworkZoneLatency[];
}

export const NetworkMesh: React.FC<NetworkMeshProps> = ({ latencies }) => {
  const [circuitBreakers, setCircuitBreakers] = useState<Record<string, boolean>>({
    'us-east-1a_to_us-east-1b': true,
    'us-east-1a_to_us-east-1c': true,
    'us-east-1b_to_us-east-1c': true,
    'us-east-1a_to_eu-west-1a (WAN)': true,
    'us-east-1a_to_ap-northeast-1 (WAN)': true
  });

  const [pingTarget, setPingTarget] = useState<string>('us-east-1b');
  const [pingResults, setPingResults] = useState<string[]>([]);
  const [isPinging, setIsPinging] = useState(false);

  const toggleCircuitBreaker = (key: string) => {
    setCircuitBreakers((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const runSyntheticPing = () => {
    setIsPinging(true);
    setPingResults(['PING 10.244.2.1: 56 data bytes...']);

    const times = [0.48, 0.52, 0.61, 0.49];
    times.forEach((t, i) => {
      setTimeout(() => {
        setPingResults((prev) => [
          ...prev,
          `64 bytes from 10.244.2.1: icmp_seq=${i + 1} ttl=64 time=${t} ms`
        ]);
        if (i === times.length - 1) {
          setIsPinging(false);
        }
      }, (i + 1) * 350);
    });
  };

  return (
    <div className="space-y-4">
      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#849587] mb-1">
            <span>Mesh Topology State</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-beacon" />
          </div>
          <div className="font-mono text-xl font-bold text-white">Full-Mesh eBPF</div>
          <div className="text-[11px] font-mono text-[#06B6D4] mt-1">Cilium vxlan / WireGuard</div>
        </div>

        <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#849587] mb-1">
            <span>Global Ingress Throughput</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
          </div>
          <div className="font-mono text-xl font-bold text-white">64.4 Gbps</div>
          <div className="text-[11px] font-mono text-[#00FF9D] mt-1">▲ 4.2% vs 1h baseline</div>
        </div>

        <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#849587] mb-1">
            <span>Average Intra-AZ RTT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D]" />
          </div>
          <div className="font-mono text-xl font-bold text-white">0.76 ms</div>
          <div className="text-[11px] font-mono text-[#849587] mt-1">Jitter: &lt; 0.05ms</div>
        </div>
      </div>

      {/* Latency Matrix & Circuit Breaker Table */}
      <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] overflow-hidden">
        <div className="p-3 bg-[#090D16] border-b border-[#1F2937] flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
            <ArrowRightLeft className="w-4 h-4 text-[#06B6D4]" />
            <span>INTER-AVAILABILITY ZONE LATENCY & FABRIC ROUTES</span>
          </div>
          <div className="text-[10px] font-mono text-[#849587]">
            PROTOCOL: TCP / BBRv3 congestion control
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0a0e17] text-[#849587] text-[10px] uppercase border-b border-[#1F2937]">
              <tr>
                <th className="p-3">Source Zone</th>
                <th className="p-3">Target Zone</th>
                <th className="p-3">RTT Latency</th>
                <th className="p-3">Packet Loss</th>
                <th className="p-3">Current Bandwidth</th>
                <th className="p-3">Health Status</th>
                <th className="p-3 text-right">Circuit Breaker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50">
              {latencies.map((row) => {
                const cbKey = `${row.fromZone}_to_${row.toZone}`;
                const isEnabled = circuitBreakers[cbKey] ?? true;

                return (
                  <tr key={cbKey} className="hover:bg-white/[0.02] transition">
                    <td className="p-3 font-semibold text-white">{row.fromZone}</td>
                    <td className="p-3 text-[#06B6D4]">{row.toZone}</td>
                    <td className="p-3">
                      <span className={`font-bold ${row.latencyMs > 20 ? 'text-[#06B6D4]' : 'text-[#00FF9D]'}`}>
                        {row.latencyMs} ms
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={row.packetLoss > 0.05 ? 'text-[#F59E0B]' : 'text-[#849587]'}>
                        {row.packetLoss}%
                      </span>
                    </td>
                    <td className="p-3 text-[#dfe2ef]">{row.bandwidthUsageGbps} Gbps</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-[2px] border ${
                          row.status === 'optimal'
                            ? 'bg-[#00FF9D]/10 text-[#00FF9D] border-[#00FF9D]/30'
                            : 'bg-[#F59E0B]/12 text-[#F59E0B] border-[#F59E0B]/30'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {/* Hardware-Style Toggle Switch (32x16px track in #1F2937, active #06B6D4) */}
                      <button
                        onClick={() => toggleCircuitBreaker(cbKey)}
                        className={`inline-block w-8 h-4 rounded-full relative transition-colors duration-200 cursor-pointer ${
                          isEnabled
                            ? 'bg-[#06B6D4] shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                            : 'bg-[#1F2937]'
                        }`}
                        title={isEnabled ? 'Route Active' : 'Circuit Tripped'}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
                            isEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthetic Ping Diagnostic Console */}
      <div className="bg-[#090D16] border border-[#1F2937] rounded-[4px] p-3 font-mono text-xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#1F2937]">
          <span className="text-[#849587] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#00FF9D]" />
            ICMP SYNTHETIC PROBE RUNNER
          </span>

          <div className="flex items-center gap-2">
            <select
              value={pingTarget}
              onChange={(e) => setPingTarget(e.target.value)}
              className="bg-[#0D1117] border border-[#1F2937] text-white text-xs px-2 py-1 rounded-[4px] focus:outline-none"
            >
              <option value="us-east-1b">Target: us-east-1b (10.244.2.1)</option>
              <option value="us-east-1c">Target: us-east-1c (10.244.3.1)</option>
              <option value="eu-west-1a">Target: eu-west-1a WAN</option>
            </select>

            <button
              onClick={runSyntheticPing}
              disabled={isPinging}
              className="px-3 py-1 bg-[#161B22] border border-[#374151] hover:border-[#00FF9D] text-[#E5E7EB] hover:text-[#00FF9D] rounded-[4px] transition text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isPinging ? 'TRANSMITTING...' : 'SEND PROBE (4 PINGS)'}
            </button>
          </div>
        </div>

        <div className="p-2.5 bg-[#0a0e17] rounded-[4px] border border-[#1F2937]/70 text-[11px] space-y-1 min-h-[90px]">
          {pingResults.length === 0 ? (
            <span className="text-[#849587]">
              Ready. Click &apos;SEND PROBE&apos; to trigger ICMP latency evaluation across VPC peering links.
            </span>
          ) : (
            pingResults.map((line, idx) => (
              <div key={idx} className="text-[#00FF9D]">
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
