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

## Design

The validated design — architecture, adapter contracts, honesty rules, config
format, test strategy, and adoption paths — lives in
[docs/design-spec.md](docs/design-spec.md).
