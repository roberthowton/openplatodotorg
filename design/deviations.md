# Intentional Design Deviations

Deviations from the spec that are deliberate decisions. The design-auditor agent
should not flag these as discrepancies.

---

## DEV-001: Commentary panel close (X) button
**Spec says:** Panel header has pin/lock button only
**Implementation:** Pin button + close (X) button
**Why:** Better UX — users need an explicit way to dismiss the panel in overlay mode without clicking outside it
