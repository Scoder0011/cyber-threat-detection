// src/__tests__/property/kpiCards.property.test.ts
// Property-based tests for KPI computation utilities

import { describe, it } from "vitest";
import * as fc from "fast-check";
import {
  computeTotalAlerts,
  computeCriticalAlerts,
  computeActiveBots,
  computeCurrentThroughput,
} from "../../utils/kpiUtils";
import {
  alertArbitrary,
  botStatusArbitraryRecord,
  throughputPointArbitrary,
} from "../arbitraries";

describe("KPI Utilities — Property-Based Tests", () => {
  // Feature: cyber-threat-dashboard, Property 2: Total alerts KPI reflects array length
  it("Property 2: computeTotalAlerts returns the length of the alerts array", () => {
    fc.assert(
      fc.property(fc.array(alertArbitrary), (alerts) => {
        return computeTotalAlerts(alerts) === alerts.length;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: cyber-threat-dashboard, Property 3: Critical alerts KPI is a filtered count
  it("Property 3: computeCriticalAlerts returns the count of alerts with severity 'Critical'", () => {
    fc.assert(
      fc.property(fc.array(alertArbitrary), (alerts) => {
        const expected = alerts.filter((a) => a.severity === "Critical").length;
        return computeCriticalAlerts(alerts) === expected;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: cyber-threat-dashboard, Property 4: Active bots KPI is a filtered count
  it("Property 4: computeActiveBots returns the count of bots with status 'active'", () => {
    fc.assert(
      fc.property(fc.array(botStatusArbitraryRecord), (bots) => {
        const expected = bots.filter((b) => b.status === "active").length;
        return computeActiveBots(bots) === expected;
      }),
      { numRuns: 100 }
    );
  });

  // Feature: cyber-threat-dashboard, Property 5: Throughput KPI reflects last data point
  it("Property 5: computeCurrentThroughput returns the value of the last element", () => {
    fc.assert(
      fc.property(
        fc.array(throughputPointArbitrary, { minLength: 1 }),
        (points) => {
          const expected = points[points.length - 1].value;
          return computeCurrentThroughput(points) === expected;
        }
      ),
      { numRuns: 100 }
    );
  });
});
