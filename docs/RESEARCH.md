# Solar PV Planner – Research Notes

> Compiled from standard engineering practice (IEC 62548, IEC 60364-7-712, NEC 690/705/706, EN 1991, ASCE 7-16 §29.4) and common industry rules of thumb. Not live-verified against current code editions. **Always confirm with the local code, the module/inverter datasheets and a licensed installer/structural engineer.**

## 1. Site & solar resource

| Item | Practice | Used in tool |
|---|---|---|
| Data source | Long-term satellite/reanalysis climatology (NASA POWER, PVGIS, Global Solar Atlas). Use monthly GHI in kWh/m²/day = "peak sun hours" (PSH) | NASA POWER climatology (GHI + T2M) via browser fetch |
| Tilt | Annual-optimal ≈ 0.76·\|lat\| + 3.1° (rule of thumb). Off-grid: optimise for the **worst month** (≈ lat + 10–15°) | Scans 0–90°, picks annual or worst-month best |
| Azimuth | Face the equator (south in N hemisphere, north in S). ±30° costs only ~3–5 % | Deviation input with a simple loss factor |
| Transposition | Isotropic-sky (Liu & Jordan / Klein) with Erbs diffuse fraction, albedo 0.2 | Implemented |
| Shading | Avoid any shade 9:00–15:00 solar time year-round; one shaded cell can drop a whole substring. Use optimisers/micro-inverters/half-cut modules if unavoidable | Row-to-row spacing only (no obstacle shading) |
| Row spacing | `pitch = L·(cosβ + sinβ / tanα)` where α = sun elevation at winter-solstice noon (some designers use 9:00 / 15:00, which needs ~1.5× more) | Implemented (noon) |

## 2. Module layout

- Keep 20–25 mm gaps between modules (thermal expansion, clamps), 0.3–0.5 m fire/maintenance setbacks from roof edges (local fire codes: IFC/NFPA 1 ridge & edge pathways, typically 0.9 m).
- **Portrait vs landscape**: landscape on tilted racks reduces row spacing (shorter slope length); portrait usually fits better on pitched roofs. The tool tries both.
- Flat roofs: tilt 10–15° (ballasted, low wind, dense) vs 25–35° (more yield, wider spacing, more wind/anchoring).
- Pitched roofs: flush-mount with 100+ mm air gap for cooling (each 10 °C of cell temp ≈ −3.5–4 % power for c-Si).

## 3. Electrical design

### 3.1 String sizing (the single most important check)
1. **Max series modules**: `Ns_max = floor( Vmax_system(or MPPT max PV V) / Voc_cold )`
   `Voc_cold = Voc_STC · (1 + βVoc · (Tmin − 25))` (βVoc is negative, ≈ −0.25 %/°C). Use record-low ambient (NEC 690.7 allows a 2 %-extreme-low table; or ×1.25 fallback).
2. **Min series modules** (stay in MPPT window at heat): `Ns_min = ceil( V_mppt_min / Vmp_hot )`
   `Vmp_hot = Vmp_STC · (1 + βPmax · (Tcell_hot − 25))`, Tcell_hot ≈ Tamb_max + 25–35 °C.
3. **Parallel strings**: `Np ≤ I_max_pv / (Isc)` (controller/inverter input current limit; use Isc, not Imp, for the limit).
4. Array/inverter ratio (DC/AC): 1.1–1.3 typical grid-tie; for MPPT controllers, array wattage ≤ rated PV power ×1.0–1.25 (clipping is acceptable, over-voltage never is).
5. Try for **equal strings per MPPT input** — never mix different orientations/lengths on one MPPT input.

### 3.2 Protection & conductors
- **Conductor ampacity**: `I = Isc × 1.25 × 1.25 = 1.56·Isc` (NEC 690.8; IEC: 1.25·Isc for both fuse and cable derated for temperature/grouping).
- **String fuses/breakers** required when **3 or more strings** are paralleled (IEC 62548: >2) – rating `1.56·Isc ≤ Ifuse ≤ module max series fuse`. DC-rated, with correct voltage rating (gPV fuses).
- **Cable**: UV/ozone-resistant double-insulated solar cable (H1Z2Z2-K / EN 50618, or USE-2/PV Wire), 4–6 mm² typical for strings, 90 °C rating, cross-section by voltage drop: `ΔV% = 2·L·I·ρ/(A·V)`, ρ_Cu = 0.0172 Ω·mm²/m (≈0.021 at 70 °C). Target **≤ 1–2 % DC string, ≤ 3 % total**, ≤ 1 % battery cables.
- **Connectors**: same make & model (MC4 with MC4 only) – mismatched "compatible" connectors are a major fire cause. Crimp with the correct tool.
- **DC isolator** on array side (rated for DC, arc-quenching, with PV polarity), **AC isolator** on output.
- **SPD** type 2 on DC and AC sides, short leads; AFCI (NEC 690.11) and **rapid shutdown** (NEC 690.12) in US roof systems.
- **Earthing**: bond all module frames and rails together (equipotential), 6 mm² Cu min if no lightning protection (16 mm² with), to the main earth; keep DC cable loops small to reduce induced surges.
- Polarity labelling, warning signs, single-line diagram on site.

