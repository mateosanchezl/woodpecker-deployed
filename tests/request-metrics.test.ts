import assert from "node:assert/strict";
import test from "node:test";
import {
  incrementPrismaOperationCount,
  withRouteMetrics,
} from "@/lib/metrics/request-metrics";

test("withRouteMetrics attaches Prisma operation headers to responses", async () => {
  const response = await withRouteMetrics("metrics.test", async () => {
    incrementPrismaOperationCount();
    incrementPrismaOperationCount();
    return new Response("ok");
  });

  assert.equal(response.headers.get("x-route-name"), "metrics.test");
  assert.equal(response.headers.get("x-prisma-ops"), "2");
  assert.ok(response.headers.get("x-route-duration-ms"));
  assert.ok(response.headers.get("x-route-p50-ms"));
  assert.ok(response.headers.get("x-route-p95-ms"));
});

test("withRouteMetrics leaves non-response return values intact", async () => {
  const value = await withRouteMetrics("metrics.value", async () => {
    incrementPrismaOperationCount();
    return { ok: true, count: 1 };
  });

  assert.deepEqual(value, { ok: true, count: 1 });
});
