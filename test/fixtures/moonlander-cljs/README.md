# Golden fixture: moonlander (ClojureScript, `:v8-shadow`)

**Provenance: captured, not constructed.** Every input in this directory is a real
artifact captured 2026-10-20 from the moonlander checkout at
`/Users/clausspacil/moonlander/projects/moonlander`, commit `6a33ce9`
("feat(render): render moonlander with PixiJS … (#18)") - the exact commit the
CRAP feasibility report validated. Files were *excerpted* (whole entries dropped,
never edited) to keep the fixture small; the content of every retained entry is
byte-identical to the capture.

## What was run (in a scratch copy; the checkout itself was treated read-only)

```
npx shadow-cljs compile sim sim-render
NODE_V8_COVERAGE=$PWD/.cov/sim    node target/sim.js        # suite green
NODE_V8_COVERAGE=$PWD/.cov/render node target/sim-render.js # suite green
clj-kondo --lint src/main --config '{:output {:analysis true :format :json}}'
# clj-kondo v2025.10.23 (the version the feasibility report used)
clojure -M:sift lint --no-kondo --edn --config crank-sift.edn src/main
# sift pinned at git sha 8125fe8 (tag v0.2.0), with crank's production config:
#   {:rulesets #{}
#    :rules {:crank/cyclomatic-complexity {:extends :metric :measure :cyclomatic :max 0}}}
```

## Contents and how each was excerpted

| file | excerpt rule |
|---|---|
| `coverage/sim/coverage-*.json`, `coverage/render/coverage-*.json` | real raw `NODE_V8_COVERAGE` output; `result` entries kept whole iff the url matches `cljs-runtime/moonlander[^/]*\.js$` and is not a test-namespace main (`moonlander.sim.js`, `moonlander.render_scene.js`). 233→6 and 132→7 entries. |
| `cljs-runtime/<build>/dev/out/cljs-runtime/moonlander.*.js(.map)` | real shadow-cljs dev-build output, unmodified; mirrors the `.shadow-cljs/builds/<build>/…` layout so url-suffix resolution works exactly as in the live repo. Test-namespace mains excluded (they have no coverage entries). |
| `kondo-analysis.json` | real clj-kondo analysis; top-level keys other than `:analysis` dropped, and inside `:analysis` everything but `:var-definitions` dropped (those keys dwarf the fixture and crank reads only var-definitions). All 151 var-definition entries retained, unmodified. |
| `sift.edn` | real sift `--edn` output, all 205 `:crank/cyclomatic-complexity` findings retained unmodified (55 of them anonymous `<fn>` units, skipped by design). |
| `crank.edn` | the config this fixture is exercised with (fixture-relative paths). |
| `expected.edn` | the pinned expectations the golden test asserts (see below). |

## Pinned anchors (from the feasibility report §2.6, reproduced by this fixture)

- `on-key!` CRAP **342.00** (CC 18, 2 blocks, cov 0.0 - never called headlessly)
- `replay-tick!` CRAP **42.00** (CC 6, 2 blocks, cov 0.0)
- `step` CRAP **22.21** (CC 22, 53 blocks, 49 covered = 92.5%)
- `new-round` cov **37.5%** (3 of 8 blocks; only the `[seed level]` arity is exercised)
- `moonlander/render/pixi.cljs` and `moonlander/boot.cljs`: never loaded by the Node
  builds → no coverage path → N/A via the declared `:na` entries in `crank.edn`
- remap fidelity: 675 IR records, 38 unmapped blocks, 0 missing maps

If a shadow-cljs upgrade shifts codegen, this fixture still pins the *old* build;
the live re-validation recipe (feasibility report §4.4) covers the new one.
