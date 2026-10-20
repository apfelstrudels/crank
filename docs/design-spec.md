# Design spec: first-party CRAP tool ("crank") with per-stack coverage adapters

**Date:** 2026-10-19
**Task:** crap-tool-design - knowledge-only design scout
**Working name:** `crank` (placeholder; the captain may rename - the backlog leaves the name open)

---

## TL;DR

Design for a small (~440 lines + ~300 lines of tests) first-party CRAP tool, implemented in
JVM Clojure and distributed as a pinned git dep, invoked as `clojure -M:crank`. It has **one
CRAP math core** (`CC^2 * (1-cov)^3 + CC`), **one worst-first table**, **one `--threshold N`
gate** (exit 2 on breach, matching crapper's convention), and exactly two things it owns that
nobody else gets right: the **coverage adapters** - a Cloverage LCOV adapter for JVM Clojure
(schairs-user-service lane) and a raw-V8-block-coverage + shadow-cljs source-map adapter for
ClojureScript (moonlander lane). It has **no own complexity counter**: it shells out to
unclebob/crapper's proven Clojure counter (pinned commit `9f1bead`) in `--no-coverage` mode,
with typmk/sift (pinned `8125fe8`) as an in-process alternative. Everything is
honest-by-construction: missing or unjoinable coverage input is a hard exit 1, never a
synthesized 0% or 100%; N/A is only possible via a config entry carrying a written
justification. The design absorbs the recommended answers to the three open moonlander
adoption calls (fake-DOM gap fix, N/A treatment, threshold 30 fail / 10-30 warn) as its
defaults, and both adoption paths are spelled out step by step.

---

## 1. What I did (evidence)

1. Read the authoritative spec: `bin/fm-tasks-axi.sh show crap-tool-design --full` - the
   backlog item body owns the requirements (CLI surface, adapter contract, config,
   gate/report-only modes, adoption paths, join test strategy, out-of-scope, ~300-500 line
   budget, honest-by-construction rules).
2. Read the moonlander mate's validated feasibility report at
   `data/remote-secondmates/moonlander/data/moonlander-crap-feasibility/report.md` (385
   lines), which contains the working ~150-line CLJS join prototype (Appendix A) and the
   evidence every design decision below leans on:
   - crapper `--no-coverage` works on `.cljs` and yields per-defn CC (124 fns on moonlander);
     its coverage lane is JVM-only and silently dishonest on CLJS (its §2.2).
   - c8/v8-to-istanbul remapped coverage is per-function unsound (defaults uncovered lines to
     hit-count 1; `on-key!` reported 100% covered though never called; its §2.4).
   - istanbul/nyc on the shadow-cljs bundle is unusable (require hook never fires; forced
     instrumentation destroys function identity; its §2.5).
   - Raw `NODE_V8_COVERAGE` block coverage + shadow-cljs `.js.map` remap + clj-kondo extents +
     sift CC joins honestly; validated anchors: `on-key!` CRAP 342 (CC 18, cov 0.0),
     `step` CRAP 22.21 (CC 22, cov 92.5%), `new-round` 37.5% cov (its §2.6, Appendix A).
   - Cloverage 1.2.4 runs mechanically on JVM Clojure and emits LCOV (its §2.3); CLJS support
     is open since 2017 (cloverage#182), i.e. will never cover the CLJS lane.
3. Read the k7 tooling survey
   (`data/remote-secondmates/moonlander/data/crap-tooling-survey-k7/report.md`) for CRAP
   threshold conventions (canonical: fail > 30, warn band 10-30; crapper exits 2 on
   `--threshold` breach) and the tool maturity picture (crapper master `9f1bead`; sift v0.2.0
   alpha, pin `8125fe8`; clj-kondo has extents via `:output {:analysis true}` but no
   complexity metric, issue #2809 open).
4. Confirmed the fleet context: schairs-user-service (JVM Clojure) already enforces CRAP <= 10
   with crapper + Cloverage in CI (captain's reference point, per the feasibility report §1);
   moonlander runs shadow-cljs node-script test builds (`sim`, `sim-render`) under Node with
   the Clojure CLI available (feasibility env: Clojure CLI 1.12.6.1673, node v26).
5. Checked the steering inbox (empty) and the main backlog; the three moonlander adoption
   calls are already recorded as open with the captain (see §9).

---

## 2. Design goals and boundaries (from the backlog item, restated as commitments)

| # | Boundary | How the design honors it |
|---|---|---|
| 1 | No own cyclomatic-complexity counter | CC is delegated behind a `ComplexitySource` contract; implementations only shell out to crapper (`--no-coverage`) or call sift, both pinned |
| 2 | Tool owns the coverage adapters | `CoverageAdapter` contract with exactly two built-ins: `:cloverage-lcov` (JVM Clojure), `:v8-shadow` (CLJS) |
| 3 | One math core, one table, one gate | All adapters emit one normalized intermediate representation (IR); one join, one CRAP fn, one table renderer, one exit-code policy |
| 4 | Honest by construction | The six honesty rules in §7 are enforced in the core, not the adapters, so no future adapter can accidentally fabricate coverage |
| 5 | Small | ~440 lines implementation + ~300 lines tests (budget in §8) |

---

## 3. Architecture

```
            ┌─────────────────────── crank ───────────────────────┐
 sources ──▶│ ComplexitySource (crapper | sift) ──▶ CC per defn   │
            │                                                     │
 sources ──▶│ clj-kondo --analysis ───────────────▶ defn extents  │──▶ JOIN ─▶ CRAP core ─▶ table + EDN report
            │   (file, row, end-row per defn)       (per defn)    │       (one math fn)    (worst-first)
 coverage ─▶│ CoverageAdapter (cloverage-lcov |                   │
  inputs    │  v8-shadow) ──▶ IR hit records                     │
            └─────────────────────────────────────────────────────┘
```

**Pipeline stages (single pass, fail-fast):**

1. **Config load** - `.crank.edn` + CLI overrides. Unknown keys are a hard error.
2. **Extents** - run `clj-kondo --lint <paths> --config '{:output {:analysis true :format :json}}'`;
   keep `:row`/`:end-row`/`:name`/`:ns` per var-definition. clj-kondo parses both `.clj` and
   `.cljs`, so this stage is stack-neutral. (Evidence: feasibility §2.6 and Appendix A use
   exactly this; 151 var-defs with `row`/`end-row` on moonlander.)
3. **Complexity** - via the configured `ComplexitySource`; produces `{:name :ns :file :line :cc}`
   per defn. CC values are tool-relative; the pin is recorded in the report.
4. **Coverage** - via the configured `CoverageAdapter`; validates inputs (loudly) and produces
   IR hit records (§4).
5. **Join** - match each CC entry to its kondo extent by `(file, name, line±2)` (the prototype's
   tolerance, Appendix A), then attribute each IR record to the enclosing extent by line range.
   Per defn: `cov = covered records / total records`.
6. **Score + report** - `CRAP = CC^2 * (1-cov)^3 + CC`; worst-first table, N/A section, fidelity
   report, EDN report to disk, exit code per §6.

The join is the heart of the tool and lives in one namespace (`crank.core`), shared by both
stacks. Adapters never see defns; extents never see adapters. That separation is what keeps
the honest-by-construction rules enforceable in one place.

---

## 4. The two contracts (how a new stack plugs in)

### 4.1 Coverage IR (the normalized intermediate representation)

One flat sequence of hit records - one record per *instrumentation unit* of the underlying
coverage engine:

```clojure
{:file "moonlander/core.cljs"   ;; source path relative to a configured source root
 :line 163                      ;; 1-based source line of the unit's start
 :hits 0}                       ;; execution count; covered? = (> hits 0)
```

- For **LCOV**, a unit is one `DA:<line>,<hits>` entry (line coverage).
- For **raw V8**, a unit is one block-coverage range, remapped to its source start position
  (block coverage).
- Multiple records may share a line; the join counts *records*, not lines, inside each defn
  extent. This preserves the validated prototype's semantics exactly (e.g. never-called
  `on-key!` = 2 records, both `hits 0` => cov 0.0 => CRAP 342; feasibility §2.6).

The denominators differ per adapter (blocks vs lines) - both are honest fractions of what the
respective engine actually instrumented, and the precision note is stated in the report header
of every run (§7.4).

**Adapter contract:**

```clojure
(defprotocol CoverageAdapter
  (validate-inputs [this cfg])   ;; nil, or throw ex-info {:crank/error :missing-coverage ...}
  (collect [this cfg]))          ;; => seq of IR records; throws {:crank/error :unjoinable-coverage} on remap failure
```

A keyword registry maps `:cloverage-lcov` / `:v8-shadow` to implementations. A new stack plugs
in by adding one namespace implementing the two fns and one registry entry - no core changes.
A future `:v8-ts` adapter (supabase lane, if it ever needs honest per-function numbers) or a
`:jacoco-xml` adapter (Java) fit the same seam.

### 4.2 Complexity source contract

```clojure
(defprotocol ComplexitySource
  (measure [this cfg]))  ;; => seq of {:name :ns :file :line :cc}
```

Implementations:

- **`:crapper` (primary).** Shells out to `python -m crapper --no-coverage <paths>` with
  crapper installed from the pinned git commit `9f1bead` (pip git URL). Parses its
  `.metrics/crap.edn` (`{:name :namespace :complexity :coverage nil :crap nil}` entries).
  Evidence it works on both stacks: feasibility §2.1 ran it on moonlander's `.cljs` (124 fns);
  schairs CI runs the same counter today. Known gap: crapper's EDN has **no line numbers**,
  so the join to extents is by `(ns, name)` against kondo's `(name, ns, row, end-row)` -
  the Plan-B join the feasibility report §4.3-Plan-B already specifies. Ambiguous matches
  (same name twice in one ns) are a loud error, never a guess.
- **`:sift` (alternative).** sift v0.2.0 pinned at sha `8125fe8`, consumed as a Clojure git
  dep and invoked in-process (it is a Clojure library; CLI form `sift lint --no-kondo --edn`
  validated in feasibility §2.6). Emits `:line`, so its extent join is the prototype's exact
  `(file, name, line±2)` match. `<fn>` anonymous entries are skipped by design.

**Pinning is part of the contract:** the resolved tool and pin are printed in every report
header. Absolute CC is tool-relative (crapper counts each `and`/`or` form once; sift counts
differently - e.g. `assist-flags` 7 vs 11, `step` 21 vs 22), so the docs state: pick one CC
tool per repo, never compare absolute CC across tools, switching tools re-baselines the gate.

---

## 5. The two built-in adapters

### 5.1 `:cloverage-lcov` (JVM Clojure - schairs-user-service lane)

- **Input:** an LCOV file produced by the project's *existing* Cloverage run
  (schairs precedent: `clj -M:cov --lcov`). The tool does not run the tests or Cloverage
  itself - coverage generation stays with the project, parsing/joining with the tool. This
  keeps the adapter tiny and makes "coverage is missing" an unambiguous precondition failure.
- **Parse:** `SF:` / `DA:` records only (`BRDA`, `FN` records ignored - v1 is statement/line
  coverage; see out-of-scope). ~50 lines, no dependency.
- **Path normalization:** `SF:` paths are relativized against the configured source root(s);
  a record outside all roots is a loud config error (it means the lcov belongs to a different
  checkout or the roots are wrong).
- **Validation:** file missing, unreadable, empty, or containing zero `DA` records =>
  exit 1 naming the path. Never default to 0% or 100%.

### 5.2 `:v8-shadow` (ClojureScript - moonlander lane)

- **Inputs:** one or more `NODE_V8_COVERAGE` output dirs (raw V8 JSON, one file per run), the
  shadow-cljs `cljs-runtime` dir holding the compiled `*.js` + `*.js.map`, and an include
  regex selecting the project's runtime files (e.g. `#"cljs-runtime/moonlander\.[^/]*\.js$"`).
- **Remap helper:** `resources/crank/remap.mjs` (~90 lines, distilled from the validated
  Appendix A prototype) run via `node`. It maps each V8 block's **start offset** through the
  shadow source map with `@jridgewell/trace-mapping` (pinned; this is the exact library the
  prototype validated), with the prototype's gap-tolerant forward scan
  (`remapWithFallback`, scan to the next mapped segment within the block's own end offset).
  Output is JSONL of IR records plus skip counters. Only dependency: `@jridgewell/trace-mapping`.
- **Why node here:** the only lane that ever runs this adapter has node by definition
  (shadow-cljs requires it), and re-using the validated remap semantics beats re-deriving them.
  A future option (documented, not built): inline a VLQ decoder in Clojure (~60 lines) to drop
  the node shell-out; rejected for v1 because fidelity with the validated prototype is the
  whole point of the adapter.
- **Honest attribution rules inherited from the prototype:** attribute by block *start*
  (basic-block entry semantics); blocks remapping into test namespaces or between defns are
  skipped and counted; a defn whose file was loaded gets its blocks even at count 0 (true 0%
  coverage), while a defn whose file produced **no** records was never loaded - that is "no
  coverage path", not 0% (§7, rule 3).
- **Validation:** coverage dir missing/empty, no `coverage-*.json`, zero records remapping
  into configured source roots (wrong build, stale maps) => exit 1 with the offending path.

---

## 6. CLI surface, modes, exit codes

Invocation is via a deps alias in the adopting repo:

```
clojure -M:crank                          # gate mode, config from .crank.edn
clojure -M:crank --report-only            # report; threshold breaches do not fail the build
clojure -M:crank --threshold 30           # override fail threshold (default from config)
clojure -M:crank --warn 10                # override warn band floor
clojure -M:crank --check                  # join-fidelity diagnostics only; no scoring, no gate
clojure -M:crank --config path/to.edn
clojure -M:crank --help
```

**Exit codes** (aligned with crapper's convention so existing CI muscle memory transfers):

| code | meaning |
|---|---|
| 0 | all scored functions <= threshold (warnings fine); or `--report-only` with honest inputs |
| 2 | at least one scored function > threshold (gate breach) - suppressed by `--report-only` |
| 1 | dishonesty/usage error: missing/unjoinable coverage, config error, unmatched defns, undeclared no-coverage-path namespace. **Never suppressed** - `--report-only` relaxes the gate, never the honesty rules |

**Output:** worst-first table to stdout (scored rows sorted by CRAP desc, warn band marked,
then an N/A section listing each N/A entry with its configured reason), a fidelity summary
(§7.4), and a machine report at `:report :edn` path (schema-versioned EDN: inputs + pins,
per-defn rows, fidelity counters) for CI artifacts and future trend tooling.

---

## 7. Honest-by-construction rules (enforced in `crank.core`)

1. **Never fabricate coverage.** Missing, unreadable, empty, or non-intersecting coverage
   input => exit 1 naming the offending path. There is no code path that defaults cov to 0.0
   or 1.0. (Anti-precedent: crapper's own coverage runner manufactures a 0% table when its
   `clj -M:cov` fails into a bare REPL - feasibility §2.2.)
2. **Zero blocks is not zero coverage.** A defn with attributed records all at `hits 0` is a
   true 0% (the file was loaded; the function was never called). A defn whose file produced
   **no** records was never loaded - that is "no coverage path" and falls under rule 3.
3. **N/A requires a written justification in config.** `{:na [{:file "moonlander/render/pixi.cljs"
   :reason "browser-only shell; the pure scene.cljs it renders is tested at 100%"}]}`.
   An undeclared no-coverage-path defn => exit 1 listing it. N/A rows never enter the gate and
   always print with their reason.
4. **Join fidelity is measured and printed every run:** records attributed vs skipped (with the
   skip reasons - test-ns, inter-defn, unmapped), CC entries matched vs unmatched. A named defn
   that fails the CC<->extent match is a loud error (exit 1), never silently dropped; the tool
   must never score a subset while presenting it as the whole. `--check` exposes this without
   scoring. Precision limits are printed in the report header (below).
5. **Pins are recorded.** The report header names the CC tool + pin, adapter, clj-kondo
   version, and (for v8-shadow) node + trace-mapping versions, so any number can be
   re-derived.
6. **One metric per stack, stated.** LCOV adapter = line coverage; v8 adapter = block coverage.
   The report header says which. No mixing within a run.

**Stated precision limits (printed in every report header and in the README):**

- v8-shadow: block-start attribution wobbles +/-1 block at defn boundaries; blocks between
  defns are skipped by design (on moonlander: 483/1158 blocks skipped, overwhelmingly test-ns
  + wrapper statements - feasibility §2.6).
- CC is tool-relative and only comparable within one pinned tool.
- shadow-cljs upgrades can shift codegen and therefore coverage anchors; re-run the bounded
  validation recipe (feasibility §4.4) after any shadow-cljs bump.

---

## 8. Config format (`.crank.edn`, repo root)

```edn
{:paths ["src/main"]                        ;; sources under the gate
 :cc {:tool :crapper                        ;; or :sift
      :pin "9f1bead"}                       ;; recorded; enforced at install time
 :coverage {:adapter :cloverage-lcov        ;; or :v8-shadow
            ;; :cloverage-lcov:
            :lcov "target/coverage/lcov.info"
            ;; :v8-shadow:
            ;; :v8-dirs [".cov/sim" ".cov/render"]
            ;; :cljs-runtime ".shadow-cljs/builds"
            ;; :include-glob #"cljs-runtime/moonlander\.[^/]*\.js$"
            }
 :threshold {:fail 30 :warn 10}             ;; schairs sets {:fail 10 :warn 5}; see §10
 :na []                                     ;; {:file ... :reason ...} entries, rule 3
 :report {:edn ".crank/report.edn"}}
```

Unknown keys, wrong types, an adapter key missing its required inputs, or an `:na` entry
matching nothing in the extents are all hard config errors (exit 1). The config is EDN because
both stacks are Clojure-flavored and the adopting repos already keep `deps.edn`.

---

## 9. The three open moonlander adoption calls - absorbed as defaults

These remain the captain's calls (they were surfaced by the moonlander mate's feasibility
report and are owned by that home's captain-hold inventory; I did not re-register them here).
Per the backlog instruction, the design's defaults absorb their **recommended** answers:

1. **Fake-DOM gap fix - recommended answer (a): fix the tests.** The gate's worst offenders
   (`on-key!` CRAP 342, `replay-tick!` 42, `tick!`/`init!`/`start!`/`requested-renderer` 20-30)
   are the browser-wiring band with zero headless exercise - a real test gap, not tooling noise
   (feasibility §2.6, §5). The adoption plan (§10.2) sequences: adopt in `--report-only`, land
   the fake-DOM extension in `sim.cljs` (it already drives leaderboard UI) to dispatch window
   `keydown`/`keyup` and drive the replay controls, expect max CRAP to drop to ~22 (`step`),
   then flip the gate on. The design does not build a grandfather-list feature - the fix is
   small and the list would be a permanent dishonesty seam. (If the captain chooses (b), a
   time-boxed grandfather entry is expressible as an `:na` with reason, so the tool absorbs
   either answer without a redesign.)
2. **N/A treatment - recommended answer: declare with justification.** `pixi.cljs` and
   `boot.cljs` have no Node coverage path (browser-only). They become `:na` entries with the
   written reason from the feasibility report (thin imperative shell; the pure `scene.cljs`
   mapping they render is tested at 100%). Never silently 0%.
3. **Threshold - recommended answer: 30 fail / 10-30 warn.** Canonical CRAP convention
   (k7 survey §1). The design ships `{:fail 30 :warn 10}` as the default. The math caveat is
   documented in the README: at 100% coverage CRAP = CC, so a CRAP-10 gate is effectively a
   CC <= 10 ceiling on well-tested code, and moonlander's `step` (CC 22, 92.5% covered,
   CRAP 22.2) can *never* pass CRAP-10 regardless of tests. If the captain wants that ceiling,
   it is a config change (`:fail 10`), set deliberately - schairs already runs exactly that.

---

## 10. Adoption paths

### 10.1 schairs-user-service (JVM Clojure)

Today: crapper + Cloverage in CI, CRAP <= 10 enforced. After: same Cloverage run, crank owns
the join, the table, and the gate.

1. Add the crank git dep (pinned sha) and alias `:crank` to `deps.edn`.
2. Keep the existing coverage step (`clj -M:cov --lcov` producing LCOV) - unchanged.
3. `.crank.edn`: `:cc {:tool :crapper :pin "9f1bead"}` (same counter as today => no CC
   baseline shift), `:coverage {:adapter :cloverage-lcov :lcov <path>}`,
   `:threshold {:fail 10 :warn 5}` (schairs deliberately keeps its stricter gate).
4. CI: replace the `python -m crapper --threshold 10` invocation with
   `clojure -M:crank`. (Python stays - crapper is still the CC source.)
5. First run as `--report-only` and diff against crapper's own table for the same coverage
   run (the differential test from §11, run once live); small drift is expected and explained
   (crapper's internal join granularity vs our LCOV-line join). Then flip to gate mode.

### 10.2 moonlander (ClojureScript)

1. Add the crank git dep + alias; add devDep `@jridgewell/trace-mapping` (pinned) - node and
   the Clojure CLI are already present (feasibility env).
2. `.crank.edn`: `:cc {:tool :sift :pin "8125fe8"}` (sift is the validated CC source on this
   codebase; crapper is the documented alternative), `:coverage {:adapter :v8-shadow
   :v8-dirs [".cov/sim" ".cov/render"] :cljs-runtime ".shadow-cljs/builds"
   :include-glob #"cljs-runtime/moonlander\.[^/]*\.js$"}`, `:threshold {:fail 30 :warn 10}`, and the two
   `:na` entries (`pixi.cljs`, `boot.cljs`) with written reasons.
3. New CI job (ubuntu-latest): `npm ci`; `npx shadow-cljs compile sim sim-render`;
   `NODE_V8_COVERAGE=.cov/sim node target/sim.js`;
   `NODE_V8_COVERAGE=.cov/render node target/sim-render.js`; `clojure -M:crank`.
   Exactly the pipeline validated end-to-end in feasibility §2.6/§4.1.
4. Sequence per §9.1: land the job with `--report-only`; land the fake-DOM key/replay tests;
   confirm the table shape matches the validated anchors (`on-key!` drops from 342, `step`
   stays ~22, N/A set = pixi + boot); flip to gate mode.
5. The TypeScript supabase lane keeps its existing c8 + crap-score pipeline (verified working,
   worst CRAP 18.0 - feasibility §2.7). A future `:v8-ts` adapter can bring it under crank via
   the §4 contract; not part of this adoption.

---

## 11. Test strategy for the join

The join is where dishonesty would live, so it gets the deepest tests. ~300 lines of tests
against the ~440-line tool.

1. **Golden fixture: moonlander (CLJS).** Freeze real inputs captured from the real codebase:
   a real raw V8 `coverage-*.json` excerpt for `moonlander/core.js`, its real `.js.map`, the
   real kondo extents JSON, and real sift EDN - sized down to a few namespaces but unmodified
   in content. Expected table pinned to the validated anchors: `on-key!` CRAP **342.00**
   (CC 18, cov 0.0), `step` **22.21** (CC 22, 92.5% of 53 blocks), `replay-tick!` **42.00**,
   `new-round` 37.5% cov, `pixi`/`boot` N/A. If a shadow-cljs upgrade shifts codegen, the
   fixture pins the *old* build and the live re-validation recipe (feasibility §4.4) covers
   the new one.
2. **Golden fixture: schairs-user-service (JVM).** A real Cloverage `lcov.info` excerpt from a
   real run + real kondo extents + real crapper EDN. Expected table checked **differentially**
   against crapper's own CRAP output for the same run: agreement within a documented tolerance,
   with per-row differences explained by line-vs-form join granularity. This is the proof the
   schairs swap does not move the numbers capriciously.
3. **CRAP math unit tests:** cov 1 => CRAP = CC exactly; cov 0 => CRAP = CC^2 + CC (so
   `on-key!` = 18^2 + 18 = 342 is also the math canary); monotonic in CC and in (1-cov).
4. **Parser unit tests (synthetic fixtures):** LCOV (multi-`SF`, out-of-order `DA`, `BRDA`
   ignored, empty file => error); crapper EDN (nil coverage keys tolerated, missing line
   numbers handled via the ns+name join, duplicate-name ambiguity => loud error); sift EDN
   (`<fn>` skipped, line±2 extent match); kondo analysis JSON.
5. **Honesty tests (the rules in §7, each with a test):** missing lcov => exit 1; empty v8
   dir => exit 1; coverage that remaps into zero configured source files (wrong build) =>
   exit 1; never-called defn (records at hits 0) => cov 0.0 scored, **not** N/A; never-loaded
   defn (no records) undeclared => exit 1; declared `:na` => N/A row with reason, gate
   unaffected; unmatched named defn => exit 1; `--report-only` converts a threshold breach to
   exit 0 but keeps every honesty failure at exit 1.
6. **Join invariants (property-style):** every scored row has 0 <= cov <= 1; every CC entry
   appears in the output exactly once (scored or N/A); the fidelity counters sum to the total
   record count.

---

## 12. Module layout and size budget (~440 lines + tests)

| file | lines (est.) | contents |
|---|---|---|
| `src/crank/main.clj` | 80 | CLI parsing, config load/validate, orchestration, exit codes |
| `src/crank/core.clj` | 120 | CC<->extent match, IR<->extent join, CRAP math, worst-first table, fidelity report, N/A handling, EDN report |
| `src/crank/kondo.clj` | 40 | shell out to clj-kondo, parse analysis JSON into extents |
| `src/crank/cc/crapper.clj` | 50 | shell out, parse `.metrics/crap.edn` |
| `src/crank/cc/sift.clj` | 40 | in-process sift call, parse findings |
| `src/crank/cov/lcov.clj` | 50 | LCOV parse -> IR, path normalization, validation |
| `src/crank/cov/v8.clj` | 50 | drive `remap.mjs`, parse JSONL -> IR, validation |
| `resources/crank/remap.mjs` | 90 | distilled Appendix A remap (trace-mapping, gap-tolerant scan) |

Tests: ~300 lines across `test/crank/{core_test,lcov_test,v8_test,honesty_test,golden_test}.clj`
plus the two golden fixture dirs.

**Distribution:** a git dep consumed with a pinned sha (`io.github.<org>/crank`
`{:git/sha "..."}`); the adopting repo adds one alias `:crank`. No deploy artifacts, no
releases needed for v1; the pin *is* the version. JVM Clojure (not babashka) for v1: startup
cost is irrelevant in CI and both lanes already have the Clojure CLI.

---

## 13. Explicitly out of scope

- **An own cyclomatic-complexity counter** - the standing boundary; CC is delegated and pinned.
- **Branch coverage** - one honest metric per stack (lines for LCOV, blocks for V8); branch
  data would double the adapter surface for marginal gate value.
- **Changed-only / diff gating** (crapper's `--changed`), trends, history charts, PR comments,
  dashboards, HTML output - the EDN report is the seam a future tool can build on.
- **The TypeScript/JS lane** - stays on c8 + crap-score; a `:v8-ts` adapter is a future
  plug-in through the §4 contract, not v1 scope.
- **Auto-inferred N/A** - N/A is always human-declared with a written reason (§7 rule 3).
- **Per-namespace thresholds, grandfather lists, baseline files** - v1 has one threshold; the
  moonlander sequencing (§10.2) uses `--report-only` instead of a baseline mechanism.
- **Running the tests/coverage builds** - projects own their coverage generation; crank
  consumes artifacts. (This is what makes "coverage missing" a crisp, loud precondition.)
- **IDE/editor integration, watch mode, non-Clojure stacks** beyond the plug-in contract.
- **Mutation-testing interplay** - clj-mutate stays its own report-only job; complementary,
  not merged.

---

## 14. Risks and mitigations

| risk | mitigation |
|---|---|
| sift is self-declared alpha (0 stars) | pinned sha `8125fe8`; crapper is the primary CC source and already trusted by the captain's schairs CI; the ComplexitySource contract makes swapping a config change |
| crapper is Python; adds a Python dep to the JVM lane | both lanes already have it: schairs CI runs crapper today, moonlander's feasibility env used it; sift is the in-process escape hatch |
| shadow-cljs upgrade shifts codegen and coverage anchors | golden fixture pins the validated build; bounded re-validation recipe exists (feasibility §4.4, half a day); fidelity report makes silent drift visible |
| crapper/sift/kondo schema drift | all three are pinned; `--check` mode surfaces join breakage as exit 1 rather than wrong numbers |
| v8-shadow requires node for `remap.mjs` | only ever runs in the shadow-cljs lane, which has node by definition; the JVM lane never touches it |
| scope creep past 500 lines | §13 is the fence; every out-of-scope item has a named seam for a later task |

---

## 15. Recommendation

Build it as specified: the hard parts are already validated on real code (the CLJS join ran
end-to-end today with defensible numbers; the JVM lane is a straight port of a CI pipeline the
captain already trusts). The first implementation task should start from §12's layout, port
Appendix A's remap into `remap.mjs` first (it is the only piece with real novelty), and land
the two golden fixtures before the CLI so the honesty rules are test-driven from the start.
Sequencing for roll-out: schairs first (lowest risk - same CC counter, existing coverage),
then moonlander in `--report-only`, then the fake-DOM tests, then the gate flip.

**Captain calls:** the three moonlander adoption calls (§9) remain open with the captain and
are owned by the moonlander home's captain-hold inventory - the defaults above absorb their
recommended answers, and the design absorbs the alternative answers without rework. This
report itself raises no new captain decisions; the completion gate was run with `--none`.

---

## Appendix - key evidence references

- Feasibility report (authoritative for the CLJS lane):
  `data/remote-secondmates/moonlander/data/moonlander-crap-feasibility/report.md`
  - §2.1 crapper `--no-coverage` works on `.cljs` (124 fns)
  - §2.2 crapper's coverage lane silently manufactures 0% (the dishonesty anti-precedent)
  - §2.4 c8/v8-to-istanbul per-function unsound (`on-key!` "100%" though never called)
  - §2.6 validated honest pipeline + anchors (`on-key!` 342, `step` 22.21) - golden-fixture source
  - §4.3 the three adoption calls and their recommended answers
  - Appendix A the ~150-line working join prototype (basis of `remap.mjs` + the v8 adapter semantics)
- k7 survey: `data/remote-secondmates/moonlander/data/crap-tooling-survey-k7/report.md`
  (threshold conventions; tool maturity: crapper `9f1bead`, sift v0.2.0 pin `8125fe8`,
  clj-kondo extents, cloverage#182 open since 2017)
- Backlog spec: `bin/fm-tasks-axi.sh show crap-tool-design --full` (requirements owner)
