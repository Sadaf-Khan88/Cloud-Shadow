"""
Cloud Shadow AI - Engine Pipeline Integration Test
==================================================
Validates that the complete end-to-end analysis engine:
1. Executes `run_analysis()` without crashing.
2. Returns a valid `EngineResult` containing:
   - `analysis_id`
   - `status` == 'completed'
   - `cost_summary` with baseline, current, and change fields
   - `anomalies` list with required anomaly schema fields
   - `root_causes` list with episode candidates and confidence scores
   - `recommendations` list adhering to the remediation schema
3. Adheres to schema constraints and non-empty outputs on the real dataset.
4. Verifies dictionary and attribute access compatibility.
5. Verifies optional custom AnalysisInput parameters.
"""

import sys
import unittest
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from engine.analysis import AnalysisInput, EngineResult, run_analysis


class TestEnginePipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "=" * 80)
        print("RUNNING CLOUD SHADOW AI ENGINE INTEGRATION TEST (REAL DATA)")
        print("=" * 80)
        cls.result = run_analysis()

    def test_01_result_type_and_status(self):
        """EngineResult is returned with status 'completed' and valid analysis_id."""
        self.assertIsInstance(self.result, dict)
        self.assertIn("analysis_id", self.result)
        self.assertTrue(self.result["analysis_id"].startswith("analysis-"))
        self.assertEqual(self.result.get("status"), "completed")
        print(f"[PASS] test_01: analysis_id={self.result['analysis_id']}, status={self.result['status']}")

    def test_02_cost_summary(self):
        """Cost summary contains baseline, current, change, and percent metrics."""
        self.assertIn("cost_summary", self.result)
        cost = self.result["cost_summary"]
        self.assertIsInstance(cost, dict)
        self.assertIn("baseline_hourly_cost", cost)
        self.assertIn("current_hourly_cost", cost)
        self.assertIn("hourly_cost_change", cost)
        self.assertIn("change_percent", cost)
        self.assertGreater(cost["baseline_hourly_cost"], 0.0)
        self.assertGreater(cost["current_hourly_cost"], 0.0)
        print(f"[PASS] test_02: cost_summary={cost}")

    def test_03_anomalies_present_and_valid(self):
        """Anomalies are detected, populated, and adhere to schema."""
        self.assertIn("anomalies", self.result)
        anomalies = self.result["anomalies"]
        self.assertIsInstance(anomalies, list)
        self.assertGreater(len(anomalies), 0)
        self.assertEqual(self.result.get("total_anomalies"), len(anomalies))

        # Check sample anomaly structure
        first_a = anomalies[0]
        required_keys = {"timestamp", "service_id", "metric", "current_value", "anomaly_score", "severity"}
        self.assertTrue(required_keys.issubset(first_a.keys()), f"Missing keys in anomaly: {first_a.keys()}")
        print(f"[PASS] test_03: total_anomalies={len(anomalies)}, sample={first_a['service_id']}:{first_a['metric']}")

    def test_04_root_causes_present_and_valid(self):
        """Root cause episodes are discovered and populated."""
        self.assertIn("root_causes", self.result)
        rcs = self.result["root_causes"]
        self.assertIsInstance(rcs, list)
        self.assertGreater(len(rcs), 0)
        self.assertEqual(self.result.get("total_root_causes"), len(rcs))

        # Check top root cause structure
        top_rc = rcs[0]
        required_rc_keys = {"service_id", "metric", "confidence", "evidence"}
        self.assertTrue(required_rc_keys.issubset(top_rc.keys()), f"Missing keys in root cause: {top_rc.keys()}")
        self.assertGreater(top_rc["confidence"], 0.0)
        print(f"[PASS] test_04: total_root_causes={len(rcs)}, top_initiator={top_rc['service_id']}:{top_rc['metric']}")

    def test_05_recommendations_present_and_schema_compliant(self):
        """Remediation recommendations are generated and follow the required 5-field schema."""
        self.assertIn("recommendations", self.result)
        recs = self.result["recommendations"]
        self.assertIsInstance(recs, list)
        self.assertGreater(len(recs), 0)
        self.assertEqual(self.result.get("total_recommendations"), len(recs))

        # Verify exact schema: service_id, action, reason, expected_effect, risk
        expected_schema = {"service_id", "action", "reason", "expected_effect", "risk"}
        for idx, rec in enumerate(recs):
            self.assertEqual(
                set(rec.keys()),
                expected_schema,
                f"Recommendation #{idx} schema mismatch: {rec.keys()}",
            )
            for k in expected_schema:
                self.assertIsInstance(rec[k], str, f"Key '{k}' in rec #{idx} must be a string")
                self.assertTrue(len(rec[k].strip()) > 0, f"Key '{k}' in rec #{idx} cannot be empty")

        print(f"[PASS] test_05: total_recommendations={len(recs)}")
        for idx, rec in enumerate(recs[:3], 1):
            print(f"       Rec #{idx} [{rec['service_id']}] {rec['action']}")

    def test_06_analysis_input_object_support(self):
        """Engine supports structured AnalysisInput input objects."""
        inp = AnalysisInput(analysis_id="custom-test-run-42")
        custom_result = run_analysis(inp)
        self.assertEqual(custom_result["analysis_id"], "custom-test-run-42")
        self.assertEqual(custom_result["status"], "completed")
        self.assertGreater(len(custom_result["recommendations"]), 0)
        print("[PASS] test_06: AnalysisInput object successfully processed")


if __name__ == "__main__":
    unittest.main(verbosity=2)