### 3.3 MPPT charge controllers
- `Voc_cold(string) ≤ ~95 % of controller max PV voltage` (many manufacturers quote it including a 5 % margin).
- Output current rating `≥ P_array / V_battery_nominal × 1.25` (a "60 A" controller at 48 V ≈ 3.2–3.5 kWp, not 60·12).
- Min PV start voltage ≈ battery voltage + 5–10 V; operate string Vmp well above it at high temperature.
- Wire several controllers in parallel on the battery bus only if they are identical and share the same sub-array design; each gets its own PV string(s).
- Set charge profile to battery chemistry (LiFePO4: 14.2–14.6 V/12 V-equivalent, no equalise; flooded lead: equalise + temperature compensation −3 mV/°C/cell).

### 3.4 Battery bank
- `Energy_bank = E_day · days_autonomy / (DoD · η_battery · η_inverter)`
- Usable DoD: **LiFePO4 80–90 %**, AGM/gel ≈ 50 %, flooded ≈ 50 %.
- Higher system voltage = lower current: **12 V ≤ 1.5 kW, 24 V ≤ 3 kW, 48 V up to ~10 kW** per inverter; above that use HV battery systems.
- Keep series strings equal; parallel ≤ 4 strings for lead, follow BMS limits for LiFePO4 (equal-length cables, busbar in the middle).
- **Class T/NH/MRBF fuse as close as possible to the battery + (+) terminal**, rated `I_inv_max/η × 1.25`, interrupt ≥ 10–20 kA. Add shunt/BMS monitoring, isolator.
- Ventilate lead-acid (hydrogen); LiFePO4 in 0–45 °C charging range; UL 9540 / IEC 62619 certified products and clearances per code (NEC 706/480).

### 3.5 Inverter
- Continuous rating ≥ the sum of simultaneous loads ×1.25; surge ≥ 3–7× motor-start loads (pumps, fridges, compressors).
- Pure-sine only for sensitive/inductive loads. Off-grid: low-frequency (transformer) inverters tolerate surges better, HF are more efficient.
- Grid-tie: UL 1741-SA / IEEE 1547 / IEC 61727 / local DSO approval; sizing by DC/AC ratio. Hybrid inverters combine MPPT + battery inverter + grid.
- Battery side current: `P_inv / (V_bat_min × η)` – cable sizing for 200+ A is often the hidden cost.

## 4. Structural / weight

### 4.1 Typical masses
| Item | Value |
|---|---|
| 400–450 W (108–144 half-cut cells, ~1.72×1.13 m) | 21–24 kg ⇒ **11–12 kg/m²** |
| 550–600 W (2.28×1.13 m) | 28–32 kg |
| Aluminium rails + clamps (flush) | 2–3 kg/m² |
| Tilted racks (aluminium, flat roof) | 4–6 kg/m² |
| Ballast (concrete blocks) | 0–30 kg/m² depending on wind zone and tilt |
| Typical extra dead load acceptable on light roofs without review | roughly **15–25 kg/m²** (rule of thumb – needs a structural check) |

### 4.2 Wind (uplift is the failure mode)
- Velocity pressure: `q = 0.5·ρ·V² = 0.613·V²` (Pa, V in m/s, ρ = 1.225 kg/m³). Use the **3-s gust design wind speed** from the local code map (ASCE 7 / EN 1991-1-4 with terrain, topography and height factors).
- Net force on a module: `F = q · C_net · A`, C_net ≈ 1.0–2.0 (increases at roof corners/edges – zone factors ×1.0 field, ×1.5 edge, ×2.0 corner used by the tool as a simplification).
- Ballast per module (resistance to uplift using Eurocode partial factors): `m_ballast = (1.5·F_vertical − 0.9·W_dead·g) / g`.
- Modules are tested to 2400 Pa (IEC 61215) – 3600/5400 Pa for snow‑rated frames; the clamp zones in the datasheet **must** be used.
- Roof penetrations (flashings) for pitched roofs need pull-out checks on rafters; ballast needs roof friction & sliding checks (μ ≈ 0.4–0.6).

### 4.3 Snow & other
- Snow on module: `s = μ · s_k`, μ ≈ 0.8 (EN 1991-1-3), `s_k` from the local map (kN/m² ≈ 100 kg/m²/kN). Tilted rows: mind snow accumulation/drift between rows.
- Combine dead + snow for gravity checks, dead + wind for uplift; verify rafter span and purlin capacity.
- Seismic zones: ASCE 7 §13 attachment checks. Corrosive/coastal: use A4/316 stainless fasteners and anodised aluminium; isolate dissimilar metals.

## 5. Performance model (used in the demo)
`E_day = P_kWp · H_tilt · PR`
where `PR = η_temp · (1 − soiling) · (1 − mismatch) · (1 − wiring) · η_inverter / η_charge-path` and `η_temp = 1 + γ·(Tcell − 25)`, `Tcell ≈ Tamb + 22 °C`. A well-built system reaches **PR 0.75–0.85**.

## 6. Installation / commissioning checklist
1. Site survey, shading analysis (Solar Pathfinder, SunEye, or sun-path overlays), structural assessment.
2. Single-line diagram + string calculation + labelling plan; permit & utility interconnection.
3. Install rails/racks; torque clamps to the datasheet spec; flash penetrations.
4. Mount modules, cable management (no cable on sharp edges, drip loops, UV clips) – lay DC cables with **+ and − together** to reduce loop area.
5. Test (IEC 62446-1): continuity of earth, polarity, Voc per string (±2 % of calc and between strings), insulation resistance (≥1 MΩ), Isc/IV curve, thermography after 1 week.
6. Commission electronics, set battery profile, verify protection, handover documentation.
7. Maintenance: wash when dirty (soiling 2–7 %/yr), annual torque check and thermography, battery capacity test.
