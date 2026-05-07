export interface Packet {
  id: number;
  timestamp: number;
  length: number;
  protocol: string;
  source: string;
  destination: string;
  info: string;
  rawData?: Uint8Array;
}

export interface ProtocolStats {
  name: string;
  count: number;
  bytes: number;
}

export interface AnalysisResult {
  summary: string;
  anomalies: string[];
  recommendations: string[];
}
