'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Activity, Terminal, Shield, MessageSquare, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentLogsWorkspace() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/orchestrator');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getAgentIcon = (agent: string) => {
    if (agent.includes('Admin')) return <Shield className="h-4 w-4 text-blue-500" />;
    if (agent.includes('Customer')) return <MessageSquare className="h-4 w-4 text-green-500" />;
    if (agent.includes('Bake')) return <Flame className="h-4 w-4 text-orange-500" />;
    return <Terminal className="h-4 w-4 text-purple-500" />;
  };

  return (
    <div className="flex flex-col gap-6 w-full h-[600px]">
      <div className="flex items-center justify-between border-b border-bakery-wheat/30 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-bakery-amber" />
          <h2 className="text-lg font-serif font-bold text-bakery-charcoal">Live Agent Orchestration</h2>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 bg-bakery-wheat/40 hover:bg-bakery-wheat/60 px-4 py-2 rounded-xl text-xs font-bold uppercase"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Terminals
        </button>
      </div>

      <div className="flex-1 bg-black/90 rounded-2xl p-6 font-mono text-sm overflow-y-auto shadow-inner border border-bakery-wheat/20 flex flex-col gap-4 relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />
        
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-4 opacity-50">
            <Terminal className="h-8 w-8 text-white" />
            <span className="text-white">Awaiting orders to awaken Agents...</span>
          </div>
        ) : (
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="flex flex-col gap-1 text-green-400"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  {getAgentIcon(log.agent)}
                  <span className="font-bold text-white">{log.agent}</span>
                  <span className="text-gray-400">»</span>
                  <span className="text-blue-300 font-semibold">{log.action}</span>
                </div>
                <div className="pl-[88px] text-gray-300 text-xs">
                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
