import React from 'react';
import { Packet } from '../types';
import { format } from 'date-fns';

interface PacketListProps {
  packets: Packet[];
  onSelect?: (packet: Packet) => void;
}

export const PacketList: React.FC<PacketListProps> = ({ packets, onSelect }) => {
  return (
    <div className="border border-[#141414] bg-white overflow-hidden flex flex-col h-full rounded-sm">
      <div className="grid grid-cols-[60px_1.5fr_1fr_1fr_2fr] bg-[#141414] text-[#E4E3E0] py-2 px-4 text-[10px] uppercase font-mono tracking-wider sticky top-0 z-10">
        <div>No.</div>
        <div>Protocol</div>
        <div>Source</div>
        <div>Destination</div>
        <div>Info</div>
      </div>
      
      <div className="flex-1 overflow-auto divide-y divide-[#141414]/10 scrollbar-thin">
        {packets.length === 0 ? (
          <div className="flex items-center justify-center h-full opacity-30 font-mono text-xs p-10 text-center">
            NO PACKETS RECORDED IN CURRENT SESSION
          </div>
        ) : (
          packets.map((packet) => (
            <div 
              key={packet.id}
              onClick={() => onSelect?.(packet)}
              className="grid grid-cols-[60px_1.5fr_1fr_1fr_2fr] py-3 px-4 text-[11px] font-mono hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors cursor-pointer group"
            >
              <div className="opacity-50">{packet.id}</div>
              <div className="font-bold flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${getProtocolColor(packet.protocol)}`}></span>
                {packet.protocol}
              </div>
              <div className="truncate pr-2">{packet.source}</div>
              <div className="truncate pr-2">{packet.destination}</div>
              <div className="truncate opacity-70 group-hover:opacity-100">{packet.info}</div>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-[#F8F7F4] border-t border-[#141414] py-1 px-4 text-[9px] font-mono opacity-50 flex justify-between">
        <span>TOTAL_CAPTURED: {packets.length}</span>
        <span>BUFFER_STATUS: NOMINAL</span>
      </div>
    </div>
  );
};

const getProtocolColor = (proto: string) => {
  switch (proto.toUpperCase()) {
    case 'HTTP': return 'bg-blue-500';
    case 'HTTPS':
    case 'TLS': return 'bg-purple-500';
    case 'TCP': return 'bg-slate-400';
    case 'UDP': return 'bg-amber-400';
    case 'DNS': return 'bg-green-500';
    case 'ARP': return 'bg-orange-500';
    case 'ICMP': return 'bg-red-500';
    default: return 'bg-gray-300';
  }
};
