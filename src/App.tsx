/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Activity, Shield, Terminal, Download, Upload, Trash2, Search, Filter, Info, Package } from 'lucide-react';
import { Packet, ProtocolStats } from './types';
import { parsePcap, generateMockPackets } from './utils/pcapParser';
import { PacketList } from './components/PacketList';
import { ProtocolChart } from './components/ProtocolChart';
import { AIAgent } from './components/AIAgent';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const map = new Map<string, { count: number; bytes: number }>();
    packets.forEach(p => {
      const current = map.get(p.protocol) || { count: 0, bytes: 0 };
      map.set(p.protocol, {
        count: current.count + 1,
        bytes: current.bytes + p.length
      });
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.count - a.count);
  }, [packets]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parsePcap(buffer);
      setPackets(parsed);
    } catch (err: any) {
      console.error('Parsing error:', err);
      setError(err.message || 'Failed to parse file');
      setPackets([]); // Explicitly clear on error
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.tcpdump.pcap': ['.pcap', '.cap', '.pcapng'],
      'application/octet-stream': ['.pcap', '.pcapng']
    },
    multiple: false
  });

  const loadSample = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setPackets(generateMockPackets(100));
      setLoading(false);
    }, 500);
  };

  const clearData = () => {
    setPackets([]);
    setSelectedPacket(null);
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Navbar */}
      <nav className="border-b border-[#141414] px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] text-[#E4E3E0] p-1.5 rounded-sm">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="font-serif italic text-xl tracking-tight leading-none">Packet Analyzer Agent</h1>
            <p className="font-mono text-[9px] uppercase tracking-tighter opacity-50">Packet Intelligence Systems v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 font-mono text-[10px] uppercase opacity-60">
            <span className="flex items-center gap-1.5"><Shield size={12} /> SECURE_NODE: ACTIVE</span>
            <span className="flex items-center gap-1.5"><Terminal size={12} /> LOG_LEVEL: VERBOSE</span>
          </div>
          <button 
            onClick={clearData}
            className="hover:text-red-600 transition-colors"
            title="Clear Analysis"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </nav>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Column: Input & Overview */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          
          {/* Dropzone */}
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed border-[#141414] rounded-sm p-8 text-center cursor-pointer transition-all
              ${isDragActive ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white hover:border-solid hover:bg-[#F8F7F4]'}
            `}
          >
            <input {...getInputProps()} />
            <Upload size={32} className="mx-auto mb-4 opacity-50" />
            <p className="font-serif italic text-sm mb-1">
              {isDragActive ? 'Drop PCAP here' : 'Select Network Trace'}
            </p>
            <p className="font-mono text-[10px] uppercase opacity-40">PCAP / PCAPNG Supported</p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={loadSample}
              className="flex-1 bg-[#141414] text-[#E4E3E0] py-3 rounded-sm font-mono text-[10px] uppercase tracking-widest hover:bg-[#333] transition-colors"
            >
              Load Protocol Sample
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm flex items-start gap-3">
              <Info className="text-red-500 shrink-0" size={16} />
              <p className="text-xs text-red-700 font-mono italic">{error}</p>
            </div>
          )}

          {/* Stats Summary */}
          <div className="bg-white border border-[#141414] p-4 rounded-sm space-y-4">
             <h3 className="font-serif italic text-xs uppercase opacity-50 tracking-widest">Traffic Metrics</h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F8F7F4] border border-[#141414]/10">
                  <div className="font-mono text-[10px] opacity-50 uppercase">Total Packets</div>
                  <div className="font-serif text-2xl font-bold">{packets.length}</div>
                </div>
                <div className="p-3 bg-[#F8F7F4] border border-[#141414]/10">
                  <div className="font-mono text-[10px] opacity-50 uppercase">Protocols</div>
                  <div className="font-serif text-2xl font-bold">{stats.length}</div>
                </div>
             </div>
             
             <div className="space-y-2 mt-4 pt-4 border-t border-[#141414]/10">
               {stats.slice(0, 5).map(stat => (
                 <div key={stat.name} className="flex justify-between items-end">
                   <span className="font-mono text-[10px] uppercase font-bold">{stat.name}</span>
                   <div className="flex-1 border-b border-dotted border-[#141414] mx-2 mb-1 opacity-20"></div>
                   <span className="font-mono text-[10px]">{stat.count}</span>
                 </div>
               ))}
             </div>
          </div>

          <ProtocolChart stats={stats} />
        </div>

        {/* Center/Right Column: Packets & AI */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
             {/* Packet List */}
             <div className="h-full">
                <PacketList 
                  packets={packets} 
                  onSelect={setSelectedPacket}
                />
             </div>

             {/* AI Agent */}
             <div className="h-full">
                <AIAgent packets={packets} stats={stats} />
             </div>
          </div>

          {/* Packet Details (Inspector) */}
          <AnimatePresence>
            {selectedPacket && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#141414] text-[#E4E3E0] p-6 rounded-sm font-mono overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                  <h3 className="uppercase text-xs tracking-widest flex items-center gap-2">
                    <Package size={14} /> Packet Inspector: #{selectedPacket.id}
                  </h3>
                  <button onClick={() => setSelectedPacket(null)} className="opacity-50 hover:opacity-100 uppercase text-[10px]">Close X</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                      <span className="opacity-40">TIMESTAMP</span>
                      <span>{new Date(selectedPacket.timestamp).toISOString()}</span>
                      <span className="opacity-40">PROTOCOL</span>
                      <span className="text-blue-400 font-bold">{selectedPacket.protocol}</span>
                      <span className="opacity-40">LENGTH</span>
                      <span>{selectedPacket.length} bytes</span>
                      <span className="opacity-40">SOURCE_ADDR</span>
                      <span>{selectedPacket.source}</span>
                      <span className="opacity-40">DEST_ADDR</span>
                      <span>{selectedPacket.destination}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-sm">
                    <span className="text-[10px] opacity-40 uppercase block mb-3">Hex Dump (Heuristic)</span>
                    <div className="grid grid-cols-8 gap-1 opacity-80">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <div key={i} className="text-[10px] text-center">
                          {Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state visual */}
          {packets.length === 0 && (
            <div className="h-[300px] flex items-center justify-center border-2 border-dotted border-[#141414]/20 rounded-sm">
              <div className="text-center opacity-20 group">
                <Search size={40} className="mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-serif italic">Awaiting Signal Ingest</p>
                <p className="font-mono text-[10px] uppercase">Upload PCAP or generate simulation to begin analysis</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-[#141414] p-6 bg-white flex flex-col md:flex-row justify-between items-center gap-4 opacity-50">
        <p className="font-mono text-[10px] uppercase">© 2026 NetLens Systems | All signal data processed locally</p>
        <div className="flex gap-4 font-mono text-[10px] uppercase">
          <span className="flex items-center gap-1"><Info size={12} /> Privacy Policy</span>
          <span>System Manual v1.2</span>
        </div>
      </footer>
    </div>
  );
}
