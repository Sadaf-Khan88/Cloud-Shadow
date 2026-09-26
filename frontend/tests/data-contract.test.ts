import test from "node:test";
import assert from "node:assert/strict";

import {
  mockCostsData,
  mockAnomalies,
  mockRootCauses,
  mockRecommendations,
  mockServices,
  mockDependencies,
  mockDashboardOverview,
} from "../src/data/mockData";
import { api } from "../src/services/api";

test("FinOps Cost Summary integrity", () => {
  assert.equal(mockCostsData.summary.cost_change_pct > 0, true);
  assert.equal(mockCostsData.summary.currency, "USD");
  assert.equal(typeof mockCostsData.summary.total_spend, "number");
  assert.equal(mockCostsData.hourly_trend.length >= 24, true);
});

test("Anomalies schema and severity ratings", () => {
  assert.equal(mockAnomalies.length >= 8, true);
  for (const anom of mockAnomalies) {
    assert.ok(["critical", "high", "medium", "low"].includes(anom.severity));
    assert.ok(anom.score >= 0 && anom.score <= 1);
    assert.ok(anom.baseline > 0);
    assert.ok(anom.current > 0);
    assert.ok(anom.service.length > 0);
  }
});

test("Root Cause primary episode and evidence confidence", () => {
  assert.equal(mockRootCauses.length >= 2, true);
  const primary = mockRootCauses[0];
  assert.equal(primary.id, "rc-001");
  assert.equal(primary.evidence_score, 0.90);
  assert.equal(primary.cost_impact, "High");
  assert.ok(primary.evidence.length >= 4);
  assert.ok(primary.timeline.length >= 4);
  assert.ok(primary.causal_graph.nodes.length >= 5);
  assert.ok(primary.causal_graph.edges.length >= 4);

  // Verify graph edge endpoints exist in nodes
  const nodeIds = new Set(primary.causal_graph.nodes.map((n) => n.id));
  for (const edge of primary.causal_graph.edges) {
    assert.ok(nodeIds.has(edge.source), `Source node ${edge.source} missing`);
    assert.ok(nodeIds.has(edge.target), `Target node ${edge.target} missing`);
  }
});

test("Safer Recommendations non-guaranteed safety policy", () => {
  assert.equal(mockRecommendations.length >= 5, true);
  for (const rec of mockRecommendations) {
    assert.ok(["Low", "Medium", "High"].includes(rec.risk));
    assert.ok(rec.action.length > 0);
    assert.ok(rec.reason.length > 0);
    assert.ok(rec.expected_effect.length > 0);
    // Verify no fake guaranteed savings claim
    assert.ok(!rec.action.toLowerCase().includes("guaranteed savings"));
  }
});

test("Dependency topology contracts", () => {
  assert.equal(mockDependencies.services.length >= 8, true);
  assert.equal(mockDependencies.edges.length >= 8, true);
  const svcIds = new Set(mockDependencies.services.map((s) => s.id));
  for (const edge of mockDependencies.edges) {
    assert.ok(svcIds.has(edge.source), `Source service ${edge.source} missing`);
    assert.ok(svcIds.has(edge.target), `Target service ${edge.target} missing`);
  }
});

test("API service fallback and filtering functionality", async () => {
  const overview = await api.getDashboardOverview();
  assert.ok(overview.data.summary);
  assert.ok(overview.isDemo !== undefined);

  const criticalAnomalies = await api.getAnomalies({ severity: "critical" });
  assert.ok(criticalAnomalies.data.every((a) => a.severity === "critical"));

  const filteredByService = await api.getAnomalies({ service: "postgres-db" });
  assert.ok(filteredByService.data.every((a) => a.service === "postgres-db"));

  const rootCause = await api.getRootCause("rc-001");
  assert.equal(rootCause.data?.id, "rc-001");
});
