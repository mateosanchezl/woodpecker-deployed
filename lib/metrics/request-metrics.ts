import { AsyncLocalStorage } from "node:async_hooks";

interface RequestMetricContext {
  prismaOperations: number;
}

interface RouteMetricSummary {
  durationMs: number;
  prismaOperations: number;
}

interface RouteSample {
  durationMs: number;
  prismaOperations: number;
}

interface MetricsStore {
  routeSamples: Map<string, RouteSample[]>;
}

const MAX_SAMPLES_PER_ROUTE = 200;
const requestMetricContext = new AsyncLocalStorage<RequestMetricContext>();

function getMetricsStore(): MetricsStore {
  const globalWithMetrics = globalThis as typeof globalThis & {
    __requestMetricsStore?: MetricsStore;
  };

  if (!globalWithMetrics.__requestMetricsStore) {
    globalWithMetrics.__requestMetricsStore = {
      routeSamples: new Map<string, RouteSample[]>(),
    };
  }

  return globalWithMetrics.__requestMetricsStore;
}

function percentile(values: number[], target: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(target * sorted.length) - 1),
  );
  return sorted[index];
}

function pushSample(routeName: string, sample: RouteSample): {
  p50: number;
  p95: number;
} {
  const store = getMetricsStore();
  const samples = store.routeSamples.get(routeName) ?? [];

  samples.push(sample);
  if (samples.length > MAX_SAMPLES_PER_ROUTE) {
    samples.shift();
  }

  store.routeSamples.set(routeName, samples);

  const durations = samples.map((entry) => entry.durationMs);

  return {
    p50: percentile(durations, 0.5),
    p95: percentile(durations, 0.95),
  };
}

export function incrementPrismaOperationCount(): void {
  const store = requestMetricContext.getStore();
  if (!store) return;
  store.prismaOperations += 1;
}

function applyMetricHeaders(
  response: Response,
  routeName: string,
  summary: RouteMetricSummary,
) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  response.headers.set("x-route-metrics-route", routeName);
  response.headers.set(
    "x-route-metrics-duration-ms",
    summary.durationMs.toFixed(2),
  );
  response.headers.set(
    "x-route-metrics-prisma-ops",
    String(summary.prismaOperations),
  );
}

export async function withRouteMetrics<T>(
  routeName: string,
  operation: () => Promise<T>,
): Promise<T> {
  const start = Date.now();

  return requestMetricContext.run({ prismaOperations: 0 }, async () => {
    let result: T | undefined;

    try {
      result = await operation();
      return result;
    } finally {
      const store = requestMetricContext.getStore();
      const durationMs = Number((Date.now() - start).toFixed(2));
      const prismaOperations = store?.prismaOperations ?? 0;
      const stats = pushSample(routeName, { durationMs, prismaOperations });
      const summary = { durationMs, prismaOperations };

      console.info(
        `[route-metrics] ${routeName} durationMs=${durationMs} prismaOps=${prismaOperations} p50=${stats.p50.toFixed(2)} p95=${stats.p95.toFixed(2)}`,
      );

      if (result instanceof Response) {
        applyMetricHeaders(result, routeName, summary);
      }
    }
  });
}
