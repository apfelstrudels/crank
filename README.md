# crank

The fleet's first-party CRAP tool, with per-stack coverage adapters.

crank computes CRAP (`CC^2 * (1-cov)^3 + CC`) per function, prints one
worst-first table, and enforces one `--threshold N` gate (exit 2 on breach,
matching crapper's convention). It owns exactly two things nobody else gets
right: the coverage adapters — a Cloverage LCOV adapter for JVM Clojure and a
raw-V8-block-coverage + shadow-cljs source-map adapter for ClojureScript.
Cyclomatic complexity is delegated to pinned external tools
(unclebob/crapper `9f1bead`, or typmk/sift `8125fe8` in-process); crank has no
complexity counter of its own.

Honest by construction: missing or unjoinable coverage input is a hard exit 1,
never a synthesized 0% or 100%; N/A is only possible via a config entry
carrying a written justification.

## Usage

Invoked as a pinned git dep via an alias in the adopting repo:

```
clojure -M:crank                      # gate mode, config from .crank.edn
clojure -M:crank --report-only        # report; threshold breaches do not fail
clojure -M:crank --threshold 30       # override fail threshold
clojure -M:crank --warn 10            # override warn band floor
clojure -M:crank --check              # join-fidelity diagnostics only
clojure -M:crank --config path/to.edn
clojure -M:crank --help
```

Exit codes: `0` clean (or `--report-only`), `2` gate breach, `1`
honesty/usage error - missing or unjoinable coverage, config error,
unmatched defns, undeclared no-coverage-path namespaces. Exit 1 is never
suppressed; `--report-only` relaxes the gate, never the honesty rules.

## Config (`.crank.edn`, repo root)

```edn
{:paths ["src/main"]                       ;; sources under the gate
 :cc {:tool :crapper                       ;; or :sift (in-process, bundled git dep)
      :pin "9f1bead"}                      ;; recorded in every report header
 :coverage {:adapter :cloverage-lcov        ;; or :v8-shadow
            :lcov "target/coverage/lcov.info"
            ;; :v8-shadow instead:
            ;; :v8-dirs [".cov/sim" ".cov/render"]
            ;; :cljs-runtime ".shadow-cljs/builds"
            ;; :include-glob #"moonlander[^/]*\.js$"
            }
 :threshold {:fail 30 :warn 10}
 :na []                                    ;; {:file ... :reason ...} entries
 :report {:edn ".crank/report.edn"}}
```

Unknown keys, wrong types, an adapter missing its required inputs, or an
`:na` entry matching nothing in the extents are all hard config errors.

Adopting repos consume crank as a pinned git dep plus one alias:

```edn
{:aliases {:crank {:extra-deps {io.github.schairs/crank {:git/sha "<pinned sha>"}}
                   :main-opts ["-m" "crank.main"]}}}
```

The `:v8-shadow` adapter additionally needs node (present in any
shadow-cljs lane) and `@jridgewell/trace-mapping` as a pinned dev
dependency of the adopting repo; crank never runs the tests or coverage
builds - missing coverage is a loud precondition failure, not 0%.

## Stated precision limits (printed in every report header)

- `:v8-shadow` is block coverage with block-start attribution; it wobbles
  +/-1 block at defn boundaries, and blocks between defns are skipped by
  design (counted in the fidelity report).
- `:cloverage-lcov` is line coverage; cov = covered `DA` / total `DA`
  inside each defn extent.
- CC is tool-relative (crapper and sift count differently). Pick one CC
  tool per repo, never compare absolute CC across tools; switching tools
  re-baselines the gate.
- shadow-cljs upgrades can shift codegen and therefore coverage anchors;
  re-validate after any bump.
- sift models top-level `def` forms as units; matched to a non-function
  kondo extent they are excluded from scoring and counted in the fidelity
  report. A defn in a loaded file with no attributed blocks is a true 0%
  (uncalled or compiled away), never N/A. N/A only ever comes from a
  config `:na` entry with a written reason.

## Development

```
npm install        # @jridgewell/trace-mapping 0.3.31 (pinned) for remap.mjs
clojure -M:test    # the whole suite, incl. both golden fixtures
```

The test strategy (golden fixtures, honesty tests, join invariants) is
design spec §11; fixture provenance is documented in
`test/fixtures/*/README.md`.

## Design

The validated design — architecture, adapter contracts, honesty rules, config
format, test strategy, and adoption paths — lives in
[docs/design-spec.md](docs/design-spec.md).
