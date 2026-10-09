export interface AbrLevel {
  bitrateKbps: number
  utility: number
}

export type AbrAlgorithmName = 'bola' | 'bba0' | 'dynamic'

export interface AbrLadderConfig {
  segmentDuration: number
  levels: AbrLevel[]
}

export interface AbrContext {
  bufferSeconds: number
  lastBitrateKbps: number
  throughputKbps?: number
}

export interface AbrDecision {
  index: number
  bitrateKbps: number
}

export interface SimulationResult {
  algorithm: AbrAlgorithmName
  segments: number
  rebufferRatio: number
  averageBitrateKbps: number
  switches: number
  stalls: number
  finalBufferSeconds: number
}

export interface AbrInstrumentationSnapshot {
  algorithm: AbrAlgorithmName
  bufferSeconds: number
  throughputKbps: number
  suggestedIndex: number
  suggestedBitrateKbps: number
  /** Level the engine confirms is playing, or null when unknown. */
  appliedIndex: number | null
  history: Array<{ index: number; bitrateKbps: number }>
  metrics: {
    switches: number
    averageBitrateKbps: number
    uptimeSeconds: number
    bytesLoaded: number
  }
}