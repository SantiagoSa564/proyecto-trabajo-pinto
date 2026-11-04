import React, { useState, useEffect, useRef } from 'react';
import { LogEntry, LogLevel, PodNode } from '../types/telemetry';
import {
  Terminal as TerminalIcon,
  Play,
  Pause,
  Trash2,
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  Flame,
  Search,
  CornerDownLeft
} from 'lucide-react';

interface TerminalConsoleProps {
  logs: LogEntry[];
  pods: PodNode[];
  onClearLogs: () => void;
  onExecuteCommand: (cmd: string) => string;
  isStreaming: boolean;
  setIsStreaming: (stream: boolean) => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  pods,
  onClearLogs,
  onExecuteCommand,
  isStreaming,
  setIsStreaming
}) => {
  const [cliInput, setCliInput] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [commandHistory, setCommandHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'devpulse --version',
      output: 'DevPulse Core Telemetry Engine v4.8.1-release (linux/amd64)\nCluster: prod-cluster-us-east-1 (nominal)'
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const cliInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch =
      logSearch === '' ||
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.source.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.ip && log.ip.includes(logSearch));
    return matchesLevel && matchesSearch;
  });

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = cliInput.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      setCommandHistory([]);
      setCliInput('');
      return;
    }

    const output = onExecuteCommand(trimmed);
    setCommandHistory((prev) => [...prev, { cmd: trimmed, output }]);
    setCliInput('');
    setHistoryIndex(-1);
  };

  const getLevelBadgeClass = (level: LogLevel) => {
    switch (level) {
      case 'INFO':
        return 'text-[#00FF9D] bg-[#00FF9D]/10 border-[#00FF9D]/30';
      case 'WARN':
        return 'text-[#F59E0B] bg-[#F59E0B]/12 border-[#F59E0B]/30';
      case 'ERROR':
      case 'FATAL':
        return 'text-[#F43F5E] bg-[#F43F5E]/15 border-[#F43F5E]/30';
      case 'DEBUG':
        return 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30';
      default:
        return 'text-[#dfe2ef] bg-[#1F2937] border-[#374151]';
    }
  };

  const exportLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devpulse-telemetry-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-3">
      {/* Top Controls & Filter Strip */}
      <div className="bg-[#0D1117] border border-[#1F2937] rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-[#849587] mr-1">Level:</span>
          {['ALL', 'INFO', 'WARN', 'ERROR', 'FATAL', 'DEBUG'].map((lvl) => {
            const isActive = filterLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded-[4px] transition border cursor-pointer ${
                  isActive
                    ? 'bg-[#0D1117] border-[#06B6D4] text-[#38BDF8] shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                    : 'bg-[#0D1117] border-[#1F2937] text-[#849587] hover:text-[#dfe2ef]'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Search within log buffer */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#849587]" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Grep regex / text in logs..."
              className="w-full pl-8 pr-2 py-1 text-xs font-mono bg-[#090D16] border border-[#1F2937] focus:border-[#00FF9D] text-[#dfe2ef] rounded-[4px] focus:outline-none"
            />
          </div>
        </div>

        {/* Streaming Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume button */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-2.5 py-1 text-xs font-mono rounded-[4px] border flex items-center gap-1.5 transition ${
              isStreaming
                ? 'bg-[#161B22] border-[#374151] hover:border-[#F59E0B] text-[#dfe2ef] hover:text-[#F59E0B]'
                : 'bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D]'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3 h-3 text-[#F59E0B]" />
                <span>PAUSE STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#00FF9D]" />
                <span>RESUME</span>
              </>
            )}
          </button>

          {/* Auto scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 text-[11px] font-mono rounded-[4px] border transition ${
              autoScroll
                ? 'bg-[#06B6D4]/15 border-[#06B6D4] text-[#38BDF8]'
                : 'bg-[#090D16] border-[#1F2937] text-[#849587]'
            }`}
          >
            TAIL -F: {autoScroll ? 'ON' : 'OFF'}
          </button>

          {/* Export JSON */}
          <button
            onClick={exportLogsAsJson}
            title="Export buffered logs"
            className="p-1.5 rounded-[4px] bg-[#161B22] border border-[#1F2937] hover:border-[#374151] text-[#849587] hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Buffer */}
          <button
            onClick={onClearLogs}
            title="Clear buffer"
            className="p-1.5 rounded-[4px] bg-[#161B22] border border-[#1F2937] hover:border-[#F43F5E] text-[#849587] hover:text-[#F43F5E] transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="bg-[#090D16] border border-[#1F2937] rounded-[4px] overflow-hidden shadow-2xl flex flex-col h-[520px]">
        {/* Terminal Title Bar */}
        <div className="px-3 py-1.5 bg-[#0D1117] border-b border-[#1F2937] flex items-center justify-between text-xs font-mono select-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF9D]" />
            </div>
            <span className="text-[#849587] ml-2 font-semibold">
              bash / devpulse-telemetry-daemon --session=tty01
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[#849587]">
            <span>BUFFER: {filteredLogs.length} events</span>
            <span className="text-[#1F2937]">|</span>
            <span className="text-[#00FF9D] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
              SOCKET ESTABLISHED
            </span>
          </div>
        </div>

        {/* Command History & Log Stream View */}
        <div className="flex-1 p-3 overflow-y-auto font-mono text-[12px] space-y-1 scanline selection:bg-[#00FF9D]/30">
          {/* Historical interactive commands */}
          {commandHistory.map((item, idx) => (
            <div key={`cmd-${idx}`} className="space-y-1 mb-2 border-b border-[#1F2937]/30 pb-2">
              <div className="flex items-center gap-2 text-[#00FF9D]">
                <span>devops@prod-mesh:~$</span>
                <span className="text-white font-bold">{item.cmd}</span>
              </div>
              <pre className="text-[#849587] whitespace-pre-wrap pl-4 font-mono text-[11px] leading-relaxed">
                {item.output}
              </pre>
            </div>
          ))}

          {/* Interactive Log Stream Lines with Hover & Syntax Highlighting */}
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="py-1 px-1.5 hover:bg-white/[0.03] transition-colors rounded-[2px] flex items-start gap-2.5 leading-relaxed group"
            >
              <span className="text-[#849587] text-[11px] font-mono select-none flex-shrink-0">
                {log.timestamp}
              </span>

              <span
                className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded-[2px] border flex-shrink-0 select-none ${getLevelBadgeClass(
                  log.level
                )}`}
              >
                {log.level}
              </span>

              <span className="text-[#06B6D4] text-[11px] select-none flex-shrink-0">
                [{log.source}]
              </span>

              {log.ip && (
                <span className="text-[#849587] text-[10px] hidden sm:inline select-none flex-shrink-0">
                  {log.ip}
                </span>
              )}

              <span className="text-[#dfe2ef] break-all flex-1">
                {log.message}
              </span>

              {log.latencyMs && (
                <span className="text-[10px] text-[#849587] group-hover:text-[#00FF9D] flex-shrink-0 select-none">
                  {log.latencyMs.toFixed(1)}ms
                </span>
              )}
            </div>
          ))}

          <div ref={logsEndRef} />
        </div>

        {/* CLI Command Input Prompt (Adhering to Query / CLI Input component spec) */}
        <form
          onSubmit={handleCommandSubmit}
          className="p-2.5 bg-[#0D1117] border-t border-[#1F2937] flex items-center gap-2"
        >
          <div className="flex items-center gap-1.5 text-[#00FF9D] font-mono text-sm font-bold pl-1">
            <span>&gt;_</span>
          </div>
          <input
            ref={cliInputRef}
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="Type 'help', 'status', 'top', 'pods', 'kill <pod_id>', 'restart <pod_id>', 'chaos'..."
            className="flex-1 bg-[#090D16] border border-[#1F2937] focus:border-[#00FF9D] focus:shadow-[0_0_0_1px_#00FF9D] text-white px-3 py-1.5 text-xs font-mono rounded-[4px] focus:outline-none transition-all placeholder-[#849587]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#00FF9D] hover:bg-[#00FF9D] text-[#090D16] font-bold text-xs rounded-[4px] transition hover:shadow-[0_0_12px_rgba(0,255,157,0.5)] flex items-center gap-1 font-mono"
          >
            <span>EXEC</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Suggested Quick CLI Commands Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-[#849587]">
        <span className="text-[10px] uppercase text-[#849587] mr-1">Quick Commands:</span>
        {[
          'help',
          'status',
          'top',
          'pods',
          'bench',
          'sysinfo',
          'clear'
        ].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setCliInput(cmd);
              if (cliInputRef.current) cliInputRef.current.focus();
            }}
            className="px-2 py-0.5 rounded-[3px] bg-[#161B22] border border-[#1F2937] hover:border-[#06B6D4] hover:text-[#38BDF8] transition cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
};
