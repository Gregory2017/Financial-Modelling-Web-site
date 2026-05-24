/**
 * Mathematics core for extreme value statistics.
 * Computes the Hill Estimator for heavy-tail Pareto-like crypto distributions.
 */

export interface HillPlotPoint {
  k: number;
  alpha: number;
  H: number;
  thresholdValue: number;
}

export interface HillAnalysisResult {
  pricesCount: number;
  returnsCount: number;
  minReturn: number;
  maxReturn: number;
  meanReturn: number;
  stdDevReturn: number;
  plotPoints: HillPlotPoint[];
  optimalAlpha: number; // calculated at standard heuristic k = sqrt(n)
  optimalK: number;
}

/**
 * Calculates absolute log returns from a series of chronological prices:
 * R_t = |ln(P_t / P_{t-1})|
 * Ignores zero-variance returns to protect extreme value index logarithms.
 */
export function getAbsoluteLogReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const pPrev = prices[i - 1];
    const pCurr = prices[i];
    if (pPrev > 0 && pCurr > 0) {
      const r = Math.abs(Math.log(pCurr / pPrev));
      if (r > 1e-8) {
        returns.push(r);
      }
    }
  }
  return returns;
}

/**
 * Executes Hill Estimator calculation across all available order statistics.
 * For a given k upper order statistics, Hill Estimator is:
 * H(k) = (1/k) * sum_{i=1}^k [ ln(X_{n-i+1}) ] - ln(X_{n-k})
 * Tail Exponent alpha(k) = 1 / H(k)
 */
export function analyzeHillEstimator(prices: number[]): HillAnalysisResult | null {
  const returns = getAbsoluteLogReturns(prices);
  if (returns.length < 3) {
    return null;
  }

  // Sort returns in ascending order to create order statistics
  const sorted = [...returns].sort((a, b) => a - b);
  const n = sorted.length;

  const plotPoints: HillPlotPoint[] = [];
  
  // Calculate stats for returns
  const sum = returns.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;
  const sqDiffSum = returns.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const stdDev = Math.sqrt(sqDiffSum / n);
  const maxVal = sorted[n - 1];
  const minVal = sorted[0];

  // We loop k from 1 upward to n - 1
  for (let k = 1; k < n; k++) {
    // k is the number of upper order statistics to use
    // The k largest observations are at index n - 1, n - 2, ..., n - k
    // The threshold is at sorted[n - k - 1]
    let logSum = 0;
    for (let i = 1; i <= k; i++) {
      logSum += Math.log(sorted[n - i]);
    }
    const logThreshold = Math.log(sorted[n - k - 1]);
    const H = (logSum / k) - logThreshold;
    
    // Avoid division by zero
    const alpha = H > 0 ? 1 / H : 0;
    
    plotPoints.push({
      k,
      alpha,
      H,
      thresholdValue: sorted[n - k - 1]
    });
  }

  // A standard heuristic selection for optimal k in extreme value theory is k = floor(sqrt(n))
  const optimalK = Math.max(1, Math.min(Math.floor(Math.sqrt(n)), n - 1));
  const optimalPoint = plotPoints.find(p => p.k === optimalK) || plotPoints[0];

  return {
    pricesCount: prices.length,
    returnsCount: n,
    minReturn: minVal,
    maxReturn: maxVal,
    meanReturn: mean,
    stdDevReturn: stdDev,
    plotPoints,
    optimalAlpha: optimalPoint ? optimalPoint.alpha : 0,
    optimalK
  };
}

// Interactive baseline datasets of crypto tail risk presets
export interface SandboxDataset {
  id: string;
  name: string;
  asset: string;
  description: string;
  prices: number[];
}

export const SANDBOX_DATASETS: SandboxDataset[] = [
  {
    id: "btc_black_thursday",
    name: "BTC Black Thursday Crash (Mar 2020)",
    asset: "BTC-USD",
    description: "An extreme panic event with extreme daily price deviations. Shows classic heavy-tail convergence on high volatility.",
    prices: [
      9130, 8910, 8750, 8820, 8640, 8100, 7920, 7810, 7950, 8120, 
      7900, 7450, 4830, 5620, 5180, 5390, 6180, 6240, 5800, 6410, 
      6630, 6500, 6720, 6840, 6680, 6420, 5920, 6180, 6220, 6420
    ]
  },
  {
    id: "ton_extreme_2024",
    name: "TON Liquidity Shock (Aug 2024)",
    asset: "TON-USD",
    description: "Sudden high-volume price drops and rebounds. Perfect for testing power-law tails on newer high-risk liquid tokens.",
    prices: [
      6.82, 6.75, 6.69, 6.81, 6.78, 6.55, 5.24, 5.42, 5.15, 5.38, 
      5.60, 5.52, 5.12, 5.34, 5.21, 5.48, 5.39, 4.88, 5.12, 5.29, 
      5.32, 5.45, 5.62, 5.70, 5.58, 5.65, 5.82, 5.78, 5.91, 6.10
    ]
  },
  {
    id: "synthetic_power_law",
    name: "Synthetic High-Fat Pareto (α ≈ 1.35)",
    asset: "SIM-DEV",
    description: "Simulated mathematical Pareto sequence generated with high-risk parameters. Highly persistent extreme spikes.",
    prices: [
      100.0, 102.3, 98.1, 105.6, 114.2, 112.0, 101.5, 95.2, 118.4, 98.6,
      135.2, 131.0, 122.5, 128.9, 105.1, 158.4, 151.2, 142.0, 112.5, 105.3,
      109.8, 115.4, 112.1, 230.5, 221.0, 198.4, 185.2, 192.1, 164.0, 312.4,
      289.1, 256.2, 271.8, 243.5, 250.2, 212.1, 195.4, 210.5, 205.1, 495.2,
      450.1, 412.3, 428.9, 395.2, 381.0, 392.4, 375.1, 362.4, 381.5, 580.4
    ]
  }
];

/**
 * Interprets a tail exponent (alpha) into intuitive, high-end visual alerts
 */
export function getTailRiskLabel(alpha: number): {
  badge: string;
  class: string;
  description: string;
  color: string;
} {
  if (alpha <= 0) {
    return {
      badge: "Calculating",
      class: "bg-neutral-800 text-text-dim border-neutral-700",
      description: "Insufficient variance or returns recorded.",
      color: "text-text-dim"
    };
  }
  if (alpha < 1.5) {
    return {
      badge: "Levy Dynamic Danger",
      class: "bg-rose-500/10 text-rose-500 border-rose-500/30",
      description: "Extremely heavy-tailed with infinite mathematical variance. High probability of recurring server-wide liquidity crashes and 30%+ single-day slip-downs.",
      color: "text-rose-500"
    };
  }
  if (alpha < 2.5) {
    return {
      badge: "Heavy Risk Pareto",
      class: "bg-amber-500/15 text-amber-500 border-amber-500/30",
      description: "Fat-tailed distribution. Extreme 4-sigma and 5-sigma market events occur 100x more frequently than under traditional Gaussian Models.",
      color: "text-amber-500"
    };
  }
  if (alpha < 4.0) {
    return {
      badge: "Moderate Fat-tail",
      class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      description: "Standard power-law tail. Comparable to common equity baskets. Risk decays relatively smoothly, but still contains rare black-swan shock potential.",
      color: "text-emerald-500"
    };
  }
  return {
    badge: "Gaussian Normal Decay",
    class: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    description: "Thin or exponential tail decay. Extreme risks are well-behaved and safely predictable under standard deviation models.",
    color: "text-sky-500"
  };
}
