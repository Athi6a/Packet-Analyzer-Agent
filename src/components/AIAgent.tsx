import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Packet, ProtocolStats } from '../types';
import { Sparkles, Loader2, Bot, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIAgentProps {
  packets: Packet[];
  stats: ProtocolStats[];
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const AIAgent: React.FC<AIAgentProps> = ({ packets, stats }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeTraffic = async () => {
    if (packets.length === 0) return;
    setLoading(true);
    
    try {
      const summary = stats.map(s => `${s.name}: ${s.count} packets`).join(', ');
      const packetSamples = packets.slice(0, 10).map(p => 
        `[${p.protocol}] ${p.source} -> ${p.destination} (${p.length} bytes)`
      ).join('\n');

      const prompt = `
        You are a Network Security AI expert. Analyze the following packet capture summary:
        Protocol Stats: ${summary}
        Total Packets: ${packets.length}
        
        Recent Packet Samples:
        ${packetSamples}
        
        Provide a concise technical analysis of the traffic. 
        Focus on:
        1. Protocol health (is there an unusual amount of any protocol?)
        2. Potential security insights (e.g. high DNS, unusual TLS patterns)
        3. A brief recommendation for the network admin.
        
        Keep it professional, data-driven, and highly technical. Use markdown with bold headers.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });

      setAnalysis(response.text || 'Analysis failed to generate.');
    } catch (error) {
      console.error(error);
      setAnalysis('Error connecting to intelligence engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-[#141414] bg-[#F8F7F4] p-6 rounded-sm shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h2 className="font-serif italic text-lg">Traffic Analysis Report</h2>
        </div>
        <button 
          onClick={analyzeTraffic}
          disabled={loading || packets.length === 0}
          className="flex items-center gap-2 bg-[#141414] text-[#E4E3E0] px-4 py-2 rounded-sm text-xs font-mono uppercase hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
          Analyze Traffic
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {!analysis && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center opacity-40"
            >
              <Cpu size={48} strokeWidth={1} className="mb-4" />
              <p className="font-mono text-xs max-w-[200px]">Intelligence engine standby. Awaiting packet data for behavioral analysis.</p>
            </motion.div>
          ) : loading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-[#E4E3E0] animate-pulse rounded-sm w-full" style={{ width: `${100 - i * 10}%` }} />
              ))}
              <p className="font-mono text-[10px] uppercase opacity-50 text-center mt-8">Decrypting patterns...</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-xs font-sans text-sm leading-relaxed"
            >
              <div dangerouslySetInnerHTML={{ __html: analysis?.replace(/\n/g, '<br/>') || '' }} />
              
              <div className="mt-8 pt-4 border-t border-[#141414]/10 flex items-center gap-2 text-[10px] font-mono text-red-600">
                <ShieldAlert size={12} />
                <span>CONFIDENTIAL SECURITY REPORT</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
