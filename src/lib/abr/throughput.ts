export function createThroughputEstimator(smoothing = 0.3) {
  let estimateKbps = 0
  return {
    record(sampleKbps: number) {
      estimateKbps =
        estimateKbps === 0 ? sampleKbps : smoothing * sampleKbps + (1 - smoothing) * estimateKbps
      return estimateKbps
    },
    estimate: () => estimateKbps,
  }
}